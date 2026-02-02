import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ClerkBillingValidation() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [validationChecks, setValidationChecks] = useState({
    inspection_approved: false,
    documents_complete: false,
    no_pending_corrections: false,
    penalties_calculated: false,
    account_good_standing: false,
    no_legal_holds: false
  });
  const [documents, setDocuments] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [defects, setDefects] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('checklist'); // checklist, documents, inspections, defects

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const fetchPendingProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?status=7`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      setError(err.message);
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
      console.error('Error fetching documents:', err);
      setDocuments([]);
    }
  };

  const fetchProjectInspections = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/?project=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch inspections');
      const data = await response.json();
      setInspections(data.results || data || []);
    } catch (err) {
      console.error('Error fetching inspections:', err);
      setInspections([]);
    }
  };

  const fetchProjectDefects = async (projectId) => {
    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/defect-reports/?project=${projectId}`, {
        headers: {
          'Authorization': `Token ${authToken}`,
        }
      });
      if (!response.ok) throw new Error('Failed to fetch defects');
      const data = await response.json();
      setDefects(data.results || data || []);
    } catch (err) {
      console.error('Error fetching defects:', err);
      setDefects([]);
    }
  };

  const checkProjectValidation = async (projectId) => {
    try {
      // Check inspection status
      const inspectionRes = await fetch(`${API_BASE_URL}/qi-inspections/?project=${projectId}`);
      const inspectionsData = await inspectionRes.json();
      const allInspections = inspectionsData.results || inspectionsData || [];
      const hasApprovedInspection = allInspections.some(i => 
        i.inspection_result === 'Pass' && i.is_completed
      );
      
      // Check documents
      const docsRes = await fetch(`${API_BASE_URL}/project-documents/?project=${projectId}`);
      const docsData = await docsRes.json();
      const allDocs = docsData.results || docsData || [];
      const requiredDocTypes = ['Certificate of Completion', 'QI Report'];
      const hasRequiredDocs = requiredDocTypes.every(type => 
        allDocs.some(d => d.doc_type_name === type && d.approval_status === 'Approved')
      );
      
      // Check defects/corrections
      const authToken = localStorage.getItem('auth_token');
      const defectsRes = await fetch(`${API_BASE_URL}/defect-reports/?project=${projectId}`, {
        headers: {
          'Authorization': `Token ${authToken}`,
        }
      });
      const defectsData = await defectsRes.json();
      const allDefects = defectsData.results || defectsData || [];
      const noPendingCorrections = allDefects.every(d => 
        d.correction_status === 'APPROVED' || d.correction_status === 'CLOSED'
      );
      
      // Check penalties
      const penaltiesRes = await fetch(`${API_BASE_URL}/penalties/?project=${projectId}`);
      const penaltiesData = await penaltiesRes.json();
      const allPenalties = penaltiesData.results || penaltiesData || [];
      const penaltiesCalculated = allPenalties.length === 0 || 
        allPenalties.every(p => p.penalty_amount > 0 && p.penalty_status !== 'Draft');
      
      setValidationChecks({
        inspection_approved: hasApprovedInspection,
        documents_complete: hasRequiredDocs,
        no_pending_corrections: noPendingCorrections || allDefects.length === 0,
        penalties_calculated: penaltiesCalculated,
        account_good_standing: true, // Manual check
        no_legal_holds: true // Manual check
      });
    } catch (err) {
      console.error('Error checking validation:', err);
    }
  };

  const handleValidateProject = async (project) => {
    setSelectedProject(project);
    setShowValidationModal(true);
    setActiveTab('checklist');
    
    // Fetch all related data
    await Promise.all([
      fetchProjectDocuments(project.project_id),
      fetchProjectInspections(project.project_id),
      fetchProjectDefects(project.project_id),
      checkProjectValidation(project.project_id)
    ]);
  };

  const handleSubmitForBilling = async () => {
    const allChecked = Object.values(validationChecks).every(v => v === true);
    
    if (!allChecked) {
      setError('All validation checks must pass before submitting for billing');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ✅ FIX: Correct the URL - remove double /api/
      const url = `${API_BASE_URL}/projects/${selectedProject.project_id}/`;
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 8 // Update to status 8 (Ready for Billing)
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || 'Failed to submit for billing');
      }

      setSuccessMessage(`✅ Project ${selectedProject.project_code} submitted for billing successfully!`);
      setShowValidationModal(false);
      setSelectedProject(null);
      fetchPendingProjects();
    } catch (err) {
      setError('Error submitting for billing: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentViewer(true);
  };

  const getCheckIcon = (checked) => checked ? '✅' : '❌';

  const getStatusColor = (status) => {
    const colors = {
      'Pass': '#4caf50',
      'Fail': '#f44336',
      'Conditional': '#ff9800',
      'APPROVED': '#4caf50',
      'REJECTED': '#f44336',
      'SUBMITTED': '#2196f3',
      'OPEN': '#ff9800',
      'CLOSED': '#9e9e9e'
    };
    return colors[status] || '#757575';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: 'bold' }}>
          ✅ Pre-Billing Validation Dashboard
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Validate projects, review inspections, and submit for billing
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: '16px', 
          padding: '24px', 
          color: 'white', 
          boxShadow: '0 8px 32px rgba(102,126,234,0.3)',
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px', fontWeight: '500' }}>
            📋 Pending Validation
          </div>
          <div style={{ fontSize: '42px', fontWeight: 'bold' }}>{projects.length}</div>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e', fontWeight: 'bold' }}>
          📊 Projects Ready for Validation
        </h2>
        
        {loading && !showValidationModal ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            color: '#666',
            fontSize: '18px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            Loading projects...
          </div>
        ) : projects.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold', borderRadius: '8px 0 0 0' }}>Project Code</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Project Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: 'bold' }}>Vendor</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: 'bold' }}>Contract Value</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>Completion Date</th>
                  <th style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', borderRadius: '0 8px 0 0' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project, index) => (
                  <tr key={project.project_id} style={{ 
                    borderBottom: '1px solid #e0e0e0',
                    background: index % 2 === 0 ? '#fafafa' : 'white',
                    transition: 'background 0.2s ease'
                  }}>
                    <td style={{ padding: '16px', color: '#1a1a2e', fontWeight: '600' }}>
                      {project.project_code}
                    </td>
                    <td style={{ padding: '16px', color: '#1a1a2e' }}>
                      {project.project_name || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', color: '#666' }}>
                      {project.vendor_name || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', color: '#1a1a2e', textAlign: 'right', fontWeight: '600' }}>
                      ₱{parseFloat(project.contract_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px', color: '#666', textAlign: 'center' }}>
                      {project.completion_date || 'N/A'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleValidateProject(project)}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600',
                          boxShadow: '0 4px 12px rgba(102,126,234,0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102,126,234,0.4)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(102,126,234,0.3)';
                        }}
                      >
                        🔍 Validate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px', 
            color: '#999',
            fontSize: '18px'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
            No projects pending validation
          </div>
        )}
      </div>

      {/* Validation Modal */}
      {showValidationModal && selectedProject && (
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
            padding: '0',
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Modal Header */}
            <div style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              padding: '24px',
              color: 'white'
            }}>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: 'bold' }}>
                📋 Pre-Billing Validation
              </h2>
              <h3 style={{ margin: '0', fontSize: '20px', opacity: 0.9 }}>
                {selectedProject.project_code} - {selectedProject.project_name}
              </h3>
            </div>

            {/* Tabs */}
            <div style={{ 
              display: 'flex', 
              borderBottom: '2px solid #e0e0e0',
              background: '#f5f5f5'
            }}>
              {[
                { id: 'checklist', label: '✅ Checklist', icon: '📋' },
                { id: 'documents', label: `📄 Documents (${documents.length})`, icon: '📄' },
                { id: 'inspections', label: `🔍 Inspections (${inspections.length})`, icon: '🔍' },
                { id: 'defects', label: `⚠️ Defects (${defects.length})`, icon: '⚠️' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '16px',
                    border: 'none',
                    background: activeTab === tab.id ? 'white' : 'transparent',
                    borderBottom: activeTab === tab.id ? '3px solid #667eea' : '3px solid transparent',
                    color: activeTab === tab.id ? '#667eea' : '#666',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ 
              flex: 1, 
              overflow: 'auto', 
              padding: '24px'
            }}>
              {/* Checklist Tab */}
              {activeTab === 'checklist' && (
                <div>
                  <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 20px 0', color: '#1a1a2e', fontSize: '20px', fontWeight: 'bold' }}>
                      ✅ Validation Checklist
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {Object.entries(validationChecks).map(([key, value]) => (
                        <div key={key} style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '12px',
                          padding: '16px',
                          background: 'white',
                          borderRadius: '8px',
                          border: `2px solid ${value ? '#4caf50' : '#e0e0e0'}`,
                          transition: 'all 0.3s ease'
                        }}>
                          <span style={{ fontSize: '24px' }}>{getCheckIcon(value)}</span>
                          <label style={{ 
                            flex: 1, 
                            cursor: 'pointer', 
                            color: '#1a1a2e',
                            fontSize: '16px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setValidationChecks({...validationChecks, [key]: e.target.checked})}
                              style={{ 
                                width: '20px', 
                                height: '20px',
                                cursor: 'pointer',
                                accentColor: '#667eea'
                              }}
                            />
                            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div style={{
                    background: Object.values(validationChecks).every(v => v) 
                      ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' 
                      : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                      {Object.values(validationChecks).every(v => v) ? '✅' : '⚠️'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {Object.values(validationChecks).every(v => v) 
                        ? 'All checks passed! Ready for billing.' 
                        : 'Please complete all validation checks before submitting.'}
                    </div>
                  </div>
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div>
                  <h4 style={{ margin: '0 0 20px 0', color: '#1a1a2e', fontSize: '20px', fontWeight: 'bold' }}>
                    📄 Project Documents ({documents.length})
                  </h4>
                  {documents.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {documents.map((doc) => (
                        <div key={doc.document_id} style={{
                          background: '#f5f5f5',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '2px solid #e0e0e0',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                fontSize: '18px', 
                                fontWeight: 'bold', 
                                color: '#1a1a2e',
                                marginBottom: '8px'
                              }}>
                                📄 {doc.document_name}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                Type: {doc.doc_type_name || 'Unknown'}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                Uploaded by: {doc.uploaded_by_name || 'Unknown'}
                              </div>
                            </div>
                            <div style={{
                              padding: '8px 16px',
                              borderRadius: '20px',
                              background: getStatusColor(doc.approval_status),
                              color: 'white',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              {doc.approval_status}
                            </div>
                          </div>
                          {doc.notes && (
                            <div style={{ 
                              background: 'white', 
                              padding: '12px', 
                              borderRadius: '8px',
                              marginBottom: '12px',
                              fontSize: '14px',
                              color: '#666'
                            }}>
                              📝 {doc.notes}
                            </div>
                          )}
                          <button
                            onClick={() => viewDocument(doc)}
                            style={{
                              background: '#2196f3',
                              color: 'white',
                              border: 'none',
                              padding: '10px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}
                          >
                            👁️ View Document
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>📭</div>
                      No documents found
                    </div>
                  )}
                </div>
              )}

              {/* Inspections Tab */}
              {activeTab === 'inspections' && (
                <div>
                  <h4 style={{ margin: '0 0 20px 0', color: '#1a1a2e', fontSize: '20px', fontWeight: 'bold' }}>
                    🔍 Quality Inspections ({inspections.length})
                  </h4>
                  {inspections.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {inspections.map((inspection) => (
                        <div key={inspection.inspection_id} style={{
                          background: '#f5f5f5',
                          borderRadius: '12px',
                          padding: '20px',
                          border: `2px solid ${inspection.inspection_result === 'Pass' ? '#4caf50' : inspection.inspection_result === 'Fail' ? '#f44336' : '#e0e0e0'}`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                            <div>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                                {inspection.inspection_type_name || 'QI Inspection'}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                Date: {inspection.inspection_date || 'Not completed'}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                Inspector: {inspection.assigned_qi_name || 'N/A'}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                Status: {inspection.is_completed ? '✅ Completed' : '⏳ Pending'}
                              </div>
                            </div>
                            {inspection.inspection_result && (
                              <div style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: getStatusColor(inspection.inspection_result),
                                color: 'white',
                                fontSize: '14px',
                                fontWeight: 'bold'
                              }}>
                                {inspection.inspection_result}
                              </div>
                            )}
                          </div>

                          {inspection.findings && (
                            <div style={{
                              background: 'white',
                              padding: '16px',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                                📝 Findings:
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                {inspection.findings}
                              </div>
                            </div>
                          )}

                          {inspection.recommendations && (
                            <div style={{
                              background: 'white',
                              padding: '16px',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                                💡 Recommendations:
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                {inspection.recommendations}
                              </div>
                            </div>
                          )}

                          {/* Correction Photos */}
                          {inspection.correction_photos && inspection.correction_photos.length > 0 && (
                            <div style={{
                              background: 'white',
                              padding: '16px',
                              borderRadius: '8px'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '12px' }}>
                                📸 Correction Photos ({inspection.correction_photos.length}):
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                                {inspection.correction_photos.map((photoUrl, index) => (
                                  <div key={index} style={{
                                    position: 'relative',
                                    paddingBottom: '100%',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '2px solid #e0e0e0'
                                  }}
                                  onClick={() => window.open(photoUrl, '_blank')}
                                  >
                                    <img
                                      src={photoUrl}
                                      alt={`Correction ${index + 1}`}
                                      style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔍</div>
                      No inspections found
                    </div>
                  )}
                </div>
              )}

              {/* Defects Tab */}
              {activeTab === 'defects' && (
                <div>
                  <h4 style={{ margin: '0 0 20px 0', color: '#1a1a2e', fontSize: '20px', fontWeight: 'bold' }}>
                    ⚠️ Defect Reports ({defects.length})
                  </h4>
                  {defects.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      {defects.map((defect) => (
                        <div key={defect.defect_id} style={{
                          background: '#f5f5f5',
                          borderRadius: '12px',
                          padding: '20px',
                          border: `2px solid ${
                            defect.severity === 'CRITICAL' ? '#f44336' : 
                            defect.severity === 'MAJOR' ? '#ff9800' : '#2196f3'
                          }`
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                                ⚠️ Defect #{defect.defect_id}: {defect.defect_type}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                Category: {defect.defect_category || 'N/A'}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                                Created: {new Date(defect.created_at).toLocaleDateString()}
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                Inspector: {defect.created_by_name || 'N/A'}
                              </div>
                            </div>
                            <div>
                              <div style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: defect.severity === 'CRITICAL' ? '#f44336' : 
                                           defect.severity === 'MAJOR' ? '#ff9800' : '#2196f3',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                marginBottom: '8px'
                              }}>
                                {defect.severity}
                              </div>
                              <div style={{
                                padding: '8px 16px',
                                borderRadius: '20px',
                                background: getStatusColor(defect.correction_status),
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}>
                                {defect.correction_status}
                              </div>
                            </div>
                          </div>

                          <div style={{
                            background: 'white',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '16px'
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                              📝 Description:
                            </div>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                              {defect.description}
                            </div>
                          </div>

                          {defect.qi_notes && (
                            <div style={{
                              background: 'white',
                              padding: '16px',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                                📋 QI Notes:
                              </div>
                              <div style={{ fontSize: '14px', color: '#666' }}>
                                {defect.qi_notes}
                              </div>
                            </div>
                          )}

                          {defect.correction_notes && (
                            <div style={{
                              background: '#fff3cd',
                              padding: '16px',
                              borderRadius: '8px',
                              marginBottom: '16px',
                              border: '1px solid #ffc107'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#856404', marginBottom: '8px' }}>
                                🔧 Correction Notes:
                              </div>
                              <div style={{ fontSize: '14px', color: '#856404' }}>
                                {defect.correction_notes}
                              </div>
                            </div>
                          )}

                          {/* Defect Photos */}
                          {defect.photos && defect.photos.length > 0 && (
                            <div style={{
                              background: 'white',
                              padding: '16px',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '12px' }}>
                                📸 Defect Photos ({defect.photos.length}):
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                                {defect.photos.map((photoUrl, index) => (
                                  <div key={index} style={{
                                    position: 'relative',
                                    paddingBottom: '100%',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '2px solid #e0e0e0'
                                  }}
                                  onClick={() => window.open(photoUrl, '_blank')}
                                  >
                                    <img
                                      src={photoUrl}
                                      alt={`Defect ${index + 1}`}
                                      style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Correction Photos */}
                          {defect.correction_photos && defect.correction_photos.length > 0 && (
                            <div style={{
                              background: 'white',
                              padding: '16px',
                              borderRadius: '8px'
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '12px' }}>
                                ✅ Correction Photos ({defect.correction_photos.length}):
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                                {defect.correction_photos.map((photoUrl, index) => (
                                  <div key={index} style={{
                                    position: 'relative',
                                    paddingBottom: '100%',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    border: '2px solid #4caf50'
                                  }}
                                  onClick={() => window.open(photoUrl, '_blank')}
                                  >
                                    <img
                                      src={photoUrl}
                                      alt={`Correction ${index + 1}`}
                                      style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
                      <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
                      No defects reported
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ 
              borderTop: '2px solid #e0e0e0', 
              padding: '24px',
              background: '#f5f5f5',
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setShowValidationModal(false);
                  setSelectedProject(null);
                }}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #ddd',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#999';
                  e.currentTarget.style.color = '#333';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#ddd';
                  e.currentTarget.style.color = '#666';
                }}
              >
                ❌ Cancel
              </button>
              <button
                onClick={handleSubmitForBilling}
                disabled={!Object.values(validationChecks).every(v => v === true) || loading}
                style={{
                  background: Object.values(validationChecks).every(v => v === true) && !loading
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: Object.values(validationChecks).every(v => v === true) && !loading ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: Object.values(validationChecks).every(v => v === true) 
                    ? '0 4px 20px rgba(102,126,234,0.4)' 
                    : 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  if (Object.values(validationChecks).every(v => v === true) && !loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 30px rgba(102,126,234,0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(102,126,234,0.4)';
                }}
              >
                {loading ? '⏳ Submitting...' : '✅ Submit for Billing'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#1a1a2e' }}>
                📄 {selectedDocument.document_name}
              </h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                Type: {selectedDocument.doc_type_name} | 
                Status: {selectedDocument.approval_status} | 
                Uploaded: {new Date(selectedDocument.upload_date).toLocaleDateString()}
              </div>
            </div>

            {selectedDocument.document_path && (
              <div style={{ 
                background: '#f5f5f5', 
                padding: '20px', 
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center'
              }}>
                {selectedDocument.document_path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img 
                    src={selectedDocument.document_path} 
                    alt={selectedDocument.document_name}
                    style={{ maxWidth: '100%', borderRadius: '8px' }}
                  />
                ) : selectedDocument.document_path.match(/\.pdf$/i) ? (
                  <iframe 
                    src={selectedDocument.document_path}
                    style={{ width: '100%', height: '600px', border: 'none', borderRadius: '8px' }}
                  />
                ) : (
                  <div style={{ padding: '40px', color: '#666' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>📄</div>
                    <div>Preview not available for this file type</div>
                    <a 
                      href={selectedDocument.document_path} 
                      download
                      style={{
                        display: 'inline-block',
                        marginTop: '20px',
                        padding: '12px 24px',
                        background: '#2196f3',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600'
                      }}
                    >
                      ⬇️ Download Document
                    </a>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowDocumentViewer(false)}
              style={{
                background: '#666',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                width: '100%'
              }}
            >
              ✖️ Close
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          padding: '20px 28px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(76,175,80,0.4)',
          zIndex: 3000,
          minWidth: '300px',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>✅</span>
          {successMessage}
        </div>
      )}
      
      {/* Error Notification */}
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #f44336 0%, #e53935 100%)',
          color: 'white',
          padding: '20px 28px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(244,67,54,0.4)',
          zIndex: 3000,
          minWidth: '300px',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>❌</span>
          {error}
        </div>
      )}
    </div>
  );
}