#!/usr/bin/env python3
"""
Script to generate role-based CRUD pages for all user types
Based on navigation structure document
"""

import os
import re

# Template content (reusable for all roles)
TEMPLATE = """// pages/{role}/{filename}
import {{ FC, useState, useEffect, ChangeEvent }} from 'react';
import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import {{ Container, Grid, Card, CardHeader, CardContent, Divider, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, Typography, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableContainer, Tooltip, IconButton, Chip, FormControl, InputLabel, Select, MenuItem }} from '@mui/material';
import Footer from '@/components/Footer';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const ENDPOINT = '{endpoint}';
const COLUMNS = {columns};

function {component_name}() {{
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecord, setCurrentRecord] = useState<any>({{}});
  const [formData, setFormData] = useState<any>({{}});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  useEffect(() => {{ fetchTableData(); }}, []);

  const fetchTableData = async () => {{
    setLoading(true); setError(null);
    try {{
      const response = await fetch(`${{API_BASE_URL}}/${{ENDPOINT}}/`);
      if (!response.ok) throw new Error(`Failed to fetch data: ${{response.statusText}}`);
      const data = await response.json();
      setTableData(Array.isArray(data) ? data : data.results || []);
    }} catch (err: any) {{ setError(err.message); setTableData([]); }} finally {{ setLoading(false); }}
  }};

  const showSuccess = (message: string) => {{ setSuccessMessage(message); setTimeout(() => setSuccessMessage(''), 3000); }};
  const handleAdd = () => {{ setModalMode('add'); setFormData({{}}); setCurrentRecord({{}}); setShowModal(true); }};
  const handleEdit = (row: any) => {{ setModalMode('edit'); setCurrentRecord(row); setFormData({{ ...row }}); setShowModal(true); }};

  const handleDelete = async (row: any) => {{
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {{
      const primaryKey = row.id || row.user_id;
      if (!primaryKey) throw new Error('Cannot determine record ID');
      const response = await fetch(`${{API_BASE_URL}}/${{ENDPOINT}}/${{primaryKey}}/`, {{ method: 'DELETE', headers: {{ 'Content-Type': 'application/json' }} }});
      if (!response.ok) {{ const errorData = await response.json().catch(() => ({{}})); throw new Error(errorData.detail || `Failed to delete: ${{response.statusText}}`); }}
      showSuccess('Record deleted successfully!'); fetchTableData();
    }} catch (err: any) {{ setError('Error deleting record: ' + err.message); }}
  }};

  const handleSubmit = async (e: React.FormEvent) => {{
    e.preventDefault(); setError(null);
    try {{
      const primaryKey = currentRecord.id || currentRecord.user_id;
      const url = modalMode === 'add' ? `${{API_BASE_URL}}/${{ENDPOINT}}/` : `${{API_BASE_URL}}/${{ENDPOINT}}/${{primaryKey}}/`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const response = await fetch(url, {{ method, headers: {{ 'Content-Type': 'application/json' }}, body: JSON.stringify(formData) }});
      if (!response.ok) {{ const errorData = await response.json().catch(() => ({{}})); throw new Error(JSON.stringify(errorData) || `Failed to save: ${{response.statusText}}`); }}
      showSuccess(`Record ${{modalMode === 'add' ? 'added' : 'updated'}} successfully!`); setShowModal(false); fetchTableData();
    }} catch (err: any) {{ setError('Error saving record: ' + err.message); }}
  }};

  const handleInputChange = (column: string, value: any) => {{ setFormData((prev: any) => ({{ ...prev, [column]: value }})); }};
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {{ setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }};

  const renderCellValue = (value: any) => {{
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return <Chip label={{value ? 'Yes' : 'No'}} color={{value ? 'success' : 'default'}} size="small" />;
    if (typeof value === 'object') return JSON.stringify(value);
    const strValue = String(value);
    return strValue.length > 50 ? <Tooltip title={{strValue}} arrow><span>{{strValue.substring(0, 50) + '...'}}</span></Tooltip> : strValue;
  }};

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Head><title>{page_title} - {role_name}</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>{icon} {page_title}</Typography>
            <Typography variant="subtitle2">{subtitle}</Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={{3}}>
          <Grid item xs={{12}}>
            <Card>
              <CardHeader action={{<Button variant="contained" startIcon={{<AddTwoToneIcon />}} onClick={{handleAdd}}>Add New</Button>}} title="{page_title} Management" />
              <Divider />
              <CardContent>
                {{successMessage && <Alert severity="success" sx={{{{ mb: 2 }}}} onClose={{() => setSuccessMessage('')}}>{{successMessage}}</Alert>}}
                {{error && <Alert severity="error" sx={{{{ mb: 2 }}}} onClose={{() => setError(null)}}>{{error}}</Alert>}}
                {{loading && <Box sx={{{{ textAlign: 'center', py: 8 }}}}><Typography variant="body1" color="text.secondary">Loading data...</Typography></Box>}}
                {{!loading && !error && tableData.length === 0 && (
                  <Box sx={{{{ textAlign: 'center', py: 8 }}}}>
                    <Typography variant="h4" color="text.secondary" gutterBottom>📭</Typography>
                    <Typography variant="h6" color="text.secondary">No data available</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{{{ mt: 1 }}}}>Click "Add New" to create your first record</Typography>
                  </Box>
                )}}
                {{!loading && !error && tableData.length > 0 && (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {{COLUMNS.map((column) => <TableCell key={{column}}><Typography variant="subtitle2" fontWeight="bold">{{column.replace(/_/g, ' ').toUpperCase()}}</Typography></TableCell>)}}
                            <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">ACTIONS</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {{paginatedData.map((row, index) => (
                            <TableRow hover key={{row.id || index}}>
                              {{COLUMNS.map((column) => <TableCell key={{column}}>{{renderCellValue(row[column])}}</TableCell>)}}
                              <TableCell align="center">
                                <Tooltip title="Edit" arrow><IconButton color="primary" size="small" onClick={{() => handleEdit(row)}} sx={{{{ mr: 1 }}}}><EditTwoToneIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="Delete" arrow><IconButton color="error" size="small" onClick={{() => handleDelete(row)}}><DeleteTwoToneIcon fontSize="small" /></IconButton></Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box p={{2}}><TablePagination component="div" count={{tableData.length}} onPageChange={{handleChangePage}} onRowsPerPageChange={{handleChangeRowsPerPage}} page={{page}} rowsPerPage={{rowsPerPage}} rowsPerPageOptions={{[5, 10, 25, 50]}} /></Box>
                  </>
                )}}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Dialog open={{showModal}} onClose={{() => setShowModal(false)}} maxWidth="md" fullWidth>
        <DialogTitle>{{modalMode === 'add' ? '➕ Add New Record' : '✏️ Edit Record'}}</DialogTitle>
        <DialogContent dividers>
          {{error && <Alert severity="error" sx={{{{ mb: 2 }}}}>{{error}}</Alert>}}
          <Box component="form" onSubmit={{handleSubmit}}>
            <Grid container spacing={{2}}>
              {{COLUMNS.map((column) => {{
                const currentValue = formData[column];
                const isBoolean = typeof currentValue === 'boolean' || (currentRecord[column] !== undefined && typeof currentRecord[column] === 'boolean');
                return (
                  <Grid item xs={{12}} sm={{6}} key={{column}}>
                    {{isBoolean ? (
                      <FormControl fullWidth>
                        <InputLabel>{{column.replace(/_/g, ' ').toUpperCase()}}</InputLabel>
                        <Select value={{currentValue === true ? 'true' : currentValue === false ? 'false' : ''}} onChange={{(e) => handleInputChange(column, e.target.value === 'true')}} label={{column.replace(/_/g, ' ').toUpperCase()}}>
                          <MenuItem value="">Select...</MenuItem>
                          <MenuItem value="true">Yes</MenuItem>
                          <MenuItem value="false">No</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField fullWidth label={{column.replace(/_/g, ' ').toUpperCase()}} value={{currentValue || ''}} onChange={{(e) => handleInputChange(column, e.target.value)}} placeholder={{`Enter ${{column.replace(/_/g, ' ')}}`}} />
                    )}}
                  </Grid>
                );
              }})}}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={{() => setShowModal(false)}} color="inherit">Cancel</Button>
          <Button onClick={{handleSubmit}} variant="contained" color="primary">{{modalMode === 'add' ? 'Add Record' : 'Save Changes'}}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={{!!successMessage}} autoHideDuration={{3000}} onClose={{() => setSuccessMessage('')}} anchorOrigin={{{{ vertical: 'bottom', horizontal: 'right' }}}}>
        <Alert severity="success" sx={{{{ width: '100%' }}}}>{{successMessage}}</Alert>
      </Snackbar>
    </>
  );
}}

{component_name}.getLayout = (page) => <SidebarLayout userRole="{role}">{{page}}</SidebarLayout>;
export default {component_name};
"""

