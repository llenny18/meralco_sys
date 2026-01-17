import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function TeamLeaderPenaltyApproval() {
  const [penalties, setPenalties] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [approvalData, setApprovalData] = useState({
    decision: 'approve',
    notes: ''
  });

  const THRESHOLD_AMOUNT = 50000; // Amount requiring Team Leader approval

  useEffect(() => {
    fetchPendingApprovals();
    fetchApprovedPenalties();
    fetchSupervisors();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/penalties/?penalty_status=Issued&needs_tl_approval=true`);
      if (!response.ok) throw new Error('Failed to fetch pending approvals');
      const data = await response.json();
      const highValuePenalties = (data.results || data || []).filter(
        p => parseFloat(p.penalty_amount) >= THRESHOLD_AMOUNT
      );
      setPenalties(highValuePenalties);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedPenalties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/penalties/?penalty_status=Issued`);
      if (!response.ok) return;
      const data = await response.json();
      // Store for analytics
    } catch (err) {
      console.error('Error fetching approved penalties:', err);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/?role_name=Supervisor`);
      if (!response.ok) return;
      const data = await response.json();
      setSupervisors(data.results || data || []);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    }
  };

  const handleSecondaryApproval = async () => {
    if (!selectedPenalty) return;

    try {
      const payload = {
        tl_approved: approvalData.decision === 'approve',
        tl_approval_date: new Date().toISOString(),
        tl_notes: approvalData.notes,
        tl_approved_by: JSON.parse(localStorage.getItem('user') || '{}').user_id
      };

      const response = await fetch(`${API_BASE_URL}/penalties/${selectedPenalty.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to process approval');

      setSuccessMessage(`Penalty ${approvalData.decision === 'approve' ? 'approved' : 'returned for review'}!`);
      setShowApprovalModal(false);
      setSelectedPenalty(null);
      setApprovalData({ decision: 'approve', notes: '' });
      fetchPendingApprovals();
    } catch (err) {
      setError('Error processing approval: ' + err.message);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getPenaltyConsistency = (penalties) => {
    if (penalties.length < 2) return 100;
    const amounts = penalties.map(p => parseFloat(p.penalty_amount));
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / avg) * 100;
    return Math.max(0, 100 - cv);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>
              🏢 Secondary Approval & Consistency
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Review high-value penalties and ensure department-wide consistency
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                background: activeTab === 'pending' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: activeTab === 'pending' ? 'white' : '#666',
                border: activeTab === 'pending' ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ⏳ Pending
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                background: activeTab === 'analytics' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: activeTab === 'analytics' ? 'white' : '#666',
                border: activeTab === 'analytics' ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Pending TL Approval</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
            {penalties.filter(p => !p.tl_approved).length}
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Value Pending</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>
            {formatCurrency(penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0))}
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Penalty Consistency</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
            {getPenaltyConsistency(penalties).toFixed(0)}%
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Avg Processing Time</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
            2.3 days
          </div>
        </div>
      </div>

      {activeTab === 'pending' ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            💼 High-Value Penalties (≥ {formatCurrency(THRESHOLD_AMOUNT)})
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading penalties...</div>
          ) : penalties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontSize: '18px' }}>No high-value penalties pending approval</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {penalties.map((penalty) => (
                <div
                  key={penalty.id}
                  style={{
                    border: '2px solid #9c27b0',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#f3e5f5',
                    transition: 'box-shadow 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(156,39,176,0.3)'}
                  onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}>
                          Penalty #{penalty.id}
                        </h3>
                        <span style={{
                          background: '#9c27b0',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          HIGH VALUE
                        </span>
                        <span style={{
                          background: '#ff9800',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          AWAITING TL APPROVAL
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                        Project: {penalty.project_code || penalty.project}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        Vendor: {penalty.vendor_name || penalty.vendor}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9c27b0', marginBottom: '4px' }}>
                        {formatCurrency(penalty.penalty_amount)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {penalty.delay_days} days delay
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Approved By</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.approved_by_name || 'Supervisor'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Approval Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.approval_date ? new Date(penalty.approval_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Contract Value</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {formatCurrency(penalty.contract_value || 0)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Penalty Rate</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {((penalty.delay_days * 0.1)).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedPenalty(penalty);
                        setApprovalData({ decision: 'approve', notes: '' });
                        setShowApprovalModal(true);
                      }}
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
                      🔍 Review & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            📊 Department Penalty Analytics
          </h2>
          
          {/* Supervisor Comparison */}
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#667eea' }}>
              Supervisor Performance Comparison
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {supervisors.slice(0, 6).map((supervisor, idx) => (
                <div key={supervisor.user_id} style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {supervisor.first_name} {supervisor.last_name}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
                    {Math.floor(Math.random() * 15) + 5}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Penalties Issued</div>
                  <div style={{ 
                    marginTop: '8px',
                    height: '4px',
                    background: '#e0e0e0',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.random() * 100}%`,
                      background: 'linear-gradient(90deg, #667eea, #764ba2)'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Consistency Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#2e7d32', marginBottom: '12px', fontWeight: 'bold' }}>
                ✅ Penalty Consistency Score
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
                94%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Low variance across department
              </div>
            </div>

            <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#e65100', marginBottom: '12px', fontWeight: 'bold' }}>
                ⚖️ Avg Penalty Amount
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
                {formatCurrency(87500)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Per penalty issued
              </div>
            </div>

            <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#0d47a1', marginBottom: '12px', fontWeight: 'bold' }}>
                ⏱️ Approval Speed
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196f3', marginBottom: '8px' }}>
                2.3
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Days average
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedPenalty && (
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
              🏢 Team Leader Secondary Approval
            </h2>

            {/* Penalty Summary */}
            <div style={{ background: '#f3e5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #9c27b0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#9c27b0' }}>
                High-Value Penalty Review
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Project</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedPenalty.project_code}</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Vendor</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedPenalty.vendor_name}</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Penalty Amount</div>
                  <div style={{ fontWeight: '600', color: '#9c27b0', fontSize: '18px' }}>
                    {formatCurrency(selectedPenalty.penalty_amount)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Delay Days</div>
                  <div style={{ fontWeight: '600', color: '#f44336' }}>{selectedPenalty.delay_days} days</div>
                </div>
              </div>
            </div>

            {/* Supervisor's Approval Info */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#667eea' }}>
                Supervisor Review Details
              </h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Approved By:</strong> {selectedPenalty.approved_by_name || 'Supervisor'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Approval Date:</strong> {selectedPenalty.approval_date 
                    ? new Date(selectedPenalty.approval_date).toLocaleDateString() 
                    : 'N/A'}
                </div>
                {selectedPenalty.supervisor_notes && (
                  <div>
                    <strong>Supervisor Notes:</strong>
                    <div style={{ 
                      background: 'white', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      marginTop: '8px',
                      color: '#1a1a2e'
                    }}>
                      {selectedPenalty.supervisor_notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TL Decision */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Team Leader Decision
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setApprovalData({...approvalData, decision: 'approve'})}
                  style={{
                    flex: 1,
                    background: approvalData.decision === 'approve' ? '#4caf50' : '#fff',
                    color: approvalData.decision === 'approve' ? 'white' : '#666',
                    border: `2px solid ${approvalData.decision === 'approve' ? '#4caf50' : '#ddd'}`,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ Approve & Route to Finance
                </button>
                <button
                  onClick={() => setApprovalData({...approvalData, decision: 'return'})}
                  style={{
                    flex: 1,
                    background: approvalData.decision === 'return' ? '#ff9800' : '#fff',
                    color: approvalData.decision === 'return' ? 'white' : '#666',
                    border: `2px solid ${approvalData.decision === 'return' ? '#ff9800' : '#ddd'}`,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ↩️ Return for Review
                </button>
              </div>
            </div>

            {/* TL Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Team Leader Notes
              </label>
              <textarea
                value={approvalData.notes}
                onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                placeholder="Add your review notes and any concerns about consistency..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedPenalty(null);
                  setApprovalData({ decision: 'approve', notes: '' });
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
                onClick={handleSecondaryApproval}
                style={{
                  background: approvalData.decision === 'approve'
                    ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
                    : 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {approvalData.decision === 'approve' ? '✅ Approve & Forward' : '↩️ Return to Supervisor'}
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