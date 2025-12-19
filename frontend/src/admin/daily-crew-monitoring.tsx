// pages/admin/daily-crew-monitoring.tsx
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
  Paper,
  Tab,
  Tabs
} from '@mui/material';
import Footer from '@/components/Footer';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone';
import UploadTwoToneIcon from '@mui/icons-material/UploadTwoTone';
import RefreshTwoToneIcon from '@mui/icons-material/RefreshTwoTone';
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
  ArcElement
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface CrewType {
  id: string;
  crew_code: string;
  crew_name: string;
  weight_a: number;
  weight_b: number;
  weight_c: number;
  weight_d: number;
  conversion_factor: number;
  working_hours_per_day: number;
  working_days_per_month: number;
  is_active: boolean;
}

interface DailyCrewRecord {
  id: string;
  crew_type: string;
  monitoring_date: string;
  value_a: number;
  value_b: number;
  value_c: number;
  value_d: number;
  daily_rate: number;
  weighted_productivity: number;
  monthly_peso_value: number;
  weekly_peso_value: number;
  daily_peso_value: number;
  notes: string;
}

interface MonthlySummary {
  crew_code: string;
  crew_name: string;
  total_productivity: number;
  total_peso_value: number;
  average_daily_productivity: number;
  days_recorded: number;
}

