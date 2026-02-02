import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function TeamLeaderBillingOversight() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({
    pending_review: 0,
    total_value: 0,
    high_value_count: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filters, setFilters] = useState({
    min_amount: 100000, // High-value threshold
    status: 'Unpaid'
  });

  useEffect(() => {
    fetchPendingInvoices();
  }, [filters]);

  const fetchPendingInvoices = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/invoices/?payment_status=${filters.status}&approved_by__isnull=true`
      );

      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      const allInvoices = data.results || data || [];
      console.log('Fetched Invoices:', allInvoices);
      
      // Filter high-value invoices
      const highValueInvoices = allInvoices.filter(inv => 
        parseFloat(inv.net_amount || 0) >= filters.min_amount
      );
      
      setInvoices(highValueInvoices);
       
      // Calculate stats
      const totalValue = highValueInvoices.reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
      setStats({
        pending_review: highValueInvoices.length,
        total_value: totalValue,
        high_value_count: highValueInvoices.filter(inv => parseFloat(inv.net_amount || 0) >= 500000).length
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewInvoice = async (invoice) => {
    setSelectedInvoice(invoice);
    setShowReviewModal(true);
  };

  const handleApproveForFinance = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').user_id || 0;
      
      // Update invoice with Team Leader approval
      const response = await fetch(`${API_BASE_URL}/invoices/${selectedInvoice.invoice_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: `Team Leader approved: ${new Date().toISOString()}`,
          approved_by: userId,
          approval_date: new Date().toISOString(),
          // Additional Team Leader approval flag could be added to model
        })
      });

      if (!response.ok) throw new Error('Failed to approve invoice');

      // Send notification to Finance (this would be handled by backend)
      setSuccessMessage(`Invoice ${selectedInvoice.invoice_number} approved and routed to Finance`);
      setShowReviewModal(false);
      fetchPendingInvoices();
    } catch (err) {
      setError('Error approving invoice: ' + err.message);
    }
  };

  const getValueCategory = (amount) => {
    if (amount >= 1000000) return { label: 'Very High', color: '#f44336' };
    if (amount >= 500000) return { label: 'High', color: '#ff9800' };
    if (amount >= 100000) return { label: 'Medium', color: '#2196f3' };
    return { label: 'Standard', color: '#4caf50' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🔍 Financial Oversight</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Review high-value invoices and financial metrics
        </p>
      </div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(102,126,234,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Review</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.pending_review}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(245,87,108,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Billing Value</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>₱{stats.total_value.toLocaleString()}</div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(254,225,64,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>High-Value Invoices</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{stats.high_value_count}</div>
          <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>≥ ₱500,000</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e', fontSize: '14px' }}>
              Minimum Amount
            </label>
            <input
              type="number"
              value={filters.min_amount}
              onChange={(e) => setFilters({...filters, min_amount: parseInt(e.target.value) || 0})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e', fontSize: '14px' }}>
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
            >
              <option value="Unpaid">Unpaid</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>
      </div>

      {/* High-Value Invoices Table */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>💎 High-Value Invoices</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading invoices...</div>
        ) : invoices.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Invoice #</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Project</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Net Amount</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1a1a2e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const category = getValueCategory(parseFloat(invoice.net_amount || 0));
                  return (
                    <tr key={invoice.invoice_number} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px', color: '#1a1a2e', fontFamily: 'monospace' }}>{invoice.invoice_number}</td>
                      <td style={{ padding: '12px', color: '#1a1a2e' }}>{invoice.project_code || 'N/A'}</td>
                      <td style={{ padding: '12px', color: '#1a1a2e' }}>{invoice.vendor_name || 'N/A'}</td>
                      <td style={{ padding: '12px', color: '#1a1a2e', fontWeight: 'bold', fontSize: '16px' }}>
                        ₱{parseFloat(invoice.net_amount || 0).toLocaleString()}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          background: category.color,
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {category.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', color: '#1a1a2e' }}>{invoice.invoice_date || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleReviewInvoice(invoice)}
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
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No high-value invoices pending review
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedInvoice && (
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1a1a2e' }}>🔍 Invoice Review</h2>
            
            {/* Invoice Details */}
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
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Project Code</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedInvoice.project_code || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Vendor</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>{selectedInvoice.vendor_name || 'N/A'}</div>
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

            {/* Approval Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>Review Notes</label>
              <textarea
                placeholder="Add your review notes here..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  minHeight: '100px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowReviewModal(false)}
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
                Cancel
              </button>
              <button
                onClick={handleApproveForFinance}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Approve & Route to Finance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#4caf50',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 2000
        }}>
          ✅ {successMessage}
        </div>
      )}
      
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