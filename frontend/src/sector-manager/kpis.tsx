import { FC, useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Box,
  Button,
  Alert,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  ChartTooltip,
  Legend
);

const API_BASE_URL = 'https://aimswo.online/api/api/v1';

interface KPIData {
  value?: number;
  numerator?: number;
  denominator?: number;
  sample_size?: number;
  target?: {
    value: number | null;
    green: number | null;
    yellow: number | null;
    red: number | null;
  } | null;
  details?: any;
}

interface DashboardData {
  period_start: string;
  period_end: string;
  total_kpis: number;
  ccti?: KPIData;
  pca_conversion?: KPIData;
  ageing_completion?: KPIData;
  pai_adherence?: KPIData;
  termination_apt?: KPIData;
  termination_resolution?: KPIData;
  prdi?: KPIData;
  cost_settlement?: KPIData;
  quality_index?: KPIData;
  capability_utilization?: KPIData;
  historical_trends?: any;
  chart_data?: any;
}

type ChipColor = 'success' | 'warning' | 'error' | 'default' | 'primary' | 'secondary' | 'info';

export default function KPIDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriodStart, setSelectedPeriodStart] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [selectedPeriodEnd, setSelectedPeriodEnd] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState<boolean>(false);
  const [selectedKPI, setSelectedKPI] = useState<any>(null);
  const [calculateDialogOpen, setCalculateDialogOpen] = useState<boolean>(false);
  const [chartViewModes, setChartViewModes] = useState<{[key: string]: 'chart' | 'table'}>({
    comparison: 'chart',
    radar: 'chart',
    trend: 'chart'
  });

  // Helper functions
  const hasKPIData = (kpi?: KPIData): boolean => {
    if (!kpi || typeof kpi !== 'object') return false;
    // Check if it's an empty object
    if (Object.keys(kpi).length === 0) return false;
    // Check if it has value property
    return kpi.value !== undefined;
  };

  const getKPIValue = (kpi?: KPIData): number => {
    return kpi?.value ?? 0;
  };

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/kpi-dashboard/current_period/?period_start=${selectedPeriodStart}&period_end=${selectedPeriodEnd}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate and save KPIs
  const handleCalculateKPIs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/kpi-snapshots/calculate_and_save/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period_start: selectedPeriodStart,
          period_end: selectedPeriodEnd,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate KPIs: ${response.statusText}`);
      }

      alert('KPIs calculated and saved successfully!');
      setCalculateDialogOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // View KPI details
  const handleViewDetails = async (kpiType: string, kpiName: string, kpiData?: KPIData) => {
    if (!hasKPIData(kpiData)) {
      alert('No data available for this KPI');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/kpi-dashboard/kpi_detail/?type=${kpiType}&period_start=${selectedPeriodStart}&period_end=${selectedPeriodEnd}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch KPI details: ${response.statusText}`);
      }
      
      const data = await response.json();
      setSelectedKPI({ ...data, name: kpiName });
      setDetailDialogOpen(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get status color - Fixed to return proper chip colors
  const getStatusColor = (value: number, target?: KPIData['target']): ChipColor => {
    if (!target || target.value === null) return 'default';
    
    if (target.green !== null && value >= target.green) return 'success';
    if (target.yellow !== null && value >= target.yellow) return 'warning';
    if (target.red !== null && value >= target.red) return 'error';
    
    return 'default';
  };

  // Get trend icon
  const getTrendIcon = (value: number, target?: KPIData['target']) => {
    if (!target || target.value === null) return <TrendingFlatIcon />;
    
    const variance = ((value - target.value) / target.value) * 100;
    
    if (variance > 5) return <TrendingUpIcon color="success" />;
    if (variance < -5) return <TrendingDownIcon color="error" />;
    return <TrendingFlatIcon color="warning" />;
  };

  // Render KPI Card
  const renderKPICard = (
    title: string,
    kpiType: string,
    data?: KPIData,
    unit: string = '%',
    description: string = ''
  ) => {
    if (!hasKPIData(data)) {
      return (
        <Card sx={{ height: '100%', borderStyle: 'dashed', borderColor: 'grey.300' }}>
          <CardHeader title={title} subheader={description} />
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={150}>
              <Typography color="text.secondary">No data available</Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    const value = getKPIValue(data);
    const status = getStatusColor(value, data.target);
    const trendIcon = getTrendIcon(value, data.target);
    const variance = data.target?.value !== null && data.target?.value !== undefined
      ? (((value - data.target.value) / data.target.value) * 100).toFixed(2)
      : null;

    return (
      <Card sx={{ height: '100%' }}>
        <CardHeader
          title={
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">{title}</Typography>
              <Tooltip title="View Details">
                <IconButton size="small" onClick={() => handleViewDetails(kpiType, title, data)}>
                  <InfoOutlinedIcon />
                </IconButton>
              </Tooltip>
            </Box>
          }
          subheader={description}
        />
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h3" color={status === 'default' ? 'text.primary' : `${status}.main`}>
                {value.toFixed(2)}
                <Typography variant="h5" component="span" color="text.secondary">
                  {unit}
                </Typography>
              </Typography>
              {data.target?.value !== null && data.target?.value !== undefined && (
                <Typography variant="body2" color="text.secondary">
                  Target: {data.target.value.toFixed(2)}{unit}
                </Typography>
              )}
            </Box>
            <Box textAlign="right">
              {trendIcon}
              {variance && (
                <Typography variant="body2" color={parseFloat(variance) > 0 ? 'success.main' : 'error.main'}>
                  {parseFloat(variance) > 0 ? '+' : ''}{variance}%
                </Typography>
              )}
            </Box>
          </Box>

          {data.target?.value !== null && data.target?.value !== undefined && (
            <Box>
              <Box display="flex" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption">Progress</Typography>
                <Typography variant="caption">
                  {((value / data.target.value) * 100).toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((value / data.target.value) * 100, 100)}
                color={status === 'default' ? 'primary' : status}
              />
            </Box>
          )}

          {(data.numerator !== undefined && data.denominator !== undefined) && (
            <Box mt={2}>
              <Typography variant="caption" color="text.secondary">
                {data.numerator} / {data.denominator}
                {data.sample_size && ` (n=${data.sample_size})`}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Prepare chart data
  const prepareComparisonChartData = () => {
    if (!dashboardData) return null;

    const kpis = [
      { label: 'CCTI', data: dashboardData.ccti },
      { label: 'PCA Conv.', data: dashboardData.pca_conversion },
      { label: 'Ageing', data: dashboardData.ageing_completion },
      { label: 'Quality', data: dashboardData.quality_index },
      { label: 'Cost Sett.', data: dashboardData.cost_settlement },
      { label: 'Capability', data: dashboardData.capability_utilization },
    ].filter(k => hasKPIData(k.data));

    if (kpis.length === 0) return null;

    return {
      labels: kpis.map(k => k.label),
      datasets: [
        {
          label: 'Current Value',
          data: kpis.map(k => getKPIValue(k.data)),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Target',
          data: kpis.map(k => k.data?.target?.value ?? 0),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const prepareComparisonTableData = () => {
    if (!dashboardData) return [];

    return [
      { name: 'CCTI', data: dashboardData.ccti },
      { name: 'PCA Conv.', data: dashboardData.pca_conversion },
      { name: 'Ageing', data: dashboardData.ageing_completion },
      { name: 'Quality', data: dashboardData.quality_index },
      { name: 'Cost Sett.', data: dashboardData.cost_settlement },
      { name: 'Capability', data: dashboardData.capability_utilization },
    ].filter(k => hasKPIData(k.data));
  };

  const prepareTrendChartData = () => {
    if (!dashboardData || !dashboardData.historical_trends) return null;

    const months = Object.keys(dashboardData.historical_trends).reverse();
    
    // Check if there's any actual data in the trends
    const hasData = months.some(m => {
      const monthData = dashboardData.historical_trends?.[m];
      return monthData && typeof monthData === 'object' && Object.keys(monthData).length > 0;
    });

    if (!hasData) return null;

    return {
      labels: months,
      datasets: [
        {
          label: 'CCTI',
          data: months.map(m => dashboardData.historical_trends?.[m]?.CCTI?.value ?? 0),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
        {
          label: 'PCA Conversion',
          data: months.map(m => dashboardData.historical_trends?.[m]?.PCA_CONVERSION?.value ?? 0),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Quality Index',
          data: months.map(m => dashboardData.historical_trends?.[m]?.QUALITY_INDEX?.value ?? 0),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    };
  };

  const prepareTrendTableData = () => {
    if (!dashboardData || !dashboardData.historical_trends) return [];

    const months = Object.keys(dashboardData.historical_trends).reverse();
    
    return months.map(month => ({
      month,
      ccti: dashboardData.historical_trends?.[month]?.CCTI?.value ?? 0,
      pca: dashboardData.historical_trends?.[month]?.PCA_CONVERSION?.value ?? 0,
      quality: dashboardData.historical_trends?.[month]?.QUALITY_INDEX?.value ?? 0,
    }));
  };

  const prepareRadarChartData = () => {
    if (!dashboardData) return null;

    const kpis = [
      { label: 'CCTI', data: dashboardData.ccti },
      { label: 'PCA Conv.', data: dashboardData.pca_conversion },
      { label: 'Ageing', data: dashboardData.ageing_completion },
      { label: 'Quality', data: dashboardData.quality_index },
      { label: 'Cost Sett.', data: dashboardData.cost_settlement },
      { label: 'Capability', data: dashboardData.capability_utilization },
    ].filter(k => hasKPIData(k.data));

    if (kpis.length === 0) return null;

    return {
      labels: kpis.map(k => k.label),
      datasets: [
        {
          label: 'Achievement %',
          data: kpis.map(k => {
            const value = getKPIValue(k.data);
            const target = k.data?.target?.value ?? 100;
            return target > 0 ? (value / target) * 100 : 0;
          }),
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        },
      ],
    };
  };

  const prepareRadarTableData = () => {
    if (!dashboardData) return [];

    return [
      { name: 'CCTI', data: dashboardData.ccti },
      { name: 'PCA Conv.', data: dashboardData.pca_conversion },
      { name: 'Ageing', data: dashboardData.ageing_completion },
      { name: 'Quality', data: dashboardData.quality_index },
      { name: 'Cost Sett.', data: dashboardData.cost_settlement },
      { name: 'Capability', data: dashboardData.capability_utilization },
    ].filter(k => hasKPIData(k.data));
  };

  const toggleChartView = (chartType: string) => {
    setChartViewModes(prev => ({
      ...prev,
      [chartType]: prev[chartType] === 'chart' ? 'table' : 'chart'
    }));
  };

  if (loading && !dashboardData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box mb={3}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              📊 KPI Dashboard
            </Typography>
            <Typography variant="subtitle2">
              Construction Team 1 - Key Performance Indicators
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<CalendarTodayIcon />}
              onClick={() => setCalculateDialogOpen(true)}
              sx={{ mr: 1 }}
            >
              Select Period
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchDashboardData}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}

          {/* Period Info */}
          {dashboardData && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <Typography variant="body1">
                      <strong>Period:</strong> {new Date(dashboardData.period_start).toLocaleDateString()} - {new Date(dashboardData.period_end).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6} textAlign="right">
                    <Chip label={`${dashboardData.total_kpis} KPIs Tracked`} color="primary" />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* KPI Cards */}
          {dashboardData && (
            <>
              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('CCTI', 'CCTI', dashboardData.ccti, '', 'Customer Connection Timeliness Index')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('PCA Conversion Rate', 'PCA_CONVERSION', dashboardData.pca_conversion, '%', 'Work Order Completion Rate')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('Ageing PCA Completion', 'AGEING_COMPLETION', dashboardData.ageing_completion, '%', 'Completion of 2024 & Prior WOs')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('PAI Adherence', 'PAI_ADHERENCE', dashboardData.pai_adherence, '%', 'Project Authorization Index')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('Termination APT', 'TERM_APT', dashboardData.termination_apt, ' days', 'Average Processing Time')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('Termination Resolution', 'TERM_RESOLUTION', dashboardData.termination_resolution, '%', 'Resolution Rate')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('PRDI', 'PRDI', dashboardData.prdi, '', 'Project Resolution Duration Index')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('Cost Settlement', 'COST_SETTLEMENT', dashboardData.cost_settlement, '%', 'WO Cost Settlement to RAB')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('Quality Index', 'QUALITY_INDEX', dashboardData.quality_index, '%', 'Quality Management Index')}
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                {renderKPICard('Capability Utilization', 'CAPABILITY_UTIL', dashboardData.capability_utilization, '%', 'Contractor Capability')}
              </Grid>
            </>
          )}

          {/* Charts Section */}
          {dashboardData && (
            <>
              {/* Comparison Chart/Table */}
              {prepareComparisonChartData() && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader 
                      title="KPI Performance vs Target"
                      action={
                        <IconButton onClick={() => toggleChartView('comparison')}>
                          {chartViewModes.comparison === 'chart' ? <TableChartIcon /> : <BarChartIcon />}
                        </IconButton>
                      }
                    />
                    <CardContent>
                      {chartViewModes.comparison === 'chart' ? (
                        <Bar
                          data={prepareComparisonChartData()!}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { position: 'top' as const },
                            },
                          }}
                        />
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>KPI</strong></TableCell>
                                <TableCell align="right"><strong>Current</strong></TableCell>
                                <TableCell align="right"><strong>Target</strong></TableCell>
                                <TableCell align="right"><strong>% Achievement</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {prepareComparisonTableData().map((row, index) => {
                                const current = getKPIValue(row.data);
                                const target = row.data?.target?.value ?? 0;
                                const achievement = target > 0 ? ((current / target) * 100).toFixed(1) : 'N/A';
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell align="right">{current.toFixed(2)}</TableCell>
                                    <TableCell align="right">{target > 0 ? target.toFixed(2) : 'N/A'}</TableCell>
                                    <TableCell align="right">{achievement}{typeof achievement === 'string' ? '' : '%'}</TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Radar Chart/Table */}
              {prepareRadarChartData() && (
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardHeader 
                      title="KPI Achievement Radar"
                      action={
                        <IconButton onClick={() => toggleChartView('radar')}>
                          {chartViewModes.radar === 'chart' ? <TableChartIcon /> : <BarChartIcon />}
                        </IconButton>
                      }
                    />
                    <CardContent>
                      {chartViewModes.radar === 'chart' ? (
                        <Radar
                          data={prepareRadarChartData()!}
                          options={{
                            responsive: true,
                            scales: {
                              r: {
                                beginAtZero: true,
                                max: 120,
                              },
                            },
                          }}
                        />
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>KPI</strong></TableCell>
                                <TableCell align="right"><strong>Achievement %</strong></TableCell>
                                <TableCell align="right"><strong>Status</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {prepareRadarTableData().map((row, index) => {
                                const value = getKPIValue(row.data);
                                const target = row.data?.target?.value ?? 100;
                                const achievement = target > 0 ? (value / target) * 100 : 0;
                                const status = getStatusColor(value, row.data?.target);
                                return (
                                  <TableRow key={index}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell align="right">{achievement.toFixed(1)}%</TableCell>
                                    <TableCell align="right">
                                      <Chip 
                                        label={status.toUpperCase()} 
                                        color={status === 'default' ? 'default' : status} 
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {/* Trend Chart/Table */}
              {prepareTrendChartData() && (
                <Grid item xs={12}>
                  <Card>
                    <CardHeader 
                      title="Historical Trends (Last 6 Months)"
                      action={
                        <IconButton onClick={() => toggleChartView('trend')}>
                          {chartViewModes.trend === 'chart' ? <TableChartIcon /> : <BarChartIcon />}
                        </IconButton>
                      }
                    />
                    <CardContent>
                      {chartViewModes.trend === 'chart' ? (
                        <Line
                          data={prepareTrendChartData()!}
                          options={{
                            responsive: true,
                            plugins: {
                              legend: { position: 'top' as const },
                            },
                          }}
                        />
                      ) : (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell><strong>Month</strong></TableCell>
                                <TableCell align="right"><strong>CCTI</strong></TableCell>
                                <TableCell align="right"><strong>PCA Conversion</strong></TableCell>
                                <TableCell align="right"><strong>Quality Index</strong></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {prepareTrendTableData().map((row, index) => (
                                <TableRow key={index}>
                                  <TableCell>{row.month}</TableCell>
                                  <TableCell align="right">{row.ccti.toFixed(2)}</TableCell>
                                  <TableCell align="right">{row.pca.toFixed(2)}</TableCell>
                                  <TableCell align="right">{row.quality.toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Container>

      {/* Period Selection Dialog */}
      <Dialog open={calculateDialogOpen} onClose={() => setCalculateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Period & Calculate KPIs</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Period Start"
                type="date"
                value={selectedPeriodStart}
                onChange={(e) => setSelectedPeriodStart(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Period End"
                type="date"
                value={selectedPeriodEnd}
                onChange={(e) => setSelectedPeriodEnd(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculateDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => { setCalculateDialogOpen(false); fetchDashboardData(); }} variant="outlined">
            View Only
          </Button>
          <Button onClick={handleCalculateKPIs} variant="contained" disabled={loading}>
            Calculate & Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* KPI Detail Dialog */}
      <Dialog open={detailDialogOpen} onClose={() => setDetailDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedKPI?.name} - Detailed Breakdown</DialogTitle>
        <DialogContent dividers>
          {selectedKPI && selectedKPI.data && (
            <Box>
              <Grid container spacing={2} mb={3}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">KPI Value</Typography>
                  <Typography variant="h4">
                    {selectedKPI.data.value !== undefined ? selectedKPI.data.value.toFixed(2) : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Sample Size</Typography>
                  <Typography variant="h4">{selectedKPI.data.sample_size || 'N/A'}</Typography>
                </Grid>
              </Grid>

              {selectedKPI.data.details && Array.isArray(selectedKPI.data.details) && selectedKPI.data.details.length > 0 && (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {Object.keys(selectedKPI.data.details[0] || {}).map((key) => (
                          <TableCell key={key}>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedKPI.data.details.slice(0, 10).map((row: any, index: number) => (
                        <TableRow key={index}>
                          {Object.values(row).map((value: any, i: number) => (
                            <TableCell key={i}>
                              {typeof value === 'number' ? value.toFixed(2) : value}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {selectedKPI.data.details && !Array.isArray(selectedKPI.data.details) && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>Breakdown:</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {Object.entries(selectedKPI.data.details).map(([key, value]: [string, any]) => (
                          <TableRow key={key}>
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {key.replace(/_/g, ' ').toUpperCase()}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              {typeof value === 'number' ? value.toFixed(2) : value}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {!selectedKPI.data.details && (
                <Typography color="text.secondary">No detailed data available</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}