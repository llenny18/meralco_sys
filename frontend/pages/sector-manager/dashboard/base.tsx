// pages/management/tables/index.tsx
import { FC, useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TableContainer,
  Tooltip,
  IconButton,
  useTheme,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import Footer from '@/components/Footer';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const USER_TYPES = {
  vendor: 'Vendor Representative',
  clerk: 'Clerk',
  engineering_aide: 'Engineering Aide',
  qi: 'Quality Inspector',
  engineer: 'Engineer/Design Engineer',
  wo_supervisor: 'WO Supervisor',
  team_leader: 'Team Leader',
  sector_manager: 'Sector Manager',
  admin: 'System Administrator'
};

interface TableConfig {
  endpoint: string;
  label: string;
  columns: string[];
}

const TABLE_CONFIGS: Record<string, TableConfig[]> = {
  vendor: [
    { endpoint: 'projects', label: '📁 My Projects', columns: ['project_code', 'project_name', 'status', 'contract_value', 'start_date', 'completion_date'] },
    { endpoint: 'project-documents', label: '📄 Documents', columns: ['project', 'doc_type', 'document_name', 'approval_status', 'upload_date'] },
    { endpoint: 'document-compliance', label: '✅ Compliance Status', columns: ['project', 'doc_type', 'is_submitted', 'is_approved', 'is_overdue'] },
    { endpoint: 'invoices', label: '💰 Invoices', columns: ['invoice_number', 'invoice_date', 'invoice_amount', 'penalty_amount', 'payment_status'] },
    { endpoint: 'payments', label: '💳 Payments', columns: ['invoice', 'payment_amount', 'payment_date', 'payment_method', 'payment_reference'] },
    { endpoint: 'penalties', label: '⚠️ Penalties', columns: ['project', 'violation_date', 'penalty_amount', 'penalty_status', 'waiver_reason'] },
    { endpoint: 'vendor-disputes', label: '💬 Disputes', columns: ['project', 'dispute_subject', 'dispute_status', 'submitted_date', 'resolution'] },
    { endpoint: 'vendor-feedback', label: '📝 Feedback', columns: ['feedback_type', 'feedback_subject', 'rating', 'status', 'response'] },
    { endpoint: 'vendor-performance', label: '📈 Performance', columns: ['evaluation_date', 'on_time_rate', 'quality_score', 'overall_rating'] }
  ],
  clerk: [
    { endpoint: 'projects', label: '📁 Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'start_date', 'completion_date'] },
    { endpoint: 'project-documents', label: '📄 Documents', columns: ['project', 'doc_type', 'document_name', 'approval_status', 'uploaded_by'] },
    { endpoint: 'document-compliance', label: '✅ Document Compliance', columns: ['project', 'doc_type', 'is_submitted', 'is_approved', 'due_date'] },
    { endpoint: 'notifications', label: '🔔 Notifications', columns: ['notification_type', 'subject', 'status', 'sent_at', 'read_at'] },
    { endpoint: 'change-logs', label: '📝 Change Logs', columns: ['table_name', 'change_type', 'field_name', 'changed_by', 'created_at'] }
  ],
  engineering_aide: [
    { endpoint: 'projects', label: '📁 Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'assigned_engineer', 'priority'] },
    { endpoint: 'project-documents', label: '📄 Documents', columns: ['project', 'doc_type', 'document_name', 'approval_status', 'upload_date'] },
    { endpoint: 'project-workflows', label: '🔄 Workflow', columns: ['project', 'stage', 'status', 'start_date', 'due_date', 'is_current_stage'] },
    { endpoint: 'notifications', label: '🔔 Notifications', columns: ['notification_type', 'subject', 'status', 'created_at', 'read_at'] },
    { endpoint: 'project-milestones', label: '🎯 Milestones', columns: ['project', 'milestone_name', 'target_date', 'completion_date', 'is_completed'] }
  ],
  qi: [
    { endpoint: 'qi-inspections', label: '🔍 Inspections', columns: ['project', 'inspection_type', 'scheduled_date', 'inspection_result', 'is_completed'] },
    { endpoint: 'qi-daily-targets', label: '🎯 Daily Targets', columns: ['target_date', 'target_audits', 'actual_audits', 'target_met', 'reason_not_met'] },
    { endpoint: 'qi-performance', label: '📈 My Performance', columns: ['evaluation_period_start', 'evaluation_period_end', 'total_inspections', 'on_time_percentage', 'quality_rating'] },
    { endpoint: 'inspection-types', label: '📋 Inspection Types', columns: ['inspection_name', 'inspection_description', 'estimated_duration_hours'] },
    { endpoint: 'projects', label: '📁 Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'assigned_qi'] }
  ],
  engineer: [
    { endpoint: 'projects', label: '📁 My Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'priority', 'risk_score'] },
    { endpoint: 'project-workflows', label: '🔄 Workflows', columns: ['project', 'stage', 'status', 'start_date', 'due_date', 'assigned_user'] },
    { endpoint: 'project-documents', label: '📄 Documents', columns: ['project', 'doc_type', 'document_name', 'approval_status', 'uploaded_by'] },
    { endpoint: 'sla-tracking', label: '⏱️ SLA Monitoring', columns: ['project', 'sla_rule', 'due_date', 'status', 'is_breached', 'breach_days'] },
    { endpoint: 'escalations', label: '⚠️ Escalations', columns: ['project', 'escalation_reason', 'status', 'escalation_date', 'resolved_by'] },
    { endpoint: 'project-delays', label: '📊 Delays', columns: ['project', 'factor', 'delay_days', 'delay_start_date', 'responsible_party'] },
    { endpoint: 'notifications', label: '🔔 Notifications', columns: ['notification_type', 'subject', 'status', 'created_at'] }
  ],
  wo_supervisor: [
    { endpoint: 'projects', label: '📁 All Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'priority', 'is_delayed'] },
    { endpoint: 'vendors', label: '🏢 Vendors', columns: ['vendor_code', 'vendor_name', 'compliance_score', 'is_active', 'is_blacklisted'] },
    { endpoint: 'penalties', label: '⚠️ Penalties', columns: ['project', 'vendor', 'penalty_amount', 'penalty_status', 'violation_date'] },
    { endpoint: 'sla-tracking', label: '⏱️ SLA Tracking', columns: ['project', 'sla_rule', 'due_date', 'status', 'is_breached'] },
    { endpoint: 'invoices', label: '💰 Invoices', columns: ['invoice_number', 'vendor', 'invoice_amount', 'payment_status', 'due_date'] },
    { endpoint: 'qi-inspections', label: '👥 QI Inspections', columns: ['project', 'assigned_qi', 'scheduled_date', 'inspection_result', 'is_completed'] },
    { endpoint: 'escalations', label: '🚨 Escalations', columns: ['project', 'escalation_reason', 'status', 'escalated_to_user'] },
    { endpoint: 'project-workflows', label: '🔄 Workflows', columns: ['project', 'stage', 'status', 'due_date', 'assigned_user'] }
  ],
  team_leader: [
    { endpoint: 'projects', label: '🎯 All Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'priority', 'risk_score'] },
    { endpoint: 'project-team', label: '👥 Team Management', columns: ['project', 'user', 'role_in_project', 'assigned_date', 'is_active'] },
    { endpoint: 'vendors', label: '🏢 Vendor Management', columns: ['vendor_code', 'vendor_name', 'compliance_score', 'is_active', 'is_blacklisted'] },
    { endpoint: 'vendor-performance', label: '📈 Vendor Performance', columns: ['vendor', 'evaluation_date', 'on_time_rate', 'quality_score', 'overall_rating'] },
    { endpoint: 'penalties', label: '⚠️ Penalty Management', columns: ['project', 'vendor', 'penalty_amount', 'penalty_status', 'created_by'] },
    { endpoint: 'sla-tracking', label: '⏱️ SLA Control', columns: ['project', 'sla_rule', 'due_date', 'status', 'is_breached', 'breach_days'] },
    { endpoint: 'escalations', label: '🚨 Escalations', columns: ['project', 'escalation_reason', 'status', 'escalated_to_user', 'resolved_by'] },
    { endpoint: 'qi-performance', label: '📊 QI Performance', columns: ['qi_user', 'total_inspections', 'on_time_percentage', 'quality_rating'] },
    { endpoint: 'project-delays', label: '📉 Delay Analysis', columns: ['project', 'factor', 'delay_days', 'responsible_party', 'reported_by'] }
  ],
  sector_manager: [
    { endpoint: 'sectors', label: '🗺️ Sectors', columns: ['sector_code', 'sector_name', 'sector_manager', 'location', 'is_active'] },
    { endpoint: 'projects', label: '📊 All Projects', columns: ['project_code', 'project_name', 'sector', 'status', 'contract_value', 'is_delayed'] },
    { endpoint: 'vendors', label: '🏢 Vendors', columns: ['vendor_code', 'vendor_name', 'compliance_score', 'is_active', 'is_blacklisted'] },
    { endpoint: 'vendor-performance', label: '📈 Vendor Performance', columns: ['vendor', 'evaluation_date', 'on_time_rate', 'quality_score', 'overall_rating'] },
    { endpoint: 'invoices', label: '💰 Financial', columns: ['invoice_number', 'vendor', 'invoice_amount', 'penalty_amount', 'payment_status'] },
    { endpoint: 'penalties', label: '⚠️ Penalties', columns: ['project', 'vendor', 'penalty_amount', 'penalty_status', 'issue_date'] },
    { endpoint: 'sla-tracking', label: '⏱️ SLA Compliance', columns: ['project', 'sla_rule', 'due_date', 'status', 'is_breached'] },
    { endpoint: 'project-delays', label: '📉 Delays', columns: ['project', 'factor', 'delay_days', 'responsible_party'] }
  ],
  admin: [
    { endpoint: 'users', label: '👥 Users', columns: ['username', 'email', 'role', 'is_active', 'phone_number'] },
    { endpoint: 'user-roles', label: '🔐 User Roles', columns: ['role_name', 'role_description', 'created_at'] },
    { endpoint: 'permissions', label: '🔑 Permissions', columns: ['permission_name', 'module_name', 'permission_description'] },
    { endpoint: 'role-permissions', label: '🔗 Role Permissions', columns: ['role', 'permission', 'created_at'] },
    { endpoint: 'vendors', label: '🏢 Vendors', columns: ['vendor_code', 'vendor_name', 'email', 'compliance_score', 'is_active'] },
    { endpoint: 'vendor-contacts', label: '📞 Vendor Contacts', columns: ['vendor', 'contact_name', 'contact_email', 'contact_phone', 'is_primary'] },
    { endpoint: 'sectors', label: '🗺️ Sectors', columns: ['sector_code', 'sector_name', 'sector_manager', 'is_active'] },
    { endpoint: 'project-status', label: '📊 Project Status', columns: ['status_name', 'status_order', 'status_color', 'is_active'] },
    { endpoint: 'projects', label: '📁 Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'priority'] },
    { endpoint: 'workflow-stages', label: '🔄 Workflow Stages', columns: ['stage_name', 'stage_order', 'default_duration_days', 'is_active'] },
    { endpoint: 'document-types', label: '📄 Document Types', columns: ['doc_type_name', 'is_required', 'created_at'] },
    { endpoint: 'sla-rules', label: '⏱️ SLA Rules', columns: ['rule_name', 'stage', 'deadline_days', 'is_active'] },
    { endpoint: 'penalty-rules', label: '⚠️ Penalty Rules', columns: ['rule_name', 'violation_type', 'penalty_formula', 'is_active'] },
    { endpoint: 'escalation-rules', label: '🚨 Escalation Rules', columns: ['rule_name', 'delay_threshold_days', 'escalate_to_role', 'is_active'] },
    { endpoint: 'notification-templates', label: '🔔 Notification Templates', columns: ['template_name', 'notification_type', 'is_active'] },
    { endpoint: 'delay-factors', label: '📉 Delay Factors', columns: ['factor_name', 'factor_category', 'is_active'] },
    { endpoint: 'system-settings', label: '⚙️ System Settings', columns: ['setting_key', 'setting_value', 'setting_type', 'is_editable'] },
    { endpoint: 'audit-logs', label: '📝 Audit Logs', columns: ['user', 'action_type', 'entity_type', 'status', 'created_at'] },
    { endpoint: 'user-sessions', label: '🔐 User Sessions', columns: ['user', 'login_time', 'logout_time', 'ip_address', 'is_active'] }
  ]
};

function DjangoTablesManager() {
  const theme = useTheme();
  const [userType, setUserType] = useState<string>('admin');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecord, setCurrentRecord] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const currentTables = TABLE_CONFIGS[userType] || [];

  useEffect(() => {
    if (currentTables.length > 0 && !selectedTable) {
      setSelectedTable(currentTables[0].endpoint);
    }
  }, [userType]);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const fetchTableData = async (endpoint: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/`);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      const data = await response.json();
      setTableData(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) {
      setError(err.message);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAdd = () => {
    setModalMode('add');
    setFormData({});
    setCurrentRecord({});
    setShowModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode('edit');
    setCurrentRecord(row);
    setFormData({ ...row });
    setShowModal(true);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;

    try {
      const primaryKey =
        row.id ||
        row.user_id ||
        row.vendor_id ||
        row.project_id ||
        row.role_id ||
        row.permission_id ||
        row.sector_id ||
        row.inspection_type_id ||
        row.setting_id ||
        row.session_id;

      if (!primaryKey) {
        throw new Error('Cannot determine record ID');
      }

      const response = await fetch(`${API_BASE_URL}/${selectedTable}/${primaryKey}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete: ${response.statusText}`);
      }

      showSuccess('Record deleted successfully!');
      fetchTableData(selectedTable);
    } catch (err: any) {
      setError('Error deleting record: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const primaryKey =
        currentRecord.id ||
        currentRecord.user_id ||
        currentRecord.vendor_id ||
        currentRecord.project_id ||
        currentRecord.role_id ||
        currentRecord.permission_id ||
        currentRecord.sector_id ||
        currentRecord.inspection_type_id ||
        currentRecord.setting_id ||
        currentRecord.session_id;

      const url =
        modalMode === 'add'
          ? `${API_BASE_URL}/${selectedTable}/`
          : `${API_BASE_URL}/${selectedTable}/${primaryKey}/`;

      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData) || `Failed to save: ${response.statusText}`);
      }

      showSuccess(`Record ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
      setShowModal(false);
      fetchTableData(selectedTable);
    } catch (err: any) {
      setError('Error saving record: ' + err.message);
    }
  };

  const handleInputChange = (column: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [column]: value
    }));
  };

  const handleUserTypeChange = (event: SelectChangeEvent<string>) => {
    setUserType(event.target.value);
    setSelectedTable('');
    setTableData([]);
    setPage(0);
  };

  const handleTableChange = (event: SelectChangeEvent<string>) => {
    setSelectedTable(event.target.value);
    setPage(0);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getCurrentTableConfig = (): TableConfig | undefined => {
    return currentTables.find((t) => t.endpoint === selectedTable);
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') {
      return (
        <Chip
          label={value ? 'Yes' : 'No'}
          color={value ? 'success' : 'default'}
          size="small"
        />
      );
    }
    if (typeof value === 'object') return JSON.stringify(value);
    const strValue = String(value);
    return strValue.length > 50 ? (
      <Tooltip title={strValue} arrow>
        <span>{strValue.substring(0, 50) + '...'}</span>
      </Tooltip>
    ) : (
      strValue
    );
  };

  const tableConfig = getCurrentTableConfig();
  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Head>
        <title>Django Tables Manager</title>
      </Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              Django Tables Manager
            </Typography>
            <Typography variant="subtitle2">
              View and manage all database tables across different user roles
            </Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="stretch"
          spacing={3}
        >
          <Grid item xs={12}>
            <Card>
              <CardHeader
                action={
                  <Button
                    variant="contained"
                    startIcon={<AddTwoToneIcon />}
                    onClick={handleAdd}
                  >
                    Add New
                  </Button>
                }
                title="Database Tables"
              />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 250 }}>
                    <InputLabel>User Type</InputLabel>
                    <Select
                      value={userType}
                      onChange={handleUserTypeChange}
                      label="User Type"
                    >
                      {Object.entries(USER_TYPES).map(([key, label]) => (
                        <MenuItem key={key} value={key}>
                          {label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl sx={{ minWidth: 350, flexGrow: 1 }}>
                    <InputLabel>Table</InputLabel>
                    <Select
                      value={selectedTable}
                      onChange={handleTableChange}
                      label="Table"
                    >
                      {currentTables.map((table) => (
                        <MenuItem key={table.endpoint} value={table.endpoint}>
                          {table.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {successMessage && (
                  <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
                    {successMessage}
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                    {error}
                  </Alert>
                )}

                {loading && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body1" color="text.secondary">
                      Loading data...
                    </Typography>
                  </Box>
                )}

                {!loading && !error && tableData.length === 0 && selectedTable && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" color="text.secondary" gutterBottom>
                      📭
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      No data available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Add New" to create your first record
                    </Typography>
                  </Box>
                )}

                {!loading && !error && tableData.length > 0 && tableConfig && (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {tableConfig.columns.map((column) => (
                              <TableCell key={column}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                  {column.replace(/_/g, ' ').toUpperCase()}
                                </Typography>
                              </TableCell>
                            ))}
                            <TableCell align="center">
                              <Typography variant="subtitle2" fontWeight="bold">
                                ACTIONS
                              </Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((row, index) => (
                            <TableRow hover key={row.id || index}>
                              {tableConfig.columns.map((column) => (
                                <TableCell key={column}>{renderCellValue(row[column])}</TableCell>
                              ))}
                              <TableCell align="center">
                                <Tooltip title="Edit" arrow>
                                  <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={() => handleEdit(row)}
                                    sx={{ mr: 1 }}
                                  >
                                    <EditTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" arrow>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => handleDelete(row)}
                                  >
                                    <DeleteTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box p={2}>
                      <TablePagination
                        component="div"
                        count={tableData.length}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        page={page}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                      />
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />

      {/* Add/Edit Dialog */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {modalMode === 'add' ? '➕ Add New Record' : '✏️ Edit Record'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {tableConfig &&
                tableConfig.columns.map((column) => {
                  const currentValue = formData[column];
                  const isBoolean =
                    typeof currentValue === 'boolean' ||
                    (currentRecord[column] !== undefined &&
                      typeof currentRecord[column] === 'boolean');

                  return (
                    <Grid item xs={12} sm={6} key={column}>
                      {isBoolean ? (
                        <FormControl fullWidth>
                          <InputLabel>{column.replace(/_/g, ' ').toUpperCase()}</InputLabel>
                          <Select
                            value={
                              currentValue === true
                                ? 'true'
                                : currentValue === false
                                ? 'false'
                                : ''
                            }
                            onChange={(e) =>
                              handleInputChange(column, e.target.value === 'true')
                            }
                            label={column.replace(/_/g, ' ').toUpperCase()}
                          >
                            <MenuItem value="">Select...</MenuItem>
                            <MenuItem value="true">Yes</MenuItem>
                            <MenuItem value="false">No</MenuItem>
                          </Select>
                        </FormControl>
                      ) : (
                        <TextField
                          fullWidth
                          label={column.replace(/_/g, ' ').toUpperCase()}
                          value={currentValue || ''}
                          onChange={(e) => handleInputChange(column, e.target.value)}
                          placeholder={`Enter ${column.replace(/_/g, ' ')}`}
                        />
                      )}
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {modalMode === 'add' ? 'Add Record' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

DjangoTablesManager.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;

export default DjangoTablesManager;