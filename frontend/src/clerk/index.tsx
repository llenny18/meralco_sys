// pages/clerk/dashboard.tsx
import { FC, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import { Container, Grid, Card, CardHeader, CardContent, Divider, Box, Typography, Avatar, Chip, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, Button, Badge, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import Footer from '@/components/Footer';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EmailIcon from '@mui/icons-material/Email';
import EventIcon from '@mui/icons-material/Event';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const COLORS = ['#5569ff', '#57ca22', '#ffc107', '#ff5630'];

// Mock Data
const documentStats = {
  uploaded: 156,
  pending: 23,
  missing: 8,
  completed: 145
};

const weeklyUploadTrend = [
  { day: 'Mon', uploads: 18, emails: 12 },
  { day: 'Tue', uploads: 24, emails: 15 },
  { day: 'Wed', uploads: 32, emails: 18 },
  { day: 'Thu', uploads: 28, emails: 14 },
  { day: 'Fri', uploads: 35, emails: 20 },
  { day: 'Sat', uploads: 15, emails: 8 },
  { day: 'Sun', uploads: 10, emails: 5 },
];

const documentTypeDistribution = [
  { name: 'COC', value: 45 },
  { name: 'Test Reports', value: 32 },
  { name: 'Inspection Photos', value: 28 },
  { name: 'Compliance Docs', value: 51 },
];

const projectDocumentStatus = [
  { project: 'Project A', uploaded: 45, total: 50, percentage: 90 },
  { project: 'Project B', uploaded: 38, total: 45, percentage: 84 },
  { project: 'Project C', uploaded: 42, total: 48, percentage: 88 },
  { project: 'Project D', uploaded: 50, total: 50, percentage: 100 },
  { project: 'Project E', uploaded: 30, total: 42, percentage: 71 },
];

const monthlyActivity = [
  { month: 'Jan', documents: 120, emails: 85, changes: 45 },
  { month: 'Feb', documents: 135, emails: 92, changes: 52 },
  { month: 'Mar', documents: 148, emails: 98, changes: 58 },
  { month: 'Apr', documents: 142, emails: 88, changes: 48 },
  { month: 'May', documents: 165, emails: 105, changes: 62 },
  { month: 'Jun', documents: 178, emails: 112, changes: 68 },
];

const upcomingDeadlines = [
  { id: 1, project: 'Project Alpha', document: 'Final COC', dueDate: '2025-12-03', status: 'Urgent' },
  { id: 2, project: 'Project Beta', document: 'Test Results', dueDate: '2025-12-05', status: 'Due Soon' },
  { id: 3, project: 'Project Gamma', document: 'Inspection Report', dueDate: '2025-12-08', status: 'Upcoming' },
  { id: 4, project: 'Project Delta', document: 'Compliance Docs', dueDate: '2025-12-10', status: 'Upcoming' },
];

const recentChanges = [
  { id: 1, action: 'Document uploaded', project: 'Project Alpha', user: 'John Doe', timestamp: '2025-12-01 14:30' },
  { id: 2, action: 'Status updated', project: 'Project Beta', user: 'Jane Smith', timestamp: '2025-12-01 13:15' },
  { id: 3, action: 'Email sent', project: 'Project Gamma', user: 'Bob Wilson', timestamp: '2025-12-01 11:45' },
  { id: 4, action: 'Document revised', project: 'Project Delta', user: 'Alice Brown', timestamp: '2025-12-01 10:20' },
];

const emailStats = {
  sent: 245,
  scheduled: 18,
  pending: 12,
  failed: 3
};

const missingDocuments = [
  { project: 'Project Epsilon', docType: 'COC', vendor: 'Vendor A', daysMissing: 5 },
  { project: 'Project Zeta', docType: 'Test Results', vendor: 'Vendor B', daysMissing: 3 },
  { project: 'Project Eta', docType: 'Photos', vendor: 'Vendor C', daysMissing: 8 },
];

function ClerkDashboard() {
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
    if (userRole !== 'clerk') {
      // Redirect non-admin users to their appropriate dashboard
      router.push('/unauthorized'); // or router.push('/dashboard');
    }
  }, [router]);

  return (
    <>
      <Head><title>Clerk Dashboard - Engineering Aide</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              📝 Clerk Dashboard
            </Typography>
            <Typography variant="subtitle2">
              Document management, tracking, and notifications
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
                    <Typography variant="h4" gutterBottom>{documentStats.uploaded}</Typography>
                    <Typography variant="body2" color="text.secondary">Documents Uploaded</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#5569ff', width: 56, height: 56 }}>
                    <CloudUploadIcon />
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
                    <Typography variant="h4" gutterBottom>{documentStats.pending}</Typography>
                    <Typography variant="body2" color="text.secondary">Pending Review</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ffc107', width: 56, height: 56 }}>
                    <PendingIcon />
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
                    <Typography variant="h4" gutterBottom>{documentStats.missing}</Typography>
                    <Typography variant="body2" color="text.secondary">Missing Documents</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#ff5630', width: 56, height: 56 }}>
                    <WarningAmberIcon />
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
                    <Typography variant="h4" gutterBottom>{emailStats.sent}</Typography>
                    <Typography variant="body2" color="text.secondary">Emails Sent</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: '#57ca22', width: 56, height: 56 }}>
                    <EmailIcon />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Upload and Email Trend */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="📊 Weekly Activity Trend" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyUploadTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="uploads" stackId="1" stroke="#5569ff" fill="#5569ff" name="Documents Uploaded" />
                    <Area type="monotone" dataKey="emails" stackId="2" stroke="#57ca22" fill="#57ca22" name="Emails Sent" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Document Type Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="📄 Document Types" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {documentTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Project Document Completion Status */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📈 Project Document Completion Status" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectDocumentStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="percentage" fill="#5569ff" name="Completion %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Monthly Activity Overview */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="📅 Monthly Activity Overview" />
              <Divider />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="documents" stroke="#5569ff" strokeWidth={2} name="Documents" />
                    <Line type="monotone" dataKey="emails" stroke="#57ca22" strokeWidth={2} name="Emails" />
                    <Line type="monotone" dataKey="changes" stroke="#ffc107" strokeWidth={2} name="Changes" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Upcoming Deadlines */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="⏰ Upcoming Deadlines" 
                action={<Badge badgeContent={upcomingDeadlines.length} color="error"><EventIcon /></Badge>}
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project</TableCell>
                        <TableCell>Document</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {upcomingDeadlines.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{item.project}</TableCell>
                          <TableCell>{item.document}</TableCell>
                          <TableCell>{item.dueDate}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.status} 
                              size="small"
                              color={item.status === 'Urgent' ? 'error' : item.status === 'Due Soon' ? 'warning' : 'default'}
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

          {/* Missing Documents Alert */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader 
                title="⚠️ Missing Documents" 
                action={<Badge badgeContent={missingDocuments.length} color="error"><WarningAmberIcon /></Badge>}
              />
              <Divider />
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Project</TableCell>
                        <TableCell>Doc Type</TableCell>
                        <TableCell>Vendor</TableCell>
                        <TableCell>Days</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {missingDocuments.map((item, idx) => (
                        <TableRow key={idx} hover>
                          <TableCell>{item.project}</TableCell>
                          <TableCell>{item.docType}</TableCell>
                          <TableCell>{item.vendor}</TableCell>
                          <TableCell>
                            <Chip 
                              label={`${item.daysMissing}d`} 
                              size="small"
                              color={item.daysMissing > 5 ? 'error' : 'warning'}
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

          {/* Recent Changes and History */}
          <Grid item xs={12}>
            <Card>
              <CardHeader 
                title="📜 Recent Changes & History" 
                action={<Button size="small" startIcon={<HistoryIcon />}>View All</Button>}
              />
              <Divider />
              <CardContent>
                <List>
                  {recentChanges.map((change) => (
                    <ListItem key={change.id} divider>
                      <ListItemIcon>
                        <CheckCircleIcon color="success" />
                      </ListItemIcon>
                      <ListItemText
                        primary={`${change.action} - ${change.project}`}
                        secondary={`By ${change.user} at ${change.timestamp}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Email Statistics */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="📧 Email Statistics" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center" py={2}>
                      <Typography variant="h3" color="success.main">{emailStats.sent}</Typography>
                      <Typography variant="body2" color="text.secondary">Sent</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" py={2}>
                      <Typography variant="h3" color="primary.main">{emailStats.scheduled}</Typography>
                      <Typography variant="body2" color="text.secondary">Scheduled</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" py={2}>
                      <Typography variant="h3" color="warning.main">{emailStats.pending}</Typography>
                      <Typography variant="body2" color="text.secondary">Pending</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center" py={2}>
                      <Typography variant="h3" color="error.main">{emailStats.failed}</Typography>
                      <Typography variant="body2" color="text.secondary">Failed</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="⚡ Quick Actions" />
              <Divider />
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<CloudUploadIcon />}
                      size="large"
                    >
                      Upload Documents
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<EmailIcon />}
                      size="large"
                      color="secondary"
                    >
                      Send Reminder Emails
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="contained" 
                      fullWidth 
                      startIcon={<DescriptionIcon />}
                      size="large"
                      color="success"
                    >
                      Generate Report
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      startIcon={<EventIcon />}
                      size="large"
                    >
                      View Calendar
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

ClerkDashboard.getLayout = (page) => <SidebarLayout userRole="clerk">{page}</SidebarLayout>;
export default ClerkDashboard;