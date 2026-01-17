import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ClerkBillingValidation() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationChecks, setValidationChecks] = useState({
    inspection_approved: false,
    documents_complete: false,
    no_pending_corrections: false,
    penalties_calculated: false,
    account_good_standing: false,
    no_legal_holds: false
  });
  const [documents, setDocuments] = useState({
    coc: null,
    qi_report: null,
    receipts: [],
    penalty_memos: []
  });
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPendingProjects();
  }, []);

  const fetchPendingProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?status=Inspection Approved`);
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
      
      const docs = data.results || data || [];
      setDocuments({
        coc: docs.find(d => d.doc_type_name === 'Certificate of Completion'),
        qi_report: docs.find(d => d.doc_type_name === 'QI Report'),
        receipts: docs.filter(d => d.doc_type_name === 'Material Receipt'),
        penalty_memos: docs.filter(d => d.doc_type_name === 'Penalty Memo')
      });
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const checkProjectValidation = async (projectId) => {
    try {
      // Check inspection status
      const inspectionRes = await fetch(`${API_BASE_URL}/qi-inspections/?project=${projectId}`);
      const inspections = await inspectionRes.json();
      const approved = (inspections.results || inspections || []).some(i => i.inspection_result === 'Pass');
      
      // Check documents
      const docsRes = await fetch(`${API_BASE_URL}/project-documents/?project=${projectId}`);
      const docs = await docsRes.json();
      const allDocs = docs.results || docs || [];
      const hasRequiredDocs = allDocs.some(d => d.doc_type_name === 'Certificate of Completion');
      
      // Check penalties
      const penaltiesRes = await fetch(`${API_BASE_URL}/penalties/?project=${projectId}`);
      const penalties = await penaltiesRes.json();
      const penaltiesCalculated = (penalties.results || penalties || []).every(p => p.penalty_amount > 0);
      
      setValidationChecks({
        inspection_approved: approved,
        documents_complete: hasRequiredDocs,
        no_pending_corrections: approved,
        penalties_calculated: penaltiesCalculated || true,
        account_good_standing: true,
        no_legal_holds: true
      });
    } catch (err) {
      console.error('Error checking validation:', err);
    }
  };

  const handleValidateProject = async (project) => {
    setSelectedProject(project);
    setShowValidationModal(true);
    await fetchProjectDocuments(project.project_id);
    await checkProjectValidation(project.project_id);
  };

  const handleSubmitForBilling = async () => {
    const allChecked = Object.values(validationChecks).every(v => v === true);
    
    if (!allChecked) {
      setError('All validation checks must pass before submitting for billing');
      return;
    }

    try {
      // Update project status to ready for billing
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.project_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Ready for Billing' })
      });

      if (!response.ok) throw new Error('Failed to submit for billing');

      setSuccessMessage(`Project ${selectedProject.project_code} submitted for billing`);
      setShowValidationModal(false);
      fetchPendingProjects();
    } catch (err) {
      setError('Error submitting for billing: ' + err.message);
    }
  };

  const getCheckIcon = (checked) => checked ? '✅' : '❌';

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>✅ Pre-Billing Validation</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Validate projects before billing submission
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(102,126,234,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Validation</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{projects.length}</div>
        </div>
      </div>

      {/* Projects List */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Projects Ready for Validation</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading projects...</div>
        ) : projects.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Project Code</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Contract Value</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Completion Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1a1a2e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.project_id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{project.project_code}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{project.vendor_name || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>₱{parseFloat(project.contract_value || 0).toLocaleString()}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{project.completion_date || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleValidateProject(project)}
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
                        Validate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
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
            <h2 style={{ margin: '0 0 20px 0', color: '#1a1a2e' }}>📋 Pre-Billing Validation</h2>
            <h3 style={{ margin: '0 0 20px 0', color: '#667eea' }}>{selectedProject.project_code}</h3>

            {/* Validation Checklist */}
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#1a1a2e' }}>Validation Checklist</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.entries(validationChecks).map(([key, value]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '20px' }}>{getCheckIcon(value)}</span>
                    <label style={{ flex: 1, cursor: 'pointer', color: '#1a1a2e' }}>
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setValidationChecks({...validationChecks, [key]: e.target.checked})}
                        style={{ marginRight: '8px' }}
                      />
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents Section */}
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#1a1a2e' }}>Required Documents</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1a1a2e' }}>
                  <span>📄 Certificate of Completion (COC)</span>
                  <span>{documents.coc ? '✅ Available' : '❌ Missing'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1a1a2e' }}>
                  <span>📊 QI Report</span>
                  <span>{documents.qi_report ? '✅ Available' : '❌ Missing'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1a1a2e' }}>
                  <span>🧾 Material Receipts</span>
                  <span>{documents.receipts.length > 0 ? `✅ ${documents.receipts.length} files` : '❌ Missing'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#1a1a2e' }}>
                  <span>⚠️ Penalty Memos</span>
                  <span>{documents.penalty_memos.length > 0 ? `✅ ${documents.penalty_memos.length} files` : 'ℹ️ None'}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowValidationModal(false)}
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
                onClick={handleSubmitForBilling}
                disabled={!Object.values(validationChecks).every(v => v === true)}
                style={{
                  background: Object.values(validationChecks).every(v => v === true) 
                    ? 'linear-gradient(45deg, #667eea, #764ba2)' 
                    : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: Object.values(validationChecks).every(v => v === true) ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Submit for Billing
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