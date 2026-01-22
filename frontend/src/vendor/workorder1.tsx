import { FC, useState, useEffect, ChangeEvent } from 'react';
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
  CircularProgress,
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
import TimelineTwoToneIcon from '@mui/icons-material/TimelineTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const ENDPOINT = 'work-orders';

interface WorkOrder {
  id?: number;
  wo_no: string;
  date_received_jacket_ps?: string;
  date_received_awarding_wo?: string;
  vip: boolean;
  description: string;
  location: string;
  municipality: string;
  area_of_responsibility: string;
  vendor_remarks: string;
  c1_remarks: string;
  assigned: string;
  status: string;
  date_wmtrl?: string;
  date_sched?: string;
  date_received_by_vc?: string;
  actual_date_completed_on_site?: string;
  date_fcomp?: string;
  date_comp?: string;
  days_wmtrl_to_fcomp?: number;
  days_sched_to_fcomp?: number;
  days_comp?: number;
  computed_index_wmtrl_to_fcomp?: number;
  computed_index_comp?: number;
  exclusion_reason: string;
  ccti_exclusion: boolean;
  apt_exclusion: boolean;
  date_received_by_contractor?: string;
  date_corrected?: string;
  actual_field_status: string;
  supervisor_full_name: string;
  created_at?: string;
  updated_at?: string;
}

function WorkOrders() {
  // State management
  const [tableData, setTableData] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [showTimelineModal, setShowTimelineModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecord, setCurrentRecord] = useState<WorkOrder | null>(null);
  const [formData, setFormData] = useState<Partial<WorkOrder>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(25);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Filters
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [municipalityFilter, setMunicipalityFilter] = useState<string>('');
  const [assignedFilter, setAssignedFilter] = useState<string>('');
  const [vipFilter, setVipFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // File upload
  const [importFile, setImportFile] = useState<File | null>(null);

  // Timeline data
  const [timelineData, setTimelineData] = useState<any>(null);

  // Status options
  const STATUS_OPTIONS = [
    'INPRG',
    'FCOMP',
    'TECO',
    'CLOSED-CAN',
    'CLOSE',
    'SCHED',
    'PCAN3',
    'COMP',
    'PCAN'
  ];


  const MUNICIPALITY_OPTIONS = [
    'Angono', 'Antipolo', 'Binangonan', 'Cainta', 'Cardona',
    'Jalajala', 'Morong', 'Pililla', 'Rodriguez', 'San Mateo',
    'Tanay', 'Taytay', 'Teresa', 'Baras'
  ];

  useEffect(() => {
    fetchTableData();
  }, [page, rowsPerPage, statusFilter, municipalityFilter, assignedFilter, vipFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(0);
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
      params.append('page_size', rowsPerPage.toString());
      
      if (statusFilter) params.append('status', statusFilter);
      if (municipalityFilter) params.append('municipality', municipalityFilter);
      if (assignedFilter) params.append('assigned', assignedFilter);
      if (vipFilter) params.append('vip', vipFilter);
      if (searchQuery) params.append('search', searchQuery);

      const storedVendorId = JSON.parse(localStorage?.getItem('user'))?.user_id || '0';
      const vendorResponse = await fetch(`${API_BASE_URL}/vendors/?user_id=${storedVendorId}`);
      const vendorData = await vendorResponse.json();

      const vendorId = vendorData.results[0].vendor_id;
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/?${params.toString()}&vendor_id=${vendorId}`);

      
      if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);
      
      const data = await response.json();
      
      if (data.results) {
        setTableData(data.results);
        setTotalCount(data.count || 0);
      } else {
        setTableData(Array.isArray(data) ? data : []);
        setTotalCount(Array.isArray(data) ? data.length : 0);
      }
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
      wo_no: '',
      vip: false,
      description: '',
      location: '',
      municipality: '',
      area_of_responsibility: '',
      vendor_remarks: '',
      c1_remarks: '',
      assigned: '',
      status: 'PENDING',
      exclusion_reason: '',
      ccti_exclusion: false,
      apt_exclusion: false,
      actual_field_status: '',
      supervisor_full_name: ''
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

  const handleViewTimeline = async (row: WorkOrder) => {
    setCurrentRecord(row);
    setShowTimelineModal(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/${row.id}/timeline/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTimelineData(data);
      }
    } catch (err) {
      console.error('Error fetching timeline:', err);
    }
  };

  const handleDelete = async (row: WorkOrder) => {
    if (!window.confirm(`Are you sure you want to delete work order ${row.wo_no}?`)) return;
    
    try {
      const primaryKey = row.id;
      if (!primaryKey) throw new Error('Cannot determine record ID');
      
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/${primaryKey}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
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
  
  // Validate required fields
  if (!formData.wo_no || formData.wo_no.trim() === '') {
    setError('Work Order Number is required');
    return;
  }
  
  try {
    const url = modalMode === 'add' 
      ? `${API_BASE_URL}/${ENDPOINT}/`
      : `${API_BASE_URL}/${ENDPOINT}/${currentRecord?.id}/`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';
    
    // Clean the data before sending
    const cleanedData: any = {};
    
    // Explicitly include wo_no (REQUIRED)
    cleanedData.wo_no = formData.wo_no;
    
    // Add all other fields
    Object.keys(formData).forEach(key => {
      if (key !== 'wo_no' && formData[key] !== undefined) {
        cleanedData[key] = formData[key];
      }
    });
    
    // Convert empty strings to null for date fields
    const dateFields = [
      'date_received_jacket_ps',
      'date_received_awarding_wo',
      'date_wmtrl',
      'date_sched',
      'date_received_by_vc',
      'actual_date_completed_on_site',
      'date_fcomp',
      'date_comp',
      'date_received_by_contractor',
      'date_corrected'
    ];
    
    dateFields.forEach(field => {
      if (cleanedData[field] === '') {
        cleanedData[field] = null;
      }
    });
    
    // Ensure booleans are actual booleans
    cleanedData.vip = Boolean(cleanedData.vip);
    cleanedData.ccti_exclusion = Boolean(cleanedData.ccti_exclusion);
    cleanedData.apt_exclusion = Boolean(cleanedData.apt_exclusion);
    
    console.log('Sending cleaned data:', cleanedData);
    console.log('wo_no specifically:', cleanedData.wo_no, typeof cleanedData.wo_no);
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      },
      body: JSON.stringify(cleanedData)
    });
    
    // ... rest of error handling
  } catch (err: any) {
    setError('Error saving record: ' + err.message);
  }
};

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Download Excel template from API
const handleDownloadTemplate = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/download_template/`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    });

    if (!response.ok) throw new Error('Template download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'work_orders_import_template.xlsx';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showSuccess('Template downloaded successfully');
  } catch (err: any) {
    setError('Download error: ' + err.message);
  }
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
      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/import_excel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      showSuccess(result.message || 'Import completed successfully');

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
      if (municipalityFilter) params.append('municipality', municipalityFilter);
      if (assignedFilter) params.append('assigned', assignedFilter);

      const response = await fetch(
        `${API_BASE_URL}/${ENDPOINT}/export_excel/?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const renderCellValue = (value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') {
      return <Chip label={value ? 'Yes' : 'No'} color={value ? 'success' : 'default'} size="small" />;
    }
    const strValue = String(value);
    return strValue.length > 50 ? (
      <Tooltip title={strValue} arrow>
        <span>{strValue.substring(0, 50) + '...'}</span>
      </Tooltip>
    ) : strValue;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, any> = {
      'PENDING': 'default',
      'IN PROGRESS': 'info',
      'WMTRL': 'warning',
      'SCHEDULED': 'info',
      'FIELD COMPLETED': 'primary',
      'FCOMP': 'primary',
      'COMPLETED': 'success',
      'CANCELLED': 'error',
      'ON HOLD': 'warning'
    };
    return colors[status] || 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3" component="h3" gutterBottom>
                📋 Work Order Management
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Track and manage work orders from receipt to completion
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
                startIcon={<CloudDownloadTwoToneIcon />}
                onClick={handleDownloadTemplate}
              >
                Download Template
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
        </Box>

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
                        <InputLabel>Municipality</InputLabel>
                        <Select
                          value={municipalityFilter}
                          onChange={(e) => setMunicipalityFilter(e.target.value)}
                          label="Municipality"
                        >
                          <MenuItem value="">All</MenuItem>
                          {MUNICIPALITY_OPTIONS.map(mun => (
                            <MenuItem key={mun} value={mun}>{mun}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>VIP</InputLabel>
                        <Select
                          value={vipFilter}
                          onChange={(e) => setVipFilter(e.target.value)}
                          label="VIP"
                        >
                          <MenuItem value="">All</MenuItem>
                          <MenuItem value="true">VIP Only</MenuItem>
                          <MenuItem value="false">Non-VIP</MenuItem>
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
                      No work orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Click "Add Work Order" to create your first record
                    </Typography>
                  </Box>
                )}

                {!loading && !error && tableData.length > 0 && (
                  <>
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">WO NO</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">DESCRIPTION</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">LOCATION</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">MUNICIPALITY</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">ASSIGNED</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">STATUS</Typography></TableCell>
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">DATE COMP</Typography></TableCell>
                            <TableCell align="right"><Typography variant="subtitle2" fontWeight="bold">DAYS</Typography></TableCell>
                            <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">ACTIONS</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {tableData.map((row, index) => (
                            <TableRow hover key={row.id || index}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {row.vip && <Chip label="VIP" color="error" size="small" />}
                                  <Typography variant="body2" fontWeight="medium">
                                    {row.wo_no}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{renderCellValue(row.description)}</TableCell>
                              <TableCell>{renderCellValue(row.location)}</TableCell>
                              <TableCell>{renderCellValue(row.municipality)}</TableCell>
                              <TableCell>
                                <Chip label={row.assigned || 'Unassigned'} size="small" variant="outlined" />
                              </TableCell>
                              <TableCell>
                                <Chip label={row.status} color={getStatusColor(row.status)} size="small" />
                              </TableCell>
                              <TableCell>{formatDate(row.date_comp)}</TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium">
                                  {row.days_comp || '-'}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Tooltip title="View Details" arrow>
                                  <IconButton color="info" size="small" onClick={() => handleView(row)} sx={{ mr: 0.5 }}>
                                    <VisibilityTwoToneIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Timeline" arrow>
                                  <IconButton color="secondary" size="small" onClick={() => handleViewTimeline(row)} sx={{ mr: 0.5 }}>
                                    <TimelineTwoToneIcon fontSize="small" />
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

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          {modalMode === 'add' ? '➕ Add New Work Order' : '✏️ Edit Work Order'}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary">Basic Information</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

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

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status || 'PENDING'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Status"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  value={formData.location || ''}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter location"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Municipality</InputLabel>
                  <Select
                    value={formData.municipality || ''}
                    onChange={(e) => handleInputChange('municipality', e.target.value)}
                    label="Municipality"
                  >
                    <MenuItem value="">Select Municipality</MenuItem>
                    {MUNICIPALITY_OPTIONS.map(mun => (
                      <MenuItem key={mun} value={mun}>{mun}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Area of Responsibility"
                  value={formData.area_of_responsibility || ''}
                  onChange={(e) => handleInputChange('area_of_responsibility', e.target.value)}
                  placeholder="Enter area"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Assigned To"
                  value={formData.assigned || ''}
                  onChange={(e) => handleInputChange('assigned', e.target.value)}
                  placeholder="Enter assigned crew/person"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supervisor Full Name"
                  value={formData.supervisor_full_name || ''}
                  onChange={(e) => handleInputChange('supervisor_full_name', e.target.value)}
                  placeholder="Enter supervisor name"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Actual Field Status"
                  value={formData.actual_field_status || ''}
                  onChange={(e) => handleInputChange('actual_field_status', e.target.value)}
                  placeholder="Enter field status"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.vip || false}
                      onChange={(e) => handleInputChange('vip', e.target.checked)}
                      color="error"
                    />
                  }
                  label="VIP Project"
                />
              </Grid>

              {/* Date Fields */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Date Tracking</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Received Jacket (PS)"
                  value={formData.date_received_jacket_ps || ''}
                  onChange={(e) => handleInputChange('date_received_jacket_ps', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Received Awarding WO"
                  value={formData.date_received_awarding_wo || ''}
                  onChange={(e) => handleInputChange('date_received_awarding_wo', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date WMTRL"
                  value={formData.date_wmtrl || ''}
                  onChange={(e) => handleInputChange('date_wmtrl', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Sched"
                  value={formData.date_sched || ''}
                  onChange={(e) => handleInputChange('date_sched', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Received by VC"
                  value={formData.date_received_by_vc || ''}
                  onChange={(e) => handleInputChange('date_received_by_vc', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Actual Date Completed on Site"
                  value={formData.actual_date_completed_on_site || ''}
                  onChange={(e) => handleInputChange('actual_date_completed_on_site', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date FCOMP"
                  value={formData.date_fcomp || ''}
                  onChange={(e) => handleInputChange('date_fcomp', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date COMP"
                  value={formData.date_comp || ''}
                  onChange={(e) => handleInputChange('date_comp', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Received by Contractor"
                  value={formData.date_received_by_contractor || ''}
                  onChange={(e) => handleInputChange('date_received_by_contractor', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date Corrected"
                  value={formData.date_corrected || ''}
                  onChange={(e) => handleInputChange('date_corrected', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Remarks Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Remarks & Notes</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Vendor Remarks"
                  value={formData.vendor_remarks || ''}
                  onChange={(e) => handleInputChange('vendor_remarks', e.target.value)}
                  multiline
                  rows={3}
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
                  rows={3}
                  placeholder="Enter C1 remarks"
                />
              </Grid>

              {/* Exclusions */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Exclusions</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Exclusion Reason"
                  value={formData.exclusion_reason || ''}
                  onChange={(e) => handleInputChange('exclusion_reason', e.target.value)}
                  multiline
                  rows={2}
                  placeholder="Enter exclusion reason"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.ccti_exclusion || false}
                      onChange={(e) => handleInputChange('ccti_exclusion', e.target.checked)}
                      color="warning"
                    />
                  }
                  label="CCTI Exclusion"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.apt_exclusion || false}
                      onChange={(e) => handleInputChange('apt_exclusion', e.target.checked)}
                      color="warning"
                    />
                  }
                  label="APT Exclusion"
                />
              </Grid>

              {/* Read-only computed fields (only show in edit mode) */}
              {modalMode === 'edit' && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Computed Metrics (Read-Only)</Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Days WMTRL to FCOMP"
                      value={formData.days_wmtrl_to_fcomp || '-'}
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Days Sched to FCOMP"
                      value={formData.days_sched_to_fcomp || '-'}
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Days COMP"
                      value={formData.days_comp || '-'}
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Computed Index WMTRL to FCOMP"
                      value={formData.computed_index_wmtrl_to_fcomp || '-'}
                      InputProps={{ readOnly: true }}
                      disabled
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Computed Index COMP"
                      value={formData.computed_index_comp || '-'}
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
        <DialogTitle>📄 Work Order Details - {currentRecord?.wo_no}</DialogTitle>
        <DialogContent dividers>
          {currentRecord && (
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>Basic Information</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">WO Number</Typography>
                <Typography variant="body1" fontWeight="medium">{currentRecord.wo_no}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip label={currentRecord.status} color={getStatusColor(currentRecord.status)} />
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
                <Typography variant="subtitle2" color="text.secondary">Area of Responsibility</Typography>
                <Typography variant="body1">{currentRecord.area_of_responsibility || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Assigned To</Typography>
                <Typography variant="body1">{currentRecord.assigned || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Supervisor</Typography>
                <Typography variant="body1">{currentRecord.supervisor_full_name || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">VIP Project</Typography>
                {renderCellValue(currentRecord.vip)}
              </Grid>

              {/* Dates */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>Timeline</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Date Received Jacket</Typography>
                <Typography variant="body1">{formatDate(currentRecord.date_received_jacket_ps)}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Date WMTRL</Typography>
                <Typography variant="body1">{formatDate(currentRecord.date_wmtrl)}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Date Sched</Typography>
                <Typography variant="body1">{formatDate(currentRecord.date_sched)}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Date FCOMP</Typography>
                <Typography variant="body1">{formatDate(currentRecord.date_fcomp)}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Date COMP</Typography>
                <Typography variant="body1">{formatDate(currentRecord.date_comp)}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Actual Completed on Site</Typography>
                <Typography variant="body1">{formatDate(currentRecord.actual_date_completed_on_site)}</Typography>
              </Grid>

              {/* Metrics */}
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>Performance Metrics</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Days WMTRL to FCOMP</Typography>
                <Typography variant="body1" fontWeight="medium">{currentRecord.days_wmtrl_to_fcomp || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Days Sched to FCOMP</Typography>
                <Typography variant="body1" fontWeight="medium">{currentRecord.days_sched_to_fcomp || '-'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="subtitle2" color="text.secondary">Days COMP</Typography>
                <Typography variant="body1" fontWeight="medium">{currentRecord.days_comp || '-'}</Typography>
              </Grid>

              {/* Remarks */}
              {(currentRecord.vendor_remarks || currentRecord.c1_remarks) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>Remarks</Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  {currentRecord.vendor_remarks && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Vendor Remarks</Typography>
                      <Typography variant="body2">{currentRecord.vendor_remarks}</Typography>
                    </Grid>
                  )}

                  {currentRecord.c1_remarks && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">C1 Remarks</Typography>
                      <Typography variant="body2">{currentRecord.c1_remarks}</Typography>
                    </Grid>
                  )}
                </>
              )}

              {/* Exclusions */}
              {(currentRecord.ccti_exclusion || currentRecord.apt_exclusion || currentRecord.exclusion_reason) && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" color="primary" gutterBottom sx={{ mt: 2 }}>Exclusions</Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">CCTI Exclusion</Typography>
                    {renderCellValue(currentRecord.ccti_exclusion)}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">APT Exclusion</Typography>
                    {renderCellValue(currentRecord.apt_exclusion)}
                  </Grid>

                  {currentRecord.exclusion_reason && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">Exclusion Reason</Typography>
                      <Typography variant="body2">{currentRecord.exclusion_reason}</Typography>
                    </Grid>
                  )}
                </>
              )}
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

      {/* Timeline Modal */}
      <Dialog open={showTimelineModal} onClose={() => setShowTimelineModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>⏱️ Timeline - {currentRecord?.wo_no}</DialogTitle>
        <DialogContent dividers>
          {timelineData ? (
            <Box>
              <Typography variant="body1">Timeline data loaded successfully</Typography>
              <pre>{JSON.stringify(timelineData, null, 2)}</pre>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading timeline...
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTimelineModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={showImportModal} onClose={() => setShowImportModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>📥 Import Work Orders from Excel</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload an Excel file with work order data matching the C1 sheet format
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

      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={3000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default WorkOrders;