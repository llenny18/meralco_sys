// pages/supervisor/supervisor-invoices.tsx
import { FC, useState, useEffect, ChangeEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { Container, Grid, Card, CardHeader, CardContent, Divider, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Snackbar, Typography, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TableContainer, Tooltip, IconButton, Chip, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import Footer from '@/components/Footer';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const ENDPOINT = 'invoices';
const COLUMNS = ['invoice_number', 'project', 'vendor', 'invoice_date', 'due_date', 'invoice_amount', 'penalty_amount', 'net_amount', 'payment_status'];

function SupervisorInvoices() {
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
    if (userRole !== 'engineer') {
      // Redirect non-admin users to their appropriate dashboard
      router.push('/unauthorized'); // or router.push('/dashboard');
    }
  }, [router]);

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

  useEffect(() => { fetchTableData(); }, []);

  const fetchTableData = async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/`);
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
      const primaryKey = row.id || row.user_id;
      if (!primaryKey) throw new Error('Cannot determine record ID');
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/${primaryKey}/`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || `Failed to delete: ${response.statusText}`); }
      showSuccess('Record deleted successfully!'); fetchTableData();
    } catch (err: any) { setError('Error deleting record: ' + err.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(null);
    try {
      const primaryKey = currentRecord.id || currentRecord.user_id;
      const url = modalMode === 'add' ? `${API_BASE_URL}/${ENDPOINT}/` : `${API_BASE_URL}/${ENDPOINT}/${primaryKey}/`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(JSON.stringify(errorData) || `Failed to save: ${response.statusText}`); }
      showSuccess(`Record ${modalMode === 'add' ? 'added' : 'updated'} successfully!`); setShowModal(false); fetchTableData();
    } catch (err: any) { setError('Error saving record: ' + err.message); }
  };

  const handleInputChange = (column: string, value: any) => { setFormData((prev: any) => ({ ...prev, [column]: value })); };
  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return <Chip label={value ? 'Yes' : 'No'} color={value ? 'success' : 'default'} size="small" />;
    if (typeof value === 'object') return JSON.stringify(value);
    const strValue = String(value);
    return strValue.length > 50 ? <Tooltip title={strValue} arrow><span>{strValue.substring(0, 50) + '...'}</span></Tooltip> : strValue;
  };

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Head><title>Invoices - WO Supervisor</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>🧾 Invoices</Typography>
            <Typography variant="subtitle2">Manage invoices</Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container direction="row" justifyContent="center" alignItems="stretch" spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader action={<Button variant="contained" startIcon={<AddTwoToneIcon />} onClick={handleAdd}>Add New</Button>} title="Invoices Management" />
              <Divider />
              <CardContent>
                {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>{successMessage}</Alert>}
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
                {loading && <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="body1" color="text.secondary">Loading data...</Typography></Box>}
                {!loading && !error && tableData.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" color="text.secondary" gutterBottom>📭</Typography>
                    <Typography variant="h6" color="text.secondary">No data available</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Click "Add New" to create your first record</Typography>
                  </Box>
                )}
                {!loading && !error && tableData.length > 0 && (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {COLUMNS.map((column) => <TableCell key={column}><Typography variant="subtitle2" fontWeight="bold">{column.replace(/_/g, ' ').toUpperCase()}</Typography></TableCell>)}
                            <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">ACTIONS</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((row, index) => (
                            <TableRow hover key={row.id || index}>
                              {COLUMNS.map((column) => <TableCell key={column}>{renderCellValue(row[column])}</TableCell>)}
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
              {COLUMNS.map((column) => {
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

SupervisorInvoices.getLayout = (page) => <SidebarLayout userRole="supervisor">{page}</SidebarLayout>;
export default SupervisorInvoices;
