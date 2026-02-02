// InvoiceCreation.tsx - Improved version with PDF generation and email functionality

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  Divider,
  Stack,
  Badge,
  DialogContentText,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Receipt as ReceiptIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Constants
const READY_FOR_BILLING_STATUS = 7; // Status ID for "Ready for Billing"
const INVOICED_STATUS = 8; // Status ID for "Invoiced"

// Types
interface Vendor {
  vendor_id: number;
  vendor_code: string;
  vendor_name: string;
  company_name: string;
  email: string;
  phone_number: string;
  address: string;
  tax_id: string;
}

interface Project {
  project_id: number;
  project_code: string;
  project_name: string;
  contract_value: string;
  vendor: number;
  status: number;
  status_name?: string;
}

interface Penalty {
  penalty_id: number;
  project: number;
  penalty_amount: string;
  penalty_status: string;
  violation_date: string;
  penalty_rule: {
    rule_name: string;
  };
}

interface Invoice {
  invoice_id?: number;
  project: number;
  vendor: number;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  invoice_amount: string;
  penalty_amount: string;
  net_amount: string;
  payment_status: string;
  payment_date?: string;
  payment_reference?: string;
  notes?: string;
  created_by?: number;
  approved_by?: number;
  approval_date?: string;
}

const InvoiceCreation: React.FC = () => {
  // State Management
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState<Invoice>({
    project: 0,
    vendor: 0,
    invoice_number: '',
    invoice_date: format(new Date(), 'yyyy-MM-dd'),
    due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    invoice_amount: '0.00',
    penalty_amount: '0.00',
    net_amount: '0.00',
    payment_status: 'Unpaid',
    notes: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  });

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [readyForBillingCount, setReadyForBillingCount] = useState(0);

  // Helper function for API calls
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`
  });

  // API Calls
  useEffect(() => {
    fetchInvoices();
    fetchProjects();
    fetchAllProjects();
    fetchVendors();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/`, {
        headers: getAuthHeaders()
      });
      setInvoices(response.data.results || response.data);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.error || 'Error fetching invoices',
        'error'
      );
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/projects/?status=${READY_FOR_BILLING_STATUS}`,
        { headers: getAuthHeaders() }
      );
      const readyProjects = response.data.results || response.data;
      setProjects(readyProjects);
      setReadyForBillingCount(readyProjects.length);
      
      console.log(`Loaded ${readyProjects.length} projects with "Ready for Billing" status`);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showSnackbar('Error loading projects ready for billing', 'error');
    }
  };

  const fetchAllProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/`, {
        headers: getAuthHeaders()
      });
      setAllProjects(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching all projects:', error);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/vendors/`, {
        headers: getAuthHeaders()
      });
      setVendors(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      showSnackbar('Error loading vendors', 'error');
    }
  };

  const fetchProjectPenalties = async (projectId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/penalties/?project=${projectId}`, {
        headers: getAuthHeaders()
      });
      const projectPenalties = response.data.results || response.data;
      setPenalties(projectPenalties);
      
      const totalPenalties = projectPenalties
        .filter((p: Penalty) => p.penalty_status === 'Issued')
        .reduce((sum: number, p: Penalty) => sum + parseFloat(p.penalty_amount), 0);
      
      setFormData(prev => ({
        ...prev,
        penalty_amount: totalPenalties.toFixed(2)
      }));

      if (totalPenalties > 0) {
        showSnackbar(
          `${projectPenalties.filter((p: Penalty) => p.penalty_status === 'Issued').length} penalties applied (₱${totalPenalties.toLocaleString()})`,
          'info'
        );
      }
    } catch (error) {
      console.error('Error fetching penalties:', error);
      showSnackbar('Error loading project penalties', 'warning');
    }
  };

  const validateProjectStatus = (projectId: number): boolean => {
    const project = allProjects.find(p => p.project_id === projectId);
    
    if (!project) {
      showSnackbar('Project not found', 'error');
      return false;
    }

    if (project.status !== READY_FOR_BILLING_STATUS) {
      showSnackbar(
        `Cannot create invoice: Project status is "${project.status_name || 'Unknown'}", not "Ready for Billing"`,
        'error'
      );
      return false;
    }

    return true;
  };

  const handleProjectChange = async (projectId: number) => {
    if (!validateProjectStatus(projectId)) {
      return;
    }

    const project = projects.find(p => p.project_id === projectId);
    if (project) {
      setFormData(prev => ({
        ...prev,
        project: projectId,
        vendor: project.vendor,
        invoice_amount: project.contract_value,
      }));
      
      await fetchProjectPenalties(projectId);
    }
  };

  const calculateNetAmount = () => {
    const invoiceAmt = parseFloat(formData.invoice_amount) || 0;
    const penaltyAmt = parseFloat(formData.penalty_amount) || 0;
    const netAmt = invoiceAmt - penaltyAmt;
    
    setFormData(prev => ({
      ...prev,
      net_amount: netAmt.toFixed(2)
    }));
  };

  useEffect(() => {
    calculateNetAmount();
  }, [formData.invoice_amount, formData.penalty_amount]);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `INV-${year}${month}-${random}`;
  };

  const handleOpenDialog = (invoice?: Invoice) => {
    if (!invoice && projects.length === 0) {
      showSnackbar(
        'No projects with "Ready for Billing" status available.',
        'warning'
      );
      return;
    }

    if (invoice) {
      setIsEditMode(true);
      setSelectedInvoice(invoice);
      setFormData(invoice);
    } else {
      setIsEditMode(false);
      setSelectedInvoice(null);
      setFormData({
        project: 0,
        vendor: 0,
        invoice_number: generateInvoiceNumber(),
        invoice_date: format(new Date(), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        invoice_amount: '0.00',
        penalty_amount: '0.00',
        net_amount: '0.00',
        payment_status: 'Unpaid',
        notes: '',
      });
      setPenalties([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInvoice(null);
    setIsEditMode(false);
    setPenalties([]);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.project || !formData.vendor) {
      showSnackbar('Please select project and vendor', 'error');
      return;
    }

    if (!formData.invoice_number) {
      showSnackbar('Invoice number is required', 'error');
      return;
    }

    if (!isEditMode && !validateProjectStatus(formData.project)) {
      return;
    }

    const invoiceAmt = parseFloat(formData.invoice_amount);
    const penaltyAmt = parseFloat(formData.penalty_amount);
    
    if (invoiceAmt <= 0) {
      showSnackbar('Invoice amount must be greater than zero', 'error');
      return;
    }

    if (penaltyAmt > invoiceAmt) {
      showSnackbar('Penalty amount cannot exceed invoice amount', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        created_by: parseInt(localStorage.getItem('user_id') || '0'),
      };

      if (isEditMode && selectedInvoice) {
        await axios.put(
          `${API_BASE_URL}/invoices/${selectedInvoice.invoice_id}/`,
          payload,
          { headers: getAuthHeaders() }
        );
        showSnackbar('Invoice updated successfully', 'success');
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/invoices/`,
          payload,
          { headers: getAuthHeaders() }
        );
        showSnackbar(
          `Invoice created successfully! Project status updated to "Invoiced"`,
          'success'
        );
      }

      await fetchInvoices();
      await fetchProjects();
      handleCloseDialog();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 
                      error.response?.data?.error ||
                      error.response?.data?.detail ||
                      'Error saving invoice';
      showSnackbar(errorMsg, 'error');
      console.error('Error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId: number) => {
    if (!window.confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/invoices/${invoiceId}/`, {
        headers: getAuthHeaders()
      });
      showSnackbar('Invoice deleted successfully', 'success');
      await fetchInvoices();
      await fetchProjects();
    } catch (error) {
      showSnackbar('Error deleting invoice', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF invoice
  const generateInvoiceDocument = async (invoice: Invoice) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices/${invoice.invoice_id}/generate_document/`,
        {},
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Invoice PDF downloaded successfully', 'success');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error generating PDF';
      showSnackbar(errorMsg, 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Download PDF receipt
  const generateReceipt = async (invoice: Invoice) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices/${invoice.invoice_id}/generate_receipt/`,
        {},
        {
          headers: getAuthHeaders(),
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Receipt PDF downloaded successfully', 'success');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Error generating receipt';
      showSnackbar(errorMsg, 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send email
  const sendInvoiceEmail = async (invoice: Invoice) => {
    const vendor = vendors.find(v => v.vendor_id === invoice.vendor);
    
    if (!vendor?.email) {
      showSnackbar('Vendor email not found', 'error');
      return;
    }

    setSelectedInvoice(invoice);
    setEmailDialogOpen(true);
  };

  const confirmSendEmail = async () => {
    if (!selectedInvoice) return;

    setLoading(true);
    setEmailDialogOpen(false);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/invoices/${selectedInvoice.invoice_id}/send_email/`,
        {},
        { headers: getAuthHeaders() }
      );
      
      showSnackbar(
        response.data.message || 'Invoice email sent successfully',
        'success'
      );
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.detail ||
                      'Error sending email';
      showSnackbar(errorMsg, 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setSelectedInvoice(null);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'all' || invoice.payment_status === filterStatus;
    const matchesVendor = filterVendor === 0 || invoice.vendor === filterVendor;
    const matchesSearch = searchTerm === '' || 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesVendor && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'success';
      case 'Partially Paid': return 'warning';
      case 'Overdue': return 'error';
      default: return 'default';
    }
  };

  const getVendorName = (vendorId: number) => {
    return vendors.find(v => v.vendor_id === vendorId)?.vendor_name || 'Unknown';
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find(p => p.project_id === projectId) || 
                   allProjects.find(p => p.project_id === projectId);
    return project?.project_name || 'Unknown';
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Invoice Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Create and manage invoices • PDF generation • Email delivery
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          disabled={loading || projects.length === 0}
          size="large"
        >
          Create Invoice
        </Button>
      </Box>

      {/* Info Alerts */}
      {readyForBillingCount > 0 && (
        <Alert severity="info" sx={{ mb: 2 }} icon={<InfoIcon />}>
          <strong>{readyForBillingCount} project{readyForBillingCount !== 1 ? 's' : ''}</strong> ready for billing.
          Projects will automatically move to "Invoiced" status after invoice creation.
        </Alert>
      )}

      {readyForBillingCount === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningIcon />}>
          No projects with "Ready for Billing" status found.
        </Alert>
      )}

      {/* Filters Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search Invoice Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Payment Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                  <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={filterVendor}
                  onChange={(e) => setFilterVendor(Number(e.target.value))}
                  label="Vendor"
                >
                  <MenuItem value={0}>All Vendors</MenuItem>
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.vendor_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Invoice #</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vendor</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Penalty</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Net Amount</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && !filteredInvoices.length ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <CircularProgress />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Loading invoices...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                  <Typography variant="body2" color="text.secondary">
                    No invoices found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.invoice_id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {invoice.invoice_number}
                    </Typography>
                  </TableCell>
                  <TableCell>{getVendorName(invoice.vendor)}</TableCell>
                  <TableCell>{getProjectName(invoice.project)}</TableCell>
                  <TableCell>
                    {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>₱{parseFloat(invoice.invoice_amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Typography color="error">
                      -₱{parseFloat(invoice.penalty_amount).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight="bold">
                      ₱{parseFloat(invoice.net_amount).toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={invoice.payment_status}
                      color={getStatusColor(invoice.payment_status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setViewDialogOpen(true);
                          }}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Invoice">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(invoice)}
                          disabled={invoice.payment_status === 'Paid'}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF Invoice">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => generateInvoiceDocument(invoice)}
                          disabled={loading}
                        >
                          <PdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Download PDF Receipt">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => generateReceipt(invoice)}
                          disabled={invoice.payment_status !== 'Paid' || loading}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Send Email">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => sendInvoiceEmail(invoice)}
                          disabled={loading}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Invoice">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(invoice.invoice_id!)}
                          disabled={invoice.payment_status === 'Paid'}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditMode ? 'Edit Invoice' : 'Create New Invoice'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Project</InputLabel>
                <Select
                  value={formData.project}
                  onChange={(e) => handleProjectChange(Number(e.target.value))}
                  label="Project"
                  disabled={isEditMode}
                >
                  <MenuItem value={0}>Select Project</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.project_id} value={project.project_id}>
                      {project.project_code} - {project.project_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Vendor</InputLabel>
                <Select
                  value={formData.vendor}
                  label="Vendor"
                  disabled
                >
                  <MenuItem value={0}>Select Vendor</MenuItem>
                  {vendors.map((vendor) => (
                    <MenuItem key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.vendor_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Invoice Number"
                value={formData.invoice_number}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_number: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  value={formData.payment_status}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_status: e.target.value }))}
                  label="Payment Status"
                >
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                  <MenuItem value="Partially Paid">Partially Paid</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Invoice Date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Invoice Amount"
                type="number"
                value={formData.invoice_amount}
                onChange={(e) => setFormData(prev => ({ ...prev, invoice_amount: e.target.value }))}
                InputProps={{ startAdornment: '₱' }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Penalty Amount"
                type="number"
                value={formData.penalty_amount}
                InputProps={{ startAdornment: '₱' }}
                disabled
                helperText="Auto-calculated from project penalties"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Net Amount"
                type="number"
                value={formData.net_amount}
                InputProps={{ startAdornment: '₱' }}
                disabled
                helperText="Invoice amount minus penalties"
              />
            </Grid>
            
            {penalties.length > 0 && (
              <Grid item xs={12}>
                <Alert severity="warning" icon={<WarningIcon />}>
                  <Typography variant="body2" fontWeight="bold">
                    {penalties.length} Penalties Applied:
                  </Typography>
                  {penalties.map((penalty) => (
                    <Typography key={penalty.penalty_id} variant="body2">
                      • {penalty.penalty_rule.rule_name}: ₱{parseFloat(penalty.penalty_amount).toLocaleString()}
                    </Typography>
                  ))}
                </Alert>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : (isEditMode ? 'Update' : 'Create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invoice Details</DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box sx={{ pt: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Invoice Number</Typography>
                  <Typography variant="body1" fontWeight="bold">{selectedInvoice.invoice_number}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Vendor</Typography>
                  <Typography variant="body1">{getVendorName(selectedInvoice.vendor)}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Project</Typography>
                  <Typography variant="body1">{getProjectName(selectedInvoice.project)}</Typography>
                </Box>
                <Divider />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Invoice Date</Typography>
                    <Typography variant="body2">
                      {format(new Date(selectedInvoice.invoice_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Due Date</Typography>
                    <Typography variant="body2">
                      {format(new Date(selectedInvoice.due_date), 'MMM dd, yyyy')}
                    </Typography>
                  </Grid>
                </Grid>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Invoice Amount</Typography>
                  <Typography variant="h6">₱{parseFloat(selectedInvoice.invoice_amount).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Penalty Amount</Typography>
                  <Typography variant="h6" color="error">
                    -₱{parseFloat(selectedInvoice.penalty_amount).toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Net Amount</Typography>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    ₱{parseFloat(selectedInvoice.net_amount).toLocaleString()}
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={selectedInvoice.payment_status}
                      color={getStatusColor(selectedInvoice.payment_status)}
                    />
                  </Box>
                </Box>
                {selectedInvoice.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Notes</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {selectedInvoice.notes}
                      </Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Email Confirmation Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <DialogTitle>Confirm Email Send</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedInvoice && (
              <>
                Send invoice <strong>{selectedInvoice.invoice_number}</strong> to{' '}
                <strong>{vendors.find(v => v.vendor_id === selectedInvoice.vendor)?.email}</strong>?
                <br /><br />
                The email will include:
                <ul>
                  <li>Invoice details</li>
                  <li>PDF attachment</li>
                  <li>Payment information</li>
                </ul>
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmSendEmail} variant="contained" startIcon={<SendIcon />}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoiceCreation;