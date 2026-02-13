const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');

class VisitorService {
  /**
   * Register a new visitor with duplicate checking logic
   */
  async registerVisitor(visitorData, hrId, companyId) {
    const { aadhaar_number, phone, full_name, email, address, remarks } = visitorData;

    // Step 1: Check if active employee exists with same Aadhaar or Phone
    let query = supabase
      .from('employees')
      .select('id, full_name, status')
      .eq('status', 'ACTIVE')
      .or(`aadhaar_number.eq.${aadhaar_number},phone.eq.${phone}`);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: activeEmployee, error: employeeError } = await query.single();

    if (employeeError && employeeError.code !== 'PGRST116') {
      throw new AppError('Database error while checking employee', 500);
    }

    // Block if active employee found
    if (activeEmployee) {
      return {
        allow: false,
        reason: 'Already Active Employee',
        message: `An active employee with this Aadhaar/Phone already exists: ${activeEmployee.full_name}`,
        employee_id: activeEmployee.id,
        employee_name: activeEmployee.full_name
      };
    }

    // Step 2: Check for offboarded employees (rejoining case)
    let offboardQuery = supabase
      .from('employees')
      .select('id, full_name, status, date_of_leaving')
      .eq('status', 'OFFBOARDED')
      .or(`aadhaar_number.eq.${aadhaar_number},phone.eq.${phone}`);

    if (companyId) {
      offboardQuery = offboardQuery.eq('company_id', companyId);
    }

    const { data: offboardedEmployee, error: offboardedError } = await offboardQuery.single();

    if (offboardedError && offboardedError.code !== 'PGRST116') {
      throw new AppError('Database error while checking offboarded employee', 500);
    }

    let candidateType = 'NEW';

    if (offboardedEmployee) {
      candidateType = 'REJOINING';
    } else {
      // Step 3: Check for previously rejected visitors
      let visitorQuery = supabase
        .from('visitors')
        .select('id, status')
        .eq('status', 'REJECTED')
        .or(`aadhaar_number.eq.${aadhaar_number},phone.eq.${phone}`);

      if (companyId) {
        visitorQuery = visitorQuery.eq('company_id', companyId);
      }

      const { data: previousVisitor, error: visitorError } = await visitorQuery.single();

      if (visitorError && visitorError.code !== 'PGRST116') {
        throw new AppError('Database error while checking previous visitors', 500);
      }

      if (previousVisitor) {
        candidateType = 'REAPPLY';
      }
    }

    // Step 4: Create visitor record
    const { data: visitor, error: createError } = await supabase
      .from('visitors')
      .insert({
        company_id: companyId,
        hr_id: hrId,
        full_name,
        phone,
        email: email || null,
        aadhaar_number,
        address: address || null,
        candidate_type: candidateType,
        status: 'PENDING',
        remarks: remarks || null
      })
      .select()
      .single();

    if (createError) {
      console.error('Supabase create visitor error:', createError);
      throw new AppError(`Failed to create visitor record: ${createError.message}`, 500);
    }

