// pages/aide/dashboard.tsx
import { FC } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { Container, Grid, Card, CardHeader, CardContent, Divider, Box, Typography, Avatar, Chip, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button, LinearProgress, Paper } from '@mui/material';
import Footer from '@/components/Footer';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Area } from 'recharts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SpeedIcon from '@mui/icons-material/Speed';

const COLORS = ['#5569ff', '#57ca22', '#ffc107', '#ff5630', '#9c27b0', '#00bcd4'];

// Mock Data
const kpiMetrics = {
  activeProjects: 42,
  completionRate: 87,
  avgResponseTime: 2.4,
  pendingApprovals: 15
};

const projectStageDistribution = [
  { name: 'Planning', value: 8 },
  { name: 'In Progress', value: 18 },
  { name: 'QA Review', value: 10 },
  { name: 'Pending Approval', value: 6 },
];

const weeklyProjectFlow = [
  { week: 'Week 1', started: 8, completed: 6, delayed: 1 },
  { week: 'Week 2', started: 10, completed: 8, delayed: 2 },
  { week: 'Week 3', started: 12, completed: 10, delayed: 1 },
  { week: 'Week 4', started: 9, completed: 11, delayed: 0 },
];

const documentComplianceByProject = [
  { project: 'Alpha', compliance: 95, missing: 2, total: 40 },
  { project: 'Beta', compliance: 88, missing: 5, total: 42 },
  { project: 'Gamma', compliance: 92, missing: 3, total: 38 },
  { project: 'Delta', compliance: 78, missing: 8, total: 36 },
  { project: 'Epsilon', compliance: 100, missing: 0, total: 45 },
  { project: 'Zeta', compliance: 85, missing: 6, total: 40 },
];

const workflowPerformance = [
  { stage: 'Document Upload', efficiency: 92 },
  { stage: 'Initial Review', efficiency: 88 },
  { stage: 'QI Inspection', efficiency: 75 },
  { stage: 'Engineering Review', efficiency: 82 },
  { stage: 'Final Approval', efficiency: 90 },
];

const monthlyTrends = [
  { month: 'Jan', projects: 35, compliance: 85, sla: 88 },
  { month: 'Feb', projects: 38, compliance: 87, sla: 90 },
  { month: 'Mar', projects: 42, compliance: 89, sla: 92 },
  { month: 'Apr', projects: 40, compliance: 88, sla: 91 },
  { month: 'May', projects: 45, compliance: 91, sla: 93 },
  { month: 'Jun', projects: 48, compliance: 92, sla: 94 },
];

const upcomingTasks = [
  { id: 1, task: 'Review Project Alpha COC', assignee: 'John Doe', dueDate: '2025-12-03', priority: 'High' },
  { id: 2, task: 'Coordinate QI inspection - Beta', assignee: 'Jane Smith', dueDate: '2025-12-05', priority: 'Medium' },
  { id: 3, task: 'Send compliance reminders', assignee: 'Auto', dueDate: '2025-12-02', priority: 'High' },
  { id: 4, task: 'Update workflow documentation', assignee: 'Bob Wilson', dueDate: '2025-12-08', priority: 'Low' },
];

const agingProjects = [
  { project: 'Project Omega', stage: 'QI Review', daysOpen: 45, risk: 'High' },
  { project: 'Project Theta', stage: 'Document Pending', daysOpen: 32, risk: 'Medium' },
  { project: 'Project Iota', stage: 'Engineering Review', daysOpen: 28, risk: 'Medium' },
];

const teamWorkload = [
  { member: 'Team A', active: 12, pending: 4, completed: 8 },
  { member: 'Team B', active: 10, pending: 3, completed: 10 },
  { member: 'Team C', active: 15, pending: 6, completed: 7 },
  { member: 'Team D', active: 8, pending: 2, completed: 12 },
];

const notificationStats = {
  sentToday: 48,
  scheduled: 22,
  overdue: 8,
  responseRate: 76
};

