import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ClerkPenaltySupport() {
  const [projects, setProjects] = useState([]);
  const [slaTracking, setSlaTracking] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showDocModal, setShowDocModal] = useState(false);
  const [penaltyCalc, setPenaltyCalc] = useState(null);

  useEffect(() => {
    fetchDelayedProjects();
    fetchSLATracking();
  }, []);

  const fetchDelayedProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?is_delayed=true`);
      if (!response.ok) throw new Error('Failed to fetch delayed projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSLATracking = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sla-tracking/?is_breached=true`);
      if (!response.ok) throw new Error('Failed to fetch SLA tracking');
      const data = await response.json();
      setSlaTracking(data.results || data || []);
    } catch (err) {
      console.error('Error fetching SLA tracking:', err);
    }
  };

  const calculatePenalty = (delayDays, contractValue) => {
    // Formula: delay_days × 0.1% per day
    const penaltyRate = 0.001; // 0.1% per day
    const penaltyAmount = delayDays * penaltyRate * (contractValue || 0);
    return {
      delayDays,
      penaltyRate: '0.1% per day',
      contractValue,
      penaltyAmount: penaltyAmount.toFixed(2)
    };
  };

  const handlePrepareDocumentation = (project) => {
    const calc = calculatePenalty(project.delay_days || 0, parseFloat(project.contract_value || 0));
    setPenaltyCalc(calc);
    setSelectedProject(project);
    setShowDocModal(true);
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
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>📊 Penalty Documentation Support</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Assist with delay calculation and penalty documentation preparation
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Delayed Projects</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#f44336' }}>{projects.length}</div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>SLA Breaches</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>{slaTracking.length}</div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Avg Delay Days</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
            {projects.length > 0 
              ? Math.round(projects.reduce((sum, p) => sum + (p.delay_days || 0), 0) / projects.length)
              : 0}
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Est. Penalties</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c27b0' }}>
            {formatCurrency(projects.reduce((sum, p) => {
              const penalty = calculatePenalty(p.delay_days || 0, parseFloat(p.contract_value || 0));
              return sum + parseFloat(penalty.penaltyAmount);
            }, 0))}
          </div>
        </div>
      </div>

      {/* Delayed Projects Table */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>⏰ Delayed Projects Requiring Documentation</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading projects...</div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <div style={{ fontSize: '18px' }}>No delayed projects found</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#666' }}>Project Code</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#666' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#666' }}>Delay Days</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#666' }}>Contract Value</th>
                  <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: '#666' }}>Est. Penalty</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600', color: '#666' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => {
                  const penalty = calculatePenalty(project.delay_days || 0, parseFloat(project.contract_value || 0));
                  return (
                    <tr 
                      key={project.project_id}
                      style={{
                        borderBottom: '1px solid #e0e0e0',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f9f9f9'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                        {project.project_code}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: '#666' }}>
                        {project.vendor_name || project.vendor}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', fontWeight: '600', color: '#f44336' }}>
                        {project.delay_days} days
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', color: '#666' }}>
                        {formatCurrency(project.contract_value || 0)}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', textAlign: 'right', fontWeight: '600', color: '#9c27b0' }}>
                        {formatCurrency(penalty.penaltyAmount)}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handlePrepareDocumentation(project)}
                          style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500'
                          }}
                        >
                          📋 Prepare Docs
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Documentation Modal */}
      {showDocModal && selectedProject && penaltyCalc && (
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
              📋 Penalty Documentation
            </h2>

            {/* Project Info */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#667eea' }}>Project Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Project Code</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedProject.project_code}</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Vendor</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedProject.vendor_name || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Start Date</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Completion Date</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedProject.completion_date ? new Date(selectedProject.completion_date).toLocaleDateString() : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Penalty Calculation */}
            <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #ff9800' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#e65100' }}>
                ⚠️ Penalty Calculation (0.1% per day)
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Delay Days:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f44336' }}>
                    {penaltyCalc.delayDays} days
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Penalty Rate:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                    {penaltyCalc.penaltyRate}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Contract Value:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                    {formatCurrency(penaltyCalc.contractValue)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f44336', borderRadius: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Penalty Amount:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                    {formatCurrency(penaltyCalc.penaltyAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Documentation Checklist */}
            <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2e7d32' }}>
                ✅ Required Documentation
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>SLA breach notification date</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Delay calculation worksheet</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Supporting project timeline</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Vendor communication records</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Penalty memo draft</span>
                </label>
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Additional Notes
              </label>
              <textarea
                placeholder="Add any notes for the supervisor review..."
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
                  setShowDocModal(false);
                  setSelectedProject(null);
                  setPenaltyCalc(null);
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
                onClick={() => {
                  setSuccessMessage('Documentation prepared and forwarded to supervisor!');
                  setShowDocModal(false);
                  setSelectedProject(null);
                  setPenaltyCalc(null);
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
                📤 Forward to Supervisor
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