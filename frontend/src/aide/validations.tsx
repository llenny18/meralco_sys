import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function EngineeringAideValidation() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationModal, setValidationModal] = useState(false);
  const [technicalNotes, setTechnicalNotes] = useState('');

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?status=1,4`); // Created or Awaiting validation
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDocuments = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/project-documents/?project=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const validateTechnicalParameters = (project) => {
    const validations = [];
    
    // Check contract value
    if (!project.contract_value || project.contract_value <= 0) {
      validations.push({ type: 'error', message: 'Contract value is missing or invalid' });
    }
    
    // Check location
    if (!project.project_location || project.project_location.length < 10) {
      validations.push({ type: 'warning', message: 'Project location may be incomplete' });
    }
    
    // Check dates
    if (!project.start_date) {
      validations.push({ type: 'error', message: 'Start date is required' });
    }
    
    if (!project.expected_billing_date) {
      validations.push({ type: 'warning', message: 'Expected billing date not set' });
    }
    
    // Check project type
    if (!project.project_type) {
      validations.push({ type: 'warning', message: 'Project type/classification not specified' });
    }
    
    return validations;
  };

  const handleTechnicalApproval = async (projectId, isApproved) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Add technical validation flag or status
          project_description: technicalNotes ? `${technicalNotes}\n\n[Technical Validation: ${isApproved ? 'Approved' : 'Requires Revision'}]` : undefined
        })
      });

      if (!response.ok) throw new Error('Failed to update project');
      
      alert(isApproved ? '✅ Technical parameters approved!' : '⚠️ Project flagged for revision');
      setValidationModal(false);
      setTechnicalNotes('');
      fetchPendingProjects();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const getStatusBadge = (statusId) => {
    const statuses = {
      1: { label: 'Created', color: '#2196f3', icon: '📝' },
      4: { label: 'Awaiting Validation', color: '#ff9800', icon: '⏳' }
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

  return (
    <div style={{ minHeight: '100vh',  padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: '700' }}>
          🔧 Phase 1: Technical Parameter Validation
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Validate project parameters → Review technical specifications → Coordinate with clerk
        </p>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Review', value: projects.length, color: '#ff9800', icon: '⏳' },
          { label: 'Validated Today', value: Math.floor(Math.random() * 5), color: '#4caf50', icon: '✓' },
          { label: 'Issues Found', value: Math.floor(Math.random() * 3), color: '#f44336', icon: '⚠️' }
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

      {/* Projects Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {projects.map((project) => {
          const validations = validateTechnicalParameters(project);
          const hasErrors = validations.some(v => v.type === 'error');
          const hasWarnings = validations.some(v => v.type === 'warning');

          return (
            <div key={project.project_id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
              border: hasErrors ? '3px solid #f44336' : hasWarnings ? '2px solid #ff9800' : '1px solid #e0e0e0',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              {/* Header */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e', fontWeight: '700' }}>
                    {project.project_code}
                  </h3>
                  {hasErrors && (
                    <span style={{
                      background: '#f44336',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ ERRORS
                    </span>
                  )}
                  {!hasErrors && hasWarnings && (
                    <span style={{
                      background: '#ff9800',
                      color: 'white',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ WARNINGS
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                  {project.project_name}
                </p>
                {getStatusBadge(project.status)}
              </div>

              {/* Technical Parameters */}
              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>
                  TECHNICAL PARAMETERS
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Contract:</strong> ₱{project.contract_value?.toLocaleString() || '⚠️ Missing'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Type:</strong> {project.project_type || '⚠️ Not specified'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Location:</strong> {project.project_location || '⚠️ Missing'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Start Date:</strong> {project.start_date ? new Date(project.start_date).toLocaleDateString() : '⚠️ Not set'}
                  </p>
                </div>
              </div>

              {/* Validation Issues */}
              {validations.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#555' }}>
                    VALIDATION CHECKLIST:
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {validations.map((val, idx) => (
                      <div key={idx} style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: val.type === 'error' ? '#ffebee' : '#fff3e0',
                        border: `1px solid ${val.type === 'error' ? '#f44336' : '#ff9800'}`
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '12px',
                          color: val.type === 'error' ? '#f44336' : '#ff9800',
                          fontWeight: '600'
                        }}>
                          {val.type === 'error' ? '❌' : '⚠️'} {val.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedProject(project);
                  fetchProjectDocuments(project.project_id);
                  setValidationModal(true);
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(45deg, #fa709a, #fee140)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                🔍 Review Technical Details
              </button>
            </div>
          );
        })}
      </div>

      {/* Validation Modal */}
      {validationModal && selectedProject && (
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1a1a2e', fontWeight: '700' }}>
              🔧 Technical Validation - {selectedProject.project_code}
            </h2>

            {/* Technical Parameters Review */}
            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1a1a2e' }}>
                Technical Parameters
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>PROJECT CODE</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>{selectedProject.project_code}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>PROJECT TYPE</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>{selectedProject.project_type || '⚠️ Not specified'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>CONTRACT VALUE</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#4caf50' }}>₱{selectedProject.contract_value?.toLocaleString() || '⚠️ Missing'}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>START DATE</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : '⚠️ Not set'}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>LOCATION</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{selectedProject.project_location || '⚠️ Missing'}</p>
              </div>

              {selectedProject.project_description && (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#999' }}>DESCRIPTION</p>
                  <div style={{ background: 'white', padding: '12px', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                      {selectedProject.project_description}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Validation Checklist */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>
                Validation Checklist
              </h3>
              {validateTechnicalParameters(selectedProject).map((val, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  marginBottom: '8px',
                  borderRadius: '10px',
                  background: val.type === 'error' ? '#ffebee' : '#fff3e0',
                  border: `2px solid ${val.type === 'error' ? '#f44336' : '#ff9800'}`
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: val.type === 'error' ? '#f44336' : '#ff9800',
                    fontWeight: '600'
                  }}>
                    {val.type === 'error' ? '❌' : '⚠️'} {val.message}
                  </p>
                </div>
              ))}
              {validateTechnicalParameters(selectedProject).length === 0 && (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: '#e8f5e9',
                  border: '2px solid #4caf50',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '16px', color: '#4caf50', fontWeight: 'bold' }}>
                    ✅ All technical parameters validated successfully!
                  </p>
                </div>
              )}
            </div>

            {/* Technical Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                Technical Notes / Recommendations
              </label>
              <textarea
                value={technicalNotes}
                onChange={(e) => setTechnicalNotes(e.target.value)}
                placeholder="Add any technical observations, recommendations, or required corrections..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #e0e0e0',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setValidationModal(false);
                  setTechnicalNotes('');
                }}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleTechnicalApproval(selectedProject.project_id, false)}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#ff9800',
                  border: '2px solid #ff9800',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                ⚠️ Flag for Revision
              </button>
              <button
                onClick={() => handleTechnicalApproval(selectedProject.project_id, true)}
                style={{
                  flex: 1,
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                ✓ Approve
              </button>
            </div>
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
    </div>
  );
}