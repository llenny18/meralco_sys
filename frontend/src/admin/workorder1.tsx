import { FC, useState, useEffect, ChangeEvent } from 'react';
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
  Paper,
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import CloudUploadTwoToneIcon from '@mui/icons-material/CloudUploadTwoTone';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import DescriptionTwoToneIcon from '@mui/icons-material/DescriptionTwoTone';

const API_BASE_URL = 'https://aimswo.online/api/api/v1';

interface WorkOrder {
  wo_id?: string;
  wo_no?: string;
  description?: string;
  location?: string;
  municipality?: string;
  vendor?: string;
  vendor_name?: string;
  assigned_crew?: string;
  supervisor?: string;
  supervisor_name?: string;
  assigned_qi?: string;
  qi_name?: string;
  status?: string;
  priority?: string;
  is_vip?: boolean;
  is_delayed?: boolean;
  date_received_jacket?: string;
  date_received_awarding?: string;
  date_energized?: string;
  date_coc_received?: string;
  date_for_audit?: string;
  date_audited?: string;
  total_manhours?: number;
  total_estimated_cost?: number;
  billed_cost?: number;
  total_resolution_days?: number;
  delay_days?: number;
  wo_initiator?: string;
  area_of_responsibility?: string;
  eam_status?: string;
  vendor_remarks?: string;
  c1_remarks?: string;
  clerk_remarks?: string;
  de_remarks?: string;
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

function WorkOrderManagement() {
  const [tableData, setTableData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecord, setCurrentRecord] = useState<WorkOrder>({});
  const [formData, setFormData] = useState<WorkOrder>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);

  // Lookup data
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [supervisors, setSupervisors] = useState<User[]>([]);
  const [qiUsers, setQiUsers] = useState<User[]>([]);