    return {
      allow: true,
      candidate_type: candidateType,
      visitor_id: visitor.id,
      visitor
    };
  }

  /**
   * Get all visitors for a company
   */
  async getVisitors(companyId, filters = {}) {
    let query = supabase
      .from('visitors')
      .select(`
        *,
        hr:users (id, full_name, email)
      `);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.candidate_type) {
      query = query.eq('candidate_type', filters.candidate_type);
    }

    if (filters.hr_id) {
      query = query.eq('hr_id', filters.hr_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch visitors', 500);
    }

    // Add previous_employee_flag and ensure HR data
    const visitorsWithFlag = await Promise.all(
      data.map(async (visitor) => {
        // Manual HR fetch if join failed but hr_id exists
        let hr = visitor.hr;
        if (!hr && visitor.hr_id) {
          console.log(`Manual fetch HR for visitor ${visitor.id}, hr_id: ${visitor.hr_id}`);
          const { data: hrUser } = await supabase
            .from('users')
            .select('id, full_name, email')
            .eq('id', visitor.hr_id)
            .single();
          if (hrUser) {
            hr = hrUser;
            console.log(`Found HR:`, hrUser.full_name);
          } else {
            console.log(`HR not found for ${visitor.hr_id}`);
          }
        }

        const { data: employee } = await supabase
          .from('employees')
          .select('id')
          .eq('aadhaar_number', visitor.aadhaar_number)
          .single();

        return {
          ...visitor,
          hr,
          previous_employee_flag: !!employee
        };
      })
    );

    return visitorsWithFlag;
  }

  /**
   * Get visitor by ID
   */
  async getVisitorById(visitorId, companyId) {
    let query = supabase
      .from('visitors')
      .select(`
        *,
        hr:users (id, full_name, email),
        interviews (*)
      `)
      .eq('id', visitorId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: visitorData, error } = await query.single();

    if (error) {
      console.error('Visitor fetch error detail:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        visitorId
      });
      throw new AppError('Visitor not found', 404, 'VISITOR_NOT_FOUND');
    }

    // Manual HR fetch if join failed
    if (!visitorData.hr && visitorData.hr_id) {
      const { data: hrUser } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('id', visitorData.hr_id)
        .single();
      if (hrUser) visitorData.hr = hrUser;
    }

    // Check for previous employee
    const { data: employee } = await supabase
      .from('employees')
      .select('id, full_name, status')
      .eq('aadhaar_number', visitorData.aadhaar_number)
      .single();

    return {
      ...visitorData,
      previous_employee_flag: !!employee,
      previous_employee: employee || null
    };
  }

  /**
   * Update visitor status
   */
  async updateVisitorStatus(visitorId, status, companyId, remarks = null) {
    let query = supabase
      .from('visitors')
      .update({
        status,
        remarks: remarks || null
      })
      .eq('id', visitorId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query.select().single();

    if (error) {
      throw new AppError('Failed to update visitor status', 500);
    }

    return data;
  }

  /**
   * Delete visitor
   */
  async deleteVisitor(visitorId, companyId) {
    let query = supabase
      .from('visitors')
      .delete()
      .eq('id', visitorId);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { error } = await query;

    if (error) {
      throw new AppError('Failed to delete visitor', 500);
    }

    return { message: 'Visitor deleted successfully' };
  }

  /**
   * Get visitor statistics for dashboard
   */
  async getVisitorStats(companyId) {
    let query = supabase
      .from('visitors')
      .select('status, created_at');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data: visitors, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch visitor stats', 500);
    }

    const today = new Date().toISOString().split('T')[0];
    
    const stats = {
      total: visitors.length,
      today: visitors.filter(v => v.created_at.startsWith(today)).length,
      pending: visitors.filter(v => v.status === 'PENDING').length,
      selected: visitors.filter(v => v.status === 'SELECTED').length,
      rejected: visitors.filter(v => v.status === 'REJECTED').length
    };

    return stats;
  }

  /**
   * Get today's visitors
   */
  async getTodaysVisitors(companyId) {
    const today = new Date().toISOString().split('T')[0];
    
    let query = supabase
      .from('visitors')
      .select(`
        *,
        hr:users (id, full_name, email)
      `)
      .gte('created_at', today + 'T00:00:00')
      .lte('created_at', today + 'T23:59:59');

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch today\'s visitors', 500);
    }

    return data;
  }

  /**
   * Get potential hosts (HRs) for visitor registration
   */
  async getHosts(companyId) {
    let query = supabase
      .from('users')
      .select('id, full_name, role')
      .eq('is_active', true)
      .in('role', ['HR', 'ADMIN_HR']);

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch hosts', 500);
    }

    return data;
  }
}

module.exports = new VisitorService();
