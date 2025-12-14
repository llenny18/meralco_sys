// pages/qi/dashboard.tsx
import { FC, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { Container, Grid, Card, CardHeader, CardContent, Divider, Box, Typography, Avatar, Chip, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button, LinearProgress, Paper, Alert } from '@mui/material';
import Footer from '@/components/Footer';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, AreaChart, Area } from 'recharts';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SpeedIcon from '@mui/icons-material/Speed';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const COLORS = ['#5569ff', '#57ca22', '#ffc107', '#ff5630', '#9c27b0'];

// Mock Data
const dailyAuditStats = {
  targetAudits: 8,
  completedToday: 6,
  pendingToday: 2,
  performanceRate: 75
};

const monthlyPerformance = [
  { day: 1, target: 8, completed: 7, efficiency: 87 },
  { day: 2, target: 8, completed: 8, efficiency: 100 },
  { day: 3, target: 8, completed: 6, efficiency: 75 },
  { day: 4, target: 8, completed: 9, efficiency: 112 },
  { day: 5, target: 8, completed: 7, efficiency: 87 },
  { day: 6, target: 8, completed: 8, efficiency: 100 },
  { day: 7, target: 8, completed: 5, efficiency: 62 },
];

const inspectionTypeBreakdown = [
  { name: 'Initial Inspection', value: 45 },
  { name: 'Progress Check', value: 38 },
  { name: 'Final Audit', value: 28 },
  { name: 'Re-inspection', value: 12 },
];

const historicalPerformance = [
  { period: '30 Days', audits: 168, target: 240, rate: 70 },
  { period: '60 Days', audits: 342, target: 480, rate: 71 },
  { period: '90 Days', audits: 520, target: 720, rate: 72 },
];

const weeklyTrend = [
  { week: 'Week 1', completed: 38, target: 40, missed: 2 },
  { week: 'Week 2', completed: 42, target: 40, missed: 0 },
  { week: 'Week 3', completed: 35, target: 40, missed: 5 },
  { week: 'Week 4', completed: 41, target: 40, missed: 1 },
];

const inspectionResults = [
  { result: 'Passed', value: 78 },
  { result: 'Passed with Notes', value: 15 },
  { result: 'Failed', value: 7 },
];

const scheduledInspections = [
  { id: 1, project: 'Project Alpha', type: 'Final Audit', scheduledTime: '09:00 AM', location: 'Site A', status: 'Pending' },
  { id: 2, project: 'Project Beta', type: 'Progress Check', scheduledTime: '11:00 AM', location: 'Site B', status: 'In Progress' },
  { id: 3, project: 'Project Gamma', type: 'Initial Inspection', scheduledTime: '02:00 PM', location: 'Site C', status: 'Pending' },
  { id: 4, project: 'Project Delta', type: 'Re-inspection', scheduledTime: '04:00 PM', location: 'Site D', status: 'Pending' },
];

const missedTargetReasons = [
  { reason: 'Site Not Ready', count: 8 },
  { reason: 'Document Delays', count: 6 },
  { reason: 'Weather Issues', count: 4 },
  { reason: 'Sick Leave', count: 3 },
  { reason: 'Multiple Sites', count: 5 },
];

const performanceMetrics = {
  avgInspectionTime: 2.5,
  inspectionsThisMonth: 125,
  backlogItems: 18,
  completionRate: 88
};

const projectWorkload = [
  { project: 'Alpha', inspections: 8, completed: 7, pending: 1 },
  { project: 'Beta', inspections: 6, completed: 5, pending: 1 },
  { project: 'Gamma', inspections: 10, completed: 8, pending: 2 },
  { project: 'Delta', inspections: 5, completed: 5, pending: 0 },
  { project: 'Epsilon', inspections: 7, completed: 4, pending: 3 },
];

const dailyCapacityData = [
  { name: 'Capacity', value: dailyAuditStats.targetAudits, fill: '#5569ff' },
  { name: 'Completed', value: dailyAuditStats.completedToday, fill: '#57ca22' },
];

