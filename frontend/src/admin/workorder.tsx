// pages/work-orders/index.tsx
import { FC, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
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
  Button,
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
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import Footer from '@/components/Footer';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import CloudUploadTwoToneIcon from '@mui/icons-material/CloudUploadTwoTone';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';

const API_BASE_URL = 'https://aimswo.online/api/api/v1';

interface WorkOrder {
  wo_id: string;
  wo_no: string;
  description: string;
  location: string;
  municipality: string;
  vendor_name: string;
  supervisor_name: string;
  status: string;
  priority: string;
  is_vip: boolean;
  date_energized: string;
  total_resolution_days: number;
  is_delayed: boolean;
  delay_days: number;
  total_manhours: number;
  total_estimated_cost: number;
  created_at: string;
}

function WorkOrders() {
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const authToken = localStorage.getItem('authToken');
    if (!isAuthenticated || !authToken || isAuthenticated !== 'true') {
      router.push('/login');
    }
  }, [router]);

  // State management
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [crewFilter, setCrewFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Dialogs
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Partial<WorkOrder>>({});
  
  // File upload
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);

  // Fetch work orders
  const fetchWorkOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('page_size', rowsPerPage.toString());
      
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (crewFilter) params.append('assigned_crew', crewFilter);
      if (searchQuery) params.append('search', searchQuery);
      
      const response = await fetch(`${API_BASE_URL}/work-orders/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.results) {
        setWorkOrders(data.results);
        setTotalCount(data.count);
      } else {
        setWorkOrders(data);
        setTotalCount(data.length);
      }
    } catch (err: any) {
      setError(err.message);
      setWorkOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, [page, rowsPerPage, statusFilter, priorityFilter, crewFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchWorkOrders();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // CRUD Operations
  const handleAdd = () => {
    setFormData({});
    setShowAddModal(true);
  };

  const handleEdit = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setFormData(wo);
    setShowEditModal(true);
  };

  const handleView = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setShowViewModal(true);
  };

  const handleDelete = async (wo: WorkOrder) => {
    if (!window.confirm(`Are you sure you want to delete work order ${wo.wo_no}?`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/work-orders/${wo.wo_id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
}
});
  if (!response.ok) {
    throw new Error('Failed to delete');
  }
  
  showSuccess('Work order deleted successfully');
  fetchWorkOrders();
} catch (err: any) {
  setError('Error deleting work order: ' + err.message);
}
};
const handleSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setError(null);
try {
  const url = selectedWO 
    ? `${API_BASE_URL}/work-orders/${selectedWO.wo_id}/`
    : `${API_BASE_URL}/work-orders/`;
  
  const method = selectedWO ? 'PUT' : 'POST';
  
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: JSON.stringify(formData)
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(JSON.stringify(errorData));
  }
  
  showSuccess(`Work order ${selectedWO ? 'updated' : 'created'} successfully`);
  setShowAddModal(false);
  setShowEditModal(false);
  fetchWorkOrders();
} catch (err: any) {
  setError('Error saving work order: ' + err.message);
}
};
// Excel Import
const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
if (e.target.files && e.target.files[0]) {
setImportFile(e.target.files[0]);
}
};
const handleImportSubmit = async () => {
if (!importFile) {
setError('Please select a file');
return;
}
setLoading(true);
setImportProgress(0);

const formData = new FormData();
formData.append('file', importFile);

try {
  const response = await fetch(`${API_BASE_URL}/work-orders/import-excel/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Import failed');
  }
  
  const result = await response.json();
  
  showSuccess(
    `Import completed: ${result.created} created, ${result.updated} updated. ${
      result.errors.length > 0 ? `${result.errors.length} errors.` : ''
    }`
  );
  
  setShowImportModal(false);
  setImportFile(null);
  fetchWorkOrders();
} catch (err: any) {
  setError('Import error: ' + err.message);
} finally {
  setLoading(false);
  setImportProgress(0);
}
};
// Excel Export
const handleExport = async () => {
try {
const params = new URLSearchParams();
if (statusFilter) params.append('status', statusFilter);
if (priorityFilter) params.append('priority', priorityFilter);
if (crewFilter) params.append('crew', crewFilter);
  const response = await fetch(
    `${API_BASE_URL}/work-orders/export-excel/?${params.toString()}`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    }
  );
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `work_orders_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
  
  showSuccess('Export completed successfully');
} catch (err: any) {
  setError('Export error: ' + err.message);
}
};
// Utility functions
const showSuccess = (message: string) => {
setSuccessMessage(message);
setTimeout(() => setSuccessMessage(''), 3000);
};
const handleChangePage = (_event: unknown, newPage: number) => {
setPage(newPage);
};
const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
setRowsPerPage(parseInt(event.target.value, 10));
setPage(0);
};
const getStatusColor = (status: string) => {
const colors: Record<string, any> = {
'NEW': 'info',
'FOR AUDIT': 'warning',
'AUDITED': 'success',
'NO COC': 'error',
'PAID': 'success',
'CANCELLED': 'default'
};
return colors[status] || 'default';
};
const getPriorityColor = (priority: string) => {
const colors: Record<string, any> = {
'Critical': 'error',
'High': 'warning',
'Medium': 'info',
'Low': 'default'
};
return colors[priority] || 'default';
};
return (
<>
<Head>
<title>Work Order Monitoring - Smart Vendor System</title>
</Head>
  <PageTitleWrapper>
    <Grid container justifyContent="space-between" alignItems="center">
      <Grid item>
        <Typography variant="h3" component="h3" gutterBottom>
          📋 Work Order Monitoring
        </Typography>
        <Typography variant="subtitle2">
          Track and manage all work orders from completion to billing
        </Typography>
      </Grid>
      <Grid item>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListTwoToneIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudUploadTwoToneIcon />}
            onClick={() => setShowImportModal(true)}
          >
            Import Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<CloudDownloadTwoToneIcon />}
            onClick={handleExport}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddTwoToneIcon />}
            onClick={handleAdd}
          >
            Add Work Order
          </Button>
        </Box>
      </Grid>
    </Grid>
  </PageTitleWrapper>

  <Container maxWidth="xl">
    <Grid container spacing={3}>
      {/* Filters Panel */}
      {showFilters && (
        <Grid item xs={12}>
          <Card>
            <CardHeader title="🔍 Filters" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    placeholder="WO No, Description, Location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="NEW">New</MenuItem>
                      <MenuItem value="FOR AUDIT">For Audit</MenuItem>
                      <MenuItem value="AUDITED">Audited</MenuItem>
                      <MenuItem value="NO COC">No COC</MenuItem>
                      <MenuItem value="PAID">Paid</MenuItem>
                      <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="Critical">Critical</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Low">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Crew</InputLabel>
                    <Select
                      value={crewFilter}
                      onChange={(e) => setCrewFilter(e.target.value)}
                      label="Crew"
                    >
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="AVECO">AVECO</MenuItem>
                      <MenuItem value="CHALLENGER">CHALLENGER</MenuItem>
                      <MenuItem value="ECOM">ECOM</MenuItem>
                      <MenuItem value="POWERHOUSE">POWERHOUSE</MenuItem>
                      <MenuItem value="VJC">VJC</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Main Table */}
      <Grid item xs={12}>
        <Card>
          <CardHeader 
            title={`Work Orders (${totalCount} total)`}
            action={
              <Chip 
                label={loading ? 'Loading...' : `${workOrders.length} displayed`} 
                color="primary" 
                size="small" 
              />
            }
          />
          <Divider />
          <CardContent>
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
            
            {loading && <LinearProgress sx={{ mb: 2 }} />}
            
            {!loading && workOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h4" color="text.secondary" gutterBottom>
                  📭
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  No work orders found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your filters or add a new work order
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            WO NO
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            DESCRIPTION
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            LOCATION
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            VENDOR
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            CREW
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            STATUS
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            PRIORITY
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle2" fontWeight="bold">
                            DAYS
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="subtitle2" fontWeight="bold">
                            ACTIONS
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {workOrders.map((wo) => (
                        <TableRow hover key={wo.wo_id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {wo.is_vip && (
                                <Chip label="VIP" color="error" size="small" />
                              )}
                              <Typography variant="body2" fontWeight="medium">
                                {wo.wo_no}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={wo.description} arrow>
                              <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                {wo.description}
                              </Typography>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                              {wo.location}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {wo.vendor_name || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={wo.assigned_crew || 'Unassigned'} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={wo.status} 
                              color={getStatusColor(wo.status)} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={wo.priority} 
                              color={getPriorityColor(wo.priority)} 
                              size="small" 
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {wo.total_resolution_days || 0}
                              </Typography>
                              {wo.is_delayed && (
                                <Chip 
                                  label={`+${wo.delay_days} delayed`} 
                                  color="error" 
                                  size="small" 
                                  sx={{ mt: 0.5 }}
                                />
                              )}
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details" arrow>
                              <IconButton 
                                color="info" 
                                size="small" 
                                onClick={() => handleView(wo)}
                                sx={{ mr: 0.5 }}
                              >
                                <VisibilityTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton 
                                color="primary" 
                                size="small" 
                                onClick={() => handleEdit(wo)}
                                sx={{ mr: 0.5 }}
                              >
                                <EditTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete" arrow>
                              <IconButton 
                                color="error" 
                                size="small" 
                                onClick={() => handleDelete(wo)}
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
                    count={totalCount}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    rowsPerPageOptions={[10, 25, 50, 100]}
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

  {/* Import Dialog */}
  <Dialog open={showImportModal} onClose={() => setShowImportModal(false)} maxWidth="sm" fullWidth>
    <DialogTitle>📥 Import Work Orders from Excel</DialogTitle>
    <DialogContent dividers>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload an Excel file with work order data. The file should match the C1 sheet format.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <input
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            id="import-file-input"
            type="file"
            onChange={handleImportFile}
          />
          <label htmlFor="import-file-input">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadTwoToneIcon />}
              fullWidth
            >
              Choose Excel File
            </Button>
          </label>
          
          {importFile && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                Selected file: {importFile.name}
              </Alert>
            </Box>
          )}
        </Box>
        
        {importProgress > 0 && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={importProgress} />
          </Box>
        )}
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowImportModal(false)} color="inherit">
        Cancel
      </Button>
      <Button 
        onClick={handleImportSubmit} 
        variant="contained" 
        color="primary"
        disabled={!importFile || loading}
      >
        Import
      </Button>
    </DialogActions>
  </Dialog>

  {/* View Details Dialog */}
  <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="md" fullWidth>
    <DialogTitle>📄 Work Order Details</DialogTitle>
    <DialogContent dividers>
      {selectedWO && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              WO Number
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {selectedWO.wo_no}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Status
            </Typography>
            <Chip label={selectedWO.status} color={getStatusColor(selectedWO.status)} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">
              Description
            </Typography>
            <Typography variant="body1">
              {selectedWO.description}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Location
            </Typography>
            <Typography variant="body1">
              {selectedWO.location}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Municipality
            </Typography>
            <Typography variant="body1">
              {selectedWO.municipality}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Vendor
            </Typography>
            <Typography variant="body1">
              {selectedWO.vendor_name || 'Not assigned'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Supervisor
            </Typography>
            <Typography variant="body1">
              {selectedWO.supervisor_name || 'Not assigned'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Manhours
            </Typography>
            <Typography variant="body1">
              {selectedWO.total_manhours || 0} hours
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Estimated Cost
            </Typography>
            <Typography variant="body1">
              ₱{selectedWO.total_estimated_cost?.toLocaleString() || 0}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Resolution Days
            </Typography>
            <Typography variant="body1">
              {selectedWO.total_resolution_days || 0} days
              {selectedWO.is_delayed && (
                <Chip 
                  label={`Delayed by ${selectedWO.delay_days} days`} 
                  color="error" 
                  size="small" 
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Priority
            </Typography>
            <Chip label={selectedWO.priority} color={getPriorityColor(selectedWO.priority)} />
          </Grid>
        </Grid>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowViewModal(false)} color="inherit">
        Close
      </Button>
      <Button 
        onClick={() => {
          setShowViewModal(false);
          if (selectedWO) handleEdit(selectedWO);
        }} 
        variant="contained" 
        color="primary"
      >
        Edit
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
WorkOrders.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;
export default WorkOrders;