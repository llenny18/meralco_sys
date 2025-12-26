


// pages/work-orders/index.tsx
import { FC, useState, useEffect, ChangeEvent } from 'react';
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Switch,
  FormControlLabel,
  Autocomplete,
} from '@mui/material';
import Footer from '@/components/Footer';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import CloudUploadTwoToneIcon from '@mui/icons-material/CloudUploadTwoTone';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const ENDPOINT = 'work-orders';

interface WorkOrder {
  wo_id?: string;
  wo_no: string;
  date_received_jacket?: string;
  date_received_awarding?: string;
  date_energized?: string;
  date_coc_received?: string;
  date_for_audit?: string;
  date_audited?: string;
  wo_initiator?: string;
  description?: string;
  location?: string;
  municipality?: string;
  area_of_responsibility?: string;
  vendor?: string;
  vendor_name?: string;
  assigned_crew?: string;
  supervisor?: string;
  supervisor_name?: string;
  assigned_qi?: string;
  qi_name?: string;
  total_manhours?: number;
  total_estimated_cost?: number;
  billed_cost?: number;
  status: string;
  priority: string;
  is_vip: boolean;
  eam_status?: string;
  vendor_remarks?: string;
  c1_remarks?: string;
  clerk_remarks?: string;
  de_remarks?: string;
  days_from_energized_to_coc?: number;
  days_from_coc_to_audit?: number;
  days_from_audit_to_billing?: number;
  total_resolution_days?: number;
  target_completion_date?: string;
  is_delayed: boolean;
  delay_days?: number;
  created_at?: string;
  updated_at?: string;
}

interface Vendor {
  vendor_id: string;
  vendor_code: string;
  vendor_name: string;
}

interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

