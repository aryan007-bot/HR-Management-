-- HR Management System Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. COMPANIES TABLE
-- =====================================================
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. USERS TABLE
-- =====================================================
CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN_HR', 'HR');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT check_admin_company CHECK (
        (role = 'SUPER_ADMIN' AND company_id IS NULL) OR
        (role IN ('ADMIN_HR', 'HR') AND company_id IS NOT NULL)
    )
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

-- =====================================================
-- 3. VISITORS TABLE
-- =====================================================
CREATE TYPE candidate_type AS ENUM ('NEW', 'REJOINING', 'REAPPLY');
CREATE TYPE visitor_status AS ENUM ('PENDING', 'SELECTED', 'REJECTED', 'BLOCKED');

CREATE TABLE visitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    hr_id UUID REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    aadhaar_number VARCHAR(12) NOT NULL,
    address TEXT,
    candidate_type candidate_type NOT NULL,
    status visitor_status DEFAULT 'PENDING',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_visitors_company ON visitors(company_id);
CREATE INDEX idx_visitors_aadhaar ON visitors(aadhaar_number);
CREATE INDEX idx_visitors_phone ON visitors(phone);
CREATE INDEX idx_visitors_status ON visitors(status);

-- =====================================================
-- 4. EMPLOYEES TABLE
-- =====================================================
CREATE TYPE employee_status AS ENUM ('ACTIVE', 'OFFBOARDED');

CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    aadhaar_number VARCHAR(12) NOT NULL,
    department VARCHAR(100),
    designation VARCHAR(100),
    status employee_status DEFAULT 'ACTIVE',
    date_of_joining DATE NOT NULL,
    date_of_leaving DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_active_aadhaar UNIQUE (aadhaar_number, status)
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_aadhaar ON employees(aadhaar_number);
CREATE INDEX idx_employees_phone ON employees(phone);
CREATE INDEX idx_employees_status ON employees(status);
CREATE INDEX idx_employees_code ON employees(employee_code);

-- =====================================================
-- 5. EMPLOYEE DOCUMENTS TABLE
-- =====================================================
CREATE TABLE employee_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_documents_employee ON employee_documents(employee_id);

-- =====================================================
-- 6. INTERVIEWS TABLE
-- =====================================================
CREATE TYPE interview_status AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_id UUID NOT NULL REFERENCES visitors(id) ON DELETE CASCADE,
    hr_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    feedback TEXT,
    score INTEGER CHECK (score >= 0 AND score <= 100),
    status interview_status DEFAULT 'SCHEDULED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_interviews_visitor ON interviews(visitor_id);
CREATE INDEX idx_interviews_hr ON interviews(hr_id);
CREATE INDEX idx_interviews_status ON interviews(status);

-- =====================================================
-- 7. LETTER TEMPLATES TABLE
-- =====================================================
CREATE TYPE letter_type AS ENUM ('OFFER', 'TERMINATION', 'RELIEVING', 'FNF', 'ABSCOND');

CREATE TABLE letter_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    type letter_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_templates_company ON letter_templates(company_id);
CREATE INDEX idx_templates_type ON letter_templates(type);

-- =====================================================
-- 8. GENERATED LETTERS TABLE
-- =====================================================
CREATE TABLE generated_letters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES letter_templates(id),
    generated_content TEXT NOT NULL,
    file_url TEXT,
    generated_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_letters_employee ON generated_letters(employee_id);
CREATE INDEX idx_letters_template ON generated_letters(template_id);

-- =====================================================
-- 9. TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interviews_updated_at BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON letter_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE letter_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_letters ENABLE ROW LEVEL SECURITY;

-- Note: Implement specific RLS policies based on your auth requirements
-- For now, using service role key bypasses RLS

-- =====================================================
-- 11. SEED DATA (Optional - Super Admin)
-- =====================================================
-- Create a super admin user (password: SuperAdmin@123)
-- Hash generated using bcrypt with salt rounds 10
INSERT INTO users (role, full_name, email, password_hash)
VALUES (
    'SUPER_ADMIN',
    'System Administrator',
    'superadmin@system.com',
    '$2a$10$rY8EqLqTqC5vQxV9xGxKv.Y9gYZYxJ8F3VxJGX0pqZXJhWzVJ8V9G'
);

-- =====================================================
-- 12. VIEWS FOR REPORTING
-- =====================================================
CREATE OR REPLACE VIEW visitor_summary AS
SELECT 
    v.id,
    v.full_name,
    v.email,
    v.phone,
    v.candidate_type,
    v.status,
    c.name as company_name,
    u.full_name as hr_name,
    v.created_at,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM employees e 
            WHERE e.aadhaar_number = v.aadhaar_number
        ) THEN TRUE
        ELSE FALSE
    END as previous_employee_flag
FROM visitors v
JOIN companies c ON v.company_id = c.id
LEFT JOIN users u ON v.hr_id = u.id;

CREATE OR REPLACE VIEW employee_summary AS
SELECT 
    e.id,
    e.employee_code,
    e.full_name,
    e.email,
    e.phone,
    e.department,
    e.designation,
    e.status,
    e.date_of_joining,
    c.name as company_name,
    COUNT(DISTINCT ed.id) as document_count
FROM employees e
JOIN companies c ON e.company_id = c.id
LEFT JOIN employee_documents ed ON e.id = ed.employee_id
GROUP BY e.id, c.name;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
