import { FC, useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Divider,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Collapse,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import TimelineIcon from '@mui/icons-material/Timeline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import BusinessIcon from '@mui/icons-material/Business';
import SummarizeIcon from '@mui/icons-material/Summarize';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface WorkOrder {
  id: number;
  wo_no: string;
  vendor_id?: number;
  project_id?: number;
  description: string;
  location: string;
  municipality: string;
  status: string;
  date_wmtrl?: string;
  date_sched?: string;
  date_fcomp?: string;
  date_comp?: string;
  days_wmtrl_to_fcomp_apt?: number;
  days_sched_to_fcomp?: number;
  days_comp?: number;
  computed_index_wmtrl_to_fcomp_ccti?: number;
  computed_index_comp?: number;
  spt_m?: number;
  spt_l?: number;
  duration_075_days?: number;
  duration_095_days?: number;
  target_days?: number;
  exclusion_days_apt?: number;
  apt_with_exclusion?: number;
  exclusion_days_ccti?: number;
  ccti_with_exclusion?: number;
  duration_ccti_with_exclusion?: number;
  e2e_prdi?: number;
  current_ccti?: number;
  current_ccti_with_exclusion?: number;
  prdi: string;
  assigned: string;
  supervisor_full_name: string;
  spt_m_for_comp?: number;
  target_days_comp?: number;
  ageing_days_since_fcomp?: number;
}

interface WorkOrderOption {
  id: number;
  wo_no: string;
  status: string;
  municipality: string;
}

interface VendorProductivity {
  vendor: string;
  ytd_accomplishment: number;
  ytd_capability: number;
  monthly_accomplishment: number;
  monthly_capability: number;
  declared_manpower: number;
  actual_capability_percentage: number;
  productivity_percentage: number;
}

interface PCASummary {
  month: string;
  ytd_energized: number;
  cancelled_count: number;
  new_work_orders_count: number;
  completed_count: number;
  completion_vs_goal: number;
  conversion_rate: number;
  performance_completion_index: number;
  target_completion: number;
  stretch_target: number;
}

interface FormulaCell {
  label: string;
  formula: string;
  value: number | string;
  unit?: string;
  color?: string;
  tooltip?: string;
}

function WorkOrderMetricsDashboard() {
  const [workOrderId, setWorkOrderId] = useState<string>('');
  const [workOrderOptions, setWorkOrderOptions] = useState<WorkOrderOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [vendorProductivity, setVendorProductivity] = useState<VendorProductivity | null>(null);
  const [pcaSummary, setPCASummary] = useState<PCASummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['apt', 'ccti', 'prdi', 'completion']));

  useEffect(() => {
    fetchWorkOrderOptions();
    
    const params = new URLSearchParams(window.location.search);
    const woId = params.get('workorderid');
    if (woId) {
      setWorkOrderId(woId);
      fetchWorkOrderData(woId);
    }
  }, []);

  const fetchWorkOrderOptions = async () => {
    setLoadingOptions(true);
    try {
      const response = await fetch(`${API_BASE_URL}/work-orders/?page_size=1000`);
      if (!response.ok) throw new Error('Failed to fetch work orders');
      const data = await response.json();
      
      const options: WorkOrderOption[] = data.results.map((wo: any) => ({
        id: wo.id,
        wo_no: wo.wo_no,
        status: wo.status,
        municipality: wo.municipality
      }));
      
      setWorkOrderOptions(options);
    } catch (err: any) {
      console.error('Error fetching work order options:', err);
      setError('Failed to load work order list');
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchWorkOrderData = async (woId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/work-orders/${woId}/`);
      if (!response.ok) throw new Error('Failed to fetch work order');
      const data = await response.json();
      setWorkOrder(data);

      if (data.vendor_id) {
        fetchVendorProductivity(data.vendor_id);
      }

      fetchPCASummary();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorProductivity = async (vendorId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-productivity-monthly/?vendor_id=${vendorId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setVendorProductivity(data.results[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching vendor productivity:', err);
    }
  };

  const fetchPCASummary = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pca-summary/`);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          setPCASummary(data.results[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching PCA summary:', err);
    }
  };

  const handleWorkOrderChange = (event: SelectChangeEvent<string>) => {
    const selectedId = event.target.value;
    setWorkOrderId(selectedId);
    if (selectedId) {
      fetchWorkOrderData(selectedId);
      window.history.pushState({}, '', `?workorderid=${selectedId}`);
    }
  };

  const handleRefresh = () => {
    if (workOrderId) {
      fetchWorkOrderData(workOrderId);
    }
    fetchWorkOrderOptions();
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const calculateAPTFormulas = (): FormulaCell[] => {
    if (!workOrder) return [];

    return [
      {
        label: 'Date WMTRL',
        formula: 'Input Date',
        value: workOrder.date_wmtrl || 'N/A',
        tooltip: 'Work Material Release Date'
      },
      {
        label: 'Date FCOMP',
        formula: 'Input Date',
        value: workOrder.date_fcomp || 'N/A',
        tooltip: 'Field Completion Date'
      },
      {
        label: 'Days WMTRL to FCOMP (APT)',
        formula: '=DAYS(date_fcomp, date_wmtrl)',
        value: workOrder.days_wmtrl_to_fcomp_apt || 0,
        unit: 'days',
        color: (workOrder.days_wmtrl_to_fcomp_apt || 0) > (workOrder.target_days || 50) ? '#ef5350' : '#66bb6a',
        tooltip: 'Actual Processing Time from WMTRL to FCOMP'
      },
      {
        label: 'SPT M',
        formula: 'Input Value',
        value: workOrder.spt_m || 0,
        unit: 'days',
        tooltip: 'Standard Processing Time - Medium'
      },
      {
        label: 'SPT L',
        formula: 'Input Value',
        value: workOrder.spt_l || 0,
        unit: 'days',
        tooltip: 'Standard Processing Time - Large'
      },
      {
        label: 'Duration (0.75)',
        formula: '=spt_m * 0.75',
        value: workOrder.duration_075_days || 0,
        unit: 'days',
        tooltip: '75% of SPT M'
      },
      {
        label: 'Duration (0.95)',
        formula: '=spt_m * 0.95',
        value: workOrder.duration_095_days || 0,
        unit: 'days',
        tooltip: '95% of SPT M'
      },
      {
        label: 'Target Days',
        formula: '=IF(spt_m>0, spt_m, 50)',
        value: workOrder.target_days || 50,
        unit: 'days',
        color: '#42a5f5',
        tooltip: 'Target days for completion'
      },
      {
        label: 'Exclusion Days (APT)',
        formula: 'Input or Calculated',
        value: workOrder.exclusion_days_apt || 0,
        unit: 'days',
        tooltip: 'Days excluded from APT calculation'
      },
      {
        label: 'APT with Exclusion',
        formula: '=days_wmtrl_to_fcomp_apt - exclusion_days_apt',
        value: workOrder.apt_with_exclusion || workOrder.days_wmtrl_to_fcomp_apt || 0,
        unit: 'days',
        color: ((workOrder.apt_with_exclusion || workOrder.days_wmtrl_to_fcomp_apt || 0) <= (workOrder.target_days || 50)) ? '#66bb6a' : '#ffa726',
        tooltip: 'APT adjusted for exclusions'
      }
    ];
  };

  const calculateCCTIFormulas = (): FormulaCell[] => {
    if (!workOrder) return [];

    return [
      {
        label: 'Days WMTRL to FCOMP',
        formula: '=DAYS(date_fcomp, date_wmtrl)',
        value: workOrder.days_wmtrl_to_fcomp_apt || 0,
        unit: 'days'
      },
      {
        label: 'Target Days',
        formula: '=IF(spt_m>0, spt_m, 50)',
        value: workOrder.target_days || 50,
        unit: 'days'
      },
      {
        label: 'CCTI (Contractor Compliance Time Index)',
        formula: '=days_wmtrl_to_fcomp / target_days',
        value: workOrder.computed_index_wmtrl_to_fcomp_ccti?.toFixed(4) || '0.0000',
        color: (workOrder.computed_index_wmtrl_to_fcomp_ccti || 0) <= 1 ? '#66bb6a' : '#ef5350',
        tooltip: 'Values ≤1.0 indicate on-time completion'
      },
      {
        label: 'Exclusion Days (CCTI)',
        formula: 'Input or Calculated',
        value: workOrder.exclusion_days_ccti || 0,
        unit: 'days'
      },
      {
        label: 'Duration CCTI with Exclusion',
        formula: '=days_wmtrl_to_fcomp - exclusion_days_ccti',
        value: workOrder.duration_ccti_with_exclusion || workOrder.days_wmtrl_to_fcomp_apt || 0,
        unit: 'days'
      },
      {
        label: 'CCTI with Exclusion',
        formula: '=duration_ccti_with_exclusion / target_days',
        value: workOrder.ccti_with_exclusion?.toFixed(4) || '0.0000',
        color: (workOrder.ccti_with_exclusion || 0) <= 1 ? '#66bb6a' : '#ffa726',
        tooltip: 'CCTI adjusted for exclusions'
      },
      {
        label: 'Current CCTI',
        formula: '=IF(date_fcomp, ccti, DAYS(TODAY(), date_wmtrl)/target_days)',
        value: workOrder.current_ccti?.toFixed(4) || '0.0000',
        color: (workOrder.current_ccti || 0) <= 1 ? '#66bb6a' : '#ef5350'
      },
      {
        label: 'Current CCTI with Exclusion',
        formula: '=current_ccti - (exclusion_days_ccti / target_days)',
        value: workOrder.current_ccti_with_exclusion?.toFixed(4) || '0.0000',
        color: (workOrder.current_ccti_with_exclusion || 0) <= 1 ? '#66bb6a' : '#ffa726'
      }
    ];
  };

  const calculatePRDIFormulas = (): FormulaCell[] => {
    if (!workOrder) return [];

    return [
      {
        label: 'Date Sched',
        formula: 'Input Date',
        value: workOrder.date_sched || 'N/A'
      },
      {
        label: 'Date FCOMP',
        formula: 'Input Date',
        value: workOrder.date_fcomp || 'N/A'
      },
      {
        label: 'Days Sched to FCOMP',
        formula: '=DAYS(date_fcomp, date_sched)',
        value: workOrder.days_sched_to_fcomp || 0,
        unit: 'days'
      },
      {
        label: 'E2E PRDI',
        formula: 'Complex calculation based on days and status',
        value: workOrder.e2e_prdi?.toFixed(4) || '0.0000',
        tooltip: 'End-to-End Performance Rate Delivery Index'
      },
      {
        label: 'PRDI Status',
        formula: '=IF(e2e_prdi<=1, "On-time", "Delayed")',
        value: workOrder.prdi || 'N/A',
        color: workOrder.prdi === 'On-time' ? '#66bb6a' : '#ef5350'
      }
    ];
  };

  const calculateCompletionFormulas = (): FormulaCell[] => {
    if (!workOrder) return [];

    return [
      {
        label: 'Date FCOMP',
        formula: 'Input Date',
        value: workOrder.date_fcomp || 'N/A'
      },
      {
        label: 'Date COMP',
        formula: 'Input Date',
        value: workOrder.date_comp || 'N/A'
      },
      {
        label: 'Days to COMP',
        formula: '=DAYS(date_comp, date_fcomp)',
        value: workOrder.days_comp || 0,
        unit: 'days'
      },
      {
        label: 'SPT M for COMP',
        formula: 'Input Value',
        value: workOrder.spt_m_for_comp || 0,
        unit: 'days'
      },
      {
        label: 'Target Days COMP',
        formula: '=IF(spt_m_for_comp>0, spt_m_for_comp, 30)',
        value: workOrder.target_days_comp || 30,
        unit: 'days'
      },
      {
        label: 'Computed Index COMP',
        formula: '=days_comp / target_days_comp',
        value: workOrder.computed_index_comp?.toFixed(4) || '0.0000',
        color: (workOrder.computed_index_comp || 0) <= 1 ? '#66bb6a' : '#ef5350'
      },
      {
        label: 'Ageing Days Since FCOMP',
        formula: '=IF(date_comp, 0, DAYS(TODAY(), date_fcomp))',
        value: workOrder.ageing_days_since_fcomp || 0,
        unit: 'days',
        color: (workOrder.ageing_days_since_fcomp || 0) > 30 ? '#ef5350' : '#66bb6a'
      }
    ];
  };

  const renderFormulaTable = (formulas: FormulaCell[], title: string) => (
    <TableContainer 
      component={Paper} 
      sx={{ 
        mb: 0,
        bgcolor: '#0a1929',
        boxShadow: 'none',
        borderRadius: 0
      }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#0182d9' }}>
            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', py: 1.5, borderBottom: 'none' }}>
              METRIC
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', py: 1.5, borderBottom: 'none' }}>
              FORMULA
            </TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 600, fontSize: '0.875rem', py: 1.5, borderBottom: 'none' }} align="right">
              VALUE
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formulas.map((cell, idx) => (
            <TableRow 
              key={idx} 
              sx={{ 
                '&:hover': { bgcolor: '#132f4c' },
                bgcolor: idx % 2 === 0 ? '#0a1929' : '#0d1f33'
              }}
            >
              <TableCell sx={{ color: '#b0bec5', borderBottom: '1px solid #1e3a5f', py: 1.5 }}>
                <Tooltip title={cell.tooltip || cell.label} arrow placement="left">
                  <Typography variant="body2" fontWeight="medium">
                    {cell.label}
                  </Typography>
                </Tooltip>
              </TableCell>
              <TableCell sx={{ color: '#78909c', borderBottom: '1px solid #1e3a5f', py: 1.5 }}>
                <Typography 
                  variant="body2" 
                  fontFamily="'Courier New', monospace" 
                  sx={{ fontSize: '0.75rem' }}
                >
                  {cell.formula}
                </Typography>
              </TableCell>
              <TableCell align="right" sx={{ borderBottom: '1px solid #1e3a5f', py: 1.5 }}>
                <Chip
                  label={`${cell.value}${cell.unit ? ' ' + cell.unit : ''}`}
                  size="small"
                  sx={{
                    bgcolor: cell.color || '#1e3a5f',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    minWidth: '80px',
                    borderRadius: '4px'
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const renderVendorProductivity = () => {
    if (!vendorProductivity) return null;

    const formulas: FormulaCell[] = [
      {
        label: 'YTD Accomplishment',
        formula: '=SUM(monthly_accomplishments)',
        value: vendorProductivity.ytd_accomplishment?.toFixed(2) || '0.00'
      },
      {
        label: 'YTD Capability',
        formula: '=SUM(monthly_capabilities)',
        value: vendorProductivity.ytd_capability?.toFixed(2) || '0.00'
      },
      {
        label: 'Monthly Accomplishment',
        formula: 'Current Month Total',
        value: vendorProductivity.monthly_accomplishment?.toFixed(2) || '0.00'
      },
      {
        label: 'Monthly Capability',
        formula: 'Based on Declared Manpower',
        value: vendorProductivity.monthly_capability?.toFixed(2) || '0.00'
      },
      {
        label: 'Declared Manpower',
        formula: 'Input Value',
        value: vendorProductivity.declared_manpower || 0,
        unit: 'persons'
      },
      {
        label: 'Actual Capability %',
        formula: '=(monthly_capability / ytd_capability) * 100',
        value: (vendorProductivity.actual_capability_percentage * 100).toFixed(2),
        unit: '%',
        color: vendorProductivity.actual_capability_percentage >= 0.8 ? '#66bb6a' : '#ffa726'
      },
      {
        label: 'Productivity %',
        formula: '=(ytd_accomplishment / ytd_capability) * 100',
        value: (vendorProductivity.productivity_percentage * 100).toFixed(2),
        unit: '%',
        color: vendorProductivity.productivity_percentage >= 0.9 ? '#66bb6a' : '#ef5350'
      }
    ];

    return renderFormulaTable(formulas, 'Vendor Productivity');
  };

  const renderPCASummary = () => {
    if (!pcaSummary) return null;

    const formulas: FormulaCell[] = [
      {
        label: 'YTD Energized',
        formula: 'Carry Over + New - Cancelled',
        value: pcaSummary.ytd_energized || 0
      },
      {
        label: 'Cancelled Count',
        formula: '=COUNTIF(status, "CANCELLED")',
        value: pcaSummary.cancelled_count || 0
      },
      {
        label: 'New Work Orders',
        formula: '=COUNT(new_work_orders)',
        value: pcaSummary.new_work_orders_count || 0
      },
      {
        label: 'Completed Count',
        formula: '=COUNTIF(status, "COMP")',
        value: pcaSummary.completed_count || 0,
        color: '#66bb6a'
      },
      {
        label: 'Completion vs Goal',
        formula: '=(completed / target) * 100',
        value: (pcaSummary.completion_vs_goal * 100).toFixed(2),
        unit: '%',
        color: pcaSummary.completion_vs_goal >= 0.986 ? '#66bb6a' : '#ffa726'
      },
      {
        label: 'Conversion Rate',
        formula: '=(completed / ytd_energized) * 100',
        value: (pcaSummary.conversion_rate * 100).toFixed(2),
        unit: '%',
        color: pcaSummary.conversion_rate >= 0.8 ? '#66bb6a' : '#ef5350'
      },
      {
        label: 'Performance Completion Index',
        formula: '=(completion_vs_goal * weight)',
        value: pcaSummary.performance_completion_index?.toFixed(4) || '0.0000',
        color: pcaSummary.performance_completion_index >= 0.98 ? '#66bb6a' : '#ffa726'
      }
    ];

    return renderFormulaTable(formulas, 'PCA Summary');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <LinearProgress />
        <Typography variant="h6" align="center" sx={{ mt: 2 }}>
          Loading work order metrics...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: '#0a1929', color: 'white' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AssessmentIcon fontSize="large" sx={{ color: '#42a5f5' }} />
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
                    Work Order Metrics Dashboard
                  </Typography>
                </Box>
              }
              subheader={
                <Typography sx={{ color: '#78909c', mt: 1 }}>
                  Comprehensive metrics with formulas and calculations
                </Typography>
              }
            />
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <FormControl sx={{ minWidth: 300 }} size="small">
                  <InputLabel 
                    id="work-order-select-label" 
                    sx={{ color: '#b0bec5', '&.Mui-focused': { color: '#42a5f5' } }}
                  >
                    Select Work Order
                  </InputLabel>
                  <Select
                    labelId="work-order-select-label"
                    id="work-order-select"
                    value={workOrderId}
                    label="Select Work Order"
                    onChange={handleWorkOrderChange}
                    disabled={loadingOptions}
                    sx={{
                      bgcolor: '#132f4c',
                      color: 'white',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: '#1e3a5f' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#42a5f5' },
                      '.MuiSvgIcon-root': { color: '#b0bec5' }
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          bgcolor: '#132f4c',
                          color: 'white',
                          '& .MuiMenuItem-root': {
                            '&:hover': { bgcolor: '#1e3a5f' },
                            '&.Mui-selected': { bgcolor: '#0182d9', '&:hover': { bgcolor: '#1976d2' } }
                          }
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>-- Select a Work Order --</em>
                    </MenuItem>
                    {workOrderOptions.map((option) => (
                      <MenuItem key={option.id} value={option.id.toString()}>
                        {option.wo_no} - {option.municipality} ({option.status})
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingOptions && (
                    <Box sx={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%)' }}>
                      <CircularProgress size={20} sx={{ color: '#42a5f5' }} />
                    </Box>
                  )}
                </FormControl>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loadingOptions}
                  sx={{
                    bgcolor: '#0182d9',
                    '&:hover': { bgcolor: '#1976d2' }
                  }}
                >
                  Refresh
                </Button>
                {workOrder && (
                  <Chip
                    label={`WO: ${workOrder.wo_no}`}
                    sx={{ 
                      ml: 2,
                      bgcolor: '#0182d9',
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Grid>
        )}

        {workOrder && (
          <>
            {/* Work Order Info */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#0a1929', color: 'white' }}>
                <CardHeader
                  title="Work Order Information"
                  sx={{ 
                    bgcolor: '#132f4c',
                    borderBottom: '2px solid #0182d9',
                    '& .MuiCardHeader-title': { fontWeight: 600 }
                  }}
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" sx={{ color: '#78909c', mb: 0.5 }}>
                        WO Number
                      </Typography>
                      <Typography variant="h6" sx={{ color: '#42a5f5', fontWeight: 600 }}>
                        {workOrder.wo_no}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" sx={{ color: '#78909c', mb: 0.5 }}>
                        Status
                      </Typography>
                      <Chip 
                        label={workOrder.status} 
                        sx={{ 
                          bgcolor: '#0182d9',
                          color: 'white',
                          fontWeight: 600
                        }} 
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" sx={{ color: '#78909c', mb: 0.5 }}>
                        Municipality
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#b0bec5' }}>
                        {workOrder.municipality}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="subtitle2" sx={{ color: '#78909c', mb: 0.5 }}>
                        Assigned To
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#b0bec5' }}>
                        {workOrder.assigned}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" sx={{ color: '#78909c', mb: 0.5 }}>
                        Description
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#b0bec5' }}>
                        {workOrder.description}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Metrics Tabs */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#0a1929' }}>
                <Box sx={{ borderBottom: 1, borderColor: '#1e3a5f' }}>
                  <Tabs
                    value={activeTab}
                    onChange={(e, v) => setActiveTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    TabIndicatorProps={{
                      style: {
                        height: '3px',
                        backgroundColor: '#0182d9'
                      }
                    }}
                    sx={{
                      '& .MuiTab-root': {
                        minHeight: 60,
                        textTransform: 'none',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#78909c',
                        '&:hover': {
                          backgroundColor: '#132f4c',
                          color: '#42a5f5'
                        },
                        '&.Mui-selected': {
                          color: '#42a5f5',
                          fontWeight: 600,
                          backgroundColor: '#132f4c'
                        }
                      }
                    }}
                  >
                    <Tab 
                      icon={<TimelineIcon />} 
                      iconPosition="start"
                      label="APT Metrics" 
                    />
                    <Tab 
                      icon={<CalculateIcon />} 
                      iconPosition="start"
                      label="CCTI Metrics" 
                    />
                    <Tab 
                      icon={<TrendingUpIcon />} 
                      iconPosition="start"
                      label="PRDI Metrics" 
                    />
                    <Tab 
                      icon={<AssessmentIcon />} 
                      iconPosition="start"
                      label="Completion Metrics" 
                    />
                    <Tab 
                      icon={<BusinessIcon />}
                      iconPosition="start"
                      label="Vendor Productivity" 
                    />
                    <Tab 
                      icon={<SummarizeIcon />}
                      iconPosition="start"
                      label="PCA Summary" 
                    />
                  </Tabs>
                </Box>

                <CardContent sx={{ p: 0 }}>
                  {/* APT Tab */}
                  {activeTab === 0 && (
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 2,
                        bgcolor: '#132f4c',
                        borderBottom: '1px solid #1e3a5f'
                      }}>
                        <Typography variant="h6" sx={{ color: '#42a5f5', fontWeight: 600 }}>
                          <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Actual Processing Time (APT) Analysis
                        </Typography>
                        <IconButton onClick={() => toggleSection('apt')} sx={{ color: '#42a5f5' }}>
                          {expandedSections.has('apt') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedSections.has('apt')}>
                        {renderFormulaTable(calculateAPTFormulas(), 'APT Formulas')}
                      </Collapse>
                    </Box>
                  )}

                  {/* CCTI Tab */}
                  {activeTab === 1 && (
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        p: 2,
                        bgcolor: '#132f4c',
                        borderBottom: '1px solid #1e3a5f'
                      }}>
                        <Typography variant="h6" sx={{ color: '#42a5f5', fontWeight: 600 }}>
                          <CalculateIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Contractor Compliance Time Index (CCTI)
                        </Typography>
                        <IconButton onClick={() => toggleSection('ccti')} sx={{ color: '#42a5f5' }}>
                          {expandedSections.has('ccti') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedSections.has('ccti')}>
                        {renderFormulaTable(calculateCCTIFormulas(), 'CCTI Formulas')}
                      </Collapse>
                    </Box>
                  )}

                  {/* PRDI Tab */}
                  {activeTab === 2 && (
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        bgcolor: '#132f4c',
                        borderBottom: '1px solid #1e3a5f'
                      }}>
                        <Typography variant="h6" sx={{ color: '#42a5f5', fontWeight: 600 }}>
                          <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Performance Rate Delivery Index (PRDI)
                        </Typography>
                        <IconButton onClick={() => toggleSection('prdi')} sx={{ color: '#42a5f5' }}>
                          {expandedSections.has('prdi') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedSections.has('prdi')}>
                        {renderFormulaTable(calculatePRDIFormulas(), 'PRDI Formulas')}
                      </Collapse>
                    </Box>
                  )}

                  {/* Completion Tab */}
                  {activeTab === 3 && (
                    <Box>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 2,
                        bgcolor: '#132f4c',
                        borderBottom: '1px solid #1e3a5f'
                      }}>
                        <Typography variant="h6" sx={{ color: '#42a5f5', fontWeight: 600 }}>
                          <AssessmentIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Completion Metrics
                        </Typography>
                        <IconButton onClick={() => toggleSection('completion')} sx={{ color: '#42a5f5' }}>
                          {expandedSections.has('completion') ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      </Box>
                      <Collapse in={expandedSections.has('completion')}>
                        {renderFormulaTable(calculateCompletionFormulas(), 'Completion Formulas')}
                      </Collapse>
                    </Box>
                  )}

                  {/* Vendor Productivity Tab */}
                  {activeTab === 4 && (
                    <Box>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: '#132f4c',
                        borderBottom: '1px solid #1e3a5f'
                      }}>
                        <Typography variant="h6" sx={{ color: '#42a5f5', fontWeight: 600 }}>
                          <BusinessIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Vendor Productivity Analysis
                        </Typography>
                      </Box>
                      {renderVendorProductivity()}
                    </Box>
                  )}

                  {/* PCA Summary Tab */}
                  {activeTab === 5 && (
                    <Box>
                      <Box sx={{ 
                        p: 2,
                        bgcolor: '#132f4c',
                        borderBottom: '1px solid #1e3a5f'
                      }}>
                        <Typography variant="h6" sx={{ color: '#42a5f5', fontWeight: 600 }}>
                          <SummarizeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Project Completion Analytics (PCA)
                        </Typography>
                      </Box>
                      {renderPCASummary()}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Legend */}
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#0a1929' }}>
                <CardHeader 
                  title="Color Legend" 
                  sx={{ 
                    color: 'white',
                    borderBottom: '1px solid #1e3a5f',
                    '& .MuiCardHeader-title': { fontWeight: 600 }
                  }} 
                />
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item>
                      <Chip label="On Target" sx={{ bgcolor: '#66bb6a', color: 'white', fontWeight: 600 }} />
                    </Grid>
                    <Grid item>
                      <Chip label="Warning" sx={{ bgcolor: '#ffa726', color: 'white', fontWeight: 600 }} />
                    </Grid>
                    <Grid item>
                      <Chip label="Critical" sx={{ bgcolor: '#ef5350', color: 'white', fontWeight: 600 }} />
                    </Grid>
                    <Grid item>
                      <Chip label="Target" sx={{ bgcolor: '#42a5f5', color: 'white', fontWeight: 600 }} />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {!workOrder && !loading && (
          <Grid item xs={12}>
            <Card sx={{ bgcolor: '#0a1929' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <AssessmentIcon sx={{ fontSize: 80, color: '#42a5f5', mb: 2, opacity: 0.5 }} />
                  <Typography variant="h5" sx={{ color: '#b0bec5', mb: 1 }} gutterBottom>
                    No Work Order Selected
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#78909c' }}>
                    Please select a work order from the dropdown above to view its metrics
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

export default WorkOrderMetricsDashboard;