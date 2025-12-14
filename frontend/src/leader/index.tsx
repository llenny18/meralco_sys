// pages/vendor/dashboard.tsx
import { FC, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { Container, Grid, Card, CardHeader, CardContent, Divider, Box, Typography, Avatar, LinearProgress, Chip, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button, Alert } from '@mui/material';
import Footer from '@/components/Footer';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const COLORS = ['#5569ff', '#57ca22', '#ffc107', '#ff5630'];

// Mock Data
const projectStats = {
  total: 24,
  completed: 18,
  inProgress: 4,
  overdue: 2
};

const complianceData = [
  { name: 'Project A', compliance: 95 },
  { name: 'Project B', compliance: 88 },
  { name: 'Project C', compliance: 72 },
  { name: 'Project D', compliance: 100 },
  { name: 'Project E', compliance: 65 },
];

const documentStatus = [
  { name: 'Submitted', value: 18 },
  { name: 'Pending', value: 4 },
  { name: 'Rejected', value: 2 },
];

const monthlySubmissions = [
  { month: 'Jan', submitted: 12, approved: 10 },
  { month: 'Feb', submitted: 15, approved: 13 },
  { month: 'Mar', submitted: 18, approved: 16 },
  { month: 'Apr', submitted: 14, approved: 12 },
  { month: 'May', submitted: 20, approved: 18 },
  { month: 'Jun', submitted: 22, approved: 20 },
];

const billingData = {
  totalPaid: 2850000,
  outstanding: 450000,
  pending: 180000
};

const pendingTasks = [
  { id: 1, project: 'Project Alpha', task: 'Submit COC', dueDate: '2025-12-05', priority: 'High' },
  { id: 2, project: 'Project Beta', task: 'Upload Test Results', dueDate: '2025-12-08', priority: 'Medium' },
  { id: 3, project: 'Project Gamma', task: 'Submit Final Report', dueDate: '2025-12-10', priority: 'Low' },
  { id: 4, project: 'Project Delta', task: 'Upload Inspection Photos', dueDate: '2025-12-03', priority: 'High' },
];

const recentNotifications = [
  { id: 1, message: 'COC for Project Alpha is due in 3 days', type: 'warning', date: '2025-12-01' },
  { id: 2, message: 'Payment of ₱450,000 has been processed', type: 'success', date: '2025-11-30' },
  { id: 3, message: 'Document rejected for Project Echo - resubmit', type: 'error', date: '2025-11-29' },
  { id: 4, message: 'New task assigned: Project Zeta inspection', type: 'info', date: '2025-11-28' },
];

function VendorDashboard() {
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
    if (userRole !== 'team-leader') {
      // Redirect non-admin users to their appropriate dashboard
      router.push('/unauthorized'); // or router.push('/dashboard');
    }
  }, [router]);

  const overallCompliance = Math.round(
    complianceData.reduce((acc, curr) => acc + curr.compliance, 0) / complianceData.length
  );

  return (
    <>
      <Head><title>Vendor Dashboard - Engineering Aide</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              🏢 Vendor Representative Dashboard
            </Typography>
            <Typography variant="subtitle2">
              Monitor your projects, compliance, and billing status
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
                    <Typography variant="h4" gutterBottom>{projectStats.total}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Projects</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#5569ff', width: 56, height: 56 }}>
                    <AssignmentTurnedInIcon />
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
                    <Typography variant="h4" gutterBottom>{projectStats.completed}</Typography>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#57ca22', width: 56, height: 56 }}>
                    <CheckCircleIcon />
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
                    <Typography variant="h4" gutterBottom>{projectStats.inProgress}</Typography>
                    <Typography variant="body2" color="text.secondary">In Progress</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>
                    <PendingActionsIcon />
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
                    <Typography variant="h4" gutterBottom>{projectStats.overdue}</Typography>
                    <Typography variant="body2" color="text.secondary">Overdue</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ff5630', width: 56, height: 56 }}>
                    <WarningIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Overall Compliance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📊 Overall Compliance Score" />
              <Divider />
              <CardContent>
                <Box textAlign="center" py={3}>
                  <Typography variant="h1" color={overallCompliance >= 90 ? 'success.main' : overallCompliance >= 70 ? 'warning.main' : 'error.main'}>
                    {overallCompliance}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Average Compliance Across All Projects
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={overallCompliance} 
                    sx={{ mt: 3, height: 10, borderRadius: 5 }}
                    color={overallCompliance >= 90 ? 'success' : overallCompliance >= 70 ? 'warning' : 'error'}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Document Status Pie Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📄 Document Status Distribution" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={documentStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Compliance Bar Chart */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📈 Project Compliance Scores" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={complianceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="compliance" fill="#5569ff" name="Compliance %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Submission Trends */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📅 Monthly Document Submission Trends" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlySubmissions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="submitted" stroke="#5569ff" strokeWidth={2} name="Submitted" />
                    <Line type="monotone" dataKey="approved" stroke="#57ca22" strokeWidth={2} name="Approved" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Billing Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="💰 Total Paid" />
              <Divider />
              <CardContent>
                <Box textAlign="center" py={2}>
                  <Avatar sx={{ bgcolor: '#57ca22', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
                    <AccountBalanceWalletIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h4" color="success.main">
                    ₱{billingData.totalPaid.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Year to Date
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="⏳ Outstanding Balance" />
              <Divider />
              <CardContent>
                <Box textAlign="center" py={2}>
                  <Avatar sx={{ bgcolor: '#ffc107', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
                    <AccountBalanceWalletIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h4" color="warning.main">
                    ₱{billingData.outstanding.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Pending Payment
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="📋 Pending Invoices" />
              <Divider />
              <CardContent>
                <Box textAlign="center" py={2}>
                  <Avatar sx={{ bgcolor: '#ff5630', width: 64, height: 64, margin: '0 auto', mb: 2 }}>
                    <AccountBalanceWalletIcon fontSize="large" />
                  </Avatar>
                  <Typography variant="h4" color="error.main">
                    ₱{billingData.pending.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Unpaid Invoices
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Tasks */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="✅ Pending Tasks" 
                action={<Button size="small" variant="contained">View All</Button>}
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project</TableCell>
                        <TableCell>Task</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Priority</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingTasks.map((task) => (
                        <TableRow key={task.id} hover>
                          <TableCell>{task.project}</TableCell>
                          <TableCell>{task.task}</TableCell>
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

          {/* Recent Notifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="🔔 Recent Notifications" 
                action={<Button size="small" variant="outlined">Mark All Read</Button>}
              />
              <Divider />
              <CardContent>
                {recentNotifications.map((notif) => (
                  <Alert 
                    key={notif.id} 
                    severity={notif.type as any}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="body2">{notif.message}</Typography>
                    <Typography variant="caption" color="text.secondary">{notif.date}</Typography>
                  </Alert>
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
                      startIcon={<UploadFileIcon />}
                      size="large"
                    >
                      Upload COC
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<AssignmentTurnedInIcon />}
                      size="large"
                      color="secondary"
                    >
                      View Projects
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<AccountBalanceWalletIcon />}
                      size="large"
                      color="success"
                    >
                      Check Billing
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      size="large"
                    >
                      Submit Feedback
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

VendorDashboard.getLayout = (page) => <SidebarLayout userRole="vendor">{page}</SidebarLayout>;
export default VendorDashboard;