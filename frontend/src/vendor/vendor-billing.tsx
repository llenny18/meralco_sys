import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function VendorPaymentTracking() {
  const [invoices, setInvoices] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const userRole = localStorage?.getItem('userRole');
    if (userRole !== 'vendor') {
      window.location.href = '/unauthorized';
      return;
    }
    
    const storedVendorId = JSON.parse(localStorage?.getItem('user'))?.vendor_id || '1';
    setVendorId(storedVendorId);
    fetchInvoices(storedVendorId);
    fetchPerformance(storedVendorId);
  }, []);

  const fetchInvoices = async (vId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/?vendor=${vId}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data.results || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformance = async (vId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-performance/?vendor=${vId}`);
      if (!response.ok) throw new Error('Failed to fetch performance');
      const data = await response.json();
      const records = data.results || data || [];
      if (records.length > 0) {
        setPerformanceData(records[0]);
      }
    } catch (err) {
      console.error('Error fetching performance:', err);
    }
  };

  const downloadInvoice = (invoice) => {
    // In a real app, this would generate/download the PDF
    alert(`Downloading invoice ${invoice.invoice_number}`);
  };

  const downloadReceipt = (invoice) => {
    // In a real app, this would download the payment receipt
    alert(`Downloading receipt for payment ${invoice.payment_reference}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#4caf50';
      case 'Unpaid': return '#ff9800';
      case 'Partially Paid': return '#2196f3';
      case 'Overdue': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>💳 Payment & Invoice Tracking</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Phase 6: Monitor your invoices and payments</p>
      </div>

      {/* Performance Scorecard */}
      {performanceData && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>⭐ Performance Scorecard</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>On-Time Rate</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>
                {performanceData.on_time_rate || 0}%
              </p>
            </div>
            <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Quality Pass Rate</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>
                {performanceData.quality_score || 0}%
              </p>
            </div>
            <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>SLA Compliance</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                {performanceData.compliance_score || 0}%
              </p>
            </div>
            <div style={{ background: '#fce4ec', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Overall Rating</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#e91e63' }}>
                {performanceData.overall_rating || 0}/5
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices List */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📄 Invoices & Payments</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No invoices yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.map((invoice) => {
              const daysUntilDue = getDaysUntilDue(invoice.due_date);
              return (
                <div
                  key={invoice.invoice_number}
                  style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>
                        {invoice.invoice_number}
                      </h3>
                      <span style={{
                        background: getStatusColor(invoice.payment_status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {invoice.payment_status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Project:</strong> {invoice.project_code || 'N/A'}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Invoice Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      <strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}
                      {daysUntilDue > 0 && invoice.payment_status !== 'Paid' && (
                        <span style={{ color: daysUntilDue <= 7 ? '#f44336' : '#ff9800', marginLeft: '8px' }}>
                          ({daysUntilDue} days remaining)
                        </span>
                      )}
                    </p>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#4caf50' }}>
                      Net Amount: ₱{parseFloat(invoice.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    {invoice.penalty_amount > 0 && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#f44336' }}>
                        Penalties Applied: -₱{parseFloat(invoice.penalty_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => { setSelectedInvoice(invoice); setShowInvoiceModal(true); }}
                      style={{
                        background: '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => downloadInvoice(invoice)}
                      style={{
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      📥 Download Invoice
                    </button>
                    {invoice.payment_status === 'Paid' && (
                      <button
                        onClick={() => downloadReceipt(invoice)}
                        style={{
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        📄 Download Receipt
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {showInvoiceModal && selectedInvoice && (
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
            <h2 style={{ margin: '0 0 20px 0', color: '#1a1a2e' }}>Invoice Details</h2>
            
            <div style={{ marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Invoice Number:</strong> {selectedInvoice.invoice_number}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Status:</strong> 
                <span style={{
                  marginLeft: '8px',
                  background: getStatusColor(selectedInvoice.payment_status),
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}>
                  {selectedInvoice.payment_status}
                </span>
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Invoice Date:</strong> {new Date(selectedInvoice.invoice_date).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Due Date:</strong> {new Date(selectedInvoice.due_date).toLocaleDateString()}
              </p>
              {selectedInvoice.payment_date && (
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Payment Date:</strong> {new Date(selectedInvoice.payment_date).toLocaleDateString()}
                </p>
              )}
              {selectedInvoice.payment_reference && (
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Payment Reference:</strong> {selectedInvoice.payment_reference}
                </p>
              )}
            </div>

            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '16px', color: '#1a1a2e' }}>Invoice Amount:</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  ₱{parseFloat(selectedInvoice.invoice_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {selectedInvoice.penalty_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px', color: '#f44336' }}>Penalties:</span>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f44336' }}>
                    -₱{parseFloat(selectedInvoice.penalty_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div style={{ borderTop: '2px solid #ddd', paddingTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e' }}>Net Amount:</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                  ₱{parseFloat(selectedInvoice.net_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {selectedInvoice.notes && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1a1a2e' }}>Notes</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{selectedInvoice.notes}</p>
              </div>
            )}

            <button
              onClick={() => setShowInvoiceModal(false)}
              style={{
                width: '100%',
                background: '#667eea',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Close
            </button>
          </div>
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
          zIndex: 2000
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}