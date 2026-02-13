const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');

class EmployeeService {
  /**
   * Generate unique employee code
   * Format: CMP-YYYY-XXXX
   */
  async generateEmployeeCode(companyId) {
    // Get company abbreviation (first 3 letters of company name)
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();

    let companyCode = 'CMP';
    if (!companyError && company && company.name) {
      companyCode = company.name.substring(0, 3).toUpperCase();
    }
    const year = new Date().getFullYear();

    // Get the last employee code for this company
    const { data: lastEmployee, error: lastError } = await supabase
      .from('employees')
      .select('employee_code')
      .eq('company_id', companyId)
      .like('employee_code', `${companyCode}-${year}-%`)
      .order('employee_code', { ascending: false })
      .limit(1);

    let sequence = 1;
    if (!lastError && lastEmployee && lastEmployee.length > 0) {
      const codeParts = lastEmployee[0].employee_code.split('-');
      const lastSequence = parseInt(codeParts[codeParts.length - 1]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${companyCode}-${year}-${String(sequence).padStart(4, '0')}`;
  }

  /**
   * Convert visitor to employee
   */
  async convertVisitorToEmployee(visitorId, companyId, additionalData = {}) {
    // Fetch visitor details
    let query = supabase
      .from('visitors')
      .select('*')
      .eq('id', visitorId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: visitor, error: visitorError } = await query.single();

    if (visitorError) {
      throw new AppError('Visitor not found', 404);
    }

    // Check for existing active employee with same Aadhaar
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('aadhaar_number', visitor.aadhaar_number)
      .eq('status', 'ACTIVE')
      .single();

    if (existingEmployee) {
      throw new AppError('Active employee with same Aadhaar already exists', 409);
    }

    // For Super Admin or cross-company conversions, ensure we have a company ID
    const targetCompanyId = companyId || visitor.company_id;

    // Generate employee code
    const employeeCode = await this.generateEmployeeCode(targetCompanyId);

    // Create employee record
    const { data: employee, error: createError } = await supabase
      .from('employees')
      .insert({
        company_id: targetCompanyId,
        employee_code: employeeCode,
        visitor_id: visitorId,
        full_name: visitor.full_name,
        phone: visitor.phone,
        email: visitor.email,
        aadhaar_number: visitor.aadhaar_number,
        department: additionalData.department || null,
        designation: additionalData.designation || null,
        status: 'ACTIVE',
        date_of_joining: additionalData.date_of_joining || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (createError) {
      throw new AppError('Failed to create employee record', 500);
    }

    // Update visitor status to SELECTED
    await supabase
      .from('visitors')
      .update({ status: 'SELECTED' })
      .eq('id', visitorId);

    // 5. Automatically create a User account for the new employee
    try {
      const authService = require('./authService');
      await authService.register({
        email: visitor.email,
        password: 'Password@123', // Default password
        role: 'HR', // Defaulting to HR role for now, or you can add a role field to the form
        full_name: visitor.full_name,
        company_id: targetCompanyId
      });
      console.log(`User account created for ${visitor.email}`);
    } catch (authError) {
      // If user already exists, we just log it and continue
      console.log(`User creation skipped or failed: ${authError.message}`);
    }

    return employee;
  }

  /**
   * Create employee directly (without visitor)
   */
  async createEmployee(employeeData, companyId) {
    const { aadhaar_number } = employeeData;

    // Check for duplicate active employee
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('id')
      .eq('aadhaar_number', aadhaar_number)
      .eq('status', 'ACTIVE')
      .single();

    if (existingEmployee) {
      throw new AppError('Active employee with same Aadhaar already exists', 409);
    }

    // Generate employee code
    const employeeCode = await this.generateEmployeeCode(companyId);

    const { data: employee, error } = await supabase
      .from('employees')
      .insert({
        company_id: companyId,
        employee_code: employeeCode,
        ...employeeData
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase employee creation error:', error);
      throw new AppError(`Failed to create employee: ${error.message}`, 500);
    }

    return employee;
  }

  /**
   * Get all employees
   */
  async getEmployees(companyId, filters = {}) {
    let query = supabase
      .from('employees')
      .select('*');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.department) {
      query = query.eq('department', filters.department);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch employees', 500);
    }

    return data;
  }

  /**
   * Get employee by ID
   */
  async getEmployeeById(employeeId, companyId) {
    let query = supabase
      .from('employees')
      .select(`
        *,
        visitor:visitor_id (*),
        documents:employee_documents (*)
      `)
      .eq('id', employeeId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query.single();

    if (error) {
      throw new AppError('Employee not found', 404);
    }

    return data;
  }

  /**
   * Update employee
   */
  async updateEmployee(employeeId, updates, companyId) {
    let query = supabase
      .from('employees')
      .update(updates)
      .eq('id', employeeId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      throw new AppError('Failed to update employee', 500);
    }

    return data;
  }

  /**
   * Offboard employee
   */
  async offboardEmployee(employeeId, companyId, dateOfLeaving = null) {
    let query = supabase
      .from('employees')
      .update({
        status: 'OFFBOARDED',
        date_of_leaving: dateOfLeaving || new Date().toISOString().split('T')[0]
      })
      .eq('id', employeeId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      throw new AppError('Failed to offboard employee', 500);
    }

    return data;
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(companyId) {
    let query = supabase
      .from('employees')
      .select('status, department');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: employees } = await query;

    const stats = {
      total: employees.length,
      active: employees.filter(e => e.status === 'ACTIVE').length,
      offboarded: employees.filter(e => e.status === 'OFFBOARDED').length,
      by_department: {}
    };

    employees.forEach(emp => {
      if (emp.department) {
        stats.by_department[emp.department] = (stats.by_department[emp.department] || 0) + 1;
      }
    });
    return stats;
  }

  /**
   * Delete employee
   */
  async deleteEmployee(employeeId, companyId) {
    let query = supabase
      .from('employees')
      .delete()
      .eq('id', employeeId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { error } = await query;

    if (error) {
      throw new AppError('Failed to delete employee', 500);
    }

    return true;
  }
}

module.exports = new EmployeeService();
