// pages/team-leader/dashboard.tsx
import { FC, useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { Container, Grid, Card, CardHeader, CardContent, Divider, Box, FormControl, InputLabel, Select, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, Typography, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableContainer, Tooltip, IconButton, Chip, SelectChangeEvent } from '@mui/material';
import Footer from '@/components/Footer';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface TableConfig { endpoint: string; label: string; columns: string[]; }

const TEAM_LEADER_TABLES: TableConfig[] = [
  { endpoint: 'projects', label: '🎯 All Projects', columns: ['project_code', 'project_name', 'vendor', 'status', 'priority', 'risk_score'] },
  { endpoint: 'project-team', label: '👥 Team Management', columns: ['project', 'user', 'role_in_project', 'assigned_date', 'is_active'] },
  { endpoint: 'vendors', label: '🏢 Vendor Management', columns: ['vendor_code', 'vendor_name', 'compliance_score', 'is_active', 'is_blacklisted'] },
  { endpoint: 'vendor-performance', label: '📈 Vendor Performance', columns: ['vendor', 'evaluation_date', 'on_time_rate', 'quality_score', 'overall_rating'] },
  { endpoint: 'penalties', label: '⚠️ Penalty Management', columns: ['project', 'vendor', 'penalty_amount', 'penalty_status', 'created_by'] },
  { endpoint: 'sla-tracking', label: '⏱️ SLA Control', columns: ['project', 'sla_rule', 'due_date', 'status', 'is_breached', 'breach_days'] },
  { endpoint: 'escalations', label: '🚨 Escalations', columns: ['project', 'escalation_reason', 'status', 'escalated_to_user', 'resolved_by'] },
  { endpoint: 'qi-performance', label: '📊 QI Performance', columns: ['qi_user', 'total_inspections', 'on_time_percentage', 'quality_rating'] },
  { endpoint: 'project-delays', label: '📉 Delay Analysis', columns: ['project', 'factor', 'delay_days', 'responsible_party', 'reported_by'] }
];

function TeamLeaderDashboard() {
  const [selectedTable, setSelectedTable] = useState<string>('projects');
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

  useEffect(() => { if (selectedTable) fetchTableData(selectedTable); }, [selectedTable]);

  const fetchTableData = async (endpoint: string) => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${endpoint}/`);
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      const data = await response.json();
      setTableData(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) { setError(err.message); setTableData([]); } finally { setLoading(false); }
  };

  const showSuccess = (message: string) => { setSuccessMessage(message); setTimeout(() => setSuccessMessage(''), 3000); };
  const handleAdd = () => { setModalMode('add'); setFormData({}); setCurrentRecord({}); setShowModal(true); };
  const handleEdit = (row: any) => { setModalMode('edit'); setCurrentRecord(row); setFormData({ ...row }); setShowModal(true); };

  const handleDelete = async (row: any) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const primaryKey = row.id || row.project_id || row.vendor_id || row.team_id || row.penalty_id || row.escalation_id || row.performance_id || row.delay_id;
      if (!primaryKey) throw new Error('Cannot determine record ID');
      const response = await fetch(`${API_BASE_URL}/${selectedTable}/${primaryKey}/`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || `Failed to delete: ${response.statusText}`); }
      showSuccess('Record deleted successfully!'); fetchTableData(selectedTable);
    } catch (err: any) { setError('Error deleting record: ' + err.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try {
      const primaryKey = currentRecord.id || currentRecord.project_id || currentRecord.vendor_id || currentRecord.team_id;
      const url = modalMode === 'add' ? `${API_BASE_URL}/${selectedTable}/` : `${API_BASE_URL}/${selectedTable}/${primaryKey}/`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(JSON.stringify(errorData) || `Failed to save: ${response.statusText}`); }
      showSuccess(`Record ${modalMode === 'add' ? 'added' : 'updated'} successfully!`); setShowModal(false); fetchTableData(selectedTable);
    } catch (err: any) { setError('Error saving record: ' + err.message); }
  };

  const handleInputChange = (column: string, value: any) => { setFormData((prev: any) => ({ ...prev, [column]: value })); };
  const handleTableChange = (event: SelectChangeEvent<string>) => { setSelectedTable(event.target.value); setPage(0); };
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };
  const getCurrentTableConfig = () => TEAM_LEADER_TABLES.find((t) => t.endpoint === selectedTable);

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return <Chip label={value ? 'Yes' : 'No'} color={value ? 'success' : 'default'} size="small" />;
    if (typeof value === 'object') return JSON.stringify(value);
    const strValue = String(value);
    return strValue.length > 50 ? <Tooltip title={strValue} arrow><span>{strValue.substring(0, 50) + '...'}</span></Tooltip> : strValue;
  };

  const tableConfig = getCurrentTableConfig();
  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Head><title>Team Leader Dashboard</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>Team Leader Dashboard</Typography>
            <Typography variant="subtitle2">Comprehensive team, vendor, and project management control</Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader action={<Button variant="contained" startIcon={<AddTwoToneIcon />} onClick={handleAdd}>Add New</Button>} title="Team Leadership" />
              <Divider />
              <CardContent>
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <FormControl sx={{ minWidth: 350, flexGrow: 1 }}>
                    <InputLabel>Select Table</InputLabel>
                    <Select value={selectedTable} onChange={handleTableChange} label="Select Table">
                      {TEAM_LEADER_TABLES.map((table) => <MenuItem key={table.endpoint} value={table.endpoint}>{table.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                {loading && <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="body1" color="text.secondary">Loading data...</Typography></Box>}
                {!loading && !error && tableData.length === 0 && selectedTable && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" color="text.secondary" gutterBottom>📭</Typography>
                    <Typography variant="h6" color="text.secondary">No data available</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Click "Add New" to create your first record</Typography>
                  </Box>
                )}
                {!loading && !error && tableData.length > 0 && tableConfig && (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {tableConfig.columns.map((column) => <TableCell key={column}><Typography variant="subtitle2" fontWeight="bold">{column.replace(/_/g, ' ').toUpperCase()}</Typography></TableCell>)}
                            <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">ACTIONS</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((row, index) => (
                            <TableRow hover key={row.id || index}>
                              {tableConfig.columns.map((column) => <TableCell key={column}>{renderCellValue(row[column])}</TableCell>)}
                              <TableCell align="center">
                                <Tooltip title="Edit" arrow><IconButton color="primary" size="small" onClick={() => handleEdit(row)} sx={{ mr: 1 }}><EditTwoToneIcon fontSize="small" /></IconButton></Tooltip>
                                <Tooltip title="Delete" arrow><IconButton color="error" size="small" onClick={() => handleDelete(row)}><DeleteTwoToneIcon fontSize="small" /></IconButton></Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Box p={2}><TablePagination component="div" count={tableData.length} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} page={page} rowsPerPage={rowsPerPage} rowsPerPageOptions={[5, 10, 25, 50]} /></Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>{modalMode === 'add' ? '➕ Add New Record' : '✏️ Edit Record'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {tableConfig && tableConfig.columns.map((column) => {
                const currentValue = formData[column];
                const isBoolean = typeof currentValue === 'boolean' || (currentRecord[column] !== undefined && typeof currentRecord[column] === 'boolean');
                return (
                  <Grid item xs={12} sm={6} key={column}>
                    {isBoolean ? (
                      <FormControl fullWidth>
                        <InputLabel>{column.replace(/_/g, ' ').toUpperCase()}</InputLabel>
                        <Select value={currentValue === true ? 'true' : currentValue === false ? 'false' : ''} onChange={(e) => handleInputChange(column, e.target.value === 'true')} label={column.replace(/_/g, ' ').toUpperCase()}>
                          <MenuItem value="">Select...</MenuItem>
                          <MenuItem value="true">Yes</MenuItem>
                          <MenuItem value="false">No</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <TextField fullWidth label={column.replace(/_/g, ' ').toUpperCase()} value={currentValue || ''} onChange={(e) => handleInputChange(column, e.target.value)} placeholder={`Enter ${column.replace(/_/g, ' ')}`} />
                    )}
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">{modalMode === 'add' ? 'Add Record' : 'Save Changes'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" sx={{ width: '100%' }}>{successMessage}</Alert>
      </Snackbar>
    </>
  );
}

TeamLeaderDashboard.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;
export default TeamLeaderDashboard;