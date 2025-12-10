#!/usr/bin/env python3
"""
Script to generate admin CRUD pages based on qi-list.tsx template
"""

import os
import re

# Template content (qi-list.tsx)
TEMPLATE = """// pages/admin/{filename}
import {{ FC, useState, useEffect, ChangeEvent }} from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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

function {component_name}() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    // If not authenticated or missing token, redirect to login
    if (!isAuthenticated || !authToken || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }

    // Optional: Check if user has admin role
    if (userRole !== 'admin') {
      // Redirect non-admin users to their appropriate dashboard
      router.push('/unauthorized'); // or router.push('/dashboard');
    }
  }, [router]);
{
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
      <Head><title>{page_title} - System Administration</title></Head>
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

{component_name}.getLayout = (page) => <SidebarLayout userRole="admin">{{page}}</SidebarLayout>;
export default {component_name};
"""

# Page configurations
PAGES = [
    # QI Management
    {
        'filename': 'admin-qi-inspections.tsx',
        'endpoint': 'qi-inspections',
        'columns': ['project', 'inspection_type', 'assigned_qi', 'scheduled_date', 'inspection_date', 'inspection_result', 'is_completed'],
        'title': 'QI Inspections',
        'icon': '🔍',
        'subtitle': 'Manage quality inspections and their results'
    },
    {
        'filename': 'admin-qi-daily-targets.tsx',
        'endpoint': 'qi-daily-targets',
        'columns': ['qi_user', 'target_date', 'target_audits', 'actual_audits', 'target_met', 'reason_not_met', 'reason_category'],
        'title': 'QI Daily Targets',
        'icon': '🎯',
        'subtitle': 'Track daily quality inspection targets and performance'
    },
    {
        'filename': 'admin-qi-performance.tsx',
        'endpoint': 'qi-performance',
        'columns': ['qi_user', 'evaluation_period_start', 'evaluation_period_end', 'total_inspections', 'on_time_percentage', 'targets_met', 'targets_missed', 'quality_rating'],
        'title': 'QI Performance',
        'icon': '📊',
        'subtitle': 'Monitor QI team performance metrics'
    },
    
    # Penalty Management
    {
        'filename': 'admin-penalty-rules.tsx',
        'endpoint': 'penalty-rules',
        'columns': ['rule_name', 'rule_description', 'violation_type', 'penalty_formula', 'minimum_penalty', 'maximum_penalty', 'grace_period_days', 'is_active'],
        'title': 'Penalty Rules',
        'icon': '⚖️',
        'subtitle': 'Configure penalty rules and violation types'
    },
    {
        'filename': 'admin-penalties.tsx',
        'endpoint': 'penalties',
        'columns': ['project', 'vendor', 'penalty_rule', 'violation_date', 'delay_days', 'penalty_amount', 'penalty_status', 'issue_date', 'payment_date', 'waived_by'],
        'title': 'Penalties',
        'icon': '💰',
        'subtitle': 'Manage penalty records and payments'
    },
    
    # Billing Management
    {
        'filename': 'admin-invoices.tsx',
        'endpoint': 'invoices',
        'columns': ['invoice_number', 'project', 'vendor', 'invoice_date', 'due_date', 'invoice_amount', 'penalty_amount', 'net_amount', 'payment_status', 'payment_date'],
        'title': 'Invoices',
        'icon': '🧾',
        'subtitle': 'Manage invoices and billing information'
    },
    {
        'filename': 'admin-payments.tsx',
        'endpoint': 'payments',
        'columns': ['invoice', 'payment_amount', 'payment_date', 'payment_method', 'payment_reference', 'processed_by', 'created_at'],
        'title': 'Payments',
        'icon': '💳',
        'subtitle': 'Track payment transactions and processing'
    },
    
    # Notification Management
    {
        'filename': 'admin-notification-templates.tsx',
        'endpoint': 'notification-templates',
        'columns': ['template_name', 'template_subject', 'notification_type', 'is_active', 'created_at', 'updated_at'],
        'title': 'Notification Templates',
        'icon': '📝',
        'subtitle': 'Manage notification email and message templates'
    },
    {
        'filename': 'admin-notifications.tsx',
        'endpoint': 'notifications',
        'columns': ['recipient_user', 'recipient_email', 'notification_type', 'subject', 'status', 'sent_at', 'delivered_at', 'read_at', 'error_message'],
        'title': 'Notifications',
        'icon': '🔔',
        'subtitle': 'View notification delivery status and history'
    },
    
    # Escalation Management
    {
        'filename': 'admin-escalation-rules.tsx',
        'endpoint': 'escalation-rules',
        'columns': ['rule_name', 'rule_description', 'trigger_condition', 'delay_threshold_days', 'escalate_to_role', 'notification_template', 'is_active'],
        'title': 'Escalation Rules',
        'icon': '⚠️',
        'subtitle': 'Configure automatic escalation rules and triggers'
    },
    {
        'filename': 'admin-escalations.tsx',
        'endpoint': 'escalations',
        'columns': ['project', 'escalation_rule', 'escalated_from_user', 'escalated_to_user', 'escalation_reason', 'escalation_date', 'status', 'resolution_date', 'resolved_by'],
        'title': 'Escalations',
        'icon': '🚨',
        'subtitle': 'Track and manage escalated issues'
    },
    
    # Analytics
    {
        'filename': 'admin-delay-factors.tsx',
        'endpoint': 'delay-factors',
        'columns': ['factor_name', 'factor_category', 'factor_description', 'is_active', 'created_at'],
        'title': 'Delay Factors',
        'icon': '⏱️',
        'subtitle': 'Define and categorize project delay factors'
    },
    {
        'filename': 'admin-project-delays.tsx',
        'endpoint': 'project-delays',
        'columns': ['project', 'factor', 'delay_days', 'delay_start_date', 'delay_end_date', 'responsible_party', 'notes', 'reported_by'],
        'title': 'Project Delays',
        'icon': '📅',
        'subtitle': 'Monitor and analyze project delays'
    },
    
    # Vendor Portal
    {
        'filename': 'admin-vendor-disputes.tsx',
        'endpoint': 'vendor-disputes',
        'columns': ['vendor', 'project', 'dispute_type', 'dispute_subject', 'dispute_status', 'submitted_date', 'assigned_to', 'resolution', 'resolved_by', 'resolution_date'],
        'title': 'Vendor Disputes',
        'icon': '⚔️',
        'subtitle': 'Handle vendor disputes and resolutions'
    },
    {
        'filename': 'admin-vendor-feedback.tsx',
        'endpoint': 'vendor-feedback',
        'columns': ['vendor', 'feedback_type', 'feedback_subject', 'rating', 'status', 'reviewed_by', 'review_date', 'response'],
        'title': 'Vendor Feedback',
        'icon': '💬',
        'subtitle': 'Review and respond to vendor feedback'
    },
    
    # Audit & Logs
    {
        'filename': 'admin-change-logs.tsx',
        'endpoint': 'change-logs',
        'columns': ['table_name', 'record_id', 'change_type', 'field_name', 'old_value', 'new_value', 'changed_by', 'change_reason', 'ip_address', 'created_at'],
        'title': 'Change Logs',
        'icon': '📋',
        'subtitle': 'Track all database changes and modifications'
    },
    {
        'filename': 'admin-audit-logs.tsx',
        'endpoint': 'audit-logs',
        'columns': ['user', 'action_type', 'action_description', 'entity_type', 'entity_id', 'ip_address', 'user_agent', 'status', 'error_message', 'created_at'],
        'title': 'System Audit Logs',
        'icon': '🔒',
        'subtitle': 'Monitor system access and security events'
    },
    
    # System Configuration
    {
        'filename': 'admin-system-settings.tsx',
        'endpoint': 'system-settings',
        'columns': ['setting_key', 'setting_value', 'setting_type', 'setting_description', 'is_editable', 'created_at', 'updated_at'],
        'title': 'System Settings',
        'icon': '⚙️',
        'subtitle': 'Configure system-wide settings and parameters'
    },
]


