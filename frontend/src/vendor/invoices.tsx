import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface Invoice {
  invoice_id: number;
  invoice_number: string;
  project_code: string;
  invoice_date: string;
  due_date: string;
  invoice_amount: string;
  penalty_amount: string;
  net_amount: string;
  payment_status: string;
  payment_date: string | null;
  payment_reference: string | null;
  notes: string;
  vendor_id: number;
}

interface PaymentReceipt {
  receipt_id: number;
  invoice: number;
  receipt_image: string;
  receipt_number: string;
  payment_amount: string;
  payment_date: string;
  payment_method: string;
  notes: string;
  status: string;
  uploaded_at: string;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
}

interface Stats {
  total_invoices: number;
  total_pending: number;
  total_paid: number;
  pending_amount: number;
  paid_amount: number;
}

export default function VendorInvoiceTracking() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  
  const [stats, setStats] = useState<Stats>({
    total_invoices: 0,
    total_pending: 0,
    total_paid: 0,
    pending_amount: 0,
    paid_amount: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    receipt_image: null as File | null,
    receipt_number: '',
    payment_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'Bank Transfer',
    notes: ''
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  // Create headers with auth token
  const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    return headers;
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.user_id;
    if (userId) {
      fetchVendorData(userId);
    }
  }, []);

  useEffect(() => {
    if (vendorId) {
      fetchVendorInvoices(vendorId);
    }
  }, [filter, vendorId]);

  const fetchVendorData = async (userId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/?user=${userId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor data');
      }
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setVendorId(data.results[0].vendor_id);
      }
    } catch (err) {
      setError('Failed to fetch vendor data');
      console.error(err);
    }
  };

  const fetchVendorInvoices = async (vId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/?vendor=${vId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch invoices');
      
      const data = await response.json();
      let invoiceList = data.results || data || [];
      
      if (filter !== 'all') {
        invoiceList = invoiceList.filter((inv: Invoice) => inv.payment_status === filter);
      }
      
      setInvoices(invoiceList);
      calculateStats(invoiceList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (invoiceList: Invoice[]) => {
    const totalPending = invoiceList.filter(inv => inv.payment_status === 'Unpaid').length;
    const totalPaid = invoiceList.filter(inv => inv.payment_status === 'Paid').length;
    const pendingAmount = invoiceList
      .filter(inv => inv.payment_status === 'Unpaid')
      .reduce((sum, inv) => sum + parseFloat(inv.net_amount || '0'), 0);
    const paidAmount = invoiceList
      .filter(inv => inv.payment_status === 'Paid')
      .reduce((sum, inv) => sum + parseFloat(inv.net_amount || '0'), 0);
    
    setStats({
      total_invoices: invoiceList.length,
      total_pending: totalPending,
      total_paid: totalPaid,
      pending_amount: pendingAmount,
      paid_amount: paidAmount
    });
  };

  const fetchPaymentReceipts = async (invoiceId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-receipts/?invoice=${invoiceId}`, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch receipts');
      
      const data = await response.json();
      setReceipts(data.results || data || []);
    } catch (err) {
      console.error('Error fetching receipts:', err);
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
    fetchPaymentReceipts(invoice.invoice_id);
  };

  const handleViewReceipt = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setShowReceiptModal(true);
  };

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentForm({
      receipt_image: null,
      receipt_number: '',
      payment_amount: invoice.net_amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'Bank Transfer',
      notes: ''
    });
    setImagePreview(null);
    setShowPaymentModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      setPaymentForm({ ...paymentForm, receipt_image: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedInvoice) return;
    
    const authToken = getAuthToken();
    if (!authToken) {
      setError('You must be logged in to submit payment receipts. Please log in and try again.');
      return;
    }
    
    if (!paymentForm.receipt_image) {
      setError('Please upload a receipt image');
      return;
    }

    if (!paymentForm.receipt_number) {
      setError('Please enter a receipt number');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('invoice', selectedInvoice.invoice_id.toString());
      formData.append('receipt_image', paymentForm.receipt_image);
      formData.append('receipt_number', paymentForm.receipt_number);
      formData.append('payment_amount', paymentForm.payment_amount);
      formData.append('payment_date', paymentForm.payment_date);
      formData.append('payment_method', paymentForm.payment_method);
      formData.append('notes', paymentForm.notes);

      const response = await fetch(`${API_BASE_URL}/payment-receipts/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Failed to submit payment receipt');
      }

      setSuccess('Payment receipt submitted successfully! Waiting for approval.');
      setShowPaymentModal(false);
      
      if (vendorId) {
        fetchVendorInvoices(vendorId);
      }
      
      setPaymentForm({
        receipt_image: null,
        receipt_number: '',
        payment_amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'Bank Transfer',
        notes: ''
      });
      setImagePreview(null);
      
    } catch (err) {
      console.error('Error submitting payment:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit payment receipt');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      setLoading(true);
      
      const authToken = getAuthToken();
      const headers: HeadersInit = {};
      
      if (authToken) {
        headers['Authorization'] = `Token ${authToken}`;
      }
      
      const response = await fetch(
        `${API_BASE_URL}/invoices/${invoice.invoice_id}/generate_document/`,
        { 
          method: 'POST',
          headers: headers
        }
      );

      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess('PDF downloaded successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#4caf50';
      case 'Unpaid': return '#f44336';
      case 'Partially Paid': return '#ff9800';
      case 'Overdue': return '#d32f2f';
      default: return '#9e9e9e';
    }
  };

  const getReceiptStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#4caf50';
      case 'PENDING': return '#ff9800';
      case 'REJECTED': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  // Auto-hide notifications
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>💵 My Invoices & Payments</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Track your billing, submit payment receipts, and download invoices
        </p>
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(102,126,234,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Invoices</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.total_invoices}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            {stats.total_pending} pending • {stats.total_paid} paid
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(245,87,108,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Payment</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>₱{stats.pending_amount.toLocaleString()}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{stats.total_pending} invoices</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(0,242,254,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Paid (YTD)</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>₱{stats.paid_amount.toLocaleString()}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>{stats.total_paid} invoices</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['all', 'Unpaid', 'Partially Paid', 'Paid', 'Overdue'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                background: filter === status ? '#667eea' : '#f5f5f5',
                color: filter === status ? 'white' : '#1a1a2e',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: filter === status ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}
            >
              {status === 'all' ? 'All Invoices' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Invoice List</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading invoices...</div>
        ) : invoices.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Invoice #</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Project</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Due Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Net Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1a1a2e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.invoice_number} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', color: '#1a1a2e', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {invoice.invoice_number}
                    </td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{invoice.project_code || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{invoice.invoice_date || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{invoice.due_date || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e', fontWeight: 'bold', fontSize: '16px' }}>
                      ₱{parseFloat(invoice.net_amount || '0').toLocaleString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{
                          background: getStatusColor(invoice.payment_status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-block'
                        }}>
                          {invoice.payment_status}
                        </span>
                        {(() => {
                          // Check if this invoice has any receipts
                          const invoiceReceipts = receipts.filter(r => r.invoice === invoice.invoice_id);
                          if (invoiceReceipts.length > 0) {
                            const pendingCount = invoiceReceipts.filter(r => r.status === 'PENDING').length;
                            const approvedCount = invoiceReceipts.filter(r => r.status === 'APPROVED').length;
                            const rejectedCount = invoiceReceipts.filter(r => r.status === 'REJECTED').length;
                            
                            return (
                              <div style={{ fontSize: '10px', color: '#666', marginTop: '2px' }}>
                                {pendingCount > 0 && (
                                  <span style={{ 
                                    background: '#ff9800', 
                                    color: 'white', 
                                    padding: '2px 6px', 
                                    borderRadius: '6px',
                                    marginRight: '4px',
                                    display: 'inline-block'
                                  }}>
                                    ⏳ {pendingCount} Pending
                                  </span>
                                )}
                                {approvedCount > 0 && (
                                  <span style={{ 
                                    background: '#4caf50', 
                                    color: 'white', 
                                    padding: '2px 6px', 
                                    borderRadius: '6px',
                                    marginRight: '4px',
                                    display: 'inline-block'
                                  }}>
                                    ✓ {approvedCount} Approved
                                  </span>
                                )}
                                {rejectedCount > 0 && (
                                  <span style={{ 
                                    background: '#f44336', 
                                    color: 'white', 
                                    padding: '2px 6px', 
                                    borderRadius: '6px',
                                    display: 'inline-block'
                                  }}>
                                    ✗ {rejectedCount} Rejected
                                  </span>
                                )}
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewDetails(invoice)}
                          style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(invoice)}
                          style={{
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          📄 PDF
                        </button>
                        {(invoice.payment_status === 'Unpaid' || invoice.payment_status === 'Partially Paid') && (
                          <button
                            onClick={() => handleOpenPaymentModal(invoice)}
                            style={{
                              background: '#ff9800',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '13px',
                              fontWeight: 'bold'
                            }}
                          >
                            💳 {invoice.payment_status === 'Partially Paid' ? 'Add Payment' : 'Pay'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No invoices found
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          overflow: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1a1a2e' }}>📄 Invoice Details</h2>
            
            {/* Invoice Info */}
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Invoice Number</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedInvoice.invoice_number}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Invoice Date</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedInvoice.invoice_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Due Date</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedInvoice.due_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Project Code</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedInvoice.project_code || 'N/A'}</div>
                </div>
              </div>
              
              <div style={{ borderTop: '1px solid #ddd', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#1a1a2e' }}>Invoice Amount:</span>
                  <span style={{ fontWeight: 'bold', color: '#1a1a2e' }}>₱{parseFloat(selectedInvoice.invoice_amount || '0').toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#f44336' }}>Penalties:</span>
                  <span style={{ fontWeight: 'bold', color: '#f44336' }}>-₱{parseFloat(selectedInvoice.penalty_amount || '0').toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#667eea', marginLeft: '-20px', marginRight: '-20px', marginBottom: '-20px', borderRadius: '0 0 12px 12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Net Amount:</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>₱{parseFloat(selectedInvoice.net_amount || '0').toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Receipts History */}
            {receipts.length > 0 ? (
              <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#1a1a2e' }}>📜 Payment Receipt History</h4>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Total Submitted: ₱{receipts.reduce((sum, r) => sum + parseFloat(r.payment_amount || '0'), 0).toLocaleString()}
                  </div>
                </div>
                {receipts.map((receipt) => (
                  <div key={receipt.receipt_id} style={{ 
                    background: 'white', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    marginBottom: '8px',
                    border: `2px solid ${getReceiptStatusColor(receipt.status)}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 'bold', color: '#1a1a2e' }}>{receipt.receipt_number}</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span style={{
                          background: getReceiptStatusColor(receipt.status),
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {receipt.status}
                        </span>
                        <button
                          onClick={() => handleViewReceipt(receipt)}
                          style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '11px'
                          }}
                        >
                          📷 View
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      Amount: ₱{parseFloat(receipt.payment_amount).toLocaleString()}<br/>
                      Date: {receipt.payment_date}<br/>
                      Method: {receipt.payment_method}
                    </div>
                    {receipt.status === 'PENDING' && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#fff3e0', borderRadius: '4px', fontSize: '12px', color: 'black' }}>
                        ⏳ <strong>Awaiting Review:</strong> This payment is pending supervisor approval
                      </div>
                    )}
                    {receipt.status === 'REJECTED' && receipt.review_notes && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#ffebee', borderRadius: '4px', fontSize: '12px' }}>
                        <strong>❌ Rejected:</strong> {receipt.review_notes}
                      </div>
                    )}
                    {receipt.status === 'APPROVED' && (
                      <div style={{ marginTop: '8px', padding: '8px', background: '#e8f5e9', borderRadius: '4px', fontSize: '12px' }}>
                        ✓ <strong>Approved</strong>
                        {receipt.reviewed_by_name && ` by ${receipt.reviewed_by_name}`}
                        {receipt.reviewed_at && ` on ${new Date(receipt.reviewed_at).toLocaleDateString()}`}
                        {receipt.review_notes && (
                          <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #c8e6c9' }}>
                            <strong>Notes:</strong> {receipt.review_notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.3 }}>📭</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#666' }}>No Payment Receipts Yet</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#999' }}>
                  {selectedInvoice.payment_status === 'Unpaid' 
                    ? 'Submit your payment receipt to start the approval process'
                    : 'No payment receipts have been submitted for this invoice'}
                </p>
              </div>
            )}

            {/* Payment Status */}
            <div style={{ background: selectedInvoice.payment_status === 'Paid' ? '#e8f5e9' : '#fff3e0', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: `1px solid ${selectedInvoice.payment_status === 'Paid' ? '#4caf50' : '#ff9800'}` }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1a1a2e' }}>💳 Payment Status & Summary</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <span style={{
                  background: getStatusColor(selectedInvoice.payment_status),
                  color: 'white',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {selectedInvoice.payment_status}
                </span>
              </div>
              
              {/* Payment Summary */}
              {receipts.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <div style={{ fontSize: '13px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#666' }}>Total Receipts Submitted:</span>
                      <span style={{ fontWeight: 'bold', color: '#1a1a2e' }}>{receipts.length}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#666' }}>Approved Payments:</span>
                      <span style={{ fontWeight: 'bold', color: '#4caf50' }}>
                        ₱{receipts.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + parseFloat(r.payment_amount || '0'), 0).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#666' }}>Pending Approval:</span>
                      <span style={{ fontWeight: 'bold', color: '#ff9800' }}>
                        ₱{receipts.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + parseFloat(r.payment_amount || '0'), 0).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#666' }}>Rejected:</span>
                      <span style={{ fontWeight: 'bold', color: '#f44336' }}>
                        {receipts.filter(r => r.status === 'REJECTED').length} receipt(s)
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: '8px' }}>
                      <span style={{ color: '#1a1a2e', fontWeight: 'bold' }}>Amount Due:</span>
                      <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a1a2e' }}>
                        ₱{parseFloat(selectedInvoice.net_amount).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedInvoice.payment_date && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedInvoice.payment_date}</div>
                </div>
              )}
              {selectedInvoice.payment_reference && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Reference Number</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', fontFamily: 'monospace' }}>{selectedInvoice.payment_reference}</div>
                </div>
              )}
            </div>

            {/* Notes */}
            {selectedInvoice.notes && (
              <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#1a1a2e' }}>📝 Notes</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6' }}>{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Close
              </button>
              {(selectedInvoice.payment_status === 'Unpaid' || selectedInvoice.payment_status === 'Partially Paid') && (
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleOpenPaymentModal(selectedInvoice);
                  }}
                  style={{
                    background: '#ff9800',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  💳 {selectedInvoice.payment_status === 'Partially Paid' ? 'Submit Additional Payment' : 'Submit Payment'}
                </button>
              )}
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                style={{
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📄 Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          overflow: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1a1a2e' }}>💳 Submit Payment Receipt</h2>
            
            <div style={{ background: '#e3f2fd', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', color: '#1976d2', marginBottom: '8px' }}>
                Invoice: <strong>{selectedInvoice.invoice_number}</strong>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Amount Due: ₱{parseFloat(selectedInvoice.net_amount).toLocaleString()}
              </div>
            </div>

            <form onSubmit={handleSubmitPayment}>
              {/* Receipt Image Upload */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Upload Receipt Image *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
                {imagePreview && (
                  <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <img 
                      src={imagePreview} 
                      alt="Receipt preview" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px', 
                        borderRadius: '8px',
                        border: '2px solid #ddd'
                      }} 
                    />
                  </div>
                )}
              </div>

              {/* Receipt Number */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Receipt Number *
                </label>
                <input
                  type="text"
                  value={paymentForm.receipt_number}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receipt_number: e.target.value })}
                  required
                  placeholder="Enter receipt/reference number"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Payment Amount */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Payment Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={paymentForm.payment_amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_amount: e.target.value })}
                  required
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Payment Date */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.payment_date}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_date: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Payment Method *
                </label>
                <select
                  value={paymentForm.payment_method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                  <option value="Cash">Cash</option>
                  <option value="Online Payment">Online Payment</option>
                </select>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Additional Notes
                </label>
                <textarea
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={uploading}
                  style={{
                    background: '#fff',
                    color: '#666',
                    border: '1px solid #ddd',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    background: uploading ? '#ccc' : '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  {uploading ? 'Uploading...' : '✓ Submit Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Image Modal */}
      {showReceiptModal && selectedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a1a2e' }}>📷 Payment Receipt</h2>
              <button
                onClick={() => setShowReceiptModal(false)}
                style={{
                  background: '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕ Close
              </button>
            </div>

            {/* Receipt Details */}
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Receipt Number</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedReceipt.receipt_number}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Amount</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>₱{parseFloat(selectedReceipt.payment_amount).toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedReceipt.payment_date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Method</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedReceipt.payment_method}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Status</div>
                  <span style={{
                    background: getReceiptStatusColor(selectedReceipt.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {selectedReceipt.status}
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Uploaded</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {new Date(selectedReceipt.uploaded_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {selectedReceipt.notes && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Notes</div>
                  <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{selectedReceipt.notes}</div>
                </div>
              )}

              {selectedReceipt.review_notes && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#fff3e0', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Review Notes</div>
                  <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{selectedReceipt.review_notes}</div>
                  {selectedReceipt.reviewed_by_name && (
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                      Reviewed by: {selectedReceipt.reviewed_by_name} on {selectedReceipt.reviewed_at ? new Date(selectedReceipt.reviewed_at).toLocaleDateString() : 'N/A'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Receipt Image */}
            <div style={{ textAlign: 'center' }}>
              <img 
                src={`${selectedReceipt.receipt_image}`}
                alt="Payment Receipt" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '600px',
                  borderRadius: '8px',
                  border: '2px solid #ddd'
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {success && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#4caf50',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 2000,
          maxWidth: '400px'
        }}>
          ✓ {success}
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#f44336',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 2000,
          maxWidth: '400px'
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}