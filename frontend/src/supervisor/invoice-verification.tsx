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
  vendor_name?: string;
}

interface PaymentReceipt {
  receipt_id: number;
  invoice: number;
  invoice_number?: string;
  vendor_name?: string;
  receipt_image: string;
  receipt_number: string;
  payment_amount: string;
  payment_date: string;
  payment_method: string;
  notes: string;
  status: string;
  uploaded_at: string;
  uploaded_by_name?: string;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
}

interface Stats {
  total_receipts: number;
  pending: number;
  approved: number;
  rejected: number;
  total_amount_approved: number;
  total_amount_pending: number;
}

export default function SupervisorPaymentVerification() {
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<PaymentReceipt | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_receipts: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    total_amount_approved: 0,
    total_amount_pending: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState('PENDING');
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const getAuthToken = () => {
    return localStorage.getItem('auth_token');
  };

  const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    
    return headers;
  };

  useEffect(() => {
    fetchPaymentReceipts();
    fetchStatistics();
  }, [filter]);

  const fetchPaymentReceipts = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/payment-receipts/`;
      if (filter !== 'ALL') {
        url += `?status=${filter}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch payment receipts');
      
      const data = await response.json();
      const receiptList = data.results || data || [];
      
      // Fetch invoice details for each receipt
      const enrichedReceipts = await Promise.all(
        receiptList.map(async (receipt: PaymentReceipt) => {
          try {
            const invoiceResponse = await fetch(
              `${API_BASE_URL}/invoices/${receipt.invoice}/`,
              { headers: getAuthHeaders() }
            );
            if (invoiceResponse.ok) {
              const invoice = await invoiceResponse.json();
              return {
                ...receipt,
                invoice_number: invoice.invoice_number,
                vendor_name: invoice.vendor_name || `Vendor ${invoice.vendor_id}`
              };
            }
          } catch (err) {
            console.error('Error fetching invoice:', err);
          }
          return receipt;
        })
      );
      
      setReceipts(enrichedReceipts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment receipts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment-receipts/statistics/`, {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const handleReviewReceipt = (receipt: PaymentReceipt, action: 'approve' | 'reject') => {
    setSelectedReceipt(receipt);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const handleViewImage = (receipt: PaymentReceipt) => {
    setSelectedReceipt(receipt);
    setShowImageModal(true);
  };

  const submitReview = async () => {
    if (!selectedReceipt) return;

    if (reviewAction === 'reject' && !reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    
    try {
      const endpoint = reviewAction === 'approve' ? 'approve' : 'reject';
      const response = await fetch(
        `${API_BASE_URL}/payment-receipts/${selectedReceipt.receipt_id}/${endpoint}/`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            review_notes: reviewNotes
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${reviewAction} receipt`);
      }

      const result = await response.json();
      setSuccess(result.message || `Receipt ${reviewAction}d successfully!`);
      setShowReviewModal(false);
      
      // Refresh data
      fetchPaymentReceipts();
      fetchStatistics();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${reviewAction} receipt`);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return '#4caf50';
      case 'PENDING': return '#ff9800';
      case 'REJECTED': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED': return '✓';
      case 'PENDING': return '⏳';
      case 'REJECTED': return '✗';
      default: return '?';
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
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🔍 Payment Receipt Verification</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Review and approve vendor payment receipts
        </p>
      </div>

      {/* Statistics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(102,126,234,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Receipts</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.total_receipts}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>All time</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(245,87,108,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Review</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.pending}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            ₱{stats.total_amount_pending.toLocaleString()}
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(0,242,254,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Approved</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.approved}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
            ₱{stats.total_amount_approved.toLocaleString()}
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(250,112,154,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Rejected</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.rejected}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>Requires resubmission</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((status) => (
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
              {status === 'ALL' ? 'All Receipts' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Receipts Table */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Payment Receipts</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading receipts...</div>
        ) : receipts.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Receipt #</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Invoice #</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Payment Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Method</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Submitted</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1a1a2e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr key={receipt.receipt_id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', color: '#1a1a2e', fontFamily: 'monospace', fontWeight: 'bold' }}>
                      {receipt.receipt_number}
                    </td>
                    <td style={{ padding: '12px', color: '#1a1a2e', fontFamily: 'monospace' }}>
                      {receipt.invoice_number || `#${receipt.invoice}`}
                    </td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>
                      {receipt.vendor_name || 'Unknown'}
                    </td>
                    <td style={{ padding: '12px', color: '#1a1a2e', fontWeight: 'bold', fontSize: '15px' }}>
                      ₱{parseFloat(receipt.payment_amount).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>
                      {new Date(receipt.payment_date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>
                      {receipt.payment_method}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        background: getStatusColor(receipt.status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {getStatusIcon(receipt.status)} {receipt.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#666', fontSize: '13px' }}>
                      {new Date(receipt.uploaded_at).toLocaleDateString()}<br/>
                      <span style={{ fontSize: '11px' }}>
                        {receipt.uploaded_by_name || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleViewImage(receipt)}
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
                          📷 View
                        </button>
                        {receipt.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleReviewReceipt(receipt, 'approve')}
                              style={{
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleReviewReceipt(receipt, 'reject')}
                              style={{
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✗ Reject
                            </button>
                          </>
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
            No payment receipts found
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReceipt && (
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
          padding: '20px'
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
            <h2 style={{ 
              margin: '0 0 20px 0', 
              color: '#1a1a2e',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {reviewAction === 'approve' ? '✓ Approve' : '✗ Reject'} Payment Receipt
            </h2>
            
            {/* Receipt Summary */}
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Receipt Number</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedReceipt.receipt_number}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Amount</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    ₱{parseFloat(selectedReceipt.payment_amount).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Invoice</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedReceipt.invoice_number || `#${selectedReceipt.invoice}`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Vendor</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedReceipt.vendor_name || 'Unknown'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {new Date(selectedReceipt.payment_date).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Method</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedReceipt.payment_method}
                  </div>
                </div>
              </div>

              {selectedReceipt.notes && (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Vendor Notes</div>
                  <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{selectedReceipt.notes}</div>
                </div>
              )}
            </div>

            {/* Review Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Review Notes {reviewAction === 'reject' && <span style={{ color: '#f44336' }}>*</span>}
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  reviewAction === 'approve' 
                    ? 'Optional: Add any comments about this approval...'
                    : 'Required: Explain why this receipt is being rejected...'
                }
                rows={4}
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

            {/* Preview Image */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>
                Receipt Image Preview
              </div>
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={`${selectedReceipt.receipt_image}`}
                  alt="Receipt preview" 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '300px',
                    borderRadius: '8px',
                    border: '2px solid #ddd',
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setShowReviewModal(false);
                    handleViewImage(selectedReceipt);
                  }}
                />
                <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Click image to view full size
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReviewModal(false)}
                disabled={processing}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: processing ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={processing || (reviewAction === 'reject' && !reviewNotes.trim())}
                style={{
                  background: processing 
                    ? '#ccc' 
                    : reviewAction === 'approve' 
                      ? '#4caf50' 
                      : '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: (processing || (reviewAction === 'reject' && !reviewNotes.trim())) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {processing 
                  ? 'Processing...' 
                  : reviewAction === 'approve' 
                    ? '✓ Approve Receipt' 
                    : '✗ Reject Receipt'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedReceipt && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
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
            maxWidth: '95vw',
            maxHeight: '95vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#1a1a2e' }}>
                📷 Receipt Image - {selectedReceipt.receipt_number}
              </h2>
              <button
                onClick={() => setShowImageModal(false)}
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
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Receipt Number</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedReceipt.receipt_number}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Invoice</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedReceipt.invoice_number || `#${selectedReceipt.invoice}`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Amount</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    ₱{parseFloat(selectedReceipt.payment_amount).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Status</div>
                  <span style={{
                    background: getStatusColor(selectedReceipt.status),
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {getStatusIcon(selectedReceipt.status)} {selectedReceipt.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Image */}
            <div style={{ textAlign: 'center' }}>
              <img 
                src={`${selectedReceipt.receipt_image}`}
                alt="Payment Receipt" 
                style={{ 
                  maxWidth: '100%',
                  maxHeight: '70vh',
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
          zIndex: 3000,
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
          zIndex: 3000,
          maxWidth: '400px'
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}