def to_pascal_case(text):
    """Convert kebab-case or snake_case to PascalCase"""
    return ''.join(word.capitalize() for word in re.split(r'[-_]', text))


def generate_page(config):
    """Generate a single admin page file"""
    # Generate component name from filename
    component_name = to_pascal_case(config['filename'].replace('.tsx', '').replace('admin-', ''))
    
    # Format columns as TypeScript array
    columns_str = str(config['columns']).replace("'", "'")
    
    # Generate the file content
    content = TEMPLATE.format(
        filename=config['filename'],
        endpoint=config['endpoint'],
        columns=columns_str,
        component_name=component_name,
        page_title=config['title'],
        icon=config['icon'],
        subtitle=config['subtitle']
    )
    
    return content


def main():
    """Main function to generate all admin pages"""
    output_dir = 'generated_admin_pages'
    
    # Create output directory
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"✅ Created directory: {output_dir}")
    
    # Generate each page
    generated_count = 0
    for config in PAGES:
        try:
            content = generate_page(config)
            filepath = os.path.join(output_dir, config['filename'])
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            generated_count += 1
            print(f"✅ Generated: {config['filename']}")
            
        except Exception as e:
            print(f"❌ Error generating {config['filename']}: {str(e)}")
    
    print(f"\n🎉 Successfully generated {generated_count}/{len(PAGES)} admin pages!")
    print(f"📁 Files saved in: {output_dir}/")
    print("\n📝 Next steps:")
    print("1. Copy the generated files to your Next.js project's pages/admin/ directory")
    print("2. Verify the API endpoints match your backend")
    print("3. Test each CRUD page functionality")


if __name__ == '__main__':
    main()