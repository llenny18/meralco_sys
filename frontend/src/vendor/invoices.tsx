import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function VendorInvoiceTracking() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total_invoices: 0,
    total_pending: 0,
    total_paid: 0,
    pending_amount: 0,
    paid_amount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [vendorId, setVendorId] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const storedVendorId = JSON.parse(localStorage.getItem('user') || '{}').user_id || '';
    setVendorId(storedVendorId);
    if (storedVendorId) {
      fetchVendorInvoices(storedVendorId);
    }
  }, [filter]);

  const fetchVendorInvoices = async (vId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/?vendor=${vId}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      let invoiceList = data.results || data || [];
      
      // Apply filter
      if (filter !== 'all') {
        invoiceList = invoiceList.filter(inv => inv.payment_status === filter);
      }
      
      setInvoices(invoiceList);
      
      // Calculate stats
      const totalPending = invoiceList.filter(inv => inv.payment_status === 'Unpaid').length;
      const totalPaid = invoiceList.filter(inv => inv.payment_status === 'Paid').length;
      const pendingAmount = invoiceList
        .filter(inv => inv.payment_status === 'Unpaid')
        .reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
      const paidAmount = invoiceList
        .filter(inv => inv.payment_status === 'Paid')
        .reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
      
      setStats({
        total_invoices: invoiceList.length,
        total_pending: totalPending,
        total_paid: totalPaid,
        pending_amount: pendingAmount,
        paid_amount: paidAmount
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  const handleDownloadPDF = (invoice) => {
    // This would trigger PDF download from backend
    setError('PDF download will be implemented by backend');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Paid': return '#4caf50';
      case 'Unpaid': return '#f44336';
      case 'Partially Paid': return '#ff9800';
      case 'Overdue': return '#d32f2f';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>💵 My Invoices & Payments</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Track your billing and payment status
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
                      ₱{parseFloat(invoice.net_amount || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px' }}>
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
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
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
                  <span style={{ fontWeight: 'bold', color: '#1a1a2e' }}>₱{parseFloat(selectedInvoice.invoice_amount || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#f44336' }}>Penalties:</span>
                  <span style={{ fontWeight: 'bold', color: '#f44336' }}>-₱{parseFloat(selectedInvoice.penalty_amount || 0).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#667eea', marginLeft: '-20px', marginRight: '-20px', marginBottom: '-20px', borderRadius: '0 0 12px 12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Net Amount:</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>₱{parseFloat(selectedInvoice.net_amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div style={{ background: selectedInvoice.payment_status === 'Paid' ? '#e8f5e9' : '#fff3e0', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: `1px solid ${selectedInvoice.payment_status === 'Paid' ? '#4caf50' : '#ff9800'}` }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1a1a2e' }}>💳 Payment Status</h4>
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
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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

      {/* Notifications */}
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