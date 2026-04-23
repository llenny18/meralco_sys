import { useState, useEffect } from 'react';
import Head from 'next/head';
import SidebarLayout from '@/layouts/SidebarLayout';
import { useRouter } from 'next/router';

import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  AccessTime,
  Business,
  Assignment,
  AttachMoney,
  Gavel,
  Description,
  Error as ErrorIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface DashboardStats {
  total_projects: number;
  active_projects: number;
  delayed_projects: number;
  completed_projects: number;
  total_vendors: number;
  active_vendors: number;
  blacklisted_vendors: number;
  pending_inspections: number;
  overdue_documents: number;
  sla_breaches: number;
  total_penalties: number;
  pending_invoices: number;
}

// Helper: safely extract an array from various API response shapes
function toArray(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.data)) return data.data;
  return [];
}

function AdminDashboard() {
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      router.push('/login');
      return;
    }
    if (userRole !== 'admin') {
      router.push('/unauthorized');
    }
  }, [router]);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [projectStatus, setProjectStatus] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [delayAnalysis, setDelayAnalysis] = useState<any[]>([]);
  const [vendorPerformance, setVendorPerformance] = useState<any[]>([]);
  const [priorityDist, setPriorityDist] = useState<any[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<any[]>([]);
  const [financialOverview, setFinancialOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        statsRes,
        statusRes,
        trendsRes,
        delayRes,
        vendorRes,
        priorityRes,
        deadlinesRes,
        financialRes
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats/`),
        fetch(`${API_BASE_URL}/dashboard/project_status_summary/`),
        fetch(`${API_BASE_URL}/dashboard/monthly_trends/`),
        fetch(`${API_BASE_URL}/dashboard/delay_analysis/`),
        fetch(`${API_BASE_URL}/dashboard/vendor_performance/?limit=5`),
        fetch(`${API_BASE_URL}/dashboard/project_priority_distribution/`),
        fetch(`${API_BASE_URL}/dashboard/upcoming_deadlines/`),
        fetch(`${API_BASE_URL}/dashboard/financial_overview/`)
      ]);

      const [
        statsData,
        statusData,
        trendsData,
        delayData,
        vendorData,
        priorityData,
        deadlinesData,
        financialData
      ] = await Promise.all([
        statsRes.json(),
        statusRes.json(),
        trendsRes.json(),
        delayRes.json(),
        vendorRes.json(),
        priorityRes.json(),
        deadlinesRes.json(),
        financialRes.json()
      ]);

      // Stats is expected to be a plain object
      setStats(statsData && !Array.isArray(statsData) ? statsData : null);

      // All list endpoints: safely coerce to array
      setProjectStatus(toArray(statusData));
      setMonthlyTrends(toArray(trendsData));
      setDelayAnalysis(toArray(delayData));
      setVendorPerformance(toArray(vendorData));
      setPriorityDist(toArray(priorityData));
      setUpcomingDeadlines(toArray(deadlinesData));

      // Financial overview is an object
      setFinancialOverview(
        financialData && !Array.isArray(financialData) ? financialData : null
      );
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary" mt={1}>
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box display="flex" alignItems="center" mt={1}>
                {trend > 0 ? (
                  <TrendingUp fontSize="small" sx={{ color: 'success.main', mr: 0.5 }} />
                ) : (
                  <TrendingDown fontSize="small" sx={{ color: 'error.main', mr: 0.5 }} />
                )}
                <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                  {Math.abs(trend)}% vs last month
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <>
        <Head><title>Dashboard - Loading...</title></Head>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress size={60} />
        </Box>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head><title>Dashboard - Error</title></Head>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Alert severity="error">Error loading dashboard: {error}</Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - System Administration</title>
      </Head>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          📊 Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom mb={3}>
          Real-time system overview and analytics
        </Typography>

        {/* Key Metrics Cards */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Projects"
              value={stats?.total_projects ?? 0}
              subtitle={`${stats?.active_projects ?? 0} active`}
              icon={<Assignment />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Vendors"
              value={stats?.active_vendors ?? 0}
              subtitle={`${stats?.total_vendors ?? 0} total`}
              icon={<Business />}
              color="#2e7d32"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Delayed Projects"
              value={stats?.delayed_projects ?? 0}
              subtitle="Require attention"
              icon={<Warning />}
              color="#ed6c02"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="SLA Breaches"
              value={stats?.sla_breaches ?? 0}
              subtitle="Active violations"
              icon={<ErrorIcon />}
              color="#d32f2f"
            />
          </Grid>
        </Grid>

        {/* Financial Overview */}
        {financialOverview && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Contract Value"
                value={`₱${((financialOverview.total_contract_value ?? 0) / 1_000_000).toFixed(2)}M`}
                subtitle="All projects"
                icon={<AttachMoney />}
                color="#9c27b0"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Penalties"
                value={`₱${((stats?.total_penalties ?? 0) / 1000).toFixed(0)}K`}
                subtitle="Issued penalties"
                icon={<Gavel />}
                color="#f44336"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Paid"
                value={`₱${((financialOverview.total_paid ?? 0) / 1_000_000).toFixed(2)}M`}
                subtitle="Completed payments"
                icon={<CheckCircle />}
                color="#4caf50"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Outstanding"
                value={`₱${((financialOverview.outstanding_payments ?? 0) / 1_000_000).toFixed(2)}M`}
                subtitle={`${stats?.pending_invoices ?? 0} invoices`}
                icon={<Description />}
                color="#ff9800"
              />
            </Grid>
          </Grid>
        )}

        {/* Charts Row 1 */}
        <Grid container spacing={3} mb={3}>
          {/* Project Status Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Project Status Distribution" />
              <CardContent>
                {projectStatus.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">No data available</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={projectStatus}
                        dataKey="project_count"
                        nameKey="status_name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={(entry) => `${entry.status_name}: ${entry.project_count}`}
                      >
                        {projectStatus.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Priority Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Project Priority Distribution" />
              <CardContent>
                {priorityDist.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">No data available</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityDist}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="priority" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 2 - Monthly Trends */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Monthly Project Trends" />
              <CardContent>
                {monthlyTrends.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">No data available</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                        }
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                        }
                      />
                      <Legend />
                      <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Projects" strokeWidth={2} />
                      <Line type="monotone" dataKey="completed" stroke="#82ca9d" name="Completed" strokeWidth={2} />
                      <Line type="monotone" dataKey="delayed" stroke="#ff7300" name="Delayed" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 3 */}
        <Grid container spacing={3} mb={3}>
          {/* Delay Analysis */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top Delay Factors" />
              <CardContent>
                {delayAnalysis.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">No delay data available</Typography>
                  </Box>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={delayAnalysis} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="factor__factor_name"
                        width={150}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="occurrence_count" fill="#ff7300" name="Occurrences" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Vendor Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Top 5 Vendor Performance" />
              <CardContent>
                {vendorPerformance.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <Typography color="textSecondary">No vendor data available</Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Vendor</strong></TableCell>
                          <TableCell align="center"><strong>Score</strong></TableCell>
                          <TableCell align="center"><strong>Projects</strong></TableCell>
                          <TableCell align="center"><strong>On-Time %</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vendorPerformance.map((vendor, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {vendor.vendor_name}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {vendor.vendor_code}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={vendor.compliance_score}
                                color={
                                  vendor.compliance_score >= 80
                                    ? 'success'
                                    : vendor.compliance_score >= 60
                                    ? 'warning'
                                    : 'error'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">{vendor.total_projects}</TableCell>
                            <TableCell align="center">
                              <Box>
                                <Typography variant="body2">{vendor.on_time_percentage}%</Typography>
                                <LinearProgress
                                  variant="determinate"
                                  value={vendor.on_time_percentage}
                                  sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
                                  color={
                                    vendor.on_time_percentage >= 80
                                      ? 'success'
                                      : vendor.on_time_percentage >= 60
                                      ? 'warning'
                                      : 'error'
                                  }
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Upcoming Deadlines */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardHeader
                title="Upcoming Deadlines (Next 7 Days)"
                avatar={<AccessTime color="warning" />}
              />
              <CardContent>
                {upcomingDeadlines.length === 0 ? (
                  <Box textAlign="center" py={4}>
                    <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" color="textSecondary">
                      No upcoming deadlines
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Project</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Due Date</strong></TableCell>
                          <TableCell align="center"><strong>Days Left</strong></TableCell>
                          <TableCell align="center"><strong>Priority</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {upcomingDeadlines.map((deadline, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {deadline.project_code}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                {deadline.project_name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip label={deadline.deadline_type} size="small" variant="outlined" />
                            </TableCell>
                            <TableCell>
                              {new Date(deadline.due_date).toLocaleDateString()}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${deadline.days_remaining} days`}
                                color={
                                  deadline.days_remaining <= 2
                                    ? 'error'
                                    : deadline.days_remaining <= 5
                                    ? 'warning'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={deadline.priority}
                                color={
                                  deadline.priority === 'Critical'
                                    ? 'error'
                                    : deadline.priority === 'High'
                                    ? 'warning'
                                    : deadline.priority === 'Medium'
                                    ? 'info'
                                    : 'default'
                                }
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

AdminDashboard.getLayout = (page: any) => <SidebarLayout>{page}</SidebarLayout>;
export default AdminDashboard;