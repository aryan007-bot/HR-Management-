const { z } = require('zod');

/**
 * Aadhaar number validation (12 digits)
 */
const aadhaarSchema = z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits');

/**
 * Phone number validation (10 digits)
 */
const phoneSchema = z.string().regex(/^\d{10}$/, 'Phone must be 10 digits');

/**
 * Visitor registration schema
 */
const visitorRegistrationSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(255),
  phone: phoneSchema,
  email: z.string().email('Invalid email').optional(),
  aadhaar_number: aadhaarSchema,
  address: z.string().optional(),
  remarks: z.string().optional()
});

/**
 * Employee creation schema
 */
const employeeCreationSchema = z.object({
  visitor_id: z.string().uuid().optional(),
  full_name: z.string().min(2).max(255),
  phone: phoneSchema,
  email: z.string().email().optional(),
  aadhaar_number: aadhaarSchema,
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  date_of_joining: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
});

/**
 * User registration schema
 */
const userRegistrationSchema = z.object({
  company_id: z.string().uuid().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN_HR', 'HR']),
  full_name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

/**
 * Company creation schema
 */
const companyCreationSchema = z.object({
  name: z.string().min(2).max(255)
});

/**
 * Interview scheduling schema
 */
const interviewScheduleSchema = z.object({
  visitor_id: z.string().uuid(),
  scheduled_date: z.string().datetime(),
  remarks: z.string().optional()
});

/**
 * Interview feedback schema
 */
const interviewFeedbackSchema = z.object({
  feedback: z.string(),
  score: z.number().min(0).max(100),
  status: z.enum(['COMPLETED', 'CANCELLED'])
});

/**
 * Letter template schema
 */
const letterTemplateSchema = z.object({
  type: z.enum(['OFFER', 'TERMINATION', 'RELIEVING', 'FNF', 'ABSCOND']),
  name: z.string().min(2).max(255),
  content: z.string().min(10)
});

/**
 * Document upload schema
 */
const documentUploadSchema = z.object({
  document_type: z.string().min(2).max(100),
  file_name: z.string().min(1).max(255)
});

/**
 * Middleware to validate request body
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          error_code: 'VALIDATION_ERROR',
          errors
        });
      }
      next(error);
    }
  };
};

module.exports = {
  visitorRegistrationSchema,
  employeeCreationSchema,
  userRegistrationSchema,
  companyCreationSchema,
  interviewScheduleSchema,
  interviewFeedbackSchema,
  letterTemplateSchema,
  documentUploadSchema,
  validate
};
