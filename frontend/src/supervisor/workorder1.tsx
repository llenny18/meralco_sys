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
  styled,
} from '@mui/material';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import CloudUploadTwoToneIcon from '@mui/icons-material/CloudUploadTwoTone';
import CloudDownloadTwoToneIcon from '@mui/icons-material/CloudDownloadTwoTone';
import FilterListTwoToneIcon from '@mui/icons-material/FilterListTwoTone';
import TimelineTwoToneIcon from '@mui/icons-material/TimelineTwoTone';
import TableChartTwoToneIcon from '@mui/icons-material/TableChartTwoTone';
import ViewListTwoToneIcon from '@mui/icons-material/ViewListTwoTone';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';
const ENDPOINT = 'work-orders';

// Styled components for Excel-like appearance
const ExcelCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #d0d0d0',
  padding: '4px 8px',
  fontSize: '12px',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#ffffff',
  color: 'black',
  height: '25px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '150px',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
  cursor: 'pointer',
}));

const ExcelHeaderCell = styled(TableCell)(({ theme }) => ({
  border: '1px solid #9e9e9e',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#e8e8e8',
  color: '#000000',
  textAlign: 'center',
  position: 'sticky',
  top: 0,
  zIndex: 10,
  height: '25px',
  whiteSpace: 'nowrap',
  userSelect: 'none',
}));

const ExcelRowHeader = styled(TableCell)(({ theme }) => ({
  border: '1px solid #9e9e9e',
  padding: '4px 8px',
  fontSize: '11px',
  fontWeight: 'bold',
  fontFamily: 'Arial, sans-serif',
  backgroundColor: '#e8e8e8',
  color: '#000000',
  textAlign: 'center',
  position: 'sticky',
  left: 0,
  zIndex: 5,
  minWidth: '50px',
  maxWidth: '50px',
  userSelect: 'none',
}));

const ExcelContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 0,
  boxShadow: 'none',
  backgroundColor: '#050c27f8',
}));

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

