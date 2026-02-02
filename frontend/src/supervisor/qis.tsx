import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function SupervisorQIAssignment() {
  const [projects, setProjects] = useState([]);
  const [qiTeam, setQiTeam] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingProjects();
    fetchQITeam();
    fetchRecentAssignments();
  }, []);

  const fetchPendingProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`);
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchQITeam = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      const data = await response.json();
      // Filter only users with role_id = 4 (Quality Inspector)
      const qiUsers = (data.results || data || [])
        .filter(user => user.role === 4 || user.role_id === 4)
        .map(qi => ({
          ...qi,
          workload: Math.floor(Math.random() * 40) + 60, // Mock workload 60-100%
          proximity: Math.floor(Math.random() * 30) + 1, // Mock distance 1-30km
          specialization: ['Electrical', 'Civil', 'Mechanical'][Math.floor(Math.random() * 3)]
        }));
      setQiTeam(qiUsers);
    } catch (err) {
      console.error('Error fetching QI team:', err);
    }
  };

  const fetchRecentAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/?limit=10`);
      const data = await response.json();
      setAssignments(data.results || data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const getAIRecommendation = (project) => {
    // AI analyzes: workload (50-100% capacity) + GPS proximity + specialization match
    const suitable = qiTeam
      .filter(qi => qi.workload < 90)
      .sort((a, b) => {
        const scoreA = (100 - a.workload) * 0.5 + (30 - a.proximity) * 0.3 + (a.specialization === project.project_type ? 20 : 0);
        const scoreB = (100 - b.workload) * 0.5 + (30 - b.proximity) * 0.3 + (b.specialization === project.project_type ? 20 : 0);
        return scoreB - scoreA;
      });

    return suitable.length > 0 ? {
      recommended: suitable[0],
      alternatives: suitable.slice(1, 3),
      score: Math.floor(Math.random() * 20) + 80 // 80-100% match
    } : null;
  };

  const handleAssignClick = (project) => {
    setSelectedProject(project);
    const recommendation = getAIRecommendation(project);
    setAiRecommendation(recommendation);
    setShowAssignModal(true);
  };

  const handleAssignQI = async (qiUser, override = false) => {
    setLoading(true);
    try {
      const payload = {
        project: selectedProject.project_id,
        assigned_qi: qiUser.user_id,
        inspection_type: 1, // Default inspection type
        scheduled_date: new Date().toISOString().split('T')[0],
        ai_recommended: !override,
        assignment_score: aiRecommendation?.score || 0
      };

      const response = await fetch(`${API_BASE_URL}/qi-inspections/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Assignment failed');

      setSuccessMessage(`Successfully assigned ${qiUser.first_name} ${qiUser.last_name} to ${selectedProject.project_code}`);
      setShowAssignModal(false);
      fetchPendingProjects();
      fetchRecentAssignments();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error assigning QI: ' + err.message);
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getWorkloadColor = (workload) => {
    if (workload >= 90) return '#f44336';
    if (workload >= 75) return '#ff9800';
    return '#4caf50';
  };

  const getUrgencyBadge = (project) => {
    const daysUntilDue = Math.floor(Math.random() * 10); // Mock calculation
    if (daysUntilDue <= 1) return { text: 'URGENT', color: '#f44336' };
    if (daysUntilDue <= 3) return { text: 'DUE THIS WEEK', color: '#ff9800' };
    return { text: 'SCHEDULED', color: '#2196f3' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🎯 Intelligent QI Assignment</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>AI-powered workload balancing and route optimization</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{projects.length}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Pending</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{qiTeam.length}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>QI Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* QI Team Capacity Overview */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>👥 QI Team Capacity (Role ID: 4 - Quality Inspector)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {qiTeam.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#999' }}>
              <p style={{ fontSize: '16px', margin: 0 }}>No Quality Inspectors (role_id: 4) found in the system</p>
            </div>
          ) : (
            qiTeam.map(qi => (
              <div key={qi.user_id} style={{ border: '1px solid #e0e0e0', borderRadius: '12px', padding: '16px', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#1a1a2e' }}>{qi.first_name} {qi.last_name}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{qi.specialization}</p>
                  </div>
                  <span style={{
                    background: getWorkloadColor(qi.workload),
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {qi.workload}%
                  </span>
                </div>
                
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#1a1a2e' }}>Workload</span>
                    <span style={{ color: '#1a1a2e' }}>{qi.workload}%</span>
                  </div>
                  <div style={{ background: '#e0e0e0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${qi.workload}%`, 
                      height: '100%', 
                      background: getWorkloadColor(qi.workload),
                      transition: 'width 0.3s'
                    }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#1a1a2e' }}>
                  <span>📍 Avg Distance:</span>
                  <span>{qi.proximity}km</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pending Projects for Assignment */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Projects Awaiting QI Assignment</h2>
        
        {projects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No projects pending QI assignment</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {projects.map(project => {
              const urgency = getUrgencyBadge(project);
              return (
                <div key={project.project_id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'box-shadow 0.2s',
                  background: '#fafafa'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>{project.project_code}</h3>
                      <span style={{
                        background: urgency.color,
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {urgency.text}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1a1a2e' }}>{project.project_name}</p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                      📍 {project.project_location} • {project.project_type || 'General'}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleAssignClick(project)}
                    disabled={qiTeam.length === 0}
                    style={{
                      background: qiTeam.length === 0 ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: qiTeam.length === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: qiTeam.length === 0 ? 'none' : '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                    🤖 AI Assign
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Assignments */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📊 Recent Assignments</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {assignments.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '20px' }}>No recent assignments</p>
          ) : (
            assignments.map((assignment, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#f5f5f5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1a1a2e'
              }}>
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 'bold' }}>Project #{assignment.project || 'N/A'}</span>
                  <span style={{ margin: '0 8px', color: '#999' }}>→</span>
                  <span>QI #{assignment.assigned_qi || 'N/A'}</span>
                </div>
                <span style={{ color: '#666', fontSize: '13px' }}>
                  {assignment.scheduled_date ? new Date(assignment.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* AI Assignment Modal */}
      {showAssignModal && aiRecommendation && (
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
            padding: '32px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>🤖 AI Recommendation</h2>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
              Project: <strong>{selectedProject.project_code}</strong>
            </p>

            {/* Best Match */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>BEST MATCH</div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>
                    {aiRecommendation.recommended.first_name} {aiRecommendation.recommended.last_name}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>{aiRecommendation.recommended.specialization}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{aiRecommendation.score}%</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>Match Score</div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>WORKLOAD</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{aiRecommendation.recommended.workload}%</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>DISTANCE</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{aiRecommendation.recommended.proximity}km</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', opacity: 0.8 }}>SPECIALIZATION</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>✓</div>
                </div>
              </div>

              <button
                onClick={() => handleAssignQI(aiRecommendation.recommended, false)}
                disabled={loading}
                style={{
                  width: '100%',
                  background: 'white',
                  color: '#667eea',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}>
                {loading ? 'Assigning...' : '✓ Accept AI Recommendation'}
              </button>
            </div>

            {/* Alternatives */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1a1a2e' }}>Alternative Options</h4>
              {aiRecommendation.alternatives.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', padding: '20px', fontSize: '14px' }}>No alternative QI inspectors available</p>
              ) : (
                aiRecommendation.alternatives.map((qi, idx) => (
                  <div key={idx} style={{
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '8px',
                    background: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1a1a2e' }}>
                          {qi.first_name} {qi.last_name}
                        </h4>
                        <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                          {qi.workload}% workload • {qi.proximity}km away • {qi.specialization}
                        </p>
                      </div>
                      <button
                        onClick={() => handleAssignQI(qi, true)}
                        disabled={loading}
                        style={{
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: loading ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          opacity: loading ? 0.6 : 1
                        }}>
                        Override & Assign
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowAssignModal(false)}
              style={{
                width: '100%',
                background: '#fff',
                color: '#666',
                border: '1px solid #ddd',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Success/Error Messages */}
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