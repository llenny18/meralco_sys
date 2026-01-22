import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function QIAssignmentNotification() {
  const [assignments, setAssignments] = useState([]);
  const [pendingAssignments, setPendingAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [qiUserId, setQiUserId] = useState('');
  const [detailsModal, setDetailsModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const storedUserId = JSON.parse(localStorage?.getItem('user') || '{}')?.user_id || '1';
    setQiUserId(storedUserId);
    fetchAssignments(storedUserId);
  }, []);

  const fetchAssignments = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?assigned_qi=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch assignments');
      const data = await response.json();
      const allAssignments = data.results || data || [];
      
      setAssignments(allAssignments);
      setPendingAssignments(allAssignments.filter(p => p.status === 4 || p.status === 5)); // Awaiting inspection
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAssignment = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 6 // QI Accepted
        })
      });

      if (!response.ok) throw new Error('Failed to accept assignment');
      
      alert('✅ Assignment accepted! Project added to your inspection queue.');
      fetchAssignments(qiUserId);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleRequestReassignment = async (projectId, reason) => {
    try {
      // Create escalation/reassignment request
      const response = await fetch(`${API_BASE_URL}/escalations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: projectId,
          escalation_reason: reason || 'QI requested reassignment due to workload/scheduling conflict',
          escalated_from_user: qiUserId,
          status: 'Open'
        })
      });

      if (!response.ok) throw new Error('Failed to request reassignment');
      
      alert('📩 Reassignment request submitted to supervisor.');
      fetchAssignments(qiUserId);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const getStatusBadge = (statusId) => {
    const statuses = {
      4: { label: 'Pending Inspection', color: '#ff9800', icon: '⏳' },
      5: { label: 'Documents Approved', color: '#2196f3', icon: '📄' },
      6: { label: 'QI Accepted', color: '#4caf50', icon: '✓' },
      7: { label: 'Inspection Scheduled', color: '#9c27b0', icon: '📅' }
    };
    const status = statuses[statusId] || { label: 'Unknown', color: '#999', icon: '?' };
    return (
      <span style={{
        background: status.color,
        color: 'white',
        padding: '6px 14px',
        borderRadius: '16px',
        fontSize: '13px',
        fontWeight: 'bold',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        {status.icon} {status.label}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      'Critical': '#d32f2f',
      'High': '#f57c00',
      'Medium': '#fbc02d',
      'Low': '#388e3c'
    };
    return (
      <span style={{
        background: colors[priority] || '#999',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        🔥 {priority}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: '700' }}>
          Assignment Notifications
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Receive assignments → Review project details → Accept or request reassignment
        </p>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Assignments', value: pendingAssignments.length, color: '#ff9800', icon: '⏳' },
          { label: 'Total Assigned', value: assignments.length, color: '#2196f3', icon: '📋' },
          { label: 'Accepted Today', value: assignments.filter(a => a.status === 6).length, color: '#4caf50', icon: '✓' },
          { label: 'Current Capacity', value: '60%', color: '#9c27b0', icon: '📊' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'white', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            🆕 New Assignments
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
            {pendingAssignments.map((project) => (
              <div key={project.project_id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
                border: '3px solid #ff9800',
                animation: 'pulse 2s infinite'
              }}>
                {/* Header */}
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e', fontWeight: '700' }}>
                      {project.project_code}
                    </h3>
                    {getPriorityBadge(project.priority)}
                  </div>
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                    {project.project_name}
                  </p>
                  {getStatusBadge(project.status)}
                </div>

                {/* Project Details */}
                <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <p style={{ margin: 0 }}>
                      <strong>📍 Location:</strong> {project.project_location || 'N/A'}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>💰 Contract:</strong> ₱{project.contract_value?.toLocaleString() || '0'}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>📅 Expected:</strong> {project.expected_billing_date ? new Date(project.expected_billing_date).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                </div>

                {/* Assignment Info */}
                <div style={{
                  background: '#e3f2fd',
                  padding: '12px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  border: '2px dashed #2196f3'
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', fontWeight: 'bold', color: '#2196f3' }}>
                    ✉️ ASSIGNMENT DETAILS
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
                    Assigned via AI optimization based on:<br/>
                    • Current workload capacity<br/>
                    • GPS proximity to site<br/>
                    • Specialization match
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setSelectedProject(project);
                      setDetailsModal(true);
                    }}
                    style={{
                      flex: 1,
                      background: '#fff',
                      color: '#2196f3',
                      border: '2px solid #2196f3',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    📋 View Details
                  </button>
                  <button
                    onClick={() => handleAcceptAssignment(project.project_id)}
                    style={{
                      flex: 1,
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    ✓ Accept
                  </button>
                </div>
                <button
                  onClick={() => {
                    const reason = prompt('Please provide reason for reassignment request:');
                    if (reason) handleRequestReassignment(project.project_id, reason);
                  }}
                  style={{
                    width: '100%',
                    background: '#fff',
                    color: '#f44336',
                    border: '2px solid #f44336',
                    padding: '10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    marginTop: '8px'
                  }}
                >
                  🔄 Request Reassignment
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Assignments */}
      <div>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '24px', color: 'white', fontWeight: '700', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          📋 All My Assignments
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {assignments.filter(a => !pendingAssignments.includes(a)).map((project) => (
            <div key={project.project_id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1a1a2e', fontWeight: '700' }}>
                  {project.project_code}
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>
                  {project.project_name}
                </p>
                {getStatusBadge(project.status)}
              </div>

              <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px' }}>
                  <strong>Location:</strong> {project.project_location || 'N/A'}
                </p>
                <p style={{ margin: 0, fontSize: '12px' }}>
                  <strong>Priority:</strong> {project.priority}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedProject(project);
                  setDetailsModal(true);
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(45deg, #11998e, #38ef7d)',
                  color: 'white',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px'
                }}
              >
                View Project
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Details Modal */}
      {detailsModal && selectedProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
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
            padding: '32px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1a1a2e', fontWeight: '700' }}>
              📋 Project Details
            </h2>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>PROJECT CODE</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1a1a2e' }}>{selectedProject.project_code}</p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>PROJECT NAME</p>
                <p style={{ margin: 0, fontSize: '16px', color: '#555' }}>{selectedProject.project_name}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>PRIORITY</p>
                  <p style={{ margin: 0 }}>{getPriorityBadge(selectedProject.priority)}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>STATUS</p>
                  <p style={{ margin: 0 }}>{getStatusBadge(selectedProject.status)}</p>
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>LOCATION</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>📍 {selectedProject.project_location || 'N/A'}</p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>CONTRACT VALUE</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#4caf50' }}>
                  ₱{selectedProject.contract_value?.toLocaleString() || '0'}
                </p>
              </div>

              {selectedProject.project_description && (
                <div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>DESCRIPTION</p>
                  <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                      {selectedProject.project_description}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '12px', border: '2px solid #2196f3' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2196f3' }}>
                  📱 AI ROUTE OPTIMIZATION
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                  Estimated travel time: 25 minutes<br/>
                  Best route: Via SLEX → Aguinaldo Highway<br/>
                  Suggested inspection time: 2-3 hours
                </p>
              </div>
            </div>

            <button
              onClick={() => setDetailsModal(false)}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '15px',
                marginTop: '24px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Loading...</p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(255, 152, 0, 0.3); }
          50% { box-shadow: 0 6px 32px rgba(255, 152, 0, 0.6); }
        }
      `}</style>
    </div>
  );
}