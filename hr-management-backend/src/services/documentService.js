const supabase = require('../config/supabase');
const { AppError } = require('../utils/errors');
const { v4: uuidv4 } = require('uuid');

class DocumentService {
  /**
   * Upload document to Supabase Storage
   */
  async uploadDocument(employeeId, companyId, documentData, uploadedBy) {
    const { document_type, file_name, file_buffer, content_type } = documentData;

    // Verify employee belongs to company
    const { data: employee, error: empError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employeeId)
      .eq('company_id', companyId)
      .single();

    if (empError) {
      throw new AppError('Employee not found', 404);
    }

    // Generate unique file path
    const fileExtension = file_name.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `${companyId}/${employeeId}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('employee-documents')
      .upload(filePath, file_buffer, {
        contentType: content_type,
        upsert: false
      });

    if (uploadError) {
      throw new AppError('Failed to upload document', 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('employee-documents')
      .getPublicUrl(filePath);

    // Save document metadata
    const { data: document, error: docError } = await supabase
      .from('employee_documents')
      .insert({
        employee_id: employeeId,
        document_type,
        file_url: urlData.publicUrl,
        file_name,
        uploaded_by: uploadedBy
      })
      .select()
      .single();

    if (docError) {
      // Rollback storage upload
      await supabase.storage
        .from('employee-documents')
        .remove([filePath]);
      
      throw new AppError('Failed to save document metadata', 500);
    }

    return document;
  }

  /**
   * Get all documents for an employee
   */
  async getEmployeeDocuments(employeeId, companyId) {
    // Verify employee belongs to company
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
      .from('employee_documents')
      .select(`
        *,
        uploader:uploaded_by (id, full_name, email)
      `)
      .eq('employee_id', employeeId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch documents', 500);
    }

    return data;
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId, employeeId, companyId) {
    const { data, error } = await supabase
      .from('employee_documents')
      .select(`
        *,
        employee:employee_id (id, company_id),
        uploader:uploaded_by (id, full_name, email)
      `)
      .eq('id', documentId)
      .eq('employee_id', employeeId)
      .single();

    if (error) {
      throw new AppError('Document not found', 404);
    }

    // Verify company ownership
    if (data.employee.company_id !== companyId) {
      throw new AppError('Access denied', 403);
    }

    return data;
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId, employeeId, companyId) {
    // Fetch document
    const { data: document } = await supabase
      .from('employee_documents')
      .select(`
        *,
        employee:employee_id (company_id)
      `)
      .eq('id', documentId)
      .eq('employee_id', employeeId)
      .single();

    if (!document) {
      throw new AppError('Document not found', 404);
    }

    if (document.employee.company_id !== companyId) {
      throw new AppError('Access denied', 403);
    }

    // Extract file path from URL
    const urlParts = document.file_url.split('/');
    const filePath = urlParts.slice(-3).join('/'); // company/employee/file

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('employee-documents')
      .remove([filePath]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('employee_documents')
      .delete()
      .eq('id', documentId);

    if (dbError) {
      throw new AppError('Failed to delete document', 500);
    }

    return { message: 'Document deleted successfully' };
  }

  /**
   * Get document statistics
   */
  async getDocumentStats(companyId) {
    const { data: documents } = await supabase
      .from('employee_documents')
      .select(`
        document_type,
        employee:employee_id (company_id)
      `)
      .eq('employee.company_id', companyId);

    const stats = {
      total: documents.length,
      by_type: {}
    };

    documents.forEach(doc => {
      stats.by_type[doc.document_type] = (stats.by_type[doc.document_type] || 0) + 1;
    });

    return stats;
  }
}

module.exports = new DocumentService();