function QIDashboard() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');

    // If not authenticated or missing token, redirect to login
    if (!isAuthenticated || !authToken || isAuthenticated !== 'true') {
      router.push('/login');
      return;
    }

    // Optional: Check if user has admin role
    if (userRole !== 'quality-inspector') {
      // Redirect non-admin users to their appropriate dashboard
      router.push('/unauthorized'); // or router.push('/dashboard');
    }
  }, [router]);

  return (
    <>
      <Head><title>Quality Inspector Dashboard</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              🔍 Quality Inspector Dashboard
            </Typography>
            <Typography variant="subtitle2">
              Inspection management, audit tracking, and performance monitoring
            </Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Daily Performance Alert */}
          <Grid item xs={12}>
            <Alert 
              severity={dailyAuditStats.performanceRate >= 100 ? 'success' : dailyAuditStats.performanceRate >= 75 ? 'info' : 'warning'}
              icon={<SpeedIcon />}
            >
              <Typography variant="body1" fontWeight="bold">
                Today's Performance: {dailyAuditStats.completedToday}/{dailyAuditStats.targetAudits} audits completed ({dailyAuditStats.performanceRate}%)
              </Typography>
              <Typography variant="body2">
                {dailyAuditStats.pendingToday} inspections remaining for today's target
              </Typography>
            </Alert>
          </Grid>

          {/* KPI Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" gutterBottom>{dailyAuditStats.targetAudits}</Typography>
                    <Typography variant="body2" color="text.secondary">Daily Target</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#5569ff', width: 56, height: 56 }}>
                    <AssignmentIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" gutterBottom>{dailyAuditStats.completedToday}</Typography>
                    <Typography variant="body2" color="text.secondary">Completed Today</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#57ca22', width: 56, height: 56 }}>
                    <CheckCircleOutlineIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" gutterBottom>{performanceMetrics.inspectionsThisMonth}</Typography>
                    <Typography variant="body2" color="text.secondary">This Month</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>
                    <TrendingUpIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" gutterBottom>{performanceMetrics.backlogItems}</Typography>
                    <Typography variant="body2" color="text.secondary">Backlog Items</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ff5630', width: 56, height: 56 }}>
                    <ErrorOutlineIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Daily Capacity Gauge */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="🎯 Daily Audit Capacity vs. Actual" />
              <Divider />
              <CardContent>
                <Box textAlign="center" py={2}>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadialBarChart 
                      cx="50%" 
                      cy="50%" 
                      innerRadius="30%" 
                      outerRadius="90%" 
                      data={dailyCapacityData}
                      startAngle={180}
                      endAngle={0}
                    >
                      <RadialBar dataKey="value" />
                      <Legend />
                      <Tooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <Typography variant="h3" color="primary" mt={2}>
                    {dailyAuditStats.performanceRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Performance Rate
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Inspection Type Breakdown */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📊 Inspection Type Distribution" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={inspectionTypeBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {inspectionTypeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* 7-Day Performance Trend */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📈 7-Day Performance Trend" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" label={{ value: 'Day', position: 'insideBottom', offset: -5 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="target" stackId="1" stroke="#ffc107" fill="#ffc107" name="Target" />
                    <Area type="monotone" dataKey="completed" stackId="2" stroke="#57ca22" fill="#57ca22" name="Completed" />
                    <Line type="monotone" dataKey="efficiency" stroke="#5569ff" strokeWidth={2} name="Efficiency %" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Performance Comparison */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📅 Weekly Performance Comparison" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#57ca22" name="Completed" />
                    <Bar dataKey="target" fill="#5569ff" name="Target" />
                    <Bar dataKey="missed" fill="#ff5630" name="Missed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Inspection Results Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="✅ Inspection Results Distribution" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inspectionResults} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="result" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#5569ff" name="Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Historical Performance (30/60/90 Days) */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📊 Historical Performance Analysis" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  {historicalPerformance.map((period, idx) => (
                    <Grid item xs={12} md={4} key={idx}>
                      <Paper elevation={2} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>{period.period}</Typography>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="body2" color="text.secondary">Audits Completed:</Typography>
                          <Typography variant="body1" fontWeight="bold">{period.audits}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Typography variant="body2" color="text.secondary">Target:</Typography>
                          <Typography variant="body1" fontWeight="bold">{period.target}</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={period.rate} 
                          sx={{ height: 10, borderRadius: 5, mb: 1 }}
                          color={period.rate >= 90 ? 'success' : period.rate >= 70 ? 'warning' : 'error'}
                        />
                        <Typography variant="h5" color={period.rate >= 90 ? 'success.main' : period.rate >= 70 ? 'warning.main' : 'error.main'} textAlign="center">
                          {period.rate}%
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Missed Target Reasons */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📋 Reasons for Missed Targets" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={missedTargetReasons} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="reason" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ff5630" name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Workload */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📁 Project-wise Inspection Workload" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectWorkload}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#57ca22" name="Completed" />
                    <Bar dataKey="pending" stackId="a" fill="#ffc107" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Today's Scheduled Inspections */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="📅 Today's Scheduled Inspections" 
                action={<Button size="small" startIcon={<CalendarTodayIcon />}>View Full Schedule</Button>}
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {scheduledInspections.map((inspection) => (
                        <TableRow key={inspection.id} hover>
                          <TableCell>{inspection.project}</TableCell>
                          <TableCell>{inspection.type}</TableCell>
                          <TableCell>{inspection.scheduledTime}</TableCell>
                          <TableCell>{inspection.location}</TableCell>
                          <TableCell>
                            <Chip 
                              label={inspection.status} 
                              size="small"
                              color={inspection.status === 'In Progress' ? 'primary' : 'default'}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Metrics Summary */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📊 Performance Metrics Summary" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="primary">{performanceMetrics.avgInspectionTime}h</Typography>
                      <Typography variant="body2" color="text.secondary">Avg Inspection Time</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="success">{performanceMetrics.inspectionsThisMonth}</Typography>
                      <Typography variant="body2" color="text.secondary">Inspections This Month</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="warning">{performanceMetrics.backlogItems}</Typography>
                      <Typography variant="body2" color="text.secondary">Backlog Items</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="secondary">{performanceMetrics.completionRate}%</Typography>
                      <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="⚡ Quick Actions" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<AssignmentIcon />}
                      size="large"
                    >
                      Start Inspection
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<CalendarTodayIcon />}
                      size="large"
                      color="secondary"
                    >
                      View Schedule
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<VerifiedUserIcon />}
                      size="large"
                      color="success"
                    >
                      Log Performance
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      size="large"
                    >
                      Report Issue
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
      <Footer />
    </>
  );
}

QIDashboard.getLayout = (page) => <SidebarLayout userRole="qi">{page}</SidebarLayout>;
export default QIDashboard;