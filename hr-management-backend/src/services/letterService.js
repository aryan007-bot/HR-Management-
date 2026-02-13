const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');
const { v4: uuidv4 } = require('uuid');

class LetterService {
  /**
   * Create letter template
   */
  async createTemplate(templateData, companyId) {
    const { type, name, content } = templateData;

    // Check for existing active template of same type
    const { data: existing } = await supabase
      .from('letter_templates')
      .select('id, version')
      .eq('company_id', companyId)
      .eq('type', type)
      .eq('is_active', true)
      .order('version', { ascending: false })
      .limit(1)
      .single();

    const version = existing ? existing.version + 1 : 1;

    // Deactivate previous version
    if (existing) {
      await supabase
        .from('letter_templates')
        .update({ is_active: false })
        .eq('id', existing.id);
    }

    // Create new template
    const { data: template, error } = await supabase
      .from('letter_templates')
      .insert({
        company_id: companyId,
        type,
        name,
        content,
        version,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to create template', 500);
    }

    return template;
  }

  /**
   * Get all templates for a company
   */
  async getTemplates(companyId, filters = {}) {
    let query = supabase
      .from('letter_templates')
      .select('*')
      .eq('company_id', companyId);

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new AppError('Failed to fetch templates', 500);
    }

    return data;
  }

  /**
   * Get template by ID
   */
  async getTemplateById(templateId, companyId) {
    const { data, error } = await supabase
      .from('letter_templates')
      .select('*')
      .eq('id', templateId)
      .eq('company_id', companyId)
      .single();

    if (error) {
      throw new AppError('Template not found', 404);
    }

    return data;
  }

  /**
   * Update template
   */
  async updateTemplate(templateId, updates, companyId) {
    const { data, error } = await supabase
      .from('letter_templates')
      .update(updates)
      .eq('id', templateId)
      .eq('company_id', companyId)
      .select()
      .single();

    if (error) {
      throw new AppError('Failed to update template', 500);
    }

    return data;
  }

  /**
   * Replace template variables with actual data
   */
  replaceVariables(template, employee, additionalData = {}) {
    let content = template;

    const variables = {
      '{{full_name}}': employee.full_name || '',
      '{{employee_code}}': employee.employee_code || '',
      '{{designation}}': employee.designation || '',
      '{{department}}': employee.department || '',
      '{{date_of_joining}}': employee.date_of_joining || '',
      '{{email}}': employee.email || '',
      '{{phone}}': employee.phone || '',
      '{{current_date}}': new Date().toLocaleDateString('en-IN'),
      ...additionalData
    };

    Object.keys(variables).forEach(key => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, variables[key]);
    });

    return content;
  }

  /**
   * Generate letter from template
   */
  async generateLetter(employeeId, templateId, companyId, generatedBy, additionalData = {}) {
    // Fetch employee
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .single();

    if (empError) {
      throw new AppError('Employee not found', 404);
    }

    // Fetch template
    const { data: template, error: templateError } = await supabase
      .from('letter_templates')
      .select('*')
      .eq('id', templateId)
      .eq('company_id', companyId)
      .single();

    if (templateError) {
      throw new AppError('Template not found', 404);
    }

    // Replace variables
    const generatedContent = this.replaceVariables(template.content, employee, additionalData);

    // Generate HTML file
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { line-height: 1.6; }
  </style>
</head>
<body>
  <div class="content">
    ${generatedContent}
  </div>
</body>
</html>
    `;

    // Upload to storage
    const fileName = `${template.type}_${employee.employee_code}_${Date.now()}.html`;
    const filePath = `${companyId}/letters/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, Buffer.from(htmlContent), {
        contentType: 'text/html',
        upsert: false
      });

    if (uploadError) {
      throw new AppError('Failed to upload letter', 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(filePath);

    // Save generated letter record
    const { data: letter, error: letterError } = await supabase
      .from('generated_letters')
      .insert({
        employee_id: employeeId,
        template_id: templateId,
        generated_content: generatedContent,
        file_url: urlData.publicUrl,
        generated_by: generatedBy
      })
      .select()
      .single();

    if (letterError) {
      throw new AppError('Failed to save letter record', 500);
    }

    return letter;
  }

  /**
   * Get generated letters for an employee
   */
  async getEmployeeLetters(employeeId, companyId) {
    // Verify employee
    const { data: employee } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .single();

    if (!employee) {
      throw new AppError('Employee not found', 404);
    }

    const { data, error } = await supabase
      .from('generated_letters')
      .select(`
        *,
        template:template_id (id, type, name),
        generator:generated_by (id, full_name)
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch letters', 500);
    }

    return data;
  }

  /**
   * Delete template
   */
  async deleteTemplate(templateId, companyId) {
    const { error } = await supabase
      .from('letter_templates')
      .delete()
      .eq('id', templateId)
      .eq('company_id', companyId);

    if (error) {
      throw new AppError('Failed to delete template', 500);
    }

    return { message: 'Template deleted successfully' };
  }
}

module.exports = new LetterService();