function AideDashboard() {
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
    if (userRole !== 'admin') {
      // Redirect non-admin users to their appropriate dashboard
      router.push('/unauthorized'); // or router.push('/dashboard');
    }
  }, [router]);

  return (
    <>
      <Head><title>Engineering Aide Dashboard</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              🔧 Engineering Aide Dashboard
            </Typography>
            <Typography variant="subtitle2">
              Support & coordination center with real-time monitoring
            </Typography>
          </Grid>
        </Grid>
      </PageTitleWrapper>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* KPI Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h4" gutterBottom>{kpiMetrics.activeProjects}</Typography>
                    <Typography variant="body2" color="text.secondary">Active Projects</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#5569ff', width: 56, height: 56 }}>
                    <DashboardIcon />
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
                    <Typography variant="h4" gutterBottom>{kpiMetrics.completionRate}%</Typography>
                    <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#57ca22', width: 56, height: 56 }}>
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
                    <Typography variant="h4" gutterBottom>{kpiMetrics.avgResponseTime}h</Typography>
                    <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>
                    <SpeedIcon />
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
                    <Typography variant="h4" gutterBottom>{kpiMetrics.pendingApprovals}</Typography>
                    <Typography variant="body2" color="text.secondary">Pending Approvals</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ff5630', width: 56, height: 56 }}>
                    <AssessmentIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Stage Distribution */}
          <Grid item xs={12} md={5}>
            <Card>
              <CardHeader title="📊 Project Stage Distribution" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={projectStageDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStageDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Workflow Performance Radar */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardHeader title="🎯 Workflow Stage Efficiency" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={workflowPerformance}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="stage" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Efficiency %" dataKey="efficiency" stroke="#5569ff" fill="#5569ff" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Project Flow */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📈 Weekly Project Flow Analysis" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={weeklyProjectFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="started" fill="#5569ff" name="Started" />
                    <Bar dataKey="completed" fill="#57ca22" name="Completed" />
                    <Line type="monotone" dataKey="delayed" stroke="#ff5630" strokeWidth={2} name="Delayed" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Document Compliance by Project */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📋 Document Compliance by Project" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={documentComplianceByProject}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="compliance" fill="#5569ff" name="Compliance %" />
                    <Bar dataKey="missing" fill="#ff5630" name="Missing Docs" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Trends - Multi-metric */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📅 Monthly Performance Trends" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="projects" fill="#5569ff" stroke="#5569ff" name="Projects" />
                    <Line type="monotone" dataKey="compliance" stroke="#57ca22" strokeWidth={2} name="Compliance %" />
                    <Line type="monotone" dataKey="sla" stroke="#ffc107" strokeWidth={2} name="SLA %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Team Workload Distribution */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="👥 Team Workload Distribution" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamWorkload} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="member" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="active" fill="#5569ff" name="Active" />
                    <Bar dataKey="pending" fill="#ffc107" name="Pending" />
                    <Bar dataKey="completed" fill="#57ca22" name="Completed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Notification Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="🔔 Notification Statistics" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="primary">{notificationStats.sentToday}</Typography>
                      <Typography variant="body2" color="text.secondary">Sent Today</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="secondary">{notificationStats.scheduled}</Typography>
                      <Typography variant="body2" color="text.secondary">Scheduled</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="error">{notificationStats.overdue}</Typography>
                      <Typography variant="body2" color="text.secondary">Overdue</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', textAlign: 'center' }}>
                      <Typography variant="h3" color="success">{notificationStats.responseRate}%</Typography>
                      <Typography variant="body2" color="text.secondary">Response Rate</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Tasks Calendar */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="📅 Upcoming Tasks & Deadlines" 
                action={<Button size="small" startIcon={<CalendarMonthIcon />}>View Calendar</Button>}
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Priority</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingTasks.map((task) => (
                        <TableRow key={task.id} hover>
                          <TableCell>{task.task}</TableCell>
                          <TableCell>{task.assignee}</TableCell>
                          <TableCell>{task.dueDate}</TableCell>
                          <TableCell>
                            <Chip 
                              label={task.priority} 
                              size="small"
                              color={task.priority === 'High' ? 'error' : task.priority === 'Medium' ? 'warning' : 'default'}
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

          {/* Aging Projects Alert */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="⚠️ Aging Projects - Attention Required" />
              <Divider />
              <CardContent>
                {agingProjects.map((project, idx) => (
                  <Box key={idx} mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body1" fontWeight="bold">{project.project}</Typography>
                      <Chip 
                        label={`${project.daysOpen} days`} 
                        size="small"
                        color={project.risk === 'High' ? 'error' : 'warning'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Current Stage: {project.stage}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min((project.daysOpen / 60) * 100, 100)}
                      color={project.risk === 'High' ? 'error' : 'warning'}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                ))}
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
                      startIcon={<AccountTreeIcon />}
                      size="large"
                    >
                      View Workflow
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<NotificationsActiveIcon />}
                      size="large"
                      color="secondary"
                    >
                      Send Reminders
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<AssessmentIcon />}
                      size="large"
                      color="success"
                    >
                      Generate Report
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<CalendarMonthIcon />}
                      size="large"
                    >
                      Auto-Schedule
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

AideDashboard.getLayout = (page) => <SidebarLayout userRole="aide">{page}</SidebarLayout>;
export default AideDashboard;