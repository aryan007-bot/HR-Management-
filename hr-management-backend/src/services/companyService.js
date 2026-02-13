const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');

class CompanyService {
  /**
   * Create new company
   */
  async createCompany(companyData) {
    const { name } = companyData;

    const { data: company, error } = await supabase
      .from('companies')
      .insert({ name })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new AppError('Company name already exists', 409);
      }
      throw new AppError('Failed to create company', 500);
    }

    return company;
  }

  /**
   * Get all companies
   */
  async getCompanies() {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch companies', 500);
    }

    return data;
  }

  /**
   * Get company by ID
   */
  async getCompanyById(companyId) {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (error) {
      throw new AppError('Company not found', 404);
    }

    return data;
  }

  /**
   * Update company
   */
  async updateCompany(companyId, updates) {
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update company', 500);
    }

    return data;
  }

  /**
   * Delete company
   */
  async deleteCompany(companyId) {
    // Check if company has users
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('company_id', companyId)
      .limit(1);

    if (users && users.length > 0) {
      throw new AppError('Cannot delete company with existing users', 400);
    }

    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId);

    if (error) {
      throw new AppError('Failed to delete company', 500);
    }

    return { message: 'Company deleted successfully' };
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(companyId) {
    const [employees, visitors, users] = await Promise.all([
      supabase
        .from('employees')
        .select('status')
        .eq('company_id', companyId),
      supabase
        .from('visitors')
        .select('status')
        .eq('company_id', companyId),
      supabase
        .from('users')
        .select('role, is_active')
        .eq('company_id', companyId)
    ]);

    return {
      employees: {
        total: employees.data?.length || 0,
        active: employees.data?.filter(e => e.status === 'ACTIVE').length || 0,
        offboarded: employees.data?.filter(e => e.status === 'OFFBOARDED').length || 0
      },
      visitors: {
        total: visitors.data?.length || 0,
        pending: visitors.data?.filter(v => v.status === 'PENDING').length || 0,
        selected: visitors.data?.filter(v => v.status === 'SELECTED').length || 0,
        rejected: visitors.data?.filter(v => v.status === 'REJECTED').length || 0
      },
      users: {
        total: users.data?.length || 0,
        active: users.data?.filter(u => u.is_active).length || 0,
        by_role: {
          admin_hr: users.data?.filter(u => u.role === 'ADMIN_HR').length || 0,
          hr: users.data?.filter(u => u.role === 'HR').length || 0
        }
      }
    };
  }
}

module.exports = new CompanyService();
