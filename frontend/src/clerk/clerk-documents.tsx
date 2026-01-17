import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ClerkDocumentValidation() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationModal, setValidationModal] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUserId = JSON.parse(localStorage?.getItem('user') || '{}')?.user_id || '1';
    setUserId(storedUserId);
    fetchPendingProjects();
    fetchValidationStats();
  }, []);

  const fetchPendingProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?assigned_qi_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchValidationStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clerk-validation/validation_stats/`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProjectDocuments = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clerk-validation/${projectId}/project_documents/`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data.results || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load documents.');
    }
  };

  const validateDocument = async (docId, isValid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clerk-validation/${docId}/validate_document/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approval_status: isValid ? 'Approved' : 'Rejected',
          approval_date: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to validate document');
      
      alert(isValid ? '✅ Document approved!' : '❌ Document rejected');
      fetchProjectDocuments(selectedProject);
      fetchValidationStats();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const generateConfirmation = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/clerk-validation/${projectId}/generate_confirmation/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate confirmation');
      }

      const data = await response.json();
      setConfirmationNumber(data.confirmation_number);

      alert(`✅ Confirmation sent to vendor!\n\nConfirmation Number: ${data.confirmation_number}\n\nVendor will receive notification.`);
      
      setValidationModal(false);
      fetchPendingProjects();
      fetchValidationStats();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const checkDocumentQuality = (doc) => {
    const issues = [];
    
    if (doc.file_size > 10485760) {
      issues.push('File size exceeds 10MB');
    }
    
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (doc.file_type && !validTypes.includes(doc.file_type.toLowerCase())) {
      issues.push('Invalid file format');
    }
    
    return issues;
  };

  const getDocumentTypeBadge = (docTypeName) => {
    const types = {
      'Certificate of Completion': { color: '#2196f3', icon: '📜' },
      'Site Photo': { color: '#4caf50', icon: '📷' },
      'Building Permit': { color: '#ff9800', icon: '📋' },
      'Material Receipt': { color: '#9c27b0', icon: '🧾' },
      'Safety Form': { color: '#f44336', icon: '🦺' },
      'As-Built Drawing': { color: '#00bcd4', icon: '📐' }
    };
    const type = types[docTypeName] || { color: '#999', icon: '📄' };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{type.icon}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{docTypeName}</span>
      </div>
    );
  };

  const defaultStats = {
    pending_validation: 0,
    validated_today: 0,
    issues_found: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div style={{ minHeight: '100vh', padding: '20px'}}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: '700' }}>
          Document Validation
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Validate submissions → Check formats & quality → Generate confirmation → Send to supervisor
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#ffebee',
          border: '2px solid #f44336',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          color: '#c62828'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Validation', value: currentStats.pending_validation, color: '#ff9800', icon: '⏳' },
          { label: 'Validated Today', value: currentStats.validated_today, color: '#4caf50', icon: '✅' },
          { label: 'Issues Found', value: currentStats.issues_found, color: '#f44336', icon: '⚠️' }
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {projects.map((project) => (
          <div key={project.project_id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            {/* Header */}
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1a1a2e', fontWeight: '700' }}>
                {project.project_code}
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                {project.project_name}
              </p>
              <span style={{
                background: '#ff9800',
                color: 'white',
                padding: '6px 14px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                📋 Awaiting Validation
              </span>
            </div>

            {/* Project Info */}
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <p style={{ margin: 0 }}>
                  <strong>Completed:</strong> {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Location:</strong> {project.project_location || 'N/A'}
                </p>
                <p style={{ margin: 0 }}>
                  <strong>Documents:</strong> {project.pending_documents} pending, {project.approved_documents} approved
                </p>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                setSelectedProject(project.project_id);
                fetchProjectDocuments(project.project_id);
                setValidationModal(true);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              🔍 Validate Documents
            </button>
          </div>
        ))}
      </div>

      {/* No Projects Message */}
      {!loading && projects.length === 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1a1a2e' }}>No Projects Pending Validation</h3>
          <p style={{ margin: 0, color: '#666' }}>All projects are up to date!</p>
        </div>
      )}

      {/* Validation Modal */}
      {validationModal && (
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
              🔍 Document Validation
            </h2>

            {/* Documents List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {documents.length > 0 ? documents.map((doc) => {
                const issues = checkDocumentQuality(doc);
                const hasIssues = issues.length > 0;

                return (
                  <div key={doc.document_id} style={{
                    border: `2px solid ${hasIssues ? '#f44336' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    background: hasIssues ? '#ffebee' : '#f8f9fa'
                  }}>
                    {/* Document Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      {getDocumentTypeBadge(doc.doc_type_name)}
                      <span style={{
                        background: doc.approval_status === 'Approved' ? '#4caf50' : doc.approval_status === 'Rejected' ? '#f44336' : '#ff9800',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {doc.approval_status || 'Pending'}
                      </span>
                    </div>

                    {/* Document Details */}
                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                        {doc.document_name}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                        Size: {doc.file_size ? (doc.file_size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'} | 
                        Type: {doc.file_type || 'N/A'}
                      </p>
                      {doc.upload_date && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          Uploaded: {new Date(doc.upload_date).toLocaleString()}
                        </p>
                      )}
                      {doc.uploaded_by_name && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          By: {doc.uploaded_by_name}
                        </p>
                      )}
                    </div>

                    {/* Quality Issues */}
                    {hasIssues && (
                      <div style={{
                        background: '#fff',
                        border: '1px solid #f44336',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '12px'
                      }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#f44336' }}>
                          ⚠️ Quality Issues:
                        </p>
                        {issues.map((issue, idx) => (
                          <p key={idx} style={{ margin: '4px 0', fontSize: '12px', color: '#f44336' }}>
                            • {issue}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Validation Buttons */}
                    {doc.approval_status !== 'Approved' && doc.approval_status !== 'Rejected' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => validateDocument(doc.document_id, false)}
                          style={{
                            flex: 1,
                            background: '#fff',
                            color: '#f44336',
                            border: '2px solid #f44336',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          ✗ Reject
                        </button>
                        <button
                          onClick={() => validateDocument(doc.document_id, true)}
                          style={{
                            flex: 1,
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          ✓ Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#999'
                }}>
                  <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📄</p>
                  <p style={{ margin: 0, fontSize: '16px' }}>No documents found</p>
                </div>
              )}
            </div>

            {/* Confirmation Number Display */}
            {confirmationNumber && (
              <div style={{
                background: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2196f3' }}>
                  CONFIRMATION NUMBER
                </p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', letterSpacing: '2px' }}>
                  {confirmationNumber}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setValidationModal(false);
                  setConfirmationNumber('');
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
                Close
              </button>
              {documents.length > 0 && documents.every(d => d.approval_status === 'Approved') && (
                <button
                  onClick={() => generateConfirmation(selectedProject)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(45deg, #4caf50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}
                >
                  ✅ Generate Confirmation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator */}
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