// Excel column definitions - ALL fields
const EXCEL_COLUMNS = [
  { key: 'id', label: 'ID', width: 60 },
  { key: 'wo_no', label: 'WO NO', width: 120 },
  { key: 'vendor_id', label: 'Vendor ID', width: 80 },
  { key: 'project_id', label: 'Project ID', width: 80 },
  { key: 'vip', label: 'VIP', width: 60 },
  { key: 'status', label: 'Status', width: 100 },
  { key: 'description', label: 'Description', width: 200 },
  { key: 'location', label: 'Location', width: 150 },
  { key: 'municipality', label: 'Municipality', width: 120 },
  { key: 'area_of_responsibility', label: 'Area of Resp.', width: 120 },
  { key: 'assigned', label: 'Assigned', width: 100 },
  { key: 'date_received_jacket_ps', label: 'Date Rcvd Jacket PS', width: 120 },
  { key: 'date_received_awarding_wo', label: 'Date Rcvd Award WO', width: 120 },
  { key: 'date_wmtrl', label: 'Date WMTRL', width: 100 },
  { key: 'date_sched', label: 'Date Sched', width: 100 },
  { key: 'date_received_by_vc', label: 'Date Rcvd by VC', width: 120 },
  { key: 'actual_date_completed_on_site', label: 'Actual Date Comp', width: 120 },
  { key: 'date_fcomp', label: 'Date FCOMP', width: 100 },
  { key: 'date_comp', label: 'Date COMP', width: 100 },
  { key: 'days_wmtrl_to_fcomp_apt', label: 'Days WMTRL to FCOMP', width: 120 },
  { key: 'days_sched_to_fcomp', label: 'Days Sched to FCOMP', width: 120 },
  { key: 'days_comp', label: 'Days COMP', width: 80 },
  { key: 'spt_m', label: 'SPT M', width: 80 },
  { key: 'spt_l', label: 'SPT L', width: 80 },
  { key: 'duration_075_days', label: 'Duration 0.75 Days', width: 120 },
  { key: 'duration_095_days', label: 'Duration 0.95 Days', width: 120 },
  { key: 'target_days', label: 'Target Days', width: 100 },
  { key: 'spt_m_for_comp', label: 'SPT M for COMP', width: 120 },
  { key: 'duration_comp_days', label: 'Duration COMP Days', width: 120 },
  { key: 'target_days_comp', label: 'Target Days COMP', width: 120 },
  { key: 'ageing_days_since_fcomp', label: 'Ageing Days FCOMP', width: 120 },
  { key: 'computed_index_wmtrl_to_fcomp_ccti', label: 'Index WMTRL CCTI', width: 120 },
  { key: 'computed_index_comp', label: 'Index COMP', width: 100 },
  { key: 'exclusion_reason', label: 'Exclusion Reason', width: 150 },
  { key: 'for_ccti_exclusion', label: 'For CCTI Excl', width: 100 },
  { key: 'for_apt_exclusion', label: 'For APT Excl', width: 100 },
  { key: 'encoded_in_eam', label: 'In EAM', width: 80 },
  { key: 'validated_by_dcsam', label: 'Valid by DCSAM', width: 100 },
  { key: 'exclusion_start_date', label: 'Excl Start Date', width: 120 },
  { key: 'exclusion_duration_days', label: 'Excl Duration', width: 100 },
  { key: 'exclusion_end_date', label: 'Excl End Date', width: 120 },
  { key: 'exclusion_days_apt', label: 'Excl Days APT', width: 100 },
  { key: 'apt_with_exclusion', label: 'APT w/ Excl', width: 100 },
  { key: 'exclusion_days_ccti', label: 'Excl Days CCTI', width: 100 },
  { key: 'duration_ccti_with_exclusion', label: 'CCTI Dur w/ Excl', width: 120 },
  { key: 'ccti_with_exclusion', label: 'CCTI w/ Excl', width: 100 },
  { key: 'vendor_remarks', label: 'Vendor Remarks', width: 200 },
  { key: 'c1_remarks', label: 'C1 Remarks', width: 200 },
  { key: 'remarks_follow_up_by', label: 'Follow Up By', width: 150 },
  { key: 'remarks_2', label: 'Remarks 2', width: 150 },
  { key: 'remarks_3', label: 'Remarks 3', width: 150 },
  { key: 'date_needed_submit_coc', label: 'Date Need COC', width: 120 },
  { key: 'ageing_submission_coc', label: 'Ageing COC', width: 100 },
  { key: 'date_completed_from_coc', label: 'Date Comp COC', width: 120 },
  { key: 'actual_received_coc', label: 'Actual Rcvd COC', width: 120 },
  { key: 'date_audit', label: 'Date Audit', width: 100 },
  { key: 'audit_by', label: 'Audit By', width: 120 },
  { key: 'with_back_job', label: 'Backjob', width: 80 },
  { key: 'backjob_tagged_eam', label: 'Backjob EAM', width: 100 },
  { key: 'date_received_by_contractor', label: 'Date Rcvd Contractor', width: 120 },
  { key: 'date_corrected', label: 'Date Corrected', width: 120 },
  { key: 'date_material_balancing', label: 'Date Mat Balance', width: 120 },
  { key: 'material_balancing_by', label: 'Mat Balance By', width: 120 },
  { key: 'yes_no_flag', label: 'Yes/No Flag', width: 80 },
  { key: 'emailed_to_meter', label: 'Email to Meter', width: 100 },
  { key: 'dt_correction_method', label: 'DT Correction', width: 120 },
  { key: 'tln', label: 'TLN', width: 100 },
  { key: 'with_pole_replacement', label: 'Pole Replace', width: 100 },
  { key: 'actual_field_status', label: 'Field Status', width: 120 },
  { key: 'abf_printed_by', label: 'ABF Printed By', width: 120 },
  { key: 'date_printed_pole_tag_form', label: 'Date Pole Tag', width: 120 },
  { key: 'pole_tln_tags', label: 'Pole TLN Tags', width: 120 },
  { key: 'e2e_prdi', label: 'E2E PRDI', width: 100 },
  { key: 'current_ccti_with_exclusion', label: 'Current CCTI Excl', width: 120 },
  { key: 'current_ccti', label: 'Current CCTI', width: 100 },
  { key: 'final_ccti_less_than_fcomp', label: 'Final CCTI < FCOMP', width: 120 },
  { key: 'prdi', label: 'PRDI', width: 100 },
  { key: 'days_ageing', label: 'Days Ageing', width: 100 },
  { key: 'rev_non_rev', label: 'Rev/Non-Rev', width: 100 },
  { key: 'age_bracket', label: 'Age Bracket', width: 100 },
  { key: 'ntc_date_created', label: 'NTC Date Created', width: 120 },
  { key: 'ntc_amount', label: 'NTC Amount', width: 100 },
  { key: 'ntc', label: 'NTC', width: 150 },
  { key: 'ntc_date_received_by_contractor', label: 'NTC Rcvd Contractor', width: 120 },
  { key: 'ntc_date_completed', label: 'NTC Date Comp', width: 120 },
  { key: 'ntc_running_days', label: 'NTC Running Days', width: 120 },
  { key: 'nov_debit_memo_date_created', label: 'NOV Date Created', width: 120 },
  { key: 'nov_amount', label: 'NOV Amount', width: 100 },
  { key: 'nov_date_received_by_contractor', label: 'NOV Rcvd Contractor', width: 120 },
  { key: 'ext', label: 'Ext', width: 80 },
  { key: 'updated_supv', label: 'Updated Supv', width: 100 },
  { key: 'supv_name', label: 'Supv Name', width: 120 },
  { key: 'supervisor_full_name', label: 'Supervisor Full', width: 150 },
  { key: 'status_as_of_2025_04_04', label: 'Status 2025-04-04', width: 120 },
  { key: 'diff_days_wmtrl_to_sched_2025', label: 'Diff Days 2025', width: 120 },
  { key: 'filter_flag', label: 'Filter Flag', width: 100 },
  { key: 'created_at', label: 'Created At', width: 150 },
  { key: 'updated_at', label: 'Updated At', width: 150 },
];

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
  const [activeFormTab, setActiveFormTab] = useState<number>(0);
  const [mainViewTab, setMainViewTab] = useState<number>(0); // 0 = Card View, 1 = Excel View

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

  // Excel view state
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string } | null>(null);

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

      const response = await fetch(`${API_BASE_URL}/${ENDPOINT}/?${params.toString()}`);
      
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
    setActiveFormTab(0);
  };

  const handleEdit = (row: WorkOrder) => {
    setModalMode('edit');
    setCurrentRecord(row);
    setFormData({ ...row });
    setShowModal(true);
    setActiveFormTab(0);
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
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCellValue = (value: any, key: string) => {
    if (value === null || value === undefined || value === '') return '';
    
    // Boolean values
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // Date fields
    if (key.includes('date') || key.includes('_at')) {
      return formatDate(value);
    }
    
    // Number fields
    if (typeof value === 'number') {
      return value.toString();
    }
    
    return String(value);
  };

  const handleCellClick = (rowIndex: number, colKey: string) => {
    setSelectedCell({ row: rowIndex, col: colKey });
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

  // Render Excel View
  const renderExcelView = () => (
    <ExcelContainer>
      <Box sx={{ p: 2, backgroundColor: '#050c27f8'}}>
        <Typography variant="body2" sx={{ fontFamily: 'Arial', fontSize: '11px', color: '#666' }}>
          📊 Spreadsheet View - {totalCount} records
        </Typography>
      </Box>
      
      {loading && <LinearProgress />}
      
      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)', backgroundColor: '#ffffff' }}>
        <Table stickyHeader size="small" sx={{ borderCollapse: 'separate' }}>
          <TableHead>
            <TableRow>
              <ExcelRowHeader>#</ExcelRowHeader>
              {EXCEL_COLUMNS.map((col) => (
                <ExcelHeaderCell key={col.key} sx={{ minWidth: col.width }}>
                  {col.label}
                </ExcelHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, rowIndex) => (
              <TableRow key={row.id || rowIndex} hover>
                <ExcelRowHeader>{page * rowsPerPage + rowIndex + 1}</ExcelRowHeader>
                {EXCEL_COLUMNS.map((col) => {
                  const cellValue = formatCellValue(row[col.key as keyof WorkOrder], col.key);
                  const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === col.key;
                  
                  return (
                    <ExcelCell
                      key={col.key}
                      onClick={() => handleCellClick(rowIndex, col.key)}
                      sx={{
                        minWidth: col.width,
                        backgroundColor: isSelected ? '#d4e3fc' : '#ffffff',
                        border: isSelected ? '2px solid #4285f4' : '1px solid #d0d0d0',
                      }}
                    >
                      <Tooltip title={cellValue} placement="top" arrow>
                        <span>{cellValue}</span>
                      </Tooltip>
                    </ExcelCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ p: 2, backgroundColor: '#050c27f8' }}>
        <TablePagination
          component="div"
          count={totalCount}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100, 200]}
          sx={{ 
            '.MuiTablePagination-toolbar': { 
              fontSize: '12px',
              minHeight: '40px'
            }
          }}
        />
      </Box>
    </ExcelContainer>
  );

  // Render Card/Table View (original view)
  const renderCardView = () => (
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
  );

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
                Complete work order tracking with all fields
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

          {/* Main View Tabs */}
          <Grid item xs={12}>
            <Card>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={mainViewTab} 
                  onChange={(e, v) => setMainViewTab(v)}
                  sx={{ px: 2 }}
                >
                  <Tab 
                    icon={<ViewListTwoToneIcon />} 
                    iconPosition="start" 
                    label="Card View" 
                  />
                  <Tab 
                    icon={<TableChartTwoToneIcon />} 
                    iconPosition="start" 
                    label="Excel View" 
                  />
                </Tabs>
              </Box>

              {mainViewTab === 0 && renderCardView()}
              {mainViewTab === 1 && renderExcelView()}
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
            <Tabs value={activeFormTab} onChange={(e, v) => setActiveFormTab(v)} variant="scrollable" scrollButtons="auto">
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
            {activeFormTab === 0 && (
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
                  <TextField
                    fullWidth
                    label="Project ID"
                    type="number"
                    value={formData.project_id || ''}
                    onChange={(e) => handleInputChange('project_id', e.target.value ? parseInt(e.target.value) : null)}
                  />
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
            {activeFormTab === 1 && (
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
            {activeFormTab === 2 && (
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
            {activeFormTab === 3 && (
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
            {activeFormTab === 4 && (
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
            {activeFormTab === 5 && (
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
            {activeFormTab === 6 && (
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
            {activeFormTab === 7 && (
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
            {activeFormTab === 8 && (
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
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Chip label={currentRecord.status} color={getStatusColor(currentRecord.status)} />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                <Typography variant="body1">{currentRecord.description || '-'}</Typography>
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