# Page configurations by role
ROLE_PAGES = {
    'vendor': [
        {'filename': 'vendor-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'status', 'start_date', 'completion_date', 'assigned_engineer'], 'title': 'My Projects', 'icon': '📋', 'subtitle': 'View your assigned projects'},
        {'filename': 'vendor-documents.tsx', 'endpoint': 'project-documents', 'columns': ['project', 'doc_type', 'document_name', 'upload_date', 'approval_status', 'version_number'], 'title': 'Document Upload', 'icon': '📄', 'subtitle': 'Upload and manage project documents'},
        {'filename': 'vendor-compliance.tsx', 'endpoint': 'document-compliance', 'columns': ['project', 'doc_type', 'is_submitted', 'submission_date', 'is_approved', 'due_date', 'is_overdue'], 'title': 'Document Compliance', 'icon': '✅', 'subtitle': 'Track document submission compliance'},
        {'filename': 'vendor-billing.tsx', 'endpoint': 'invoices', 'columns': ['invoice_number', 'invoice_date', 'due_date', 'invoice_amount', 'penalty_amount', 'net_amount', 'payment_status'], 'title': 'Billing Summary', 'icon': '💰', 'subtitle': 'View invoices and billing information'},
        {'filename': 'vendor-payments.tsx', 'endpoint': 'payments', 'columns': ['invoice', 'payment_amount', 'payment_date', 'payment_method', 'payment_reference'], 'title': 'Payments', 'icon': '💳', 'subtitle': 'Track payment history'},
        {'filename': 'vendor-disputes.tsx', 'endpoint': 'vendor-disputes', 'columns': ['dispute_subject', 'dispute_type', 'dispute_status', 'submitted_date', 'resolution_date'], 'title': 'Disputes', 'icon': '⚔️', 'subtitle': 'Submit and track disputes'},
        {'filename': 'vendor-feedback.tsx', 'endpoint': 'vendor-feedback', 'columns': ['feedback_type', 'feedback_subject', 'rating', 'status', 'created_at'], 'title': 'Feedback', 'icon': '💬', 'subtitle': 'Provide feedback and suggestions'},
        {'filename': 'vendor-notifications.tsx', 'endpoint': 'notifications', 'columns': ['notification_type', 'subject', 'message', 'status', 'sent_at', 'read_at'], 'title': 'Notifications', 'icon': '🔔', 'subtitle': 'View your notifications'},
    ],
    
    'clerk': [
        {'filename': 'clerk-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'vendor', 'status', 'assigned_engineer', 'start_date', 'completion_date'], 'title': 'Projects', 'icon': '📁', 'subtitle': 'Manage project records'},
        {'filename': 'clerk-documents.tsx', 'endpoint': 'project-documents', 'columns': ['project', 'doc_type', 'document_name', 'uploaded_by', 'upload_date', 'approval_status', 'is_current_version'], 'title': 'Documents', 'icon': '📄', 'subtitle': 'Manage project documents'},
        {'filename': 'clerk-document-types.tsx', 'endpoint': 'document-types', 'columns': ['doc_type_name', 'doc_type_description', 'is_required', 'created_at'], 'title': 'Document Types', 'icon': '📋', 'subtitle': 'Manage document type definitions'},
        {'filename': 'clerk-compliance.tsx', 'endpoint': 'document-compliance', 'columns': ['project', 'doc_type', 'is_submitted', 'submission_date', 'is_approved', 'is_overdue', 'overdue_days'], 'title': 'Document Compliance', 'icon': '✅', 'subtitle': 'Track document compliance status'},
        {'filename': 'clerk-notifications.tsx', 'endpoint': 'notifications', 'columns': ['recipient_user', 'notification_type', 'subject', 'status', 'sent_at', 'delivered_at'], 'title': 'Notifications', 'icon': '🔔', 'subtitle': 'Manage notifications'},
        {'filename': 'clerk-change-logs.tsx', 'endpoint': 'change-logs', 'columns': ['table_name', 'record_id', 'change_type', 'field_name', 'old_value', 'new_value', 'changed_by', 'created_at'], 'title': 'Change Logs', 'icon': '📋', 'subtitle': 'View system change history'},
    ],
    
    'aide': [
        {'filename': 'aide-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'vendor', 'sector', 'status', 'priority', 'start_date', 'completion_date', 'is_delayed'], 'title': 'Projects', 'icon': '📊', 'subtitle': 'Coordinate project activities'},
        {'filename': 'aide-workflow.tsx', 'endpoint': 'project-workflows', 'columns': ['project', 'stage', 'assigned_user', 'start_date', 'due_date', 'completion_date', 'status', 'is_current_stage'], 'title': 'Workflow', 'icon': '🔄', 'subtitle': 'Track project workflow stages'},
        {'filename': 'aide-workflow-stages.tsx', 'endpoint': 'workflow-stages', 'columns': ['stage_name', 'stage_description', 'stage_order', 'default_duration_days', 'is_active'], 'title': 'Workflow Stages', 'icon': '📝', 'subtitle': 'Manage workflow stage definitions'},
        {'filename': 'aide-documents.tsx', 'endpoint': 'project-documents', 'columns': ['project', 'doc_type', 'document_name', 'uploaded_by', 'upload_date', 'approval_status'], 'title': 'Documents', 'icon': '📄', 'subtitle': 'Manage project documents'},
        {'filename': 'aide-compliance.tsx', 'endpoint': 'document-compliance', 'columns': ['project', 'doc_type', 'is_submitted', 'submission_date', 'is_approved', 'due_date', 'is_overdue'], 'title': 'Document Compliance', 'icon': '✅', 'subtitle': 'Monitor document compliance'},
        {'filename': 'aide-notifications.tsx', 'endpoint': 'notifications', 'columns': ['recipient_user', 'notification_type', 'subject', 'status', 'sent_at', 'read_at'], 'title': 'Notifications', 'icon': '🔔', 'subtitle': 'View notifications'},
        {'filename': 'aide-change-logs.tsx', 'endpoint': 'change-logs', 'columns': ['table_name', 'record_id', 'change_type', 'field_name', 'changed_by', 'created_at'], 'title': 'Change History', 'icon': '📋', 'subtitle': 'View change history'},
    ],
    
    'qi': [
        {'filename': 'qi-inspections.tsx', 'endpoint': 'qi-inspections', 'columns': ['project', 'inspection_type', 'scheduled_date', 'inspection_date', 'inspection_result', 'is_completed'], 'title': 'My Inspections', 'icon': '🔍', 'subtitle': 'Manage your quality inspections'},
        {'filename': 'qi-inspection-types.tsx', 'endpoint': 'inspection-types', 'columns': ['inspection_name', 'inspection_description', 'estimated_duration_hours', 'created_at'], 'title': 'Inspection Types', 'icon': '📋', 'subtitle': 'View inspection type definitions'},
        {'filename': 'qi-daily-targets.tsx', 'endpoint': 'qi-daily-targets', 'columns': ['target_date', 'target_audits', 'actual_audits', 'target_met', 'reason_not_met', 'reason_category'], 'title': 'Daily Targets', 'icon': '🎯', 'subtitle': 'Track daily inspection targets'},
        {'filename': 'qi-performance.tsx', 'endpoint': 'qi-performance', 'columns': ['evaluation_period_start', 'evaluation_period_end', 'total_inspections', 'on_time_percentage', 'targets_met', 'targets_missed', 'quality_rating'], 'title': 'Performance', 'icon': '📊', 'subtitle': 'View performance metrics'},
        {'filename': 'qi-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'vendor', 'sector', 'status', 'assigned_qi'], 'title': 'Projects', 'icon': '📁', 'subtitle': 'View assigned projects'},
        {'filename': 'qi-workflow.tsx', 'endpoint': 'project-workflows', 'columns': ['project', 'stage', 'assigned_user', 'due_date', 'status', 'is_current_stage'], 'title': 'Workflow', 'icon': '🔄', 'subtitle': 'Track project workflow'},
        {'filename': 'qi-notifications.tsx', 'endpoint': 'notifications', 'columns': ['notification_type', 'subject', 'message', 'status', 'sent_at'], 'title': 'Notifications', 'icon': '🔔', 'subtitle': 'View your notifications'},
    ],
    
    'engineer': [
        {'filename': 'engineer-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'vendor', 'sector', 'status', 'assigned_engineer', 'priority', 'risk_score', 'start_date', 'completion_date'], 'title': 'Projects', 'icon': '🏗️', 'subtitle': 'Manage engineering projects'},
        {'filename': 'engineer-milestones.tsx', 'endpoint': 'project-milestones', 'columns': ['project', 'milestone_name', 'target_date', 'completion_date', 'is_completed', 'milestone_order'], 'title': 'Project Milestones', 'icon': '🎯', 'subtitle': 'Track project milestones'},
        {'filename': 'engineer-documents.tsx', 'endpoint': 'project-documents', 'columns': ['project', 'doc_type', 'document_name', 'uploaded_by', 'upload_date', 'approval_status', 'approved_by'], 'title': 'Documents', 'icon': '📄', 'subtitle': 'Review and approve documents'},
        {'filename': 'engineer-workflow.tsx', 'endpoint': 'project-workflows', 'columns': ['project', 'stage', 'assigned_user', 'start_date', 'due_date', 'completion_date', 'status'], 'title': 'Workflow', 'icon': '🔄', 'subtitle': 'Monitor project workflows'},
        {'filename': 'engineer-sla-tracking.tsx', 'endpoint': 'sla-tracking', 'columns': ['project', 'sla_rule', 'start_date', 'due_date', 'completion_date', 'status', 'is_breached', 'breach_days'], 'title': 'SLA Tracking', 'icon': '⏱️', 'subtitle': 'Monitor SLA compliance'},
        {'filename': 'engineer-vendor-performance.tsx', 'endpoint': 'vendor-performance', 'columns': ['vendor', 'evaluation_date', 'on_time_rate', 'quality_score', 'compliance_score', 'overall_rating'], 'title': 'Vendor Performance', 'icon': '⭐', 'subtitle': 'Evaluate vendor performance'},
        {'filename': 'engineer-change-logs.tsx', 'endpoint': 'change-logs', 'columns': ['table_name', 'record_id', 'change_type', 'field_name', 'old_value', 'new_value', 'changed_by', 'created_at'], 'title': 'Change History', 'icon': '📋', 'subtitle': 'View change history'},
    ],
    
    'supervisor': [
        {'filename': 'supervisor-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'vendor', 'sector', 'status', 'assigned_engineer', 'assigned_qi', 'priority', 'risk_score', 'is_delayed', 'delay_days'], 'title': 'All Projects', 'icon': '🏗️', 'subtitle': 'Supervise all projects'},
        {'filename': 'supervisor-milestones.tsx', 'endpoint': 'project-milestones', 'columns': ['project', 'milestone_name', 'target_date', 'completion_date', 'is_completed'], 'title': 'Project Milestones', 'icon': '🎯', 'subtitle': 'Track project milestones'},
        {'filename': 'supervisor-project-team.tsx', 'endpoint': 'project-team', 'columns': ['project', 'user', 'role_in_project', 'assigned_date', 'is_active'], 'title': 'Project Team', 'icon': '👥', 'subtitle': 'Manage project team assignments'},
        {'filename': 'supervisor-project-delays.tsx', 'endpoint': 'project-delays', 'columns': ['project', 'factor', 'delay_days', 'delay_start_date', 'delay_end_date', 'responsible_party'], 'title': 'Project Delays', 'icon': '⏱️', 'subtitle': 'Track project delays'},
        {'filename': 'supervisor-workflow.tsx', 'endpoint': 'project-workflows', 'columns': ['project', 'stage', 'assigned_user', 'start_date', 'due_date', 'completion_date', 'status', 'is_current_stage'], 'title': 'Workflow Management', 'icon': '🔄', 'subtitle': 'Manage project workflows'},
        {'filename': 'supervisor-workflow-stages.tsx', 'endpoint': 'workflow-stages', 'columns': ['stage_name', 'stage_order', 'default_duration_days', 'is_active'], 'title': 'Workflow Stages', 'icon': '📝', 'subtitle': 'Configure workflow stages'},
        {'filename': 'supervisor-sla-rules.tsx', 'endpoint': 'sla-rules', 'columns': ['rule_name', 'stage', 'deadline_days', 'warning_threshold_days', 'is_active'], 'title': 'SLA Rules', 'icon': '⚖️', 'subtitle': 'Manage SLA rules'},
        {'filename': 'supervisor-sla-tracking.tsx', 'endpoint': 'sla-tracking', 'columns': ['project', 'sla_rule', 'start_date', 'due_date', 'completion_date', 'status', 'is_breached', 'breach_days'], 'title': 'SLA Tracking', 'icon': '📊', 'subtitle': 'Monitor SLA compliance'},
        {'filename': 'supervisor-compliance.tsx', 'endpoint': 'document-compliance', 'columns': ['project', 'doc_type', 'is_submitted', 'submission_date', 'is_approved', 'due_date', 'is_overdue', 'overdue_days'], 'title': 'Document Compliance', 'icon': '✅', 'subtitle': 'Monitor document compliance'},
        {'filename': 'supervisor-penalty-rules.tsx', 'endpoint': 'penalty-rules', 'columns': ['rule_name', 'violation_type', 'penalty_formula', 'minimum_penalty', 'maximum_penalty', 'grace_period_days', 'is_active'], 'title': 'Penalty Rules', 'icon': '⚖️', 'subtitle': 'Configure penalty rules'},
        {'filename': 'supervisor-penalties.tsx', 'endpoint': 'penalties', 'columns': ['project', 'vendor', 'penalty_rule', 'violation_date', 'delay_days', 'penalty_amount', 'penalty_status', 'issue_date'], 'title': 'Penalties', 'icon': '💰', 'subtitle': 'Manage penalties'},
        {'filename': 'supervisor-qi-inspections.tsx', 'endpoint': 'qi-inspections', 'columns': ['project', 'inspection_type', 'assigned_qi', 'scheduled_date', 'inspection_date', 'inspection_result', 'is_completed'], 'title': 'QI Inspections', 'icon': '🔍', 'subtitle': 'Oversee quality inspections'},
        {'filename': 'supervisor-qi-targets.tsx', 'endpoint': 'qi-daily-targets', 'columns': ['qi_user', 'target_date', 'target_audits', 'actual_audits', 'target_met', 'reason_not_met'], 'title': 'QI Daily Targets', 'icon': '🎯', 'subtitle': 'Monitor QI targets'},
        {'filename': 'supervisor-qi-performance.tsx', 'endpoint': 'qi-performance', 'columns': ['qi_user', 'evaluation_period_start', 'evaluation_period_end', 'total_inspections', 'on_time_percentage', 'quality_rating'], 'title': 'QI Performance', 'icon': '📊', 'subtitle': 'Track QI performance'},
        {'filename': 'supervisor-vendors.tsx', 'endpoint': 'vendors', 'columns': ['vendor_code', 'vendor_name', 'company_name', 'email', 'phone_number', 'compliance_score', 'is_active', 'is_blacklisted'], 'title': 'Vendors', 'icon': '🏢', 'subtitle': 'Manage vendor information'},
        {'filename': 'supervisor-vendor-performance.tsx', 'endpoint': 'vendor-performance', 'columns': ['vendor', 'evaluation_date', 'on_time_rate', 'document_submission_rate', 'quality_score', 'compliance_score', 'overall_rating'], 'title': 'Vendor Performance', 'icon': '⭐', 'subtitle': 'Evaluate vendor performance'},
        {'filename': 'supervisor-vendor-disputes.tsx', 'endpoint': 'vendor-disputes', 'columns': ['vendor', 'project', 'dispute_subject', 'dispute_status', 'submitted_date', 'assigned_to', 'resolution_date'], 'title': 'Vendor Disputes', 'icon': '⚔️', 'subtitle': 'Handle vendor disputes'},
        {'filename': 'supervisor-vendor-feedback.tsx', 'endpoint': 'vendor-feedback', 'columns': ['vendor', 'feedback_type', 'feedback_subject', 'rating', 'status', 'reviewed_by'], 'title': 'Vendor Feedback', 'icon': '💬', 'subtitle': 'Review vendor feedback'},
        {'filename': 'supervisor-invoices.tsx', 'endpoint': 'invoices', 'columns': ['invoice_number', 'project', 'vendor', 'invoice_date', 'due_date', 'invoice_amount', 'penalty_amount', 'net_amount', 'payment_status'], 'title': 'Invoices', 'icon': '🧾', 'subtitle': 'Manage invoices'},
        {'filename': 'supervisor-payments.tsx', 'endpoint': 'payments', 'columns': ['invoice', 'payment_amount', 'payment_date', 'payment_method', 'payment_reference', 'processed_by'], 'title': 'Payments', 'icon': '💳', 'subtitle': 'Track payments'},
        {'filename': 'supervisor-escalation-rules.tsx', 'endpoint': 'escalation-rules', 'columns': ['rule_name', 'trigger_condition', 'delay_threshold_days', 'escalate_to_role', 'is_active'], 'title': 'Escalation Rules', 'icon': '⚠️', 'subtitle': 'Configure escalation rules'},
        {'filename': 'supervisor-escalations.tsx', 'endpoint': 'escalations', 'columns': ['project', 'escalation_rule', 'escalated_from_user', 'escalated_to_user', 'escalation_date', 'status', 'resolution_date'], 'title': 'Escalations', 'icon': '🚨', 'subtitle': 'Manage escalations'},
        {'filename': 'supervisor-delay-factors.tsx', 'endpoint': 'delay-factors', 'columns': ['factor_name', 'factor_category', 'factor_description', 'is_active'], 'title': 'Delay Factors', 'icon': '⏱️', 'subtitle': 'Define delay factors'},
        {'filename': 'supervisor-documents.tsx', 'endpoint': 'project-documents', 'columns': ['project', 'doc_type', 'document_name', 'uploaded_by', 'upload_date', 'approval_status', 'approved_by'], 'title': 'Project Documents', 'icon': '📄', 'subtitle': 'Manage all documents'},
        {'filename': 'supervisor-document-types.tsx', 'endpoint': 'document-types', 'columns': ['doc_type_name', 'doc_type_description', 'is_required'], 'title': 'Document Types', 'icon': '📋', 'subtitle': 'Configure document types'},
        {'filename': 'supervisor-notifications.tsx', 'endpoint': 'notifications', 'columns': ['recipient_user', 'notification_type', 'subject', 'status', 'sent_at', 'delivered_at', 'read_at'], 'title': 'Notifications', 'icon': '🔔', 'subtitle': 'View all notifications'},
        {'filename': 'supervisor-notification-templates.tsx', 'endpoint': 'notification-templates', 'columns': ['template_name', 'template_subject', 'notification_type', 'is_active'], 'title': 'Notification Templates', 'icon': '📝', 'subtitle': 'Manage notification templates'},
        {'filename': 'supervisor-change-logs.tsx', 'endpoint': 'change-logs', 'columns': ['table_name', 'record_id', 'change_type', 'field_name', 'old_value', 'new_value', 'changed_by', 'created_at'], 'title': 'Change Logs', 'icon': '📋', 'subtitle': 'View change history'},
        {'filename': 'supervisor-audit-logs.tsx', 'endpoint': 'audit-logs', 'columns': ['user', 'action_type', 'action_description', 'entity_type', 'status', 'created_at'], 'title': 'Audit Logs', 'icon': '🔒', 'subtitle': 'View audit logs'},
    ],
    
    'leader': [
        {'filename': 'leader-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'vendor', 'sector', 'status', 'assigned_engineer', 'assigned_qi', 'wo_supervisor', 'priority', 'risk_score'], 'title': 'All Projects', 'icon': '🏗️', 'subtitle': 'Strategic project oversight'},
        {'filename': 'leader-sectors.tsx', 'endpoint': 'sectors', 'columns': ['sector_code', 'sector_name', 'sector_manager', 'location', 'is_active'], 'title': 'Sectors', 'icon': '🗺️', 'subtitle': 'Manage organizational sectors'},
        {'filename': 'leader-project-status.tsx', 'endpoint': 'project-statuses', 'columns': ['status_name', 'status_description', 'status_order', 'status_color', 'is_active'], 'title': 'Project Status', 'icon': '🚦', 'subtitle': 'Configure project statuses'},
        {'filename': 'leader-vendor-analytics.tsx', 'endpoint': 'vendor-performance', 'columns': ['vendor', 'evaluation_date', 'on_time_rate', 'document_submission_rate', 'quality_score', 'compliance_score', 'overall_rating'], 'title': 'Vendor Analytics', 'icon': '📊', 'subtitle': 'Analyze vendor performance'},
        {'filename': 'leader-delay-analysis.tsx', 'endpoint': 'project-delays', 'columns': ['project', 'factor', 'delay_days', 'responsible_party', 'delay_start_date'], 'title': 'Delay Analysis', 'icon': '⏱️', 'subtitle': 'Analyze project delays'},
        {'filename': 'leader-sla-overview.tsx', 'endpoint': 'sla-tracking', 'columns': ['project', 'sla_rule', 'due_date', 'completion_date', 'status', 'is_breached', 'breach_days'], 'title': 'SLA Overview', 'icon': '📈', 'subtitle': 'Monitor SLA compliance'},
        {'filename': 'leader-sla-rules.tsx', 'endpoint': 'sla-rules', 'columns': ['rule_name', 'stage', 'deadline_days', 'warning_threshold_days', 'is_active'], 'title': 'SLA Rules Management', 'icon': '⚖️', 'subtitle': 'Configure SLA rules'},
        {'filename': 'leader-penalties.tsx', 'endpoint': 'penalties', 'columns': ['project', 'vendor', 'penalty_rule', 'violation_date', 'penalty_amount', 'penalty_status'], 'title': 'Penalty Overview', 'icon': '💰', 'subtitle': 'Review penalty records'},
        {'filename': 'leader-penalty-rules.tsx', 'endpoint': 'penalty-rules', 'columns': ['rule_name', 'violation_type', 'penalty_formula', 'minimum_penalty', 'maximum_penalty'], 'title': 'Penalty Rules', 'icon': '⚖️', 'subtitle': 'Configure penalty rules'},
        {'filename': 'leader-billing.tsx', 'endpoint': 'invoices', 'columns': ['invoice_number', 'project', 'vendor', 'invoice_date', 'invoice_amount', 'payment_status'], 'title': 'Billing Overview', 'icon': '🧾', 'subtitle': 'Monitor billing activities'},
        {'filename': 'leader-qi-overview.tsx', 'endpoint': 'qi-performance', 'columns': ['qi_user', 'evaluation_period_start', 'evaluation_period_end', 'total_inspections', 'on_time_percentage', 'targets_met', 'targets_missed'], 'title': 'QI Performance Overview', 'icon': '📊', 'subtitle': 'Monitor QI team performance'},
        {'filename': 'leader-qi-workload.tsx', 'endpoint': 'qi-daily-targets', 'columns': ['qi_user', 'target_date', 'target_audits', 'actual_audits', 'target_met', 'reason_not_met'], 'title': 'QI Workload Analysis', 'icon': '📋', 'subtitle': 'Analyze QI workload'},
        {'filename': 'leader-escalations.tsx', 'endpoint': 'escalations', 'columns': ['project', 'escalation_rule', 'escalated_to_user', 'escalation_date', 'status', 'resolution_date'], 'title': 'Escalation Management', 'icon': '🚨', 'subtitle': 'Handle escalated issues'},
        {'filename': 'leader-escalation-rules.tsx', 'endpoint': 'escalation-rules', 'columns': ['rule_name', 'trigger_condition', 'delay_threshold_days', 'escalate_to_role', 'is_active'], 'title': 'Escalation Rules', 'icon': '⚠️', 'subtitle': 'Configure escalation rules'},
        {'filename': 'leader-users.tsx', 'endpoint': 'users', 'columns': ['username', 'email', 'role', 'is_active', 'phone_number', 'last_login'], 'title': 'Users', 'icon': '👥', 'subtitle': 'Manage system users'},
        {'filename': 'leader-user-roles.tsx', 'endpoint': 'user-roles', 'columns': ['role_name', 'role_description', 'created_at'], 'title': 'User Roles', 'icon': '🎭', 'subtitle': 'Manage user roles'},
        {'filename': 'leader-permissions.tsx', 'endpoint': 'permissions', 'columns': ['permission_name', 'permission_description', 'module_name'], 'title': 'Permissions', 'icon': '🔐', 'subtitle': 'Manage system permissions'},
        {'filename': 'leader-role-permissions.tsx', 'endpoint': 'role-permissions', 'columns': ['role', 'permission', 'created_at'], 'title': 'Role Permissions', 'icon': '🔑', 'subtitle': 'Assign permissions to roles'},
        {'filename': 'leader-vendors.tsx', 'endpoint': 'vendors', 'columns': ['vendor_code', 'vendor_name', 'company_name', 'compliance_score', 'is_active', 'is_blacklisted'], 'title': 'Vendor Management', 'icon': '🏢', 'subtitle': 'Manage vendor accounts'},
        {'filename': 'leader-vendor-contacts.tsx', 'endpoint': 'vendor-contacts', 'columns': ['vendor', 'contact_name', 'contact_position', 'contact_email', 'is_primary'], 'title': 'Vendor Contacts', 'icon': '📞', 'subtitle': 'Manage vendor contacts'},
        {'filename': 'leader-change-logs.tsx', 'endpoint': 'change-logs', 'columns': ['table_name', 'record_id', 'change_type', 'changed_by', 'created_at'], 'title': 'Change Logs', 'icon': '📋', 'subtitle': 'View system changes'},
        {'filename': 'leader-audit-logs.tsx', 'endpoint': 'audit-logs', 'columns': ['user', 'action_type', 'entity_type', 'status', 'created_at'], 'title': 'Audit Logs', 'icon': '🔒', 'subtitle': 'View audit trail'},
    ],
    
    'sector-manager': [
        {'filename': 'sector-manager-sectors.tsx', 'endpoint': 'sectors', 'columns': ['sector_code', 'sector_name', 'sector_manager', 'location', 'is_active'], 'title': 'Sector Overview', 'icon': '🗺️', 'subtitle': 'Manage sector operations'},
        {'filename': 'sector-manager-projects.tsx', 'endpoint': 'projects', 'columns': ['project_code', 'project_name', 'vendor', 'status', 'priority', 'contract_value', 'completion_date'], 'title': 'Project Portfolio', 'icon': '📊', 'subtitle': 'Strategic project portfolio'},
        {'filename': 'sector-manager-vendor-performance.tsx', 'endpoint': 'vendor-performance', 'columns': ['vendor', 'evaluation_date', 'overall_rating', 'compliance_score'], 'title': 'Vendor Performance', 'icon': '⭐', 'subtitle': 'Executive vendor overview'},
        {'filename': 'sector-manager-sla.tsx', 'endpoint': 'sla-tracking', 'columns': ['project', 'sla_rule', 'status', 'is_breached'], 'title': 'SLA Compliance', 'icon': '📈', 'subtitle': 'Monitor SLA compliance'},
        {'filename': 'sector-manager-financial.tsx', 'endpoint': 'invoices', 'columns': ['invoice_number', 'vendor', 'invoice_amount', 'payment_status'], 'title': 'Financial Overview', 'icon': '💰', 'subtitle': 'Financial performance metrics'},
        {'filename': 'sector-manager-penalties.tsx', 'endpoint': 'penalties', 'columns': ['project', 'vendor', 'penalty_amount', 'penalty_status'], 'title': 'Penalties Overview', 'icon': '⚖️', 'subtitle': 'Monitor penalty records'},
    ],
}


def to_pascal_case(text):
    """Convert kebab-case or snake_case to PascalCase"""
    return ''.join(word.capitalize() for word in re.split(r'[-_]', text))


def get_role_name(role):
    """Get display name for role"""
    role_names = {
        'vendor': 'Vendor Portal',
        'clerk': 'Clerk Portal',
        'aide': 'Engineering Aide',
        'qi': 'Quality Inspector',
        'engineer': 'Engineer Portal',
        'supervisor': 'WO Supervisor',
        'leader': 'Team Leader',
        'sector-manager': 'Sector Manager'
    }
    return role_names.get(role, role.title())


def generate_page(config, role):
    """Generate a single page file for a specific role"""
    # Generate component name from filename
    component_name = to_pascal_case(config['filename'].replace('.tsx', ''))
    
    # Format columns as TypeScript array
    columns_str = str(config['columns']).replace("'", "'")
    
    # Generate the file content
    content = TEMPLATE.format(
        role=role,
        filename=config['filename'],
        endpoint=config['endpoint'],
        columns=columns_str,
        component_name=component_name,
        page_title=config['title'],
        icon=config['icon'],
        subtitle=config['subtitle'],
        role_name=get_role_name(role)
    )
    
    return content


def main():
    """Main function to generate all pages for all roles"""
    base_output_dir = 'generated_pages'
    
    # Create base output directory
    if not os.path.exists(base_output_dir):
        os.makedirs(base_output_dir)
        print(f"✅ Created directory: {base_output_dir}")
    
    total_generated = 0
    
    # Generate pages for each role
    for role, pages in ROLE_PAGES.items():
        role_dir = os.path.join(base_output_dir, role)
        
        # Create role directory
        if not os.path.exists(role_dir):
            os.makedirs(role_dir)
            print(f"\n📁 Created directory: {role_dir}")
        
        generated_count = 0
        
        # Generate each page for this role
        for config in pages:
            try:
                content = generate_page(config, role)
                filepath = os.path.join(role_dir, config['filename'])
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                generated_count += 1
                total_generated += 1
                print(f"  ✅ {config['filename']}")
                
            except Exception as e:
                print(f"  ❌ Error generating {config['filename']}: {str(e)}")
        
        print(f"  📊 Generated {generated_count}/{len(pages)} pages for {role}")
    
    # Print summary
    print(f"\n{'='*60}")
    print(f"🎉 GENERATION COMPLETE!")
    print(f"{'='*60}")
    print(f"Total files generated: {total_generated}")
    print(f"Roles processed: {len(ROLE_PAGES)}")
    print(f"Output directory: {base_output_dir}/")
    
    # Print breakdown by role
    print(f"\n📋 Breakdown by Role:")
    for role, pages in ROLE_PAGES.items():
        print(f"  • {get_role_name(role)}: {len(pages)} pages")
    
    print(f"\n📝 Next steps:")
    print(f"1. Copy role directories to your Next.js pages/ directory")
    print(f"2. Verify API endpoints match your backend")
    print(f"3. Test CRUD functionality for each role")
    print(f"4. Customize dashboards and reports pages as needed")
    print(f"5. Implement role-based access control in SidebarLayout")


if __name__ == '__main__':
    main()