const documentService = require('../services/documentService');
const { asyncHandler } = require('../utils/errors');
const { AppError } = require('../utils/errors');

class DocumentController {
  /**
   * Upload document
   * POST /api/employees/:employeeId/documents
   */
  uploadDocument = asyncHandler(async (req, res) => {
    // In a real implementation, you'd use multer or similar middleware
    // For this example, we'll expect base64 encoded file in request body
    const { document_type, file_name, file_data, content_type } = req.body;

    if (!file_data) {
      throw new AppError('No file data provided', 400);
    }

    // Convert base64 to buffer
    const file_buffer = Buffer.from(file_data, 'base64');

    const document = await documentService.uploadDocument(
      req.params.employeeId,
      req.user.companyId,
      {
        document_type,
        file_name,
        file_buffer,
        content_type: content_type || 'application/octet-stream'
      },
      req.user.id
    );

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: document
    });
  });

  /**
   * Get all documents for an employee
   * GET /api/employees/:employeeId/documents
   */
  getEmployeeDocuments = asyncHandler(async (req, res) => {
    const documents = await documentService.getEmployeeDocuments(
      req.params.employeeId,
      req.user.companyId
    );

    res.json({
      success: true,
      count: documents.length,
      data: documents
    });
  });

  /**
   * Get document by ID
   * GET /api/employees/:employeeId/documents/:documentId
   */
  getDocumentById = asyncHandler(async (req, res) => {
    const document = await documentService.getDocumentById(
      req.params.documentId,
      req.params.employeeId,
      req.user.companyId
    );

    res.json({
      success: true,
      data: document
    });
  });

  /**
   * Delete document
   * DELETE /api/employees/:employeeId/documents/:documentId
   */
  deleteDocument = asyncHandler(async (req, res) => {
    const result = await documentService.deleteDocument(
      req.params.documentId,
      req.params.employeeId,
      req.user.companyId
    );

    res.json({
      success: true,
      message: result.message
    });
  });

  /**
   * Get document statistics
   * GET /api/documents/stats
   */
  getStats = asyncHandler(async (req, res) => {
    const stats = await documentService.getDocumentStats(req.user.companyId);

    res.json({
      success: true,
      data: stats
    });
  });
}

module.exports = new DocumentController();