function DailyCrewMonitoring() {
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
  const [tabValue, setTabValue] = useState(0);
  const [tableData, setTableData] = useState<DailyCrewRecord[]>([]);
  const [crewTypes, setCrewTypes] = useState<CrewType[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [currentRecord, setCurrentRecord] = useState<any>({});
  const [formData, setFormData] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  // Fetch data on mount and when month changes
  useEffect(() => {
    fetchCrewTypes();
    fetchTableData();
    fetchMonthlySummary();
  }, [selectedMonth]);

  const fetchCrewTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/crew-types/`);
      if (!response.ok) throw new Error('Failed to fetch crew types');
      const data = await response.json();
      setCrewTypes(Array.isArray(data) ? data : data.results || []);
    } catch (err: any) {
      console.error('Error fetching crew types:', err);
    }
  };

  const fetchTableData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_BASE_URL}/daily-crew-monitoring/?monitoring_date=${selectedMonth}`
      );
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

  const fetchMonthlySummary = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/daily-crew-monitoring/monthly_summary/?month=${selectedMonth}-01`
      );
      if (!response.ok) throw new Error('Failed to fetch summary');
      const data = await response.json();
      setMonthlySummary(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching monthly summary:', err);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAdd = () => {
    setModalMode('add');
    setFormData({
      monitoring_date: new Date().toISOString().split('T')[0],
      value_a: 0,
      value_b: 0,
      value_c: 0,
      value_d: 0,
      daily_rate: 0
    });
    setCurrentRecord({});
    setShowModal(true);
  };

  const handleEdit = (row: any) => {
    setModalMode('edit');
    setCurrentRecord(row);
    setFormData({ ...row });
    setShowModal(true);
  };

  const handleDelete = async (row: any) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/daily-crew-monitoring/${row.id}/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to delete');
      showSuccess('Record deleted successfully!');
      fetchTableData();
      fetchMonthlySummary();
    } catch (err: any) {
      setError('Error deleting record: ' + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const url =
        modalMode === 'add'
          ? `${API_BASE_URL}/daily-crew-monitoring/`
          : `${API_BASE_URL}/daily-crew-monitoring/${currentRecord.id}/`;
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(JSON.stringify(errorData) || 'Failed to save');
      }
      showSuccess(`Record ${modalMode === 'add' ? 'added' : 'updated'} successfully!`);
      setShowModal(false);
      fetchTableData();
      fetchMonthlySummary();
    } catch (err: any) {
      setError('Error saving record: ' + err.message);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate chart data
  const getProductivityChartData = () => {
    const labels = monthlySummary.map((item) => item.crew_code);
    const data = monthlySummary.map((item) => item.total_productivity);

    return {
      labels,
      datasets: [
        {
          label: 'Total Productivity',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const getPesoValueChartData = () => {
    const labels = monthlySummary.map((item) => item.crew_code);
    const data = monthlySummary.map((item) => item.total_peso_value);

    return {
      labels,
      datasets: [
        {
          label: 'Total Peso Value',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };
  };

  const getCrewDistributionData = () => {
    const labels = monthlySummary.map((item) => item.crew_code);
    const data = monthlySummary.map((item) => item.days_recorded);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ]
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  const paginatedData = tableData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Head>
        <title>Daily Crew Monitoring - Dashboard</title>
      </Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              👷 Daily Crew Monitoring
            </Typography>
            <Typography variant="subtitle2">
              Track daily crew productivity and performance metrics
            </Typography>
          </Grid>
          <Grid item>
            <TextField
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              size="small"
              sx={{ mr: 2 }}
            />
            <Button
              variant="outlined"
              startIcon={<RefreshTwoToneIcon />}
              onClick={() => {
                fetchTableData();
                fetchMonthlySummary();
              }}
              sx={{ mr: 1 }}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<UploadTwoToneIcon />}
              sx={{ mr: 1 }}
            >
              Import Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadTwoToneIcon />}
              sx={{ mr: 1 }}
            >
              Export Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddTwoToneIcon />}
              onClick={handleAdd}
            >
              Add Entry
            </Button>
          </Grid>
        </Grid>
      </PageTitleWrapper>

      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Records
                </Typography>
                <Typography variant="h4">{tableData.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Crews
                </Typography>
                <Typography variant="h4">{monthlySummary.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Avg Productivity
                </Typography>
                <Typography variant="h4">
                  {monthlySummary.length > 0
                    ? (
                        monthlySummary.reduce((sum, item) => sum + item.average_daily_productivity, 0) /
                        monthlySummary.length
                      ).toFixed(2)
                    : '0'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Peso Value
                </Typography>
                <Typography variant="h4">
                  ₱
                  {monthlySummary
                    .reduce((sum, item) => sum + item.total_peso_value, 0)
                    .toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Tabs */}
          <Grid item xs={12}>
            <Card>
              <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                <Tab label="📊 Dashboard" />
                <Tab label="📋 Daily Records" />
                <Tab label="📈 Monthly Summary" />
              </Tabs>
              <Divider />

              {/* Dashboard Tab */}
              {tabValue === 0 && (
                <CardContent>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                          Productivity by Crew
                        </Typography>
                        <Box sx={{ height: 250 }}>
                          <Bar data={getProductivityChartData()} options={chartOptions} />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                          Peso Value by Crew
                        </Typography>
                        <Box sx={{ height: 250 }}>
                          <Bar data={getPesoValueChartData()} options={chartOptions} />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                          Days Recorded Distribution
                        </Typography>
                        <Box sx={{ height: 250 }}>
                          <Pie data={getCrewDistributionData()} />
                        </Box>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Paper sx={{ p: 2, height: 300 }}>
                        <Typography variant="h6" gutterBottom>
                          Average Daily Productivity
                        </Typography>
                        <Box sx={{ height: 250 }}>
                          <Line
                            data={{
                              labels: monthlySummary.map((item) => item.crew_code),
                              datasets: [
                                {
                                  label: 'Avg Daily Productivity',
                                  data: monthlySummary.map((item) => item.average_daily_productivity),
                                  borderColor: 'rgba(255, 99, 132, 1)',
                                  backgroundColor: 'rgba(255, 99, 132, 0.2)',
                                  tension: 0.4
                                }
                              ]
                            }}
                            options={chartOptions}
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              )}

              {/* Daily Records Tab */}
              {tabValue === 1 && (
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

                  {loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="body1" color="text.secondary">
                        Loading data...
                      </Typography>
                    </Box>
                  )}

                  {!loading && tableData.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h4" color="text.secondary" gutterBottom>
                        📭
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        No records for selected month
                      </Typography>
                    </Box>
                  )}

                  {!loading && tableData.length > 0 && (
                    <>
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Crew</TableCell>
                              <TableCell align="center">A</TableCell>
                              <TableCell align="center">B</TableCell>
                              <TableCell align="center">C</TableCell>
                              <TableCell align="center">D</TableCell>
                              <TableCell align="right">Weighted Prod.</TableCell>
                              <TableCell align="right">Daily Rate</TableCell>
                              <TableCell align="right">Daily ₱ Value</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paginatedData.map((row) => (
                              <TableRow hover key={row.id}>
                                <TableCell>{row.monitoring_date}</TableCell>
                                <TableCell>
                                  {crewTypes.find((ct) => ct.id === row.crew_type)?.crew_code || row.crew_type}
                                </TableCell>
                                <TableCell align="center">{row.value_a}</TableCell>
                                <TableCell align="center">{row.value_b}</TableCell>
                                <TableCell align="center">{row.value_c}</TableCell>
                                <TableCell align="center">{row.value_d}</TableCell>
                                <TableCell align="right">{row.weighted_productivity?.toFixed(2)}</TableCell>
                                <TableCell align="right">₱{row.daily_rate?.toFixed(2)}</TableCell>
                                <TableCell align="right">₱{row.daily_peso_value?.toFixed(2)}</TableCell>
                                <TableCell align="center">
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
                      <TablePagination
                        component="div"
                        count={tableData.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                      />
                    </>
                  )}
                </CardContent>
              )}

              {/* Monthly Summary Tab */}
              {tabValue === 2 && (
                <CardContent>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Crew Code</TableCell>
                          <TableCell>Crew Name</TableCell>
                          <TableCell align="right">Total Productivity</TableCell>
                          <TableCell align="right">Total Peso Value</TableCell>
                          <TableCell align="right">Avg Daily Prod.</TableCell>
                          <TableCell align="center">Days Recorded</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {monthlySummary.map((row, index) => (
                          <TableRow key={index}>
                            <TableCell>{row.crew_code}</TableCell>
                            <TableCell>{row.crew_name}</TableCell>
                            <TableCell align="right">{row.total_productivity?.toFixed(2)}</TableCell>
                            <TableCell align="right">₱{row.total_peso_value?.toLocaleString()}</TableCell>
                            <TableCell align="right">{row.average_daily_productivity?.toFixed(2)}</TableCell>
                            <TableCell align="center">
                              <Chip label={row.days_recorded} color="primary" size="small" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Footer />

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {modalMode === 'add' ? '➕ Add Daily Record' : '✏️ Edit Daily Record'}
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Crew Type</InputLabel>
                  <Select
                    value={formData.crew_type || ''}
                    onChange={(e) => handleInputChange('crew_type', e.target.value)}
                    label="Crew Type"
                  >
                    {crewTypes.map((crew) => (
                      <MenuItem key={crew.id} value={crew.id}>
                        {crew.crew_code} - {crew.crew_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Monitoring Date"
                  value={formData.monitoring_date || ''}
                  onChange={(e) => handleInputChange('monitoring_date', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Value A"
                  value={formData.value_a || 0}
                  onChange={(e) => handleInputChange('value_a', parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Value B"
                  value={formData.value_b || 0}
                  onChange={(e) => handleInputChange('value_b', parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Value C"
                  value={formData.value_c || 0}
                  onChange={(e) => handleInputChange('value_c', parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={6} sm={3}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Value D"
                  value={formData.value_d || 0}
                  onChange={(e) => handleInputChange('value_d', parseFloat(e.target.value) || 0)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Daily Rate (₱)"
                  value={formData.daily_rate || 0}
                  onChange={(e) => handleInputChange('daily_rate', parseFloat(e.target.value) || 0)}
                  inputProps={{ step: '0.01' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Notes"
                  value={formData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes or remarks..."
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowModal(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {modalMode === 'add' ? 'Add Record' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

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

DailyCrewMonitoring.getLayout = (page) => <SidebarLayout userRole="admin">{page}</SidebarLayout>;
export default DailyCrewMonitoring;