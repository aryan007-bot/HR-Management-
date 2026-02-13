const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const { AppError } = require('../utils/errors');

class AuthService {
  /**
   * Register new user
   */
  async register(userData) {
    const { email, password, role, full_name, company_id } = userData;

    // Validate role-company relationship
    if (role === 'SUPER_ADMIN' && company_id) {
      throw new AppError('Super admin cannot be assigned to a company', 400);
    }

    if ((role === 'ADMIN_HR' || role === 'HR') && !company_id) {
      throw new AppError(`${role} must be assigned to a company`, 400);
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        role,
        full_name,
        company_id: company_id || null,
        is_active: true
      })
      .select('id, email, role, full_name, company_id, created_at')
      .single();

    if (error) {
      throw new AppError('Failed to create user', 500);
    }

    return user;
  }

  /**
   * Login user
   */
  async login(email, password) {
    // Fetch user
    const trimmedEmail = email.trim();
    console.log(`Login attempt for email: "${trimmedEmail}"`);
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', trimmedEmail)
      .single();

    if (error || !user) {
      console.log(`User not found for email: "${email}"`);
      throw new AppError('Invalid credentials', 401);
    }

    console.log(`User found: ${user.email}, Role: ${user.role}`);

    // Check if user is active
    if (!user.is_active) {
      console.log(`User ${user.email} is inactive`);
      throw new AppError('Account is deactivated', 403);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.log(`Invalid password for user: ${user.email}`);
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const payload = jwtConfig.generatePayload(user);
    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        company_id: user.company_id
      }
    };
  }

  /**
   * Get user profile
   */
  async getProfile(userId) {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        full_name,
        company_id,
        created_at,
        company:company_id (id, name)
      `)
      .eq('id', userId)
      .single();

    if (error) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    // Prevent updating sensitive fields
    const allowedFields = ['full_name'];
    const filteredUpdates = {};

    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field];
      }
    });

    const { data, error } = await supabase
      .from('users')
      .update(filteredUpdates)
      .eq('id', userId)
      .select('id, email, role, full_name, company_id')
      .single();

    if (error) {
      throw new AppError('Failed to update profile', 500);
    }

    return data;
  }

  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Fetch user
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    const { error } = await supabase
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (error) {
      throw new AppError('Failed to change password', 500);
    }

    return { message: 'Password changed successfully' };
  }

  /**
   * Get all users (Admin only)
   */
  async getUsers(companyId = null, role = null) {
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        full_name,
        company_id,
        is_active,
        created_at,
        company:company_id (id, name)
      `);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (role) {
      query = query.eq('role', role);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch users', 500);
    }

    return data;
  }

  /**
   * Deactivate user
   */
  async deactivateUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', userId)
      .select('id, email, is_active')
      .single();

    if (error) {
      throw new AppError('Failed to deactivate user', 500);
    }

    return data;
  }

  /**
   * Activate user
   */
  async activateUser(userId) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', userId)
      .select('id, email, is_active')
      .single();

    if (error) {
      throw new AppError('Failed to activate user', 500);
    }

    return data;
  }
}

module.exports = new AuthService();
