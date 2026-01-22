import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function VendorPenaltyView() {
  const [penalties, setPenalties] = useState([]);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [vendorId, setVendorId] = useState('');
  
  const [disputeData, setDisputeData] = useState({
    dispute_subject: '',
    dispute_description: '',
    dispute_type: 'Penalty Amount'
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const vId = userData.user_id || '1';
    setVendorId(vId);
    fetchPenalties(vId);
  }, []);

  const fetchPenalties = async (vId) => {
    setLoading(true);
    try {
      const vendorResponse = await fetch(`${API_BASE_URL}/vendors/?user_id=${vId}`);
      const vendorData = await vendorResponse.json();

      const vendorId = vendorData.results[0].vendor_id;
      const response = await fetch(`${API_BASE_URL}/penalties/?vendor=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch penalties');
      const data = await response.json();
      setPenalties(data.results || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDispute = async () => {
    if (!selectedPenalty || !disputeData.dispute_description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const payload = {
        vendor: vendorId,
        project: selectedPenalty.project,
        related_penalty: selectedPenalty.id,
        ...disputeData
      };

      const response = await fetch(`${API_BASE_URL}/vendor-disputes/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to submit dispute');

      setSuccessMessage('Dispute submitted successfully!');
      setShowDisputeModal(false);
      fetchPenalties(vendorId);
      setDisputeData({ dispute_subject: '', dispute_description: '', dispute_type: 'Penalty Amount' });
    } catch (err) {
      setError('Error submitting dispute: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return '#9e9e9e';
      case 'Issued': return '#ff9800';
      case 'Paid': return '#4caf50';
      case 'Waived': return '#2196f3';
      case 'Disputed': return '#f44336';
      default: return '#757575';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>⚠️ Penalty Notifications</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          View penalty details and submit disputes if needed
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Penalties</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e' }}>{penalties.length}</div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Pending Payment</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
            {penalties.filter(p => p.penalty_status === 'Issued').length}
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Amount</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>
            {formatCurrency(penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0))}
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Disputed</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
            {penalties.filter(p => p.penalty_status === 'Disputed').length}
          </div>
        </div>
      </div>

      {/* Penalties List */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Penalty Records</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading penalties...</div>
        ) : penalties.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '18px' }}>No penalties found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {penalties.map((penalty) => (
              <div
                key={penalty.id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  transition: 'box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}>
                        Penalty #{penalty.id}
                      </h3>
                      <span style={{
                        background: getStatusColor(penalty.penalty_status),
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {penalty.penalty_status}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                      Project: {penalty.project_code || penalty.project}
                    </p>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                      Violation Date: {new Date(penalty.violation_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336', marginBottom: '4px' }}>
                      {formatCurrency(penalty.penalty_amount)}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {penalty.delay_days} days delay
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Violation Type</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                        {penalty.penalty_rule_name || 'SLA Breach'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Issue Date</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                        {penalty.issue_date ? new Date(penalty.issue_date).toLocaleDateString() : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Payment Date</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                        {penalty.payment_date ? new Date(penalty.payment_date).toLocaleDateString() : 'Not Paid'}
                      </div>
                    </div>
                  </div>
                </div>

                {penalty.dispute_reason && (
                  <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '8px', marginBottom: '12px', borderLeft: '4px solid #ff9800' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e65100', marginBottom: '4px' }}>
                      DISPUTE SUBMITTED
                    </div>
                    <div style={{ fontSize: '14px', color: '#1a1a2e' }}>{penalty.dispute_reason}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      setSelectedPenalty(penalty);
                      setDisputeData({
                        dispute_subject: `Penalty Dispute - ${penalty.project_code}`,
                        dispute_description: '',
                        dispute_type: 'Penalty Amount'
                      });
                      setShowDisputeModal(true);
                    }}
                    disabled={penalty.penalty_status === 'Disputed' || penalty.penalty_status === 'Paid'}
                    style={{
                      background: penalty.penalty_status === 'Disputed' || penalty.penalty_status === 'Paid' ? '#e0e0e0' : '#2196f3',
                      color: penalty.penalty_status === 'Disputed' || penalty.penalty_status === 'Paid' ? '#999' : 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: penalty.penalty_status === 'Disputed' || penalty.penalty_status === 'Paid' ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    📝 Submit Dispute
                  </button>
                  
                  <button
                    style={{
                      background: '#fff',
                      color: '#666',
                      border: '1px solid #ddd',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    📄 View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dispute Modal */}
      {showDisputeModal && (
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📝 Submit Penalty Dispute</h2>
            
            {selectedPenalty && (
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                  Penalty Amount: <strong style={{ color: '#f44336', fontSize: '18px' }}>
                    {formatCurrency(selectedPenalty.penalty_amount)}
                  </strong>
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Delay Days: {selectedPenalty.delay_days} days
                </div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Dispute Type
              </label>
              <select
                value={disputeData.dispute_type}
                onChange={(e) => setDisputeData({...disputeData, dispute_type: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <option value="Penalty Amount">Penalty Amount</option>
                <option value="Delay Calculation">Delay Calculation</option>
                <option value="SLA Interpretation">SLA Interpretation</option>
                <option value="Force Majeure">Force Majeure</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Subject
              </label>
              <input
                type="text"
                value={disputeData.dispute_subject}
                onChange={(e) => setDisputeData({...disputeData, dispute_subject: e.target.value})}
                placeholder="Brief subject of dispute"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Detailed Explanation
              </label>
              <textarea
                value={disputeData.dispute_description}
                onChange={(e) => setDisputeData({...disputeData, dispute_description: e.target.value})}
                placeholder="Provide detailed explanation for your dispute..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '150px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDisputeModal(false);
                  setDisputeData({ dispute_subject: '', dispute_description: '', dispute_type: 'Penalty Amount' });
                }}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitDispute}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Submit Dispute
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
          zIndex: 2000,
          fontSize: '14px'
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
          zIndex: 2000,
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}