function WorkOrders() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const authToken = localStorage.getItem('authToken');
    if (!isAuthenticated || !authToken || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }
  }, [router]);

  // State management
  const [tableData, setTableData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecord, setCurrentRecord] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState<Partial<WorkOrder>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Filters
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [crewFilter, setCrewFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Lookup data
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [qiUsers, setQiUsers] = useState<User[]>([]);

  // File upload
  const [importFile, setImportFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<FileList | null>(null);
  const [documentType, setDocumentType] = useState<string>('COC');
  const [woDocuments, setWoDocuments] = useState<any[]>([]);

  // Status and Priority options
  const STATUS_OPTIONS = [
    'NEW',
    'FOR AUDIT',
    'AUDITED',
    'NO COC',
    'PAID',
    'CANCELLED'
  ];

  const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];

  const CREW_OPTIONS = ['AVECO', 'CHALLENGER', 'ECOM', 'POWERHOUSE', 'VJC'];

  useEffect(() => {
    fetchTableData();
    fetchVendors();
    fetchUsers();
  }, [page, rowsPerPage, statusFilter, priorityFilter, crewFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchTableData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTableData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('limit', rowsPerPage.toString());
      
      if (statusFilter) params.append('status', statusFilter);
      if (priorityFilter) params.append('priority', priorityFilter);
      if (crewFilter) params.append('assigned_crew', crewFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
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

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setVendors(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const usersList = Array.isArray(data) ? data : data.results || [];
        setUsers(usersList);
        
        // Filter supervisors and QI users based on role or naming convention
        setSupervisors(usersList.filter((u: User) => 
          u.username.toLowerCase().includes('supervisor') || 
          u.email.toLowerCase().includes('supervisor')
        ));
        
        setQiUsers(usersList.filter((u: User) => 
          u.username.toLowerCase().includes('qi') || 
          u.email.toLowerCase().includes('qi')
        ));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      status: 'NEW',
      priority: 'Medium',
      is_vip: false,
      is_delayed: false,
      billed_cost: 0
    });
    setCurrentRecord(null);
    setShowModal(true);
  };

  const handleEdit = (row: WorkOrder) => {
    setModalMode('edit');
    setCurrentRecord(row);
    setFormData({ ...row });
    setShowModal(true);
  };

  const handleView = (row: WorkOrder) => {
    setCurrentRecord(row);
    setShowViewModal(true);
  };

  const handleDelete = async (row: WorkOrder) => {
    if (!window.confirm(`Are you sure you want to delete work order ${row.wo_no}?`)) return;
    
    try {
      const primaryKey = row.wo_id;
      if (!primaryKey) throw new Error('Cannot determine record ID');
      
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/${primaryKey}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to delete: ${response.statusText}`);
      }
      
      showSuccess('Work order deleted successfully!');
      fetchTableData();
    } catch (err: any) {
      setError('Error deleting record: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const url = modalMode === 'add' 
        ? `${API_BASE_URL}/${ENDPOINT}/`
        : `${API_BASE_URL}/${ENDPOINT}/${currentRecord?.wo_id}/`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData) || `Failed to save: ${response.statusText}`);
      }
      
      showSuccess(`Work order ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
      setShowModal(false);
      fetchTableData();
    } catch (err: any) {
      setError('Error saving record: ' + err.message);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    const formData = new FormData();
    formData.append('file', importFile);

    try {
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/import-excel/`, {
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
      fetchTableData();
    } catch (err: any) {
      setError('Import error: ' + err.message);
    } finally {
      setLoading(false);
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
        `${API_BASE_URL}/${ENDPOINT}/export-excel/?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (!response.ok) throw new Error('Export failed');

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

  // Document Management
  const handleViewDocuments = async (row: WorkOrder) => {
    setCurrentRecord(row);
    setShowDocumentsModal(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/${row.wo_id}/documents/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const docs = await response.json();
        setWoDocuments(docs);
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const handleUploadDocuments = async () => {
    if (!documentFiles || documentFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    const formData = new FormData();
    Array.from(documentFiles).forEach(file => {
      formData.append('files', file);
    });
    formData.append('work_order_id', currentRecord?.wo_id || '');
    formData.append('document_type', documentType);

    try {
      const response = await fetch(`${API_BASE_URL}/work-orders/bulk-upload-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      showSuccess(result.message);
      setDocumentFiles(null);
      if (currentRecord) handleViewDocuments(currentRecord);
    } catch (err: any) {
      setError('Upload error: ' + err.message);
    }
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') {
      return <Chip label={value ? 'Yes' : 'No'} color={value ? 'success' : 'default'} size="small" />;
    }
    if (typeof value === 'object') return JSON.stringify(value);
    const strValue = String(value);
    return strValue.length > 50 ? (
      <Tooltip title={strValue} arrow>
        <span>{strValue.substring(0, 50) + '...'}</span>
      </Tooltip>
    ) : strValue;
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

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                {showFilters ? 'Hide' : 'Show'} Filters
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
                          {STATUS_OPTIONS.map(status => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                          ))}
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
                          {PRIORITY_OPTIONS.map(priority => (
                            <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                          ))}
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
                          {CREW_OPTIONS.map(crew => (
                            <MenuItem key={crew} value={crew}>{crew}</MenuItem>
                          ))}
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
              <CardHeader title="Work Order Management" />
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

                {!loading && !error && tableData.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" color="text.secondary" gutterBottom>
                      📭
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      No data available
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Add Work Order" to create your first record
                    </Typography>
                  </Box>
                )}

                {!loading && !error && tableData.length > 0 && (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">WO NO</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">DESCRIPTION</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">LOCATION</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">VENDOR</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">CREW</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">STATUS</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">PRIORITY</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="subtitle2" fontWeight="bold">DAYS</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="subtitle2" fontWeight="bold">ACTIONS</Typography>
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((row, index) => (
                            <TableRow hover key={row.wo_id || index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {row.is_vip && <Chip label="VIP" color="error" size="small" />}
                                  <Typography variant="body2" fontWeight="medium">
                                    {row.wo_no}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {renderCellValue(row.description)}
                              </TableCell>
                              <TableCell>{renderCellValue(row.location)}</TableCell>
                              <TableCell>{renderCellValue(row.vendor_name || row.vendor)}</TableCell>
                              <TableCell>
                                <Chip label={row.assigned_crew || 'Unassigned'} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                              </TableCell>
                              <TableCell>
                                <Chip label={row.priority} color={getPriorityColor(row.priority)} size="small" />
                              </TableCell>
                              <TableCell align="right">
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {row.total_resolution_days || 0}
                                  </Typography>
                                  {row.is_delayed && (
                                    <Chip label={`+${row.delay_days}`} color="error" size="small" />
                                  )}
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="View Details" arrow>
                                  <IconButton color="info" size="small" onClick={() => handleView(row)} sx={{ mr: 0.5 }}>
                                    <VisibilityTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Documents" arrow>
                                  <IconButton color="secondary" size="small" onClick={() => handleViewDocuments(row)} sx={{ mr: 0.5 }}>
                                    <DescriptionTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Edit" arrow>
                                  <IconButton color="primary" size="small" onClick={() => handleEdit(row)} sx={{ mr: 0.5 }}>
                                    <EditTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete" arrow>
                                  <IconButton color="error" size="small" onClick={() => handleDelete(row)}>
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

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {modalMode === 'add' ? '➕ Add New Work Order' : '✏️ Edit Work Order'}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* WO ID (Read-only, auto-generated) */}
              {modalMode === 'edit' && formData.wo_id && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Work Order ID"
                    value={formData.wo_id}
                    InputProps={{ readOnly: true }}
                    disabled
                    helperText="Auto-generated (Read-only)"
                  />
                </Grid>
              )}

              {/* WO Number */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="WO Number"
                  value={formData.wo_no || ''}
                  onChange={(e) => handleInputChange('wo_no', e.target.value)}
                  placeholder="Enter work order number"
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={3}
                  placeholder="Enter work order description"
                />
              </Grid>

              {/* Location */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location"
                />
              </Grid>

              {/* Municipality */}
<Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Municipality"
              value={formData.municipality || ''}
              onChange={(e) => handleInputChange('municipality', e.target.value)}
              placeholder="Enter municipality"
            />
          </Grid>

          {/* Area of Responsibility */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Area of Responsibility"
              value={formData.area_of_responsibility || ''}
              onChange={(e) => handleInputChange('area_of_responsibility', e.target.value)}
              placeholder="Enter area"
            />
          </Grid>

          {/* WO Initiator */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="WO Initiator"
              value={formData.wo_initiator || ''}
              onChange={(e) => handleInputChange('wo_initiator', e.target.value)}
              placeholder="Enter initiator"
            />
          </Grid>

          {/* Vendor */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={vendors}
              getOptionLabel={(option) => `${option.vendor_code} - ${option.vendor_name}`}
              value={vendors.find(v => v.vendor_id === formData.vendor) || null}
              onChange={(_, newValue) => handleInputChange('vendor', newValue?.vendor_id || '')}
              renderInput={(params) => (
                <TextField {...params} label="Vendor" placeholder="Select vendor" />
              )}
            />
          </Grid>

          {/* Assigned Crew */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Assigned Crew</InputLabel>
              <Select
                value={formData.assigned_crew || ''}
                onChange={(e) => handleInputChange('assigned_crew', e.target.value)}
                label="Assigned Crew"
              >
                <MenuItem value="">Unassigned</MenuItem>
                {CREW_OPTIONS.map(crew => (
                  <MenuItem key={crew} value={crew}>{crew}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Supervisor */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.username})`}
              value={users.find(u => u.user_id.toString() === formData.supervisor?.toString()) || null}
              onChange={(_, newValue) => handleInputChange('supervisor', newValue?.user_id || '')}
              renderInput={(params) => (
                <TextField {...params} label="Supervisor" placeholder="Select supervisor" />
              )}
            />
          </Grid>

          {/* Assigned QI */}
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={users}
              getOptionLabel={(option) => `${option.first_name} ${option.last_name} (${option.username})`}
              value={users.find(u => u.user_id.toString() === formData.assigned_qi?.toString()) || null}
              onChange={(_, newValue) => handleInputChange('assigned_qi', newValue?.user_id || '')}
              renderInput={(params) => (
                <TextField {...params} label="Assigned QI" placeholder="Select QI" />
              )}
            />
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status || 'NEW'}
                onChange={(e) => handleInputChange('status', e.target.value)}
                label="Status"
              >
                {STATUS_OPTIONS.map(status => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Priority */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Priority</InputLabel>
              <Select
                value={formData.priority || 'Medium'}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                label="Priority"
              >
                {PRIORITY_OPTIONS.map(priority => (
                  <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* EAM Status */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="EAM Status"
              value={formData.eam_status || ''}
              onChange={(e) => handleInputChange('eam_status', e.target.value)}
              placeholder="Enter EAM status"
            />
          </Grid>

          {/* Total Manhours */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Total Manhours"
              value={formData.total_manhours || ''}
              onChange={(e) => handleInputChange('total_manhours', parseFloat(e.target.value))}
              placeholder="0.00"
              inputProps={{ step: "0.01" }}
            />
          </Grid>

          {/* Total Estimated Cost */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Total Estimated Cost (₱)"
              value={formData.total_estimated_cost || ''}
              onChange={(e) => handleInputChange('total_estimated_cost', parseFloat(e.target.value))}
              placeholder="0.00"
              inputProps={{ step: "0.01" }}
            />
          </Grid>

          {/* Billed Cost */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Billed Cost (₱)"
              value={formData.billed_cost || 0}
              onChange={(e) => handleInputChange('billed_cost', parseFloat(e.target.value))}
              placeholder="0.00"
              inputProps={{ step: "0.01" }}
            />
          </Grid>

          {/* Dates */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date Received Jacket"
              value={formData.date_received_jacket || ''}
              onChange={(e) => handleInputChange('date_received_jacket', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date Received Awarding"
              value={formData.date_received_awarding || ''}
              onChange={(e) => handleInputChange('date_received_awarding', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date Energized"
              value={formData.date_energized || ''}
              onChange={(e) => handleInputChange('date_energized', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date COC Received"
              value={formData.date_coc_received || ''}
              onChange={(e) => handleInputChange('date_coc_received', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date For Audit"
              value={formData.date_for_audit || ''}
              onChange={(e) => handleInputChange('date_for_audit', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Date Audited"
              value={formData.date_audited || ''}
              onChange={(e) => handleInputChange('date_audited', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Target Completion Date"
              value={formData.target_completion_date || ''}
              onChange={(e) => handleInputChange('target_completion_date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Boolean Fields */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_vip || false}
                  onChange={(e) => handleInputChange('is_vip', e.target.checked)}
                  color="error"
                />
              }
              label="VIP Project"
            />
          </Grid>

          {/* Remarks */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Vendor Remarks"
              value={formData.vendor_remarks || ''}
              onChange={(e) => handleInputChange('vendor_remarks', e.target.value)}
              multiline
              rows={2}
              placeholder="Enter vendor remarks"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="C1 Remarks"
              value={formData.c1_remarks || ''}
              onChange={(e) => handleInputChange('c1_remarks', e.target.value)}
              multiline
              rows={2}
              placeholder="Enter C1 remarks"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Clerk Remarks"
              value={formData.clerk_remarks || ''}
              onChange={(e) => handleInputChange('clerk_remarks', e.target.value)}
              multiline
              rows={2}
              placeholder="Enter clerk remarks"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="DE Remarks"
              value={formData.de_remarks || ''}
              onChange={(e) => handleInputChange('de_remarks', e.target.value)}
              multiline
              rows={2}
              placeholder="Enter DE remarks"
            />
          </Grid>

          {/* Auto-calculated fields (Read-only) - Only show in edit mode */}
          {modalMode === 'edit' && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Auto-Calculated Fields (Read-Only)" size="small" />
                </Divider>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Days Energized to COC"
                  value={formData.days_from_energized_to_coc || 0}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Days COC to Audit"
                  value={formData.days_from_coc_to_audit || 0}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Days Audit to Billing"
                  value={formData.days_from_audit_to_billing || 0}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Total Resolution Days"
                  value={formData.total_resolution_days || 0}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_delayed || false}
                      disabled
                      color="error"
                    />
                  }
                  label="Is Delayed (Auto-calculated)"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Delay Days"
                  value={formData.delay_days || 0}
                  InputProps={{ readOnly: true }}
                  disabled
                />
              </Grid>
            </>
          )}
        </Grid>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowModal(false)} color="inherit">
        Cancel
      </Button>
      <Button onClick={handleSubmit} variant="contained" color="primary">
        {modalMode === 'add' ? 'Add Work Order' : 'Save Changes'}
      </Button>
    </DialogActions>
  </Dialog>

  {/* View Modal */}
  <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="md" fullWidth>
    <DialogTitle>📄 Work Order Details</DialogTitle>
    <DialogContent dividers>
      {currentRecord && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Work Order ID</Typography>
            <Typography variant="body1">{currentRecord.wo_id}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">WO Number</Typography>
            <Typography variant="body1" fontWeight="medium">{currentRecord.wo_no}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary">Description</Typography>
            <Typography variant="body1">{currentRecord.description || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Location</Typography>
            <Typography variant="body1">{currentRecord.location || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Municipality</Typography>
            <Typography variant="body1">{currentRecord.municipality || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Vendor</Typography>
            <Typography variant="body1">{currentRecord.vendor_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Supervisor</Typography>
            <Typography variant="body1">{currentRecord.supervisor_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Assigned QI</Typography>
            <Typography variant="body1">{currentRecord.qi_name || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Assigned Crew</Typography>
            <Chip label={currentRecord.assigned_crew || 'Unassigned'} size="small" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Status</Typography>
            <Chip label={currentRecord.status} color={getStatusColor(currentRecord.status)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
            <Chip label={currentRecord.priority} color={getPriorityColor(currentRecord.priority)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">VIP Project</Typography>
            {renderCellValue(currentRecord.is_vip)}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Total Manhours</Typography>
            <Typography variant="body1">{currentRecord.total_manhours || 0} hours</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Estimated Cost</Typography>
            <Typography variant="body1">₱{currentRecord.total_estimated_cost?.toLocaleString() || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Billed Cost</Typography>
            <Typography variant="body1">₱{currentRecord.billed_cost?.toLocaleString() || 0}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">Total Resolution Days</Typography>
            <Typography variant="body1">
              {currentRecord.total_resolution_days || 0} days
              {currentRecord.is_delayed && (
                <Chip label={`Delayed by ${currentRecord.delay_days} days`} color="error" size="small" sx={{ ml: 1 }} />
              )}
            </Typography>
          </Grid>
        </Grid>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowViewModal(false)} color="inherit">Close</Button>
      <Button onClick={() => { setShowViewModal(false); if (currentRecord) handleEdit(currentRecord); }} variant="contained">
        Edit
      </Button>
    </DialogActions>
  </Dialog>

  {/* Import Modal */}
  <Dialog open={showImportModal} onClose={() => setShowImportModal(false)} maxWidth="sm" fullWidth>
    <DialogTitle>📥 Import Work Orders from Excel</DialogTitle>
    <DialogContent dividers>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Upload an Excel file with work order data (C1 sheet format)
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
            <Button variant="outlined" component="span" startIcon={<CloudUploadTwoToneIcon />} fullWidth>
              Choose Excel File
            </Button>
          </label>
          {importFile && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">Selected file: {importFile.name}</Alert>
            </Box>
          )}
        </Box>
      </Box>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowImportModal(false)} color="inherit">Cancel</Button>
      <Button onClick={handleImportSubmit} variant="contained" disabled={!importFile || loading}>
        Import
      </Button>
    </DialogActions>
  </Dialog>

  {/* Documents Modal */}
  <Dialog open={showDocumentsModal} onClose={() => setShowDocumentsModal(false)} maxWidth="md" fullWidth>
    <DialogTitle>📎 Work Order Documents - {currentRecord?.wo_no}</DialogTitle>
    <DialogContent dividers>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Upload New Documents</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Document Type</InputLabel>
              <Select value={documentType} onChange={(e) => setDocumentType(e.target.value)} label="Document Type">
                <MenuItem value="COC">Certificate of Completion</MenuItem>
                <MenuItem value="PERMIT">Permit</MenuItem>
                <MenuItem value="INSPECTION">Inspection Report</MenuItem>
                <MenuItem value="INVOICE">Invoice</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <input
              accept="*/*"
              style={{ display: 'none' }}
              id="document-upload-input"
              type="file"
              multiple
              onChange={(e) => setDocumentFiles(e.target.files)}
            />
            <label htmlFor="document-upload-input">
              <Button variant="outlined" component="span" startIcon={<CloudUploadTwoToneIcon />} fullWidth>
                Choose Files
              </Button>
            </label>
          </Grid>
          {documentFiles && documentFiles.length > 0 && (
            <Grid item xs={12}>
              <Alert severity="info">{documentFiles.length} file(s) selected</Alert>
              <Button variant="contained" onClick={handleUploadDocuments} sx={{ mt: 1 }} fullWidth>
                Upload Documents
              </Button>
            </Grid>
          )}
        </Grid>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle1" gutterBottom>Existing Documents</Typography>
      {woDocuments.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No documents uploaded yet</Typography>
      ) : (
        <Box>
          {woDocuments.map((doc) => (
            <Box key={doc.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mb: 1 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={8}>
                  <Typography variant="body2" fontWeight="medium">{doc.document_name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Type: {doc.document_type} | Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                  </Typography>
                </Grid>
                <Grid item xs={4} textAlign="right">
                  <Chip label={doc.is_approved ? 'Approved' : 'Pending'} color={doc.is_approved ? 'success' : 'warning'} size="small" />
                </Grid>
              </Grid>
            </Box>
          ))}
        </Box>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setShowDocumentsModal(false)}>Close</Button>
    </DialogActions>
  </Dialog>

  <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
    <Alert severity="success">{successMessage}</Alert>
  </Snackbar>
</>
);
}
WorkOrders.getLayout = (page) => <SidebarLayout>{page}</SidebarLayout>;
export default WorkOrders;