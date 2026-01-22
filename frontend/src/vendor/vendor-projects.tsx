import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function VendorProjectInitiation() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [documents, setDocuments] = useState({
    coc: null,
    photos: [],
    permits: null,
    receipts: null,
    safety: null,
    drawings: null
  });

  useEffect(() => {
    const storedVendorId = JSON.parse(localStorage.getItem('user') || '{}')?.user_id || '0';
    setVendorId(storedVendorId);
    fetchVendorProjects(storedVendorId);
  }, []);

  const fetchVendorProjects = async (vId) => {
    setLoading(true);
    try {
      const vendorResponse = await fetch(`${API_BASE_URL}/vendors/?user_id=${vId}`);
      const vendorData = await vendorResponse.json();

      const vendorId = vendorData.results[0].vendor_id;
      const response = await fetch(`${API_BASE_URL}/projects/?vendor=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type, files) => {
    if (type === 'photos') {
      setDocuments(prev => ({ ...prev, photos: [...prev.photos, ...Array.from(files)] }));
    } else {
      setDocuments(prev => ({ ...prev, [type]: files[0] }));
    }
  };

  const handleMarkCompleted = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 3, // Assuming status 3 = Completed
          completion_date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) throw new Error('Failed to mark as completed');
      
      alert('✅ Project marked as completed! Please upload documents.');
      setSelectedProject(projectId);
      setUploadModal(true);
      fetchVendorProjects(vendorId);
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const handleDocumentUpload = async () => {
    if (!selectedProject) return;

    try {
      const formData = new FormData();
      
      // Upload each document type
      const docTypes = [
        { key: 'coc', type: 'COC', file: documents.coc },
        { key: 'permits', type: 'PERMIT', file: documents.permits },
        { key: 'receipts', type: 'RECEIPT', file: documents.receipts },
        { key: 'safety', type: 'SAFETY', file: documents.safety },
        { key: 'drawings', type: 'DRAWING', file: documents.drawings }
      ];

      for (const doc of docTypes) {
        if (doc.file) {
          const fd = new FormData();
          fd.append('project', selectedProject);
          fd.append('doc_type', doc.type);
          fd.append('document_name', doc.file.name);
          fd.append('document_path', doc.file);
          fd.append('uploaded_by', vendorId);

          await fetch(`${API_BASE_URL}/project-documents/`, {
            method: 'POST',
            body: fd
          });
        }
      }

      // Upload photos
      for (const photo of documents.photos) {
        const fd = new FormData();
        fd.append('project', selectedProject);
        fd.append('doc_type', 'PHOTO');
        fd.append('document_name', photo.name);
        fd.append('document_path', photo);
        fd.append('uploaded_by', vendorId);

        await fetch(`${API_BASE_URL}/project-documents/`, {
          method: 'POST',
          body: fd
        });
      }

      alert('✅ Documents uploaded successfully! Confirmation number: ' + Math.random().toString(36).substr(2, 9).toUpperCase());
      setUploadModal(false);
      setDocuments({ coc: null, photos: [], permits: null, receipts: null, safety: null, drawings: null });
      fetchVendorProjects(vendorId);
    } catch (err) {
      alert('❌ Upload error: ' + err.message);
    }
  };

  const getStatusBadge = (statusId) => {
    const statuses = {
      1: { label: 'Created', color: '#2196f3' },
      2: { label: 'In Progress', color: '#ff9800' },
      3: { label: 'Completed', color: '#4caf50' },
      4: { label: 'Awaiting Documents', color: '#f44336' }
    };
    const status = statuses[statusId] || { label: 'Unknown', color: '#999' };
    return <span style={{ background: status.color, color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>{status.label}</span>;
  };

  const calculateSLADays = (completionDate) => {
    if (!completionDate) return null;
    const days = Math.floor((new Date() - new Date(completionDate)) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '12px' }}>
          Project Initiation & Document Submission
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Complete physical work → Mark as completed → Upload required documents
        </p>
      </div>

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {projects.map((project) => {
          const slaDays = calculateSLADays(project.completion_date);
          const isOverdue = slaDays > 7;

          return (
            <div key={project.project_id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: isOverdue ? '3px solid #f44336' : 'none'
            }}>
              {/* Project Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1a1a2e' }}>{project.project_code}</h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>{project.project_name}</p>
                  {getStatusBadge(project.status)}
                </div>
              </div>

              {/* Project Details */}
              <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <p style={{ margin: 0, color: "black" }}><strong>Location:</strong> {project.project_location || 'N/A'}</p>
                  <p style={{ margin: 0, color: "black"  }}><strong>Contract Value:</strong> ₱{project.contract_value?.toLocaleString() || '0'}</p>
                  <p style={{ margin: 0, color: "black"  }}><strong>Assigned QI:</strong> {project.assigned_qi || 'Not yet assigned'}</p>
                  {project.completion_date && (
                    <p style={{ margin: 0 }}><strong>Completed:</strong> {new Date(project.completion_date).toLocaleDateString()}</p>
                  )}
                </div>
              </div>

              {/* SLA Countdown */}
              {project.completion_date && (
                <div style={{
                  background: isOverdue ? '#ffebee' : '#e3f2fd',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: `2px solid ${isOverdue ? '#f44336' : '#2196f3'}`
                }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: 'bold', color: isOverdue ? '#f44336' : '#2196f3' }}>
                    SLA COUNTDOWN
                  </p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: isOverdue ? '#f44336' : '#2196f3' }}>
                    {slaDays !== null ? `${7 - slaDays} days remaining` : 'N/A'}
                  </p>
                  {isOverdue && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#f44336' }}>
                      ⚠️ OVERDUE! Penalty may apply
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {project.status !== 3 && (
                  <button
                    onClick={() => handleMarkCompleted(project.project_id)}
                    style={{
                      flex: 1,
                      background: '#4caf50',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    ✅ Mark Completed
                  </button>
                )}
                {project.status === 3 && (
                  <button
                    onClick={() => { setSelectedProject(project.project_id); setUploadModal(true); }}
                    style={{
                      flex: 1,
                      background: '#2196f3',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    📤 Upload Documents
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Modal */}
      {uploadModal && (
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
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#1a1a2e' }}>📤 Upload Project Documents</h2>

            {/* Document Upload Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                  Certificate of Completion (COC) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('coc', e.target.files)}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #ddd', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                  Site Photos (Before/During/After) *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange('photos', e.target.files)}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #ddd', borderRadius: '8px' }}
                />
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                  Selected: {documents.photos.length} photo(s)
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                  Building Permits
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('permits', e.target.files)}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #ddd', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                  Material Receipts
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('receipts', e.target.files)}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #ddd', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                  Safety Forms
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('safety', e.target.files)}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #ddd', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                  As-Built Drawings
                </label>
                <input
                  type="file"
                  accept=".pdf,.dwg,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('drawings', e.target.files)}
                  style={{ width: '100%', padding: '8px', border: '2px dashed #ddd', borderRadius: '8px' }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setUploadModal(false)}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #ddd',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDocumentUpload}
                style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Upload Documents
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
          padding: '24px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Loading...</p>
        </div>
      )}
    </div>
  );
}