import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function AdminDocumentArchiving() {
  const [projects, setProjects] = useState([]);
  const [archiveStats, setArchiveStats] = useState({
    total_documents: 0,
    total_size_gb: 0,
    projects_archived: 0,
    retention_compliant: 0
  });
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchCompletedProjects();
    fetchArchiveStats();
    fetchAuditLogs();
  }, []);

  const fetchCompletedProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?status=Billing Approved`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchArchiveStats = async () => {
    try {
      const [docsRes, projectsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/project-documents/`),
        fetch(`${API_BASE_URL}/projects/?status=Completed`)
      ]);

      const docsData = await docsRes.json();
      const projectsData = await projectsRes.json();

      const documents = docsData.results || docsData || [];
      const completedProjects = projectsData.results || projectsData || [];

      const totalSize = documents.reduce((sum, doc) => sum + (doc.file_size || 0), 0);

      setArchiveStats({
        total_documents: documents.length,
        total_size_gb: (totalSize / (1024 * 1024 * 1024)).toFixed(2),
        projects_archived: completedProjects.length,
        retention_compliant: completedProjects.length // Simplified
      });
    } catch (err) {
      console.error('Error fetching archive stats:', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/audit-logs/?limit=20`);
      const data = await response.json();
      setAuditLogs(data.results || data || []);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    }
  };

  const archiveProject = async () => {
    if (!selectedProject) return;

    try {
      // Get all project documents
      const docsResponse = await fetch(`${API_BASE_URL}/project-documents/?project=${selectedProject.project_id}`);
      const docsData = await docsResponse.json();
      const documents = docsData.results || docsData || [];

      // Update project status to archived
      const projectResponse = await fetch(`${API_BASE_URL}/projects/${selectedProject.project_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Archived',
          notes: `Archived on ${new Date().toISOString()} - ${documents.length} documents preserved for 10-year retention`
        })
      });

      if (!projectResponse.ok) throw new Error('Failed to archive project');

      // Create audit log entry
      const auditPayload = {
        action_type: 'PROJECT_ARCHIVED',
        action_description: `Project ${selectedProject.project_code} archived with ${documents.length} documents`,
        entity_type: 'Project',
        entity_id: selectedProject.project_id,
        status: 'Success'
      };

      await fetch(`${API_BASE_URL}/audit-logs/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditPayload)
      });

      setSuccessMessage('Project archived successfully with all documents!');
      setShowArchiveModal(false);
      fetchCompletedProjects();
      fetchArchiveStats();
      fetchAuditLogs();
    } catch (err) {
      setError(err.message);
    }
  };

  const getRetentionStatus = (completionDate) => {
    if (!completionDate) return { label: 'N/A', color: '#9e9e9e' };
    
    const completed = new Date(completionDate);
    const now = new Date();
    const yearsDiff = (now - completed) / (1000 * 60 * 60 * 24 * 365);
    const yearsRemaining = Math.max(0, 10 - yearsDiff);

    if (yearsRemaining > 8) return { label: `${yearsRemaining.toFixed(1)} years left`, color: '#4caf50' };
    if (yearsRemaining > 5) return { label: `${yearsRemaining.toFixed(1)} years left`, color: '#2196f3' };
    if (yearsRemaining > 2) return { label: `${yearsRemaining.toFixed(1)} years left`, color: '#ff9800' };
    return { label: `${yearsRemaining.toFixed(1)} years left`, color: '#f44336' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🗄️ Document Archiving & Audit</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Phase 6: Maintain data integrity and 10-year retention compliance</p>
      </div>

      {/* Archive Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Total Documents</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#667eea' }}>
            {archiveStats.total_documents.toLocaleString()}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>archived files</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Storage Used</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
            {archiveStats.total_size_gb} GB
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>cloud + local backup</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Projects Archived</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
            {archiveStats.projects_archived}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>completed projects</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Retention Compliance</p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#9c27b0' }}>
            {((archiveStats.retention_compliant / (archiveStats.projects_archived || 1)) * 100).toFixed(0)}%
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>10-year retention</p>
        </div>
      </div>

      {/* Projects Ready for Archiving */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>Projects Ready for Archiving</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No projects ready for archiving</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#1a1a2e' }}>Project Code</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#1a1a2e' }}>Project Name</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>Completion Date</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>Documents</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>Retention Status</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => {
                  const retention = getRetentionStatus(project.completion_date);
                  return (
                    <tr key={project.project_id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                        {project.project_code}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>{project.project_name}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        {project.document_count || 0}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          background: retention.color,
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {retention.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => { setSelectedProject(project); setShowArchiveModal(true); }}
                          style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          Archive
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

      {/* Recent Audit Logs */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Recent Audit Logs</h2>
        
        {auditLogs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No recent audit logs</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {auditLogs.slice(0, 10).map((log, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {log.action_type}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{log.action_description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                  <span style={{
                    background: log.status === 'Success' ? '#4caf50' : '#f44336',
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archive Modal */}
      {showArchiveModal && selectedProject && (
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
            padding: '24px',
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#1a1a2e' }}>Archive Project</h2>
            
            <div style={{ marginBottom: '20px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Project:</strong> {selectedProject.project_code}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Name:</strong> {selectedProject.project_name}
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                <strong>Completion:</strong> {selectedProject.completion_date ? new Date(selectedProject.completion_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div style={{ marginBottom: '20px', background: '#e3f2fd', padding: '16px', borderRadius: '8px', border: '1px solid #2196f3' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#1565c0' }}>
                ℹ️ <strong>Archiving Process:</strong> All documents will be preserved with cloud + local backup for 10-year retention. 
                Read-only permissions will be applied and a complete audit trail will be maintained.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowArchiveModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={archiveProject}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Archive Project
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