  // Filters
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [crewFilter, setCrewFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // File upload
  const [importFile, setImportFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<FileList | null>(null);
  const [documentType, setDocumentType] = useState<string>('COC');
  const [woDocuments, setWoDocuments] = useState<any[]>([]);

  const STATUS_CHOICES = ['NEW', 'FOR AUDIT', 'AUDITED', 'NO COC', 'PAID', 'CANCELLED'];
  const PRIORITY_CHOICES = ['Low', 'Medium', 'High', 'Critical'];
  const CREW_CHOICES = ['AVECO', 'CHALLENGER', 'ECOM', 'POWERHOUSE', 'VJC'];

  useEffect(() => {
    fetchTableData();
    fetchLookupData();
  }, [page, rowsPerPage, statusFilter, priorityFilter, crewFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchTableData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLookupData = async () => {
    try {
      // Fetch vendors
      const vendorsRes = await fetch(`${API_BASE_URL}/vendors/`);
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(Array.isArray(vendorsData) ? vendorsData : vendorsData.results || []);
      }

      // Fetch users (for supervisors and QI)
      const usersRes = await fetch(`${API_BASE_URL}/users/`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const users = Array.isArray(usersData) ? usersData : usersData.results || [];
        setSupervisors(users);
        setQiUsers(users);
      }
    } catch (err) {
      console.error('Error fetching lookup data:', err);
    }
  };

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

      const response = await fetch(`${API_BASE_URL}/work-orders/?${params.toString()}`);
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
    setFormData({
      status: 'NEW',
      priority: 'Medium',
      is_vip: false,
      is_delayed: false,
    });
    setCurrentRecord({});
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
      
      const response = await fetch(`${API_BASE_URL}/work-orders/${primaryKey}/`, {
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
      const primaryKey = currentRecord.wo_id;
      const url = modalMode === 'add' 
        ? `${API_BASE_URL}/work-orders/`
        : `${API_BASE_URL}/work-orders/${primaryKey}/`;
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
    const formDataUpload = new FormData();
    formDataUpload.append('file', importFile);

    try {
      const response = await fetch(`${API_BASE_URL}/work-orders/import-excel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formDataUpload
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      showSuccess(
        `Import completed: ${result.created} created, ${result.updated} updated. ${
          result.errors?.length > 0 ? `${result.errors.length} errors.` : ''
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

  const handleViewDocuments = async (row: WorkOrder) => {
    setCurrentRecord(row);
    setShowDocumentsModal(true);
    
    try {
      const primaryKey = row.wo_id;
      const response = await fetch(`${API_BASE_URL}/work-orders/${primaryKey}/documents/`, {
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

    const formDataUpload = new FormData();
    Array.from(documentFiles).forEach(file => {
      formDataUpload.append('files', file);
    });
    formDataUpload.append('work_order_id', currentRecord.wo_id || '');
    formDataUpload.append('document_type', documentType);

    try {
      const response = await fetch(`${API_BASE_URL}/work-order-documents/bulk-upload-documents/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formDataUpload
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      showSuccess(result.message);
      setDocumentFiles(null);
      handleViewDocuments(currentRecord);
    } catch (err: any) {
      setError('Upload error: ' + err.message);
    }
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return <Chip label={value ? 'Yes' : 'No'} color={value ? 'success' : 'default'} size="small" />;
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
    <Box sx={{ bgcolor: 'transparent', minHeight: '100vh', py: 3 }}>

      <Container maxWidth="xl">
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h4" component="h1" gutterBottom>
                📋 Work Order Monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage all work orders from completion to billing
              </Typography>
            </Grid>
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
                  Import
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CloudDownloadTwoToneIcon />}
                  onClick={handleExport}
                >
                  Export
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
        </Paper>

        {/* Filters Panel */}
        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardHeader title="🔍 Filters" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Search"
                    placeholder="WO No, Description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="">All</MenuItem>
                      {STATUS_CHOICES.map(status => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="">All</MenuItem>
                      {PRIORITY_CHOICES.map(priority => (
                        <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Crew</InputLabel>
                    <Select
                      value={crewFilter}
                      onChange={(e) => setCrewFilter(e.target.value)}
                      label="Crew"
                    >
                      <MenuItem value="">All</MenuItem>
                      {CREW_CHOICES.map(crew => (
                        <MenuItem key={crew} value={crew}>{crew}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Main Table */}
        <Card>
          <CardHeader title="Work Orders" />
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
              </Box>
            )}

            {!loading && !error && tableData.length > 0 && (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">WO NO</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">DESCRIPTION</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">LOCATION</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">VENDOR</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">CREW</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">STATUS</Typography></TableCell>
                        <TableCell><Typography variant="subtitle2" fontWeight="bold">PRIORITY</Typography></TableCell>
                        <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">DAYS</Typography></TableCell>
                        <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">ACTIONS</Typography></TableCell>
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
                          <TableCell>{renderCellValue(row.description)}</TableCell>
                          <TableCell>{renderCellValue(row.location)}</TableCell>
                          <TableCell>{renderCellValue(row.vendor_name || row.vendor)}</TableCell>
                          <TableCell>
                            <Chip label={row.assigned_crew || 'Unassigned'} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip label={row.status} color={getStatusColor(row.status || '')} size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip label={row.priority} color={getPriorityColor(row.priority || '')} size="small" />
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
                            <Tooltip title="View" arrow>
                              <IconButton color="info" size="small" onClick={() => handleView(row)}>
                                <VisibilityTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Documents" arrow>
                              <IconButton color="secondary" size="small" onClick={() => handleViewDocuments(row)}>
                                <DescriptionTwoToneIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit" arrow>
                              <IconButton color="primary" size="small" onClick={() => handleEdit(row)}>
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
      </Container>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>{modalMode === 'add' ? '➕ Add New Work Order' : '✏️ Edit Work Order'}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* WO Number - Read-only in edit mode */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Work Order Number"
                  value={formData.wo_no || 'Auto-generated'}
                  disabled={modalMode === 'edit'}
                  InputProps={{
                    readOnly: modalMode === 'edit'
                  }}
                  helperText={modalMode === 'add' ? 'Will be auto-generated' : ''}
                />
              </Grid>

              {/* WO Initiator */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="WO Initiator"
                  value={formData.wo_initiator || ''}
                  onChange={(e) => handleInputChange('wo_initiator', e.target.value)}
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
                  required
                />
              </Grid>

              {/* Location & Municipality */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Municipality"
                  value={formData.municipality || ''}
                  onChange={(e) => handleInputChange('municipality', e.target.value)}
                />
              </Grid>

              {/* Area of Responsibility */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area of Responsibility"
                  value={formData.area_of_responsibility || ''}
                  onChange={(e) => handleInputChange('area_of_responsibility', e.target.value)}
                />
              </Grid>

              {/* Vendor */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    value={formData.vendor || ''}
                    onChange={(e) => handleInputChange('vendor', e.target.value)}
                    label="Vendor"
                  >
                    <MenuItem value="">Select Vendor</MenuItem>
                    {vendors.map(vendor => (
                      <MenuItem key={vendor.vendor_id} value={vendor.vendor_id}>
                        {vendor.vendor_code} - {vendor.vendor_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
                    {CREW_CHOICES.map(crew => (
                      <MenuItem key={crew} value={crew}>{crew}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Supervisor */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Supervisor</InputLabel>
                  <Select
                    value={formData.supervisor || ''}
                    onChange={(e) => handleInputChange('supervisor', e.target.value)}
                    label="Supervisor"
                  >
                    <MenuItem value="">Select Supervisor</MenuItem>
                    {supervisors.map(user => (
                      <MenuItem key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name} ({user.username})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Assigned QI */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Assigned QI</InputLabel>
                  <Select
                    value={formData.assigned_qi || ''}
                    onChange={(e) => handleInputChange('assigned_qi', e.target.value)}
                    label="Assigned QI"
                  >
                    <MenuItem value="">Select QI</MenuItem>
                    {qiUsers.map(user => (
                      <MenuItem key={user.user_id} value={user.user_id}>
                        {user.first_name} {user.last_name} ({user.username})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Status */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status || 'NEW'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Status"
                  >
                    {STATUS_CHOICES.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Priority */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority || 'Medium'}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    label="Priority"
                  >
                    {PRIORITY_CHOICES.map(priority => (
                      <MenuItem key={priority} value={priority}>{priority}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Boolean Switches */}
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

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_delayed || false}
                      onChange={(e) => handleInputChange('is_delayed', e.target.checked)}
                      color="warning"
                    />
                  }
                  label="Delayed"
                />
              </Grid>

              {/* EAM Status */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="EAM Status"
                  value={formData.eam_status || ''}
                  onChange={(e) => handleInputChange('eam_status', e.target.value)}
                />
              </Grid>

              {/* Dates Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Important Dates" />
                </Divider>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Date Received Jacket"
                  type="date"
                  value={formData.date_received_jacket || ''}
                  onChange={(e) => handleInputChange('date_received_jacket', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Date Received Awarding"
                  type="date"
                  value={formData.date_received_awarding || ''}
                  onChange={(e) => handleInputChange('date_received_awarding', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Date Energized"
                  type="date"
                  value={formData.date_energized || ''}
                  onChange={(e) => handleInputChange('date_energized', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Date COC Received"
                  type="date"
                  value={formData.date_coc_received || ''}
                  onChange={(e) => handleInputChange('date_coc_received', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Date For Audit"
                  type="date"
                  value={formData.date_for_audit || ''}
                  onChange={(e) => handleInputChange('date_for_audit', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  label="Date Audited"
                  type="date"
                  value={formData.date_audited || ''}
                  onChange={(e) => handleInputChange('date_audited', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Financial Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Financial Details" />
                </Divider>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Total Manhours"
                  type="number"
                  value={formData.total_manhours || ''}
                  onChange={(e) => handleInputChange('total_manhours', parseFloat(e.target.value))}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Total Estimated Cost"
                  type="number"
                  value={formData.total_estimated_cost || ''}
                  onChange={(e) => handleInputChange('total_estimated_cost', parseFloat(e.target.value))}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Billed Cost"
                  type="number"
                  value={formData.billed_cost || ''}
                  onChange={(e) => handleInputChange('billed_cost', parseFloat(e.target.value))}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>

              {/* Remarks Section */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }}>
                  <Chip label="Remarks" />
                </Divider>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor Remarks"
                  value={formData.vendor_remarks || ''}
                  onChange={(e) => handleInputChange('vendor_remarks', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="C1 Remarks"
                  value={formData.c1_remarks || ''}
                  onChange={(e) => handleInputChange('c1_remarks', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Clerk Remarks"
                  value={formData.clerk_remarks || ''}
                  onChange={(e) => handleInputChange('clerk_remarks', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="DE Remarks"
                  value={formData.de_remarks || ''}
                  onChange={(e) => handleInputChange('de_remarks', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>

              {/* Read-only calculated fields (only show in edit mode) */}
              {modalMode === 'edit' && (
                <>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }}>
                      <Chip label="Calculated Fields (Read-Only)" />
                    </Divider>
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Total Resolution Days"
                      value={formData.total_resolution_days || 0}
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
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
        <DialogTitle>📄 Work Order Details - {currentRecord.wo_no}</DialogTitle>
        <DialogContent dividers>
          {currentRecord && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">WO Number</Typography>
                <Typography variant="body1" fontWeight="medium">{currentRecord.wo_no}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip label={currentRecord.status} color={getStatusColor(currentRecord.status || '')} size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                <Chip label={currentRecord.priority} color={getPriorityColor(currentRecord.priority || '')} size="small" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">VIP Project</Typography>
                <Chip label={currentRecord.is_vip ? 'Yes' : 'No'} color={currentRecord.is_vip ? 'error' : 'default'} size="small" />
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
                <Typography variant="subtitle2" color="text.secondary">Assigned Crew</Typography>
                <Typography variant="body1">{currentRecord.assigned_crew || '-'}</Typography>
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
                <Typography variant="subtitle2" color="text.secondary">Total Manhours</Typography>
                <Typography variant="body1">{currentRecord.total_manhours || 0}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Total Estimated Cost</Typography>
                <Typography variant="body1">₱{(currentRecord.total_estimated_cost || 0).toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Total Resolution Days</Typography>
                <Typography variant="body1">{currentRecord.total_resolution_days || 0} days</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Delayed</Typography>
                <Chip 
                  label={currentRecord.is_delayed ? `Yes (+${currentRecord.delay_days} days)` : 'No'} 
                  color={currentRecord.is_delayed ? 'error' : 'success'} 
                  size="small" 
                />
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
              handleEdit(currentRecord);
            }}
            variant="contained"
            color="primary"
          >
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
                  <Alert severity="info">Selected file: {importFile.name}</Alert>
                </Box>
              )}
            </Box>
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

      {/* Documents Modal */}
      <Dialog open={showDocumentsModal} onClose={() => setShowDocumentsModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>📎 Work Order Documents - {currentRecord?.wo_no}</DialogTitle>
        <DialogContent dividers>
          {/* Upload Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Upload New Documents
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Document Type</InputLabel>
                  <Select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    label="Document Type"
                  >
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
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUploadTwoToneIcon />}
                    fullWidth
                  >
                    Choose Files
                  </Button>
                </label>
              </Grid>
              {documentFiles && documentFiles.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    {documentFiles.length} file(s) selected
                  </Alert>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUploadDocuments}
                    sx={{ mt: 1 }}
                    fullWidth
                  >
                    Upload Documents
                  </Button>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Existing Documents */}
          <Typography variant="subtitle1" gutterBottom>
            Existing Documents
          </Typography>
          {woDocuments.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No documents uploaded yet
            </Typography>
          ) : (
            <Box>
              {woDocuments.map((doc) => (
                <Box key={doc.id} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, mb: 1 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={8}>
                      <Typography variant="body2" fontWeight="medium">
                        {doc.document_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Type: {doc.document_type} | Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} textAlign="right">
                      <Chip
                        label={doc.is_approved ? 'Approved' : 'Pending'}
                        color={doc.is_approved ? 'success' : 'warning'}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDocumentsModal(false)} color="inherit">
            Close
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
    </Box>
  );
}
WorkOrderManagement.getLayout = (page) => <SidebarLayout  userRole="admin">{page}</SidebarLayout>;
export default WorkOrderManagement;