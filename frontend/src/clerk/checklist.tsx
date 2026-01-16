// pages/clerk/coc-checklist.tsx
import { FC, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import SidebarLayout from '@/layouts/SidebarLayout';
import PageTitleWrapper from '@/components/PageTitleWrapper';
import {
  Container, Grid, Card, CardHeader, CardContent, Divider, Box, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert,
  Typography, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Tooltip, IconButton, Chip, FormControl, InputLabel,
  Select, MenuItem, Checkbox, Stack, Paper
} from '@mui/material';
import Footer from '@/components/Footer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WarningIcon from '@mui/icons-material/Warning';
import FilterListIcon from '@mui/icons-material/FilterList';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface WorkOrder {
  wo_id: string;
  wo_no: string;
  description: string;
  location: string;
  municipality: string;
  vendor_name: string;
  vendor_code: string;
  assigned_crew: string;
  supervisor_name: string;
  status: string;
  date_energized: string;
  date_coc_received: string;
  date_for_audit: string;
  days_since_energized: number;
  days_since_coc: number;
  needs_attention: boolean;
  vendor_remarks: string;
  clerk_remarks: string;
  total_estimated_cost: number;
}

interface Stats {
  total: number;
  awaiting_coc: number;
  awaiting_audit: number;
  needs_attention: number;
}

function ClerkCOCChecklist() {
  const router = useRouter();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    awaiting_coc: 0,
    awaiting_audit: 0,
    needs_attention: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [crewFilter, setCrewFilter] = useState('');
  const [needsAttentionFilter, setNeedsAttentionFilter] = useState(false);

  // Modal states
  const [showCOCModal, setShowCOCModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [cocDate, setCocDate] = useState('');
  const [auditDate, setAuditDate] = useState('');
  const [remarks, setRemarks] = useState('');

  // Bulk selection
  const [selectedWOs, setSelectedWOs] = useState<string[]>([]);



  useEffect(() => {
    fetchCOCChecklist();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [workOrders, statusFilter, vendorFilter, crewFilter, needsAttentionFilter]);

  const fetchCOCChecklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/clerk/coc-checklist/`);
      if (!response.ok) throw new Error('Failed to fetch COC checklist');
      const data = await response.json();
      setWorkOrders(data.results || []);
      setStats(data.stats || { total: 0, awaiting_coc: 0, awaiting_audit: 0, needs_attention: 0 });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...workOrders];

    if (statusFilter) {
      filtered = filtered.filter(wo => wo.status === statusFilter);
    }
    if (vendorFilter) {
      filtered = filtered.filter(wo => wo.vendor_code === vendorFilter);
    }
    if (crewFilter) {
      filtered = filtered.filter(wo => wo.assigned_crew === crewFilter);
    }
    if (needsAttentionFilter) {
      filtered = filtered.filter(wo => wo.needs_attention);
    }

    setFilteredOrders(filtered);
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleMarkCOCReceived = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setCocDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setShowCOCModal(true);
  };

  const handleSendForAudit = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setAuditDate(new Date().toISOString().split('T')[0]);
    setRemarks('');
    setShowAuditModal(true);
  };

  const handleViewDetails = (wo: WorkOrder) => {
    setSelectedWO(wo);
    setShowDetailsModal(true);
  };

  const submitCOCReceived = async () => {
    if (!selectedWO) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/clerk/${selectedWO.wo_id}/mark-coc-received/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date_coc_received: cocDate,
            clerk_remarks: remarks
          })
        }
      );
      if (!response.ok) throw new Error('Failed to mark COC received');
      showSuccess('COC receipt marked successfully!');
      setShowCOCModal(false);
      fetchCOCChecklist();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const submitSendForAudit = async () => {
    if (!selectedWO) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/clerk/${selectedWO.wo_id}/send-for-audit/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            date_for_audit: auditDate,
            clerk_remarks: remarks
          })
        }
      );
      if (!response.ok) throw new Error('Failed to send for audit');
      showSuccess('Work order sent for audit successfully!');
      setShowAuditModal(false);
      fetchCOCChecklist();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkMarkCOC = async () => {
    if (selectedWOs.length === 0) {
      setError('Please select work orders first');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/clerk/bulk-mark-coc/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wo_ids: selectedWOs,
          date_coc_received: new Date().toISOString().split('T')[0]
        })
      });
      if (!response.ok) throw new Error('Failed to bulk mark COC');
      const data = await response.json();
      showSuccess(data.message);
      setSelectedWOs([]);
      fetchCOCChecklist();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleSelectWO = (woId: string) => {
    setSelectedWOs(prev =>
      prev.includes(woId) ? prev.filter(id => id !== woId) : [...prev, woId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedWOs.length === filteredOrders.length) {
      setSelectedWOs([]);
    } else {
      setSelectedWOs(filteredOrders.map(wo => wo.wo_id));
    }
  };

  const getPriorityColor = (wo: WorkOrder) => {
    if (!wo.date_coc_received && wo.days_since_energized > 7) return 'error';
    if (wo.date_coc_received && !wo.date_for_audit && wo.days_since_coc > 3) return 'warning';
    return 'default';
  };

  const uniqueVendors = [...new Set(workOrders.map(wo => wo.vendor_code))];
  const uniqueCrews = [...new Set(workOrders.map(wo => wo.assigned_crew).filter(Boolean))];

  return (
    <>
      <Head><title>COC Checklist - Clerk Portal</title></Head>
      <PageTitleWrapper>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3" component="h3" gutterBottom>
              📋 COC Checklist
            </Typography>
            <Typography variant="subtitle2">
              Certificate of Completion Review & Processing
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleBulkMarkCOC}
              disabled={selectedWOs.length === 0}
              startIcon={<CheckCircleIcon />}
            >
              Bulk Mark COC ({selectedWOs.length})
            </Button>
          </Grid>
        </Grid>
      </PageTitleWrapper>

      <Container maxWidth="lg">
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{stats.total}</Typography>
              <Typography variant="body2" color="text.secondary">Total Items</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">{stats.awaiting_coc}</Typography>
              <Typography variant="body2" color="text.secondary">Awaiting COC</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">{stats.awaiting_audit}</Typography>
              <Typography variant="body2" color="text.secondary">Awaiting Audit</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" color="error.main">{stats.needs_attention}</Typography>
              <Typography variant="body2" color="text.secondary">Needs Attention</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="NEW">New</MenuItem>
                    <MenuItem value="FOR AUDIT">For Audit</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Vendor</InputLabel>
                  <Select
                    value={vendorFilter}
                    onChange={(e) => setVendorFilter(e.target.value)}
                    label="Vendor"
                  >
                    <MenuItem value="">All</MenuItem>
                    {uniqueVendors.map(vendor => (
                      <MenuItem key={vendor} value={vendor}>{vendor}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Crew</InputLabel>
                  <Select
                    value={crewFilter}
                    onChange={(e) => setCrewFilter(e.target.value)}
                    label="Crew"
                  >
                    <MenuItem value="">All</MenuItem>
                    {uniqueCrews.map(crew => (
                      <MenuItem key={crew} value={crew}>{crew}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox
                    checked={needsAttentionFilter}
                    onChange={(e) => setNeedsAttentionFilter(e.target.checked)}
                  />
                  <Typography variant="body2">Needs Attention Only</Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Main Table */}
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

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography>Loading...</Typography>
              </Box>
            ) : filteredOrders.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">No work orders found</Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedWOs.length === filteredOrders.length}
                          onChange={toggleSelectAll}
                        />
                      </TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">WO NO</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">DESCRIPTION</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">VENDOR</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">CREW</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">ENERGIZED</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">COC RECEIVED</Typography></TableCell>
                      <TableCell><Typography variant="subtitle2" fontWeight="bold">STATUS</Typography></TableCell>
                      <TableCell align="center"><Typography variant="subtitle2" fontWeight="bold">ACTIONS</Typography></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOrders.map((wo) => (
                      <TableRow key={wo.wo_id} hover sx={{ bgcolor: wo.needs_attention ? 'error.lighter' : 'inherit' }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedWOs.includes(wo.wo_id)}
                            onChange={() => toggleSelectWO(wo.wo_id)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">{wo.wo_no}</Typography>
                          {wo.needs_attention && (
                            <Chip icon={<WarningIcon />} label="Urgent" size="small" color="error" sx={{ mt: 0.5 }} />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{wo.description?.substring(0, 50)}...</Typography>
                          <Typography variant="caption" color="text.secondary">{wo.location}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{wo.vendor_code}</Typography>
                        </TableCell>
                        <TableCell>{wo.assigned_crew || '-'}</TableCell>
                        <TableCell>
                          {wo.date_energized ? (
                            <>
                              <Typography variant="body2">{new Date(wo.date_energized).toLocaleDateString()}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({wo.days_since_energized} days ago)
                              </Typography>
                            </>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {wo.date_coc_received ? (
                            <>
                              <Typography variant="body2">{new Date(wo.date_coc_received).toLocaleDateString()}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({wo.days_since_coc} days ago)
                              </Typography>
                            </>
                          ) : (
                            <Chip label="Pending" size="small" color="warning" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip label={wo.status} size="small" color={getPriorityColor(wo)} />
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details"><IconButton size="small" onClick={() => handleViewDetails(wo)}><VisibilityIcon fontSize="small" /></IconButton></Tooltip>
                          {!wo.date_coc_received && (
                            <Tooltip title="Mark COC Received"><IconButton size="small" color="success" onClick={() => handleMarkCOCReceived(wo)}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                          )}
                          {wo.date_coc_received && !wo.date_for_audit && (
                            <Tooltip title="Send for Audit"><IconButton size="small" color="primary" onClick={() => handleSendForAudit(wo)}><SendIcon fontSize="small" /></IconButton></Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>
      <Footer />

      {/* COC Received Modal */}
      <Dialog open={showCOCModal} onClose={() => setShowCOCModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark COC Received</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Work Order: <strong>{selectedWO?.wo_no}</strong>
          </Typography>
          <TextField
            fullWidth
            label="COC Received Date"
            type="date"
            value={cocDate}
            onChange={(e) => setCocDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCOCModal(false)}>Cancel</Button>
          <Button onClick={submitCOCReceived} variant="contained" color="success">
            Mark Received
          </Button>
        </DialogActions>
      </Dialog>

      {/* Send for Audit Modal */}
      <Dialog open={showAuditModal} onClose={() => setShowAuditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send for Audit</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Work Order: <strong>{selectedWO?.wo_no}</strong>
          </Typography>
          <TextField
            fullWidth
            label="Audit Date"
            type="date"
            value={auditDate}
            onChange={(e) => setAuditDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Remarks (Optional)"
            multiline
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAuditModal(false)}>Cancel</Button>
          <Button onClick={submitSendForAudit} variant="contained" color="primary">
            Send for Audit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onClose={() => setShowDetailsModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Work Order Details</DialogTitle>
        <DialogContent dividers>
          {selectedWO && (
            <Grid container spacing={2}>
              <Grid item xs={6}><Typography variant="body2"><strong>WO No:</strong> {selectedWO.wo_no}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Status:</strong> {selectedWO.status}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2"><strong>Description:</strong> {selectedWO.description}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2"><strong>Location:</strong> {selectedWO.location}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Vendor:</strong> {selectedWO.vendor_name} ({selectedWO.vendor_code})</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Crew:</strong> {selectedWO.assigned_crew}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Date Energized:</strong> {selectedWO.date_energized ? new Date(selectedWO.date_energized).toLocaleDateString() : 'N/A'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>COC Received:</strong> {selectedWO.date_coc_received ? new Date(selectedWO.date_coc_received).toLocaleDateString() : 'Pending'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>For Audit:</strong> {selectedWO.date_for_audit ? new Date(selectedWO.date_for_audit).toLocaleDateString() : 'Not yet'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2"><strong>Estimated Cost:</strong> ₱{selectedWO.total_estimated_cost?.toLocaleString()}</Typography></Grid>
              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={12}><Typography variant="body2"><strong>Vendor Remarks:</strong></Typography><Typography variant="body2" color="text.secondary">{selectedWO.vendor_remarks || 'None'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2"><strong>Clerk Remarks:</strong></Typography><Typography variant="body2" color="text.secondary">{selectedWO.clerk_remarks || 'None'}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

ClerkCOCChecklist.getLayout = (page) => <SidebarLayout userRole="clerk">{page}</SidebarLayout>;
export default ClerkCOCChecklist;