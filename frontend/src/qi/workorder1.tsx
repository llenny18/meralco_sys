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
  Tabs,
  Tab,
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

// COMPLETE WorkOrder interface with ALL fields from the model
interface WorkOrder {
  id?: number;
  
  // Relations
  vendor_id?: number;
  project_id?: number;
  
  // Basic Info
  wo_no: string;
  date_received_jacket_ps?: string;
  date_received_awarding_wo?: string;
  vip: boolean;
  description: string;
  location: string;
  municipality: string;
  area_of_responsibility: string;
  
  // Remarks & Status
  vendor_remarks: string;
  c1_remarks: string;
  assigned: string;
  status: string;
  
  // Work Dates
  date_wmtrl?: string;
  date_sched?: string;
  date_received_by_vc?: string;
  actual_date_completed_on_site?: string;
  date_fcomp?: string;
  date_comp?: string;
  
  // Durations (APT/SPT)
  days_wmtrl_to_fcomp_apt?: number;
  days_sched_to_fcomp?: number;
  days_comp?: number;
  date_needed_wmtrl_to_fcomp_075?: string;
  date_needed_fcomp_095?: string;
  date_needed_wmtrl_to_fcomp_50?: string;
  computed_index_wmtrl_to_fcomp_ccti?: number;
  computed_index_comp?: number;
  spt_m?: number;
  spt_l?: number;
  duration_075_days?: number;
  duration_095_days?: number;
  target_days?: number;
  spt_m_for_comp?: number;
  duration_comp_days?: number;
  target_days_comp?: number;
  date_needed_to_comp?: string;
  ageing_days_since_fcomp?: number;
  
  // Exclusions
  exclusion_reason: string;
  for_ccti_exclusion: boolean;
  encoded_in_eam: boolean;
  validated_by_dcsam: boolean;
  for_apt_exclusion: boolean;
  exclusion_start_date?: string;
  exclusion_duration_days?: number;
  exclusion_end_date?: string;
  
  // COC
  remarks_follow_up_by: string;
  remarks_2: string;
  date_needed_submit_coc?: string;
  ageing_submission_coc?: number;
  date_completed_from_coc?: string;
  actual_received_coc?: string;
  
  // Audit / Backjob
  date_audit?: string;
  audit_by: string;
  with_back_job: boolean;
  backjob_tagged_eam: boolean;
  
  // Contractor / Correction
  date_received_by_contractor?: string;
  date_corrected?: string;
  date_material_balancing?: string;
  material_balancing_by: string;
  yes_no_flag: boolean;
  emailed_to_meter: boolean;
  dt_correction_method: string;
  tln: string;
  with_pole_replacement: boolean;
  actual_field_status: string;
  remarks_3: string;
  abf_printed_by: string;
  date_printed_pole_tag_form?: string;
  pole_tln_tags: string;
  
  // APT / CCTI with Exclusion
  exclusion_days_apt?: number;
  apt_with_exclusion?: number;
  exclusion_days_ccti?: number;
  duration_ccti_with_exclusion?: number;
  ccti_with_exclusion?: number;
  
  // Performance
  e2e_prdi?: number;
  current_ccti_with_exclusion?: number;
  current_ccti?: number;
  final_ccti_less_than_fcomp?: number;
  prdi: string;
  days_ageing?: number;
  rev_non_rev: string;
  age_bracket: string;
  
  // NTC
  ntc_date_created?: string;
  ntc_amount?: number;
  ntc: string;
  ntc_date_received_by_contractor?: string;
  ntc_date_completed?: string;
  ntc_running_days?: number;
  
  // NOV / Debit
  nov_debit_memo_date_created?: string;
  nov_amount?: number;
  nov_date_received_by_contractor?: string;
  
  // Supervisor
  ext: string;
  updated_supv: boolean;
  supv_name: string;
  status_as_of_2025_04_04: string;
  diff_days_wmtrl_to_sched_2025?: number;
  filter_flag: string;
  supervisor_full_name: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

interface Project {
  project_id: number;
  project_name: string;
  assigned_qi?: number;
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
  const [activeTab, setActiveTab] = useState<number>(0);
  
  // User and projects
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignedProjectIds, setAssignedProjectIds] = useState<number[]>([]);

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
const [storedUser, setStoredUser] = useState<any>(null);
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
    'PCAN',
    'PENDING'
  ];

  const MUNICIPALITY_OPTIONS = [
    'Angono', 'Antipolo', 'Binangonan', 'Cainta', 'Cardona',
    'Jalajala', 'Morong', 'Pililla', 'Rodriguez', 'San Mateo',
    'Tanay', 'Taytay', 'Teresa', 'Baras'
  ];

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Fetch projects when user is loaded
  useEffect(() => {
    if (currentUserId) {
      fetchAssignedProjects();
    }
  }, [currentUserId]);

  // Fetch work orders when projects are loaded
  useEffect(() => {
    if (assignedProjectIds.length > 0) {
      fetchTableData();
    }
  }, [page, rowsPerPage, statusFilter, municipalityFilter, assignedFilter, vipFilter, assignedProjectIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined && assignedProjectIds.length > 0) {
        setPage(0);
        fetchTableData();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      setStoredUser(parsedUser);
      setCurrentUserId(parsedUser?.user_id || null);
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    setError('Failed to fetch user information. Using default view.');
  }
};

useEffect(() => {
  fetchCurrentUser();
}, []);


  const fetchAssignedProjects = async () => {
    if (!currentUserId) return;
    
    try {
      // Fetch all projects where assigned_qi matches current user
      const response = await fetch(
        `${API_BASE_URL}/projects/?assigned_qi=${currentUserId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch assigned projects');
      }
      
      const data = await response.json();
      const projectList = data.results || data;
      
      setProjects(projectList);
      
      // Extract project IDs
      const projectIds = projectList.map((p: Project) => p.project_id);
      setAssignedProjectIds(projectIds);
      
      console.log(`QI User ${currentUserId} assigned to ${projectIds.length} projects:`, projectIds);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError('Failed to fetch assigned projects');
    }
  };

  const fetchTableData = async () => {
    if (assignedProjectIds.length === 0) {
      setTableData([]);
      setTotalCount(0);
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('page', (page + 1).toString());
      params.append('page_size', rowsPerPage.toString());
    
      // Filter by assigned project IDs
      assignedProjectIds.forEach(projectId => {
        params.append('project_id', projectId.toString());
      });
      
      if (statusFilter) params.append('status', statusFilter);
      if (municipalityFilter) params.append('municipality', municipalityFilter);
      if (assignedFilter) params.append('assigned', assignedFilter);
      if (vipFilter) params.append('vip', vipFilter);
      if (searchQuery) params.append('search', searchQuery);

      console.log(`${API_BASE_URL}/${ENDPOINT}/?${params.toString()}`);

const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/?${params.toString()}`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
  }
});

if (!response.ok) throw new Error(`Failed to fetch data: ${response.statusText}`);

const data = await response.json();
console.log('🔍 Fetch response:', data);  // ← Log AFTER parsing, not before

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

  const getDefaultFormData = (): Partial<WorkOrder> => ({
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
    for_ccti_exclusion: false,
    for_apt_exclusion: false,
    actual_field_status: '',
    supervisor_full_name: '',
    encoded_in_eam: false,
    validated_by_dcsam: false,
    with_back_job: false,
    backjob_tagged_eam: false,
    yes_no_flag: false,
    emailed_to_meter: false,
    with_pole_replacement: false,
    updated_supv: false,
    remarks_follow_up_by: '',
    remarks_2: '',
    remarks_3: '',
    audit_by: '',
    material_balancing_by: '',
    dt_correction_method: '',
    tln: '',
    abf_printed_by: '',
    pole_tln_tags: '',
    prdi: '',
    rev_non_rev: '',
    age_bracket: '',
    ntc: '',
    ext: '',
    supv_name: '',
    status_as_of_2025_04_04: '',
    filter_flag: ''
  });

  const handleAdd = () => {
    setModalMode('add');
    setFormData(getDefaultFormData());
    setCurrentRecord(null);
    setShowModal(true);
    setActiveTab(0);
  };

  const handleEdit = (row: WorkOrder) => {
    setModalMode('edit');
    setCurrentRecord(row);
    setFormData({ ...row });
    setShowModal(true);
    setActiveTab(0);
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
      
      // Copy all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== undefined) {
          cleanedData[key] = formData[key];
        }
      });
      
      // Convert empty strings to null for date fields
      const dateFields = [
        'date_received_jacket_ps', 'date_received_awarding_wo', 'date_wmtrl',
        'date_sched', 'date_received_by_vc', 'actual_date_completed_on_site',
        'date_fcomp', 'date_comp', 'date_received_by_contractor', 'date_corrected',
        'date_needed_wmtrl_to_fcomp_075', 'date_needed_fcomp_095', 
        'date_needed_wmtrl_to_fcomp_50', 'date_needed_to_comp', 'exclusion_start_date',
        'exclusion_end_date', 'date_needed_submit_coc', 'date_completed_from_coc',
        'actual_received_coc', 'date_audit', 'date_material_balancing',
        'date_printed_pole_tag_form', 'ntc_date_created', 'ntc_date_received_by_contractor',
        'ntc_date_completed', 'nov_debit_memo_date_created', 'nov_date_received_by_contractor'
      ];
      
      dateFields.forEach(field => {
        if (cleanedData[field] === '') {
          cleanedData[field] = null;
        }
      });
      
      // Ensure booleans are actual booleans
      const booleanFields = [
        'vip', 'for_ccti_exclusion', 'for_apt_exclusion', 'encoded_in_eam',
        'validated_by_dcsam', 'with_back_job', 'backjob_tagged_eam', 'yes_no_flag',
        'emailed_to_meter', 'with_pole_replacement', 'updated_supv'
      ];
      
      booleanFields.forEach(field => {
        if (cleanedData[field] !== undefined) {
          cleanedData[field] = Boolean(cleanedData[field]);
        }
      });
      
      console.log('Sending data:', cleanedData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify(cleanedData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.error || `Failed to save: ${response.statusText}`);
      }
      
      showSuccess(modalMode === 'add' ? 'Work order added successfully!' : 'Work order updated successfully!');
      setShowModal(false);
      fetchTableData();
    } catch (err: any) {
      setError('Error saving record: ' + err.message);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
      a.download = 'work_orders_template.xlsx';
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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      
      // Include assigned project IDs in export
      assignedProjectIds.forEach(projectId => {
        params.append('project_id', projectId.toString());
      });
      
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
      a.download = `work_orders_qi_${currentUserId}_${new Date().toISOString().split('T')[0]}.xlsx`;
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
      'INPRG': 'info',
      'WMTRL': 'warning',
      'SCHED': 'info',
      'FCOMP': 'primary',
      'COMP': 'success',
      'TECO': 'success',
      'CLOSE': 'success',
      'CLOSED-CAN': 'error',
      'PCAN': 'error',
      'PCAN3': 'error'
    };
    return colors[status] || 'default';
  };

  const getProjectName = (projectId?: number) => {
    if (!projectId) return '-';
    const project = projects.find(p => p.project_id === projectId);
    return project ? project.project_name : `Project ${projectId}`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item>
              <Typography variant="h3" component="h3" gutterBottom>
                📋 My Assigned Work Orders (QI)
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                Showing work orders from {assignedProjectIds.length} assigned project{assignedProjectIds.length !== 1 ? 's' : ''}
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
                  startIcon={<CloudDownloadTwoToneIcon />}
                  onClick={handleDownloadTemplate}
                >
                  Template
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
                  disabled={assignedProjectIds.length === 0}
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
              <CardHeader 
                title="Work Orders" 
                subheader={currentUserId ? `QI User ID: ${currentUserId} | ${totalCount} work orders` : 'Loading...'}
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

                {!loading && !currentUserId && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      Loading user information...
                    </Typography>
                  </Box>
                )}

                {!loading && currentUserId && assignedProjectIds.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" color="text.secondary" gutterBottom>
                      🎯
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      No projects assigned
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      You are not assigned as QI to any projects yet
                    </Typography>
                  </Box>
                )}

                {!loading && !error && assignedProjectIds.length > 0 && tableData.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h4" color="text.secondary" gutterBottom>
                      📭
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      No work orders found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      No work orders for your assigned projects
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
                            <TableCell><Typography variant="subtitle2" fontWeight="bold">PROJECT</Typography></TableCell>
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
                              <TableCell>
                                <Tooltip title={`Project ID: ${row.project_id}`}>
                                  <Chip 
                                    label={getProjectName(row.project_id)} 
                                    size="small" 
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Tooltip>
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

      {/* Add/Edit Modal - WITH ALL FIELDS */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="xl" fullWidth>
        <DialogTitle>
          {modalMode === 'add' ? '➕ Add New Work Order' : '✏️ Edit Work Order'}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
              <Tab label="Basic Info" />
              <Tab label="Dates" />
              <Tab label="Duration & Metrics" />
              <Tab label="Exclusions" />
              <Tab label="COC & Audit" />
              <Tab label="Contractor" />
              <Tab label="Performance" />
              <Tab label="NTC & NOV" />
              <Tab label="Supervisor" />
            </Tabs>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
            {/* TAB 0: BASIC INFO */}
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">Basic Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    required
                    label="WO Number"
                    value={formData.wo_no || ''}
                    onChange={(e) => handleInputChange('wo_no', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Vendor ID"
                    type="number"
                    value={formData.vendor_id || ''}
                    onChange={(e) => handleInputChange('vendor_id', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Project</InputLabel>
                    <Select
                      value={formData.project_id || ''}
                      onChange={(e) => handleInputChange('project_id', e.target.value ? parseInt(e.target.value as string) : null)}
                      label="Project"
                    >
                      <MenuItem value="">Select Project</MenuItem>
                      {projects.map(project => (
                        <MenuItem key={project.project_id} value={project.project_id}>
                          {project.project_name} (ID: {project.project_id})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
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

                <Grid item xs={12} sm={6} md={4}>
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

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Assigned To"
                    value={formData.assigned || ''}
                    onChange={(e) => handleInputChange('assigned', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Actual Field Status"
                    value={formData.actual_field_status || ''}
                    onChange={(e) => handleInputChange('actual_field_status', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Vendor Remarks"
                    value={formData.vendor_remarks || ''}
                    onChange={(e) => handleInputChange('vendor_remarks', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="C1 Remarks"
                    value={formData.c1_remarks || ''}
                    onChange={(e) => handleInputChange('c1_remarks', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 1: DATES */}
            {activeTab === 1 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">Date Tracking</Typography>
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

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Needed (0.75) WMTRL to FCOMP"
                    value={formData.date_needed_wmtrl_to_fcomp_075 || ''}
                    onChange={(e) => handleInputChange('date_needed_wmtrl_to_fcomp_075', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Needed (0.95) FCOMP"
                    value={formData.date_needed_fcomp_095 || ''}
                    onChange={(e) => handleInputChange('date_needed_fcomp_095', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Needed (50 days) WMTRL to FCOMP"
                    value={formData.date_needed_wmtrl_to_fcomp_50 || ''}
                    onChange={(e) => handleInputChange('date_needed_wmtrl_to_fcomp_50', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Needed to COMP"
                    value={formData.date_needed_to_comp || ''}
                    onChange={(e) => handleInputChange('date_needed_to_comp', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 2: DURATION & METRICS */}
            {activeTab === 2 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">Duration & SPT Metrics</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="SPT M"
                    type="number"
                    value={formData.spt_m || ''}
                    onChange={(e) => handleInputChange('spt_m', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="SPT L"
                    type="number"
                    value={formData.spt_l || ''}
                    onChange={(e) => handleInputChange('spt_l', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Duration 0.75 Days"
                    type="number"
                    value={formData.duration_075_days || ''}
                    onChange={(e) => handleInputChange('duration_075_days', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Duration 0.95 Days"
                    type="number"
                    value={formData.duration_095_days || ''}
                    onChange={(e) => handleInputChange('duration_095_days', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Target Days"
                    type="number"
                    value={formData.target_days || ''}
                    onChange={(e) => handleInputChange('target_days', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="SPT M for COMP"
                    type="number"
                    value={formData.spt_m_for_comp || ''}
                    onChange={(e) => handleInputChange('spt_m_for_comp', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Duration COMP Days"
                    type="number"
                    value={formData.duration_comp_days || ''}
                    onChange={(e) => handleInputChange('duration_comp_days', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Target Days COMP"
                    type="number"
                    value={formData.target_days_comp || ''}
                    onChange={(e) => handleInputChange('target_days_comp', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Ageing Days Since FCOMP"
                    type="number"
                    value={formData.ageing_days_since_fcomp || ''}
                    onChange={(e) => handleInputChange('ageing_days_since_fcomp', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Computed Indices (Read-Only in Edit)</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Days WMTRL to FCOMP (APT)"
                    type="number"
                    value={formData.days_wmtrl_to_fcomp_apt || ''}
                    InputProps={{ readOnly: modalMode === 'edit' }}
                    disabled={modalMode === 'edit'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Days Sched to FCOMP"
                    type="number"
                    value={formData.days_sched_to_fcomp || ''}
                    InputProps={{ readOnly: modalMode === 'edit' }}
                    disabled={modalMode === 'edit'}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Days COMP"
                    type="number"
                    value={formData.days_comp || ''}
                    InputProps={{ readOnly: modalMode === 'edit' }}
                    disabled={modalMode === 'edit'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Computed Index WMTRL to FCOMP (CCTI)"
                    type="number"
                    value={formData.computed_index_wmtrl_to_fcomp_ccti || ''}
                    InputProps={{ readOnly: modalMode === 'edit' }}
                    disabled={modalMode === 'edit'}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Computed Index COMP"
                    type="number"
                    value={formData.computed_index_comp || ''}
                    InputProps={{ readOnly: modalMode === 'edit' }}
                    disabled={modalMode === 'edit'}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 3: EXCLUSIONS */}
            {activeTab === 3 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">Exclusions & Flags</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Exclusion Reason"
                    value={formData.exclusion_reason || ''}
                    onChange={(e) => handleInputChange('exclusion_reason', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.for_ccti_exclusion || false}
                        onChange={(e) => handleInputChange('for_ccti_exclusion', e.target.checked)}
                        color="warning"
                      />
                    }
                    label="For CCTI Exclusion"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.for_apt_exclusion || false}
                        onChange={(e) => handleInputChange('for_apt_exclusion', e.target.checked)}
                        color="warning"
                      />
                    }
                    label="For APT Exclusion"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.encoded_in_eam || false}
                        onChange={(e) => handleInputChange('encoded_in_eam', e.target.checked)}
                      />
                    }
                    label="Encoded in EAM"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.validated_by_dcsam || false}
                        onChange={(e) => handleInputChange('validated_by_dcsam', e.target.checked)}
                      />
                    }
                    label="Validated by DCSAM"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Exclusion Start Date"
                    value={formData.exclusion_start_date || ''}
                    onChange={(e) => handleInputChange('exclusion_start_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Exclusion Duration (Days)"
                    type="number"
                    value={formData.exclusion_duration_days || ''}
                    onChange={(e) => handleInputChange('exclusion_duration_days', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Exclusion End Date"
                    value={formData.exclusion_end_date || ''}
                    onChange={(e) => handleInputChange('exclusion_end_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Exclusion Metrics</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Exclusion Days (APT)"
                    type="number"
                    value={formData.exclusion_days_apt || ''}
                    onChange={(e) => handleInputChange('exclusion_days_apt', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="APT with Exclusion"
                    type="number"
                    value={formData.apt_with_exclusion || ''}
                    onChange={(e) => handleInputChange('apt_with_exclusion', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Exclusion Days (CCTI)"
                    type="number"
                    value={formData.exclusion_days_ccti || ''}
                    onChange={(e) => handleInputChange('exclusion_days_ccti', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Duration CCTI with Exclusion"
                    type="number"
                    value={formData.duration_ccti_with_exclusion || ''}
                    onChange={(e) => handleInputChange('duration_ccti_with_exclusion', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="CCTI with Exclusion"
                    type="number"
                    value={formData.ccti_with_exclusion || ''}
                    onChange={(e) => handleInputChange('ccti_with_exclusion', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 4: COC & AUDIT */}
            {activeTab === 4 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">COC (Certificate of Completion)</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Remarks Follow Up By"
                    value={formData.remarks_follow_up_by || ''}
                    onChange={(e) => handleInputChange('remarks_follow_up_by', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Remarks 2"
                    value={formData.remarks_2 || ''}
                    onChange={(e) => handleInputChange('remarks_2', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Needed Submit COC"
                    value={formData.date_needed_submit_coc || ''}
                    onChange={(e) => handleInputChange('date_needed_submit_coc', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Ageing Submission COC"
                    type="number"
                    value={formData.ageing_submission_coc || ''}
                    onChange={(e) => handleInputChange('ageing_submission_coc', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Completed from COC"
                    value={formData.date_completed_from_coc || ''}
                    onChange={(e) => handleInputChange('date_completed_from_coc', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Actual Received COC"
                    value={formData.actual_received_coc || ''}
                    onChange={(e) => handleInputChange('actual_received_coc', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>Audit & Backjob</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Audit"
                    value={formData.date_audit || ''}
                    onChange={(e) => handleInputChange('date_audit', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Audit By"
                    value={formData.audit_by || ''}
                    onChange={(e) => handleInputChange('audit_by', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.with_back_job || false}
                        onChange={(e) => handleInputChange('with_back_job', e.target.checked)}
                      />
                    }
                    label="With Back Job"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.backjob_tagged_eam || false}
                        onChange={(e) => handleInputChange('backjob_tagged_eam', e.target.checked)}
                      />
                    }
                    label="Backjob Tagged in EAM"
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 5: CONTRACTOR */}
            {activeTab === 5 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">Contractor & Correction</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Material Balancing"
                    value={formData.date_material_balancing || ''}
                    onChange={(e) => handleInputChange('date_material_balancing', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Material Balancing By"
                    value={formData.material_balancing_by || ''}
                    onChange={(e) => handleInputChange('material_balancing_by', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.yes_no_flag || false}
                        onChange={(e) => handleInputChange('yes_no_flag', e.target.checked)}
                      />
                    }
                    label="Yes/No Flag"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.emailed_to_meter || false}
                        onChange={(e) => handleInputChange('emailed_to_meter', e.target.checked)}
                      />
                    }
                    label="Emailed to Meter"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="DT Correction Method"
                    value={formData.dt_correction_method || ''}
                    onChange={(e) => handleInputChange('dt_correction_method', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="TLN"
                    value={formData.tln || ''}
                    onChange={(e) => handleInputChange('tln', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.with_pole_replacement || false}
                        onChange={(e) => handleInputChange('with_pole_replacement', e.target.checked)}
                      />
                    }
                    label="With Pole Replacement"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="ABF Printed By"
                    value={formData.abf_printed_by || ''}
                    onChange={(e) => handleInputChange('abf_printed_by', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date Printed Pole Tag Form"
                    value={formData.date_printed_pole_tag_form || ''}
                    onChange={(e) => handleInputChange('date_printed_pole_tag_form', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Pole TLN Tags"
                    value={formData.pole_tln_tags || ''}
                    onChange={(e) => handleInputChange('pole_tln_tags', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Remarks 3"
                    value={formData.remarks_3 || ''}
                    onChange={(e) => handleInputChange('remarks_3', e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 6: PERFORMANCE */}
            {activeTab === 6 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">Performance Metrics</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="E2E PRDI"
                    type="number"
                    value={formData.e2e_prdi || ''}
                    onChange={(e) => handleInputChange('e2e_prdi', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Current CCTI with Exclusion"
                    type="number"
                    value={formData.current_ccti_with_exclusion || ''}
                    onChange={(e) => handleInputChange('current_ccti_with_exclusion', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Current CCTI"
                    type="number"
                    value={formData.current_ccti || ''}
                    onChange={(e) => handleInputChange('current_ccti', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Final CCTI Less Than FCOMP"
                    type="number"
                    value={formData.final_ccti_less_than_fcomp || ''}
                    onChange={(e) => handleInputChange('final_ccti_less_than_fcomp', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Days Ageing"
                    type="number"
                    value={formData.days_ageing || ''}
                    onChange={(e) => handleInputChange('days_ageing', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="PRDI"
                    value={formData.prdi || ''}
                    onChange={(e) => handleInputChange('prdi', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Rev/Non-Rev"
                    value={formData.rev_non_rev || ''}
                    onChange={(e) => handleInputChange('rev_non_rev', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Age Bracket"
                    value={formData.age_bracket || ''}
                    onChange={(e) => handleInputChange('age_bracket', e.target.value)}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 7: NTC & NOV */}
            {activeTab === 7 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">NTC (Notice to Commence)</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="NTC Date Created"
                    value={formData.ntc_date_created || ''}
                    onChange={(e) => handleInputChange('ntc_date_created', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="NTC Amount"
                    type="number"
                    value={formData.ntc_amount || ''}
                    onChange={(e) => handleInputChange('ntc_amount', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="NTC Date Received by Contractor"
                    value={formData.ntc_date_received_by_contractor || ''}
                    onChange={(e) => handleInputChange('ntc_date_received_by_contractor', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="NTC Date Completed"
                    value={formData.ntc_date_completed || ''}
                    onChange={(e) => handleInputChange('ntc_date_completed', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="NTC Running Days"
                    type="number"
                    value={formData.ntc_running_days || ''}
                    onChange={(e) => handleInputChange('ntc_running_days', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="NTC"
                    value={formData.ntc || ''}
                    onChange={(e) => handleInputChange('ntc', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2 }}>NOV (Notice of Violation) / Debit</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="NOV Debit Memo Date Created"
                    value={formData.nov_debit_memo_date_created || ''}
                    onChange={(e) => handleInputChange('nov_debit_memo_date_created', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="NOV Amount"
                    type="number"
                    value={formData.nov_amount || ''}
                    onChange={(e) => handleInputChange('nov_amount', e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    type="date"
                    label="NOV Date Received by Contractor"
                    value={formData.nov_date_received_by_contractor || ''}
                    onChange={(e) => handleInputChange('nov_date_received_by_contractor', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}

            {/* TAB 8: SUPERVISOR */}
            {activeTab === 8 && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom color="primary">Supervisor Information</Typography>
                  <Divider sx={{ mb: 2 }} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Supervisor Full Name"
                    value={formData.supervisor_full_name || ''}
                    onChange={(e) => handleInputChange('supervisor_full_name', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Supv Name"
                    value={formData.supv_name || ''}
                    onChange={(e) => handleInputChange('supv_name', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Ext"
                    value={formData.ext || ''}
                    onChange={(e) => handleInputChange('ext', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.updated_supv || false}
                        onChange={(e) => handleInputChange('updated_supv', e.target.checked)}
                      />
                    }
                    label="Updated Supv"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Status as of 2025-04-04"
                    value={formData.status_as_of_2025_04_04 || ''}
                    onChange={(e) => handleInputChange('status_as_of_2025_04_04', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Diff Days WMTRL to Sched (2025)"
                    type="number"
                    value={formData.diff_days_wmtrl_to_sched_2025 || ''}
                    onChange={(e) => handleInputChange('diff_days_wmtrl_to_sched_2025', e.target.value ? parseInt(e.target.value) : null)}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Filter Flag"
                    value={formData.filter_flag || ''}
                    onChange={(e) => handleInputChange('filter_flag', e.target.value)}
                  />
                </Grid>
              </Grid>
            )}
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
              <Grid item xs={12}>
                <Typography variant="h6" color="primary" gutterBottom>Basic Information</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">WO Number</Typography>
                <Typography variant="body1" fontWeight="medium">{currentRecord.wo_no}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Project</Typography>
                <Chip label={getProjectName(currentRecord.project_id)} color="primary" variant="outlined" />
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
              Upload an Excel file with work order data. Download the template for the correct format.
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