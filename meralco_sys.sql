-- Project Management System Database Schema
-- Supports GAINS tracking, vendor management, QI audits, and comprehensive project lifecycle

-- =====================================================
-- CORE SYSTEM TABLES
-- =====================================================

-- Users and Authentication
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    role_id INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Roles and Permissions
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- =====================================================
-- ORGANIZATIONAL STRUCTURE
-- =====================================================

-- Sectors and Teams
CREATE TABLE sectors (
    sector_id SERIAL PRIMARY KEY,
    sector_name VARCHAR(100) NOT NULL,
    sector_code VARCHAR(20) UNIQUE NOT NULL,
    location VARCHAR(200),
    manager_id INTEGER REFERENCES users(user_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE teams (
    team_id SERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    team_code VARCHAR(20) UNIQUE NOT NULL,
    sector_id INTEGER REFERENCES sectors(sector_id),
    team_lead_id INTEGER REFERENCES users(user_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendors/Contractors
CREATE TABLE vendors (
    vendor_id SERIAL PRIMARY KEY,
    vendor_name VARCHAR(200) NOT NULL,
    vendor_code VARCHAR(50) UNIQUE NOT NULL,
    contact_person VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    is_active BOOLEAN DEFAULT true,
    registration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PROJECT AND WORK ORDER MANAGEMENT
-- =====================================================

-- Projects
CREATE TABLE projects (
    project_id SERIAL PRIMARY KEY,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(200) NOT NULL,
    project_type VARCHAR(50) NOT NULL, -- 'PCA', 'RELOCATION', 'GOVERNMENT', 'BBB'
    project_subtype VARCHAR(50), -- 'NEW', 'MODIFICATION', 'TERMINATION', 'RELOC'
    description TEXT,
    sector_id INTEGER REFERENCES sectors(sector_id),
    team_id INTEGER REFERENCES teams(team_id),
    assigned_vendor_id INTEGER REFERENCES vendors(vendor_id),
    customer_name VARCHAR(200),
    customer_type VARCHAR(50), -- 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'GOVERNMENT'
    applied_load DECIMAL(10,2),
    manhours DECIMAL(10,2),
    project_value DECIMAL(15,2),
    currency VARCHAR(3) DEFAULT 'PHP',
    status VARCHAR(50) DEFAULT 'WMTRL', -- 'WMTRL', 'APPR', 'INPRG', 'SCHED', 'COMP', 'FCOMP', 'CLOSED'
    priority_level VARCHAR(20) DEFAULT 'NORMAL', -- 'LOW', 'NORMAL', 'HIGH', 'URGENT'
    wmtrl_date DATE,
    appr_date DATE,
    start_date DATE,
    target_completion_date DATE,
    actual_completion_date DATE,
    fcomp_date DATE,
    closed_date DATE,
    spt_days INTEGER, -- Standard Processing Time in days
    is_revenue BOOLEAN DEFAULT true,
    is_aging BOOLEAN DEFAULT false,
    aging_category VARCHAR(20), -- '0-90', '90+', '>90'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Orders
CREATE TABLE work_orders (
    wo_id SERIAL PRIMARY KEY,
    wo_number VARCHAR(50) UNIQUE NOT NULL,
    project_id INTEGER REFERENCES projects(project_id),
    wo_type VARCHAR(50) NOT NULL, -- 'NEW', 'MODIFICATION', 'TERMINATION', 'RELOCATION'
    description TEXT,
    assigned_crew VARCHAR(100),
    assigned_user_id INTEGER REFERENCES users(user_id),
    manhours DECIMAL(10,2),
    material_cost DECIMAL(12,2),
    labor_cost DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    status VARCHAR(50) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- DOCUMENT MANAGEMENT
-- =====================================================

-- Document Types
CREATE TABLE document_types (
    doc_type_id SERIAL PRIMARY KEY,
    doc_type_name VARCHAR(100) NOT NULL,
    doc_type_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    sla_days INTEGER, -- SLA deadline in days
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Documents
CREATE TABLE project_documents (
    doc_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    doc_type_id INTEGER REFERENCES document_types(doc_type_id),
    document_name VARCHAR(200) NOT NULL,
    file_path VARCHAR(500),
    file_size_kb INTEGER,
    mime_type VARCHAR(100),
    uploaded_by INTEGER REFERENCES users(user_id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'REJECTED', 'REVISION_REQUIRED'
    approved_by INTEGER REFERENCES users(user_id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,
    version_number INTEGER DEFAULT 1,
    is_current_version BOOLEAN DEFAULT true
);

-- Certificate of Completion tracking
CREATE TABLE coc_submissions (
    coc_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES vendors(vendor_id),
    submission_date DATE NOT NULL,
    due_date DATE NOT NULL,
    days_delayed INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- 'SUBMITTED', 'APPROVED', 'REJECTED'
    approved_by INTEGER REFERENCES users(user_id),
    approved_date DATE,
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- QUALITY INSPECTION MODULE
-- =====================================================

-- QI Inspectors
CREATE TABLE qi_inspectors (
    inspector_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) UNIQUE,
    inspector_code VARCHAR(20) UNIQUE NOT NULL,
    specialization TEXT,
    daily_target INTEGER DEFAULT 5, -- Daily audit target
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QI Audits
CREATE TABLE qi_audits (
    audit_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    inspector_id INTEGER REFERENCES qi_inspectors(inspector_id),
    audit_date DATE NOT NULL,
    scheduled_date DATE,
    audit_type VARCHAR(50) DEFAULT 'REGULAR', -- 'REGULAR', 'RE_AUDIT', 'SPOT_CHECK'
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    start_time TIME,
    end_time TIME,
    duration_hours DECIMAL(4,2),
    audit_result VARCHAR(50), -- 'PASSED', 'FAILED', 'CONDITIONAL', 'PENDING'
    findings TEXT,
    recommendations TEXT,
    photos_uploaded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QI Performance Tracking
CREATE TABLE qi_performance_log (
    log_id SERIAL PRIMARY KEY,
    inspector_id INTEGER REFERENCES qi_inspectors(inspector_id),
    log_date DATE NOT NULL,
    target_audits INTEGER NOT NULL,
    completed_audits INTEGER DEFAULT 0,
    target_met BOOLEAN DEFAULT false,
    reason_not_met VARCHAR(100), -- 'SICK_LEAVE', 'SITE_ISSUE', 'DOCUMENT_DELAY', 'SYSTEM_ISSUE'
    custom_reason TEXT,
    logged_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- SLA MONITORING AND COMPLIANCE
-- =====================================================

-- SLA Definitions
CREATE TABLE sla_definitions (
    sla_id SERIAL PRIMARY KEY,
    sla_name VARCHAR(100) NOT NULL,
    project_type VARCHAR(50),
    process_stage VARCHAR(50), -- 'QI', 'COC', 'BILLING', 'COMPLETION'
    sla_days INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SLA Tracking
CREATE TABLE sla_tracking (
    tracking_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    sla_id INTEGER REFERENCES sla_definitions(sla_id),
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    completion_date DATE,
    days_used INTEGER,
    days_overdue INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE', -- 'ACTIVE', 'COMPLETED', 'BREACHED'
    breach_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PENALTY MANAGEMENT
-- =====================================================

-- Penalty Rules
CREATE TABLE penalty_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    project_type VARCHAR(50),
    penalty_per_day DECIMAL(10,2),
    max_penalty_percentage DECIMAL(5,2),
    grace_period_days INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Penalty Calculations
CREATE TABLE penalties (
    penalty_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES vendors(vendor_id),
    rule_id INTEGER REFERENCES penalty_rules(rule_id),
    delay_days INTEGER NOT NULL,
    penalty_amount DECIMAL(12,2) NOT NULL,
    penalty_percentage DECIMAL(5,2),
    memo_generated BOOLEAN DEFAULT false,
    memo_sent_date DATE,
    status VARCHAR(50) DEFAULT 'CALCULATED', -- 'CALCULATED', 'ISSUED', 'DISPUTED', 'WAIVED', 'PAID'
    dispute_reason TEXT,
    waiver_reason TEXT,
    waived_by INTEGER REFERENCES users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- BILLING MODULE
-- =====================================================

-- Vendor Billing Summary
CREATE TABLE vendor_billing (
    billing_id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(vendor_id),
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    total_projects INTEGER DEFAULT 0,
    total_billed_amount DECIMAL(15,2) DEFAULT 0,
    total_paid_amount DECIMAL(15,2) DEFAULT 0,
    outstanding_balance DECIMAL(15,2) DEFAULT 0,
    penalty_deductions DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'DRAFT', -- 'DRAFT', 'SENT', 'PAID', 'OVERDUE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual Project Billing
CREATE TABLE project_billing (
    billing_item_id SERIAL PRIMARY KEY,
    billing_id INTEGER REFERENCES vendor_billing(billing_id) ON DELETE CASCADE,
    project_id INTEGER REFERENCES projects(project_id),
    amount DECIMAL(12,2) NOT NULL,
    penalty_amount DECIMAL(10,2) DEFAULT 0,
    net_amount DECIMAL(12,2) NOT NULL,
    payment_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- NOTIFICATION SYSTEM
-- =====================================================

-- Notification Templates
CREATE TABLE notification_templates (
    template_id SERIAL PRIMARY KEY,
    template_name VARCHAR(100) NOT NULL,
    template_code VARCHAR(50) UNIQUE NOT NULL,
    subject_template TEXT NOT NULL,
    body_template TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL, -- 'EMAIL', 'SMS', 'PUSH', 'IN_APP'
    trigger_event VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications Log
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    template_id INTEGER REFERENCES notification_templates(template_id),
    recipient_user_id INTEGER REFERENCES users(user_id),
    recipient_email VARCHAR(100),
    recipient_phone VARCHAR(20),
    subject TEXT NOT NULL,
    message_body TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    project_id INTEGER REFERENCES projects(project_id),
    status VARCHAR(50) DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'DELIVERED', 'FAILED'
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ANALYTICS AND REPORTING
-- =====================================================

-- KPI Definitions (for GAINS tracking)
CREATE TABLE kpi_definitions (
    kpi_id SERIAL PRIMARY KEY,
    kpi_code VARCHAR(50) UNIQUE NOT NULL,
    kpi_name VARCHAR(200) NOT NULL,
    kpi_category VARCHAR(50) NOT NULL, -- 'ENERGY_SALES', 'CSI', 'LTIFR', 'SUSTAINABILITY', 'CAPEX'
    measurement_unit VARCHAR(50), -- 'INDEX', 'PERCENTAGE', 'DAYS', 'COUNT', 'CURRENCY'
    target_value DECIMAL(15,4),
    stretch_value DECIMAL(15,4),
    weight_percentage DECIMAL(5,2),
    ol_level VARCHAR(10), -- 'OL1', 'OL2', 'OL3'
    calculation_formula TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- KPI Performance Tracking
CREATE TABLE kpi_performance (
    performance_id SERIAL PRIMARY KEY,
    kpi_id INTEGER REFERENCES kpi_definitions(kpi_id),
    team_id INTEGER REFERENCES teams(team_id),
    sector_id INTEGER REFERENCES sectors(sector_id),
    measurement_date DATE NOT NULL,
    actual_value DECIMAL(15,4),
    target_value DECIMAL(15,4),
    stretch_value DECIMAL(15,4),
    variance DECIMAL(15,4), -- actual - target
    performance_percentage DECIMAL(6,2), -- (actual/target) * 100
    status VARCHAR(50), -- 'BELOW_TARGET', 'TARGET_MET', 'STRETCH_ACHIEVED'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vendor Performance Analytics
CREATE TABLE vendor_performance (
    performance_id SERIAL PRIMARY KEY,
    vendor_id INTEGER REFERENCES vendors(vendor_id),
    measurement_period_start DATE NOT NULL,
    measurement_period_end DATE NOT NULL,
    total_projects INTEGER DEFAULT 0,
    completed_on_time INTEGER DEFAULT 0,
    completed_late INTEGER DEFAULT 0,
    on_time_rate DECIMAL(5,2) DEFAULT 0, -- percentage
    average_delay_days DECIMAL(6,2) DEFAULT 0,
    total_penalties DECIMAL(12,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    compliance_score DECIMAL(5,2) DEFAULT 0, -- 0-100
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PREDICTIVE ANALYTICS
-- =====================================================

-- Risk Assessment
CREATE TABLE project_risk_assessment (
    risk_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    risk_score VARCHAR(20) DEFAULT 'LOW', -- 'LOW', 'MEDIUM', 'HIGH'
    predicted_delay_days INTEGER DEFAULT 0,
    confidence_level DECIMAL(5,2), -- 0-100
    risk_factors JSONB, -- Store array of contributing factors
    assessment_date DATE DEFAULT CURRENT_DATE,
    model_version VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- AUDIT TRAIL AND HISTORY
-- =====================================================

-- Change History
CREATE TABLE change_history (
    change_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER REFERENCES users(user_id),
    change_reason VARCHAR(200),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Escalation History
CREATE TABLE escalations (
    escalation_id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(project_id) ON DELETE CASCADE,
    escalation_level INTEGER DEFAULT 1, -- 1, 2, 3
    escalated_to INTEGER REFERENCES users(user_id),
    escalated_by INTEGER REFERENCES users(user_id),
    escalation_reason TEXT NOT NULL,
    response_required_by DATE,
    response_received_at TIMESTAMP,
    response_details TEXT,
    status VARCHAR(50) DEFAULT 'OPEN', -- 'OPEN', 'RESPONDED', 'RESOLVED', 'CLOSED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CONFIGURATION AND LOOKUP TABLES
-- =====================================================

-- SPT (Standard Processing Time) Configuration
CREATE TABLE spt_configuration (
    config_id SERIAL PRIMARY KEY,
    applied_load_min INTEGER,
    applied_load_max INTEGER,
    manhour_min INTEGER,
    manhour_max INTEGER,
    spt_days INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Configuration
CREATE TABLE system_config (
    config_id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    updated_by INTEGER REFERENCES users(user_id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Primary performance indexes
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_vendor ON projects(assigned_vendor_id);
CREATE INDEX idx_projects_team ON projects(team_id);
CREATE INDEX idx_projects_wmtrl_date ON projects(wmtrl_date);
CREATE INDEX idx_projects_fcomp_date ON projects(fcomp_date);
CREATE INDEX idx_projects_type_subtype ON projects(project_type, project_subtype);

CREATE INDEX idx_qi_audits_date ON qi_audits(audit_date);
CREATE INDEX idx_qi_audits_inspector ON qi_audits(inspector_id);
CREATE INDEX idx_qi_audits_project ON qi_audits(project_id);

CREATE INDEX idx_sla_tracking_status ON sla_tracking(status);
CREATE INDEX idx_sla_tracking_due_date ON sla_tracking(due_date);

CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_user_id);

CREATE INDEX idx_kpi_performance_date ON kpi_performance(measurement_date);
CREATE INDEX idx_kpi_performance_team ON kpi_performance(team_id);

CREATE INDEX idx_penalties_vendor ON penalties(vendor_id);
CREATE INDEX idx_penalties_status ON penalties(status);

-- =====================================================
-- INITIAL DATA SETUP
-- =====================================================

-- Insert default roles
INSERT INTO roles (role_name, description) VALUES
('Admin', 'System Administrator'),
('Manager', 'Sector/Team Manager'),
('Engineer', 'Design Engineer'),
('QI Inspector', 'Quality Inspector'),
('Clerk', 'Administrative Clerk'),
('Vendor', 'External Contractor/Vendor');

-- Insert default document types
INSERT INTO document_types (doc_type_name, doc_type_code, description, is_required, sla_days) VALUES
('Certificate of Completion', 'COC', 'Certificate of Completion from vendor', true, 5),
('Quality Inspection Report', 'QI', 'Quality inspection report', true, 7),
('Material Submission', 'MAT', 'Material submission documents', true, 3),
('Progress Report', 'PROG', 'Project progress report', false, null);

-- Insert SPT configuration based on applied load
INSERT INTO spt_configuration (applied_load_min, applied_load_max, spt_days) VALUES
(0, 50, 36),
(51, 100, 34),
(101, 200, 32),
(201, 300, 30),
(301, 400, 28),
(401, 500, 26),
(501, 1000, 23),
(1001, 999999, 20);

-- Insert SPT configuration based on manhours
INSERT INTO spt_configuration (manhour_min, manhour_max, spt_days) VALUES
(0, 50, 20),
(51, 100, 23),
(101, 200, 26),
(201, 300, 28),
(301, 400, 30),
(401, 500, 32),
(501, 1000, 36),
(1001, 1500, 40),
(1501, 2000, 45),
(2001, 999999, 50);

-- Insert KPI definitions based on GAINS document
INSERT INTO kpi_definitions (kpi_code, kpi_name, kpi_category, measurement_unit, target_value, stretch_value, weight_percentage, ol_level) VALUES
('CCTI', 'Customer Connection Timeliness Index', 'ENERGY_SALES', 'INDEX', 1.10, 1.02, 20.0, 'OL2'),
('PCA_CONV_RATE', 'PCA Conversion Rate', 'ENERGY_SALES', 'PERCENTAGE', 93.8, 95.7, 17.0, 'OL2'),
('AGING_PCA_COMP', 'Completion of Ageing PCAs', 'ENERGY_SALES', 'PERCENTAGE', 95.0, 100.0, 5.0, 'OL3'),
('PAI_ADHERENCE', 'Adherence to approved PAI SAIDI', 'ENERGY_SALES', 'PERCENTAGE', 10.0, 5.0, 5.0, 'OL2'),
('PCA_TERM_APT', 'PCA Termination/Modification APT', 'ENERGY_SALES', 'DAYS', 40.0, 40.0, 2.0, 'OL3'),
('PRDI', 'Project Resolution Duration Index', 'ENERGY_SALES', 'INDEX', 1.00, 0.95, 5.0, 'OL3'),
('QMI', 'Quality Management Index', 'CSI', 'PERCENTAGE', 90.0, 98.0, 10.0, 'OL3'),
('LTI', 'Lost Time Incidents', 'LTIFR', 'COUNT', 0.0, 0.0, 3.0, 'OL3'),
('FATALITY', 'Fatality', 'LTIFR', 'COUNT', 0.0, 0.0, 3.0, 'OL3');

-- Insert system configuration
INSERT INTO system_config (config_key, config_value, description, is_system) VALUES
('DEFAULT_SLA_DAYS', '7', 'Default SLA days for processes', false),
('AUTO_PENALTY_CALCULATION', 'true', 'Enable automatic penalty calculation', false),
('NOTIFICATION_EMAIL_ENABLED', 'true', 'Enable email notifications', false),
('QI_DAILY_TARGET_DEFAULT', '5', 'Default daily target for QI inspectors', false),
('CCTI_FORMULA_WEIGHT_PROJECT', '0.30', 'Project duration weight in CCTI formula', true),
('CCTI_FORMULA_WEIGHT_REVISED', '0.70', 'Revised duration weight in CCTI formula', true);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Project Dashboard View
CREATE VIEW vw_project_dashboard AS
SELECT 
    p.project_id,
    p.project_code,
    p.project_name,
    p.project_type,
    p.project_subtype,
    p.status,
    p.wmtrl_date,
    p.fcomp_date,
    p.spt_days,
    CASE 
        WHEN p.fcomp_date IS NOT NULL THEN p.fcomp_date - p.wmtrl_date
        ELSE CURRENT_DATE - p.wmtrl_date
    END as actual_days,
    v.vendor_name,
    t.team_name,
    s.sector_name,
    (SELECT COUNT(*) FROM qi_audits qa WHERE qa.project_id = p.project_id AND qa.status = 'COMPLETED') as audits_completed,
    (SELECT COUNT(*) FROM project_documents pd WHERE pd.project_id = p.project_id AND pd.status = 'APPROVED') as documents_approved,
    (SELECT SUM(penalty_amount) FROM penalties pen WHERE pen.project_id = p.project_id AND pen.status = 'ISSUED') as total_penalties
FROM projects p
LEFT JOIN vendors v ON p.assigned_vendor_id = v.vendor_id
LEFT JOIN teams t ON p.team_id = t.team_id
LEFT JOIN sectors s ON p.sector_id = s.sector_id;

-- Vendor Performance Summary View
CREATE VIEW vw_vendor_performance_summary AS
SELECT 
    v.vendor_id,
    v.vendor_name,
    COUNT(p.project_id) as total_projects,
    COUNT(CASE WHEN p.status = 'FCOMP' THEN 1 END) as completed_projects,
    COUNT(CASE WHEN p.fcomp_date <= p.wmtrl_date + INTERVAL '1 day' * p.spt_days THEN 1 END) as on_time_projects,
    ROUND(
        CASE 
            WHEN COUNT(CASE WHEN p.status = 'FCOMP' THEN 1 END) > 0 
            THEN (COUNT(CASE WHEN p.fcomp_date <= p.wmtrl_date + INTERVAL '1 day' * p.spt_days THEN 1 END) * 100.0 / 
                  COUNT(CASE WHEN p.status = 'FCOMP' THEN 1 END))
            ELSE 0 
        END, 2
    ) as on_time_rate,
    COALESCE(SUM(pen.penalty_amount), 0) as total_penalties
FROM vendors v
LEFT JOIN projects p ON v.vendor_id = p.assigned_vendor_id
LEFT JOIN penalties pen ON p.project_id = pen.project_id AND pen.status = 'ISSUED'
WHERE v.is_active = true
GROUP BY v.vendor_id, v.vendor_name;

-- QI Performance View
CREATE VIEW vw_qi_performance AS
SELECT 
    qi.inspector_id,
    u.first_name || ' ' || u.last_name as inspector_name,
    qi.daily_target,
    DATE(qa.audit_date) as audit_date,
    COUNT(qa.audit_id) as audits_completed,
    qi.daily_target - COUNT(qa.audit_id) as variance,
    CASE 
        WHEN COUNT(qa.audit_id) >= qi.daily_target THEN 'TARGET_MET'
        ELSE 'BELOW_TARGET'
    END as performance_status
FROM qi_inspectors qi
JOIN users u ON qi.user_id = u.user_id
LEFT JOIN qi_audits qa ON qi.inspector_id = qa.inspector_id 
    AND qa.status = 'COMPLETED' 
    AND qa.audit_date >= CURRENT_DATE - INTERVAL '30 days'
WHERE qi.is_active = true
GROUP BY qi.inspector_id, u.first_name, u.last_name, qi.daily_target, DATE(qa.audit_date)
ORDER BY audit_date DESC, inspector_name;