import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function SupervisorPenaltyReview() {
  const [penalties, setPenalties] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [reviewDecision, setReviewDecision] = useState({
    decision: 'approve',
    notes: ''
  });

  useEffect(() => {
    fetchPendingPenalties();
    fetchDelayedProjects();
  }, []);

  const fetchPendingPenalties = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/penalties/?penalty_status=Draft`);
      if (!response.ok) throw new Error('Failed to fetch pending penalties');
      const data = await response.json();
      setPenalties(data.results || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDelayedProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?is_delayed=true`);
      if (!response.ok) throw new Error('Failed to fetch delayed projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      console.error('Error fetching delayed projects:', err);
    }
  };

  const handleReviewPenalty = async () => {
    if (!selectedPenalty) return;

    try {
      const payload = {
        penalty_status: reviewDecision.decision === 'approve' ? 'Issued' : 'Draft',
        approved_by: JSON.parse(localStorage.getItem('user') || '{}').user_id,
        approval_date: new Date().toISOString(),
        notes: reviewDecision.notes
      };

      const response = await fetch(`${API_BASE_URL}/penalties/${selectedPenalty.id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to update penalty');

      setSuccessMessage(`Penalty ${reviewDecision.decision === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setShowReviewModal(false);
      setSelectedPenalty(null);
      setReviewDecision({ decision: 'approve', notes: '' });
      fetchPendingPenalties();
    } catch (err) {
      setError('Error reviewing penalty: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Open': '#ff9800',
      'Met': '#4caf50',
      'Breached': '#f44336',
      'Waived': '#2196f3'
    };
    return colors[status] || '#9e9e9e';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const calculatePenalty = (delayDays, contractValue) => {
    const penaltyRate = 0.001; // 0.1% per day
    return delayDays * penaltyRate * (contractValue || 0);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>⚖️ Penalty Review & Approval</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Review penalty memos and approve/reject based on SLA compliance
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowDashboard(true)}
              style={{
                background: showDashboard ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: showDashboard ? 'white' : '#666',
                border: showDashboard ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setShowDashboard(false)}
              style={{
                background: !showDashboard ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: !showDashboard ? 'white' : '#666',
                border: !showDashboard ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📋 Pending Reviews
            </button>
          </div>
        </div>
      </div>

      {showDashboard ? (
        <>
          {/* Dashboard View */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🟢 Active Projects</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
                {projects.filter(p => !p.is_delayed).length}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🟡 Delayed Projects</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
                {projects.filter(p => p.is_delayed && p.delay_days <= 7).length}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>🔴 Critical Delays</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>
                {projects.filter(p => p.delay_days > 7).length}
              </div>
            </div>
            
            <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>⚠️ Pending Penalties</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9c27b0' }}>
                {penalties.length}
              </div>
            </div>
          </div>

          {/* Color-Coded Project Status */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🎨 Project Status Monitor</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {projects.slice(0, 12).map((project) => {
                const statusColor = project.delay_days === 0 ? '#4caf50' : 
                                   project.delay_days <= 7 ? '#ff9800' : '#f44336';
                const statusIcon = project.delay_days === 0 ? '🟢' : 
                                  project.delay_days <= 7 ? '🟡' : '🔴';
                
                return (
                  <div
                    key={project.project_id}
                    style={{
                      border: `2px solid ${statusColor}`,
                      borderRadius: '12px',
                      padding: '16px',
                      background: `${statusColor}08`,
                      transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '24px' }}>{statusIcon}</span>
                      <h3 style={{ margin: 0, fontSize: '16px', color: '#1a1a2e' }}>
                        {project.project_code}
                      </h3>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      {project.project_name || 'Unnamed Project'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        Vendor: {project.vendor_name || 'N/A'}
                      </span>
                      <span style={{ 
                        fontSize: '14px', 
                        fontWeight: 'bold', 
                        color: statusColor,
                        padding: '4px 8px',
                        background: 'white',
                        borderRadius: '6px'
                      }}>
                        {project.delay_days === 0 ? 'On Time' : `${project.delay_days}d delay`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Pending Penalties Review */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📝 Pending Penalty Reviews</h2>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading penalties...</div>
            ) : penalties.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontSize: '18px' }}>No pending penalty reviews</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {penalties.map((penalty) => (
                  <div
                    key={penalty.id}
                    style={{
                      border: '2px solid #ff9800',
                      borderRadius: '12px',
                      padding: '20px',
                      background: '#fff8e1',
                      transition: 'box-shadow 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(255,152,0,0.3)'}
                    onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}>
                            Penalty #{penalty.id}
                          </h3>
                          <span style={{
                            background: '#ff9800',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            PENDING REVIEW
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
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336', marginBottom: '4px' }}>
                          {formatCurrency(penalty.penalty_amount)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {penalty.delay_days} days × 0.1%/day
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Violation Date</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                            {new Date(penalty.violation_date).toLocaleDateString()}
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
                            0.1% per day
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Created By</div>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                            {penalty.created_by_name || 'Clerk'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setSelectedPenalty(penalty);
                          setReviewDecision({ decision: 'approve', notes: '' });
                          setShowReviewModal(true);
                        }}
                        style={{
                          background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        ✅ Review & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedPenalty && (
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
              ⚖️ Review Penalty Memo
            </h2>

            {/* Penalty Details */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#667eea' }}>Penalty Details</h3>
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
                  <div style={{ color: '#666', marginBottom: '4px' }}>Delay Days</div>
                  <div style={{ fontWeight: '600', color: '#f44336' }}>{selectedPenalty.delay_days} days</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Penalty Amount</div>
                  <div style={{ fontWeight: '600', color: '#f44336' }}>
                    {formatCurrency(selectedPenalty.penalty_amount)}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Decision
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setReviewDecision({...reviewDecision, decision: 'approve'})}
                  style={{
                    flex: 1,
                    background: reviewDecision.decision === 'approve' ? '#4caf50' : '#fff',
                    color: reviewDecision.decision === 'approve' ? 'white' : '#666',
                    border: `2px solid ${reviewDecision.decision === 'approve' ? '#4caf50' : '#ddd'}`,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => setReviewDecision({...reviewDecision, decision: 'reject'})}
                  style={{
                    flex: 1,
                    background: reviewDecision.decision === 'reject' ? '#f44336' : '#fff',
                    color: reviewDecision.decision === 'reject' ? 'white' : '#666',
                    border: `2px solid ${reviewDecision.decision === 'reject' ? '#f44336' : '#ddd'}`,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  ❌ Reject
                </button>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Review Notes
              </label>
              <textarea
                value={reviewDecision.notes}
                onChange={(e) => setReviewDecision({...reviewDecision, notes: e.target.value})}
                placeholder="Add review notes..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedPenalty(null);
                  setReviewDecision({ decision: 'approve', notes: '' });
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
                onClick={handleReviewPenalty}
                style={{
                  background: reviewDecision.decision === 'approve' 
                    ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
                    : 'linear-gradient(45deg, #f44336, #e57373)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                {reviewDecision.decision === 'approve' ? '✅ Approve Penalty' : '❌ Reject Penalty'}
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