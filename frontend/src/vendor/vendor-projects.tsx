import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface Project {
  project_id: number;
  project_code: string;
  project_name: string;
  project_location?: string;
  contract_value?: number;
  assigned_qi?: string;
  completion_date?: string;
  status: number;
}

interface DocumentState {
  coc: File | null;
  photos: File[];
  permits: File | null;
  receipts: File | null;
  safety: File | null;
  drawings: File | null;
}

interface User {
  user_id: number;
  username: string;
}

interface UploadedDocument {
  id: number;
  document_type: string;
  document_name: string;
  upload_date: string;
  is_approved: boolean;
}

interface ProjectDocuments {
  [projectId: number]: UploadedDocument[];
}

export default function VendorProjectInitiation() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [userId, setUserId] = useState<number>(0);
  const [uploadProgress, setUploadProgress] = useState('');
  const [projectDocuments, setProjectDocuments] = useState<ProjectDocuments>({});
  const [documents, setDocuments] = useState<DocumentState>({
    coc: null,
    photos: [],
    permits: null,
    receipts: null,
    safety: null,
    drawings: null
  });

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    const user: User | null = userStr ? JSON.parse(userStr) : null;
    
    if (user && user.user_id) {
      setUserId(user.user_id);
      fetchVendorProjects(user.user_id);
    } else {
      alert('⚠️ Please log in to continue');
    }
  }, []);

  const fetchUploadedDocuments = async (projectId: number) => {
    try {
      // First, get ALL work orders
      const woResponse = await fetch(`${API_BASE_URL}/work-orders/?project_id=${projectId}`);
      const woData = await woResponse.json();
      
      if (!woData.results || woData.results.length === 0) {
        return [];
      }

      // Filter work orders by project_id on the client side
      const matchingWorkOrders = woData.results;
      
      if (matchingWorkOrders.length === 0) {
        return [];
      }

      const workOrderId = matchingWorkOrders[0].id;
      
      // Fetch ALL documents
      const docsResponse = await fetch(`${API_BASE_URL}/work-order-documents/`);
      const docsData = await docsResponse.json();
      
      const allDocs = docsData.results || docsData || [];
      
      // Filter documents by work_order id on the client side
      const filteredDocs = allDocs.filter((doc: any) => doc.work_order === workOrderId);
      
      return filteredDocs;
    } catch (err) {
      console.error('Error fetching documents for project:', projectId, err);
      return [];
    }
  };

  const fetchVendorProjects = async (uId: number) => {
    setLoading(true);
    try {
      const vendorResponse = await fetch(`${API_BASE_URL}/vendors/?user_id=${uId}`);
      const vendorData = await vendorResponse.json();

      if (!vendorData.results || vendorData.results.length === 0) {
        alert('No vendor found for your account');
        setLoading(false);
        return;
      }

      const vendorId = vendorData.results[0].vendor_id;
      
      const response = await fetch(`${API_BASE_URL}/projects/?vendor=${vendorId}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      const projectList = data.results || data || [];
      setProjects(projectList);

      // Fetch documents for all projects
      const docsMap: ProjectDocuments = {};
      for (const project of projectList) {
        const docs = await fetchUploadedDocuments(project.project_id);
        docsMap[project.project_id] = docs;
      }
      setProjectDocuments(docsMap);
    } catch (err) {
      console.error('Error fetching projects:', err);
      alert('Error loading projects: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type: keyof DocumentState, files: FileList | null) => {
    if (!files) return;
    
    if (type === 'photos') {
      setDocuments(prev => ({ 
        ...prev, 
        photos: [...prev.photos, ...Array.from(files)] 
      }));
    } else {
      setDocuments(prev => ({ ...prev, [type]: files[0] }));
    }
  };

  const handleMarkCompleted = async (projectId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 3,
          completion_date: new Date().toISOString().split('T')[0]
        })
      });

      if (!response.ok) throw new Error('Failed to mark as completed');
      
      alert('✅ Project marked as completed! Please upload documents.');
      
      const project = projects.find(p => p.project_id === projectId);
      if (project) {
        setSelectedProject(project.project_code);
        setSelectedProjectId(projectId);
        setUploadModal(true);
      }
      
      fetchVendorProjects(userId);
    } catch (err) {
      alert('❌ Error: ' + (err as Error).message);
    }
  };

  const uploadDocument = async (
    workOrderId: number, 
    docType: string, 
    document_name: string, 
    file: File,
    description: string
  ) => {
    const fd = new FormData();
    fd.append('work_order', workOrderId.toString());
    fd.append('document_type', docType);
    fd.append('file', file);
    fd.append('uploaded_by', userId.toString());
    fd.append('notes', description);

    const response = await fetch(`${API_BASE_URL}/work-order-documents/`, {
      method: 'POST',
      body: fd
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload error:', errorData);
      throw new Error(`Failed to upload ${document_name}: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  };

  const handleDocumentUpload = async () => {
    if (!selectedProject || !selectedProjectId) {
      alert('No project selected');
      return;
    }

    if (!documents.coc || documents.photos.length === 0) {
      alert('⚠️ COC and at least one photo are required!');
      return;
    }

    if (!userId) {
      alert('⚠️ User not authenticated. Please log in again.');
      return;
    }

    setUploadProgress('Starting upload...');

    try {
      setUploadProgress('Finding work order...');
      
      // Fetch ALL work orders and filter by project_id
      const woResponse = await fetch(`${API_BASE_URL}/work-orders/?project_id=${selectedProjectId}`);
      const woData = await woResponse.json();
      
      if (!woData.results || woData.results.length === 0) {
        throw new Error('No work orders found. Please contact administrator.');
      }
      
      // Filter for matching project_id
      console.log('All work orders:', woData.results);
      console.log('Selected Project ID:', selectedProjectId);
      const matchingWorkOrders = woData.results;
      
      if (matchingWorkOrders.length === 0) {
        throw new Error('No work order found for this project. Please contact administrator.');
      }
      const workOrderId = matchingWorkOrders[0].id;
      let uploadedCount = 0;

      // Upload COC
      if (documents.coc) {
        setUploadProgress('Uploading Certificate of Completion...');
        await uploadDocument(
          workOrderId,
          'COC',
          'Certificate of Completion',
          documents.coc,
          'Certificate of Completion for project'
        );
        uploadedCount++;
      }

      // Upload Permits
      if (documents.permits) {
        setUploadProgress('Uploading Building Permit...');
        await uploadDocument(
          workOrderId,
          'PERMIT',
          'Building Permit',
          documents.permits,
          'Building Permit for project'
        );
        uploadedCount++;
      }

      // Upload Receipts
      if (documents.receipts) {
        setUploadProgress('Uploading Material Receipt...');
        await uploadDocument(
          workOrderId,
          'RECEIPT',
          'Material Receipt',
          documents.receipts,
          'Material Receipt for project'
        );
        uploadedCount++;
      }

      // Upload Safety Forms
      if (documents.safety) {
        setUploadProgress('Uploading Safety Compliance...');
        await uploadDocument(
          workOrderId,
          'SAFETY',
          'Safety Compliance Form',
          documents.safety,
          'Safety Compliance for project'
        );
        uploadedCount++;
      }

      // Upload Drawings
      if (documents.drawings) {
        setUploadProgress('Uploading As-Built Drawing...');
        await uploadDocument(
          workOrderId,
          'DRAWING',
          'As-Built Drawing',
          documents.drawings,
          'As-Built Drawing for project'
        );
        uploadedCount++;
      }

      // Upload Photos
      for (let i = 0; i < documents.photos.length; i++) {
        const photo = documents.photos[i];
        setUploadProgress(`Uploading photo ${i + 1} of ${documents.photos.length}...`);
        
        await uploadDocument(
          workOrderId,
          'PHOTO',
          `Site Photo ${i + 1}`,
          photo,
          `Site photo ${i + 1}`
        );
        uploadedCount++;
      }

      const confirmationNumber = Math.random().toString(36).substr(2, 9).toUpperCase();
      alert(`✅ ${uploadedCount} document(s) uploaded successfully!\n\nConfirmation: ${confirmationNumber}\n\nDocuments saved to server.`);
      
      setUploadModal(false);
      setUploadProgress('');
      setDocuments({ 
        coc: null, 
        photos: [], 
        permits: null, 
        receipts: null, 
        safety: null, 
        drawings: null 
      });
      fetchVendorProjects(userId);
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Upload error: ' + (err as Error).message);
      setUploadProgress('');
    }
  };

  const getStatusBadge = (statusId: number): JSX.Element => {
    const statuses: Record<number, { label: string; color: string }> = {
      1: { label: 'Created', color: '#2196f3' },
      2: { label: 'In Progress', color: '#ff9800' },
      3: { label: 'Completed', color: '#4caf50' },
      4: { label: 'Awaiting Documents', color: '#f44336' }
    };
    
    const status = statuses[statusId] || { label: 'Unknown', color: '#999' };
    
    return (
      <span style={{ 
        background: status.color, 
        color: 'white', 
        padding: '4px 12px', 
        borderRadius: '12px', 
        fontSize: '12px', 
        fontWeight: 'bold' 
      }}>
        {status.label}
      </span>
    );
  };

  const calculateSLADays = (completionDate?: string): number | null => {
    if (!completionDate) return null;
    const days = Math.floor((new Date().getTime() - new Date(completionDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDocumentTypeLabel = (docType: string): string => {
    const labels: Record<string, string> = {
      'COC': 'Certificate of Completion',
      'PERMIT': 'Building Permit',
      'RECEIPT': 'Material Receipt',
      'SAFETY': 'Safety Compliance',
      'DRAWING': 'As-Built Drawing',
      'PHOTO': 'Site Photo'
    };
    return labels[docType] || docType;
  };

  const hasDocumentType = (projectId: number, docType: string): boolean => {
    const docs = projectDocuments[projectId] || [];
    return docs.some(doc => doc.document_type === docType);
  };

  const getDocumentCount = (projectId: number, docType: string): number => {
    const docs = projectDocuments[projectId] || [];
    return docs.filter(doc => doc.document_type === docType).length;
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '24px', 
        marginBottom: '20px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)' 
      }}>
        <h1 style={{ 
          margin: '0 0 8px 0', 
          fontSize: '32px', 
          color: '#1a1a2e', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          📋 Project Initiation & Document Submission
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Complete physical work → Mark as completed → Upload required documents
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', 
        gap: '20px' 
      }}>
        {projects.map((project) => {
          const slaDays = calculateSLADays(project.completion_date);
          const isOverdue = slaDays !== null && slaDays > 7;
          const uploadedDocs = projectDocuments[project.project_id] || [];

          return (
            <div key={project.project_id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: isOverdue ? '3px solid #f44336' : 'none'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start', 
                marginBottom: '16px' 
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1a1a2e' }}>
                    {project.project_code}
                  </h3>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                    {project.project_name}
                  </p>
                  {getStatusBadge(project.status)}
                </div>
              </div>

              <div style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <p style={{ margin: 0, color: "black" }}>
                    <strong>Location:</strong> {project.project_location || 'N/A'}
                  </p>
                  <p style={{ margin: 0, color: "black" }}>
                    <strong>Contract Value:</strong> ₱{project.contract_value?.toLocaleString() || '0'}
                  </p>
                  <p style={{ margin: 0, color: "black" }}>
                    <strong>Assigned QI:</strong> {project.assigned_qi || 'Not yet assigned'}
                  </p>
                  {project.completion_date && (
                    <p style={{ margin: 0, color: "black" }}>
                      <strong>Completed:</strong> {new Date(project.completion_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {uploadedDocs.length > 0 && (
                <div style={{
                  background: '#e8f5e9',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: '2px solid #4caf50'
                }}>
                  <p style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: '#2e7d32' 
                  }}>
                    📁 UPLOADED DOCUMENTS ({uploadedDocs.length})
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {hasDocumentType(project.project_id, 'COC') && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#2e7d32' }}>
                        ✓ Certificate of Completion
                      </p>
                    )}
                    {getDocumentCount(project.project_id, 'PHOTO') > 0 && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#2e7d32' }}>
                        ✓ Site Photos ({getDocumentCount(project.project_id, 'PHOTO')})
                      </p>
                    )}
                    {hasDocumentType(project.project_id, 'PERMIT') && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#2e7d32' }}>
                        ✓ Building Permit
                      </p>
                    )}
                    {hasDocumentType(project.project_id, 'RECEIPT') && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#2e7d32' }}>
                        ✓ Material Receipt
                      </p>
                    )}
                    {hasDocumentType(project.project_id, 'SAFETY') && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#2e7d32' }}>
                        ✓ Safety Compliance
                      </p>
                    )}
                    {hasDocumentType(project.project_id, 'DRAWING') && (
                      <p style={{ margin: 0, fontSize: '12px', color: '#2e7d32' }}>
                        ✓ As-Built Drawing
                      </p>
                    )}
                  </div>
                </div>
              )}

              {project.completion_date && (
                <div style={{
                  background: isOverdue ? '#ffebee' : '#e3f2fd',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '16px',
                  border: `2px solid ${isOverdue ? '#f44336' : '#2196f3'}`
                }}>
                  <p style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '12px', 
                    fontWeight: 'bold', 
                    color: isOverdue ? '#f44336' : '#2196f3' 
                  }}>
                    SLA COUNTDOWN
                  </p>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: isOverdue ? '#f44336' : '#2196f3' 
                  }}>
                    {slaDays !== null ? `${7 - slaDays} days remaining` : 'N/A'}
                  </p>
                  {isOverdue && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#f44336' }}>
                      ⚠️ OVERDUE! Penalty may apply
                    </p>
                  )}
                </div>
              )}

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
                    onClick={() => { 
                      setSelectedProject(project.project_code); 
                      setSelectedProjectId(project.project_id);
                      setUploadModal(true); 
                    }}
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

      {uploadModal && selectedProjectId && (
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
            <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', color: '#1a1a2e' }}>
              📤 Upload Project Documents
            </h2>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#666' }}>
              Project: <strong>{selectedProject}</strong>
            </p>

            {uploadProgress && (
              <div style={{
                background: '#e3f2fd',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                color: '#2196f3',
                fontWeight: 'bold'
              }}>
                {uploadProgress}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '14px' 
                }}>
                  Certificate of Completion (COC) * 
                  <span style={{ color: '#f44336' }}> Required</span>
                  {hasDocumentType(selectedProjectId, 'COC') && (
                    <span style={{ color: '#4caf50', marginLeft: '8px' }}>✓ Already uploaded</span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('coc', e.target.files)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px' 
                  }}
                />
                {documents.coc && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4caf50' }}>
                    ✓ {documents.coc.name}
                  </p>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '14px' 
                }}>
                  Site Photos (Before/During/After) * 
                  <span style={{ color: '#f44336' }}> Required</span>
                  {getDocumentCount(selectedProjectId, 'PHOTO') > 0 && (
                    <span style={{ color: '#4caf50', marginLeft: '8px' }}>
                      ✓ {getDocumentCount(selectedProjectId, 'PHOTO')} uploaded
                    </span>
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileChange('photos', e.target.files)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px' 
                  }}
                />
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: '12px', 
                  color: documents.photos.length > 0 ? '#4caf50' : '#666' 
                }}>
                  {documents.photos.length > 0 ? '✓ ' : ''}Selected: {documents.photos.length} photo(s)
                </p>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '14px' 
                }}>
                  Building Permits
                  {hasDocumentType(selectedProjectId, 'PERMIT') && (
                    <span style={{ color: '#4caf50', marginLeft: '8px' }}>✓ Already uploaded</span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('permits', e.target.files)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px' 
                  }}
                />
                {documents.permits && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4caf50' }}>
                    ✓ {documents.permits.name}
                  </p>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '14px' 
                }}>
                  Material Receipts
                  {hasDocumentType(selectedProjectId, 'RECEIPT') && (
                    <span style={{ color: '#4caf50', marginLeft: '8px' }}>✓ Already uploaded</span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('receipts', e.target.files)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px' 
                  }}
                />
                {documents.receipts && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4caf50' }}>
                    ✓ {documents.receipts.name}
                  </p>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '14px' 
                }}>
                  Safety Forms
                  {hasDocumentType(selectedProjectId, 'SAFETY') && (
                    <span style={{ color: '#4caf50', marginLeft: '8px' }}>✓ Already uploaded</span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('safety', e.target.files)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px' 
                  }}
                />
                {documents.safety && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4caf50' }}>
                    ✓ {documents.safety.name}
                  </p>
                )}
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: 'bold', 
                  fontSize: '14px' 
                }}>
                  As-Built Drawings
                  {hasDocumentType(selectedProjectId, 'DRAWING') && (
                    <span style={{ color: '#4caf50', marginLeft: '8px' }}>✓ Already uploaded</span>
                  )}
                </label>
                <input
                  type="file"
                  accept=".pdf,.dwg,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange('drawings', e.target.files)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '2px dashed #ddd', 
                    borderRadius: '8px' 
                  }}
                />
                {documents.drawings && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#4caf50' }}>
                    ✓ {documents.drawings.name}
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => {
                  setUploadModal(false);
                  setUploadProgress('');
                }}
                disabled={uploadProgress !== ''}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #ddd',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: uploadProgress ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  opacity: uploadProgress ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDocumentUpload}
                disabled={uploadProgress !== ''}
                style={{
                  flex: 1,
                  background: uploadProgress ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: uploadProgress ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {uploadProgress ? 'Uploading...' : 'Upload Documents'}
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
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 2000
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Loading...</p>
        </div>
      )}
    </div>
  );
}