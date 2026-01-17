import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function SupervisorProjectCreation() {
  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [qiUsers, setQiUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');

  const [formData, setFormData] = useState({
    project_code: '',
    project_name: '',
    vendor: '',
    sector: '',
    assigned_qi: '',
    project_type: '',
    project_description: '',
    contract_value: '',
    project_location: '',
    start_date: '',
    expected_billing_date: '',
    priority: 'Medium',
    sla_deadline_days: 7
  });

  useEffect(() => {
    const storedUserId = JSON.parse(localStorage?.getItem('user') || '{}')?.user_id || '1';
    setUserId(storedUserId);
    fetchProjects();
    fetchVendors();
    fetchQIUsers();
    fetchSectors();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/?is_active=true`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchQIUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      const allUsers = data.results || data || [];
      const qis = allUsers.filter(u => u.role_name?.toLowerCase().includes('qi') || u.role_name?.toLowerCase().includes('inspector'));
      setQiUsers(qis);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchSectors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sectors/?is_active=true`);
      if (!response.ok) throw new Error('Failed to fetch sectors');
      const data = await response.json();
      setSectors(data.results || data || []);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleCreateProject = async () => {
    try {
      const payload = {
        ...formData,
        wo_supervisor: userId,
        status: 1, // Created status
        created_at: new Date().toISOString()
      };

      const response = await fetch(`${API_BASE_URL}/projects/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      alert('✅ Project created successfully! Vendor will be notified.');
      setShowCreateModal(false);
      fetchProjects();
      
      // Reset form
      setFormData({
        project_code: '',
        project_name: '',
        vendor: '',
        sector: '',
        assigned_qi: '',
        project_type: '',
        project_description: '',
        contract_value: '',
        project_location: '',
        start_date: '',
        expected_billing_date: '',
        priority: 'Medium',
        sla_deadline_days: 7
      });
    } catch (err) {
      alert('❌ Error creating project: ' + err.message);
    }
  };

  const handleApproveDocuments = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 5 // Approved status
        })
      });

      if (!response.ok) throw new Error('Failed to approve');
      
      alert('✅ Documents approved! Project moved to next phase.');
      fetchProjects();
    } catch (err) {
      alert('❌ Error: ' + err.message);
    }
  };

  const getStatusBadge = (statusId) => {
    const statuses = {
      1: { label: 'Created', color: '#2196f3', icon: '📝' },
      2: { label: 'In Progress', color: '#ff9800', icon: '⚙️' },
      3: { label: 'Completed', color: '#9c27b0', icon: '✓' },
      4: { label: 'Awaiting Documents', color: '#f44336', icon: '📄' },
      5: { label: 'Documents Approved', color: '#4caf50', icon: '✅' }
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
        {priority}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: '700' }}>
              Project Creation & Assignment
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Create projects → Assign to vendors → Set SLA deadlines → Review submissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            ➕ Create New Project
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Projects', value: projects.length, color: '#2196f3', icon: '📊' },
          { label: 'In Progress', value: projects.filter(p => p.status === 2).length, color: '#ff9800', icon: '⚙️' },
          { label: 'Awaiting Docs', value: projects.filter(p => p.status === 4).length, color: '#f44336', icon: '📄' },
          { label: 'Approved', value: projects.filter(p => p.status === 5).length, color: '#4caf50', icon: '✅' }
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

      {/* Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {projects.map((project) => (
          <div key={project.project_id} style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.1)';
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '11px', fontWeight: '600' }}>VENDOR</p>
                  <p style={{ margin: 0, color: '#1a1a2e', fontWeight: '600' }}>
                    {vendors.find(v => v.vendor_id === project.vendor)?.vendor_code || 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '11px', fontWeight: '600' }}>QI ASSIGNED</p>
                  <p style={{ margin: 0, color: '#1a1a2e', fontWeight: '600' }}>
                    {qiUsers.find(q => q.user_id === project.assigned_qi)?.first_name || 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '11px', fontWeight: '600' }}>CONTRACT VALUE</p>
                  <p style={{ margin: 0, color: '#1a1a2e', fontWeight: '600' }}>
                    ₱{project.contract_value?.toLocaleString() || '0'}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '11px', fontWeight: '600' }}>START DATE</p>
                  <p style={{ margin: 0, color: '#1a1a2e', fontWeight: '600' }}>
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            {project.project_location && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#999', fontSize: '11px', fontWeight: '600' }}>📍 LOCATION</p>
                <p style={{ margin: 0, color: '#1a1a2e', fontSize: '13px' }}>{project.project_location}</p>
              </div>
            )}

            {/* Action Buttons */}
            {project.status === 4 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('📄 Viewing documents for ' + project.project_code);
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
                  📄 View Documents
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApproveDocuments(project.project_id);
                  }}
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
                  ✅ Approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
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
              ➕ Create New Project
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Project Code *
                </label>
                <input
                  type="text"
                  value={formData.project_code}
                  onChange={(e) => setFormData({...formData, project_code: e.target.value})}
                  placeholder="e.g., PROJ-2025-001"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Project Name *
                </label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData({...formData, project_name: e.target.value})}
                  placeholder="Project Name"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Vendor *
                </label>
                <select
                  value={formData.vendor}
                  onChange={(e) => setFormData({...formData, vendor: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                >
                  <option value="">Select Vendor</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.vendor_id} value={vendor.vendor_id}>
                      {vendor.vendor_code} - {vendor.vendor_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Sector
                </label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({...formData, sector: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                >
                  <option value="">Select Sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.sector_id} value={sector.sector_id}>
                      {sector.sector_code} - {sector.sector_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Assigned QI
                </label>
                <select
                  value={formData.assigned_qi}
                  onChange={(e) => setFormData({...formData, assigned_qi: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                >
                  <option value="">Select QI</option>
                  {qiUsers.map((qi) => (
                    <option key={qi.user_id} value={qi.user_id}>
                      {qi.first_name} {qi.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  SLA Deadline (Days)
                </label>
                <input
                  type="number"
                  value={formData.sla_deadline_days}
                  onChange={(e) => setFormData({...formData, sla_deadline_days: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Contract Value (₱)
                </label>
                <input
                  type="number"
                  value={formData.contract_value}
                  onChange={(e) => setFormData({...formData, contract_value: e.target.value})}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Location
                </label>
                <input
                  type="text"
                  value={formData.project_location}
                  onChange={(e) => setFormData({...formData, project_location: e.target.value})}
                  placeholder="Project Location"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 'bold', color: '#555' }}>
                  Description
                </label>
                <textarea
                  value={formData.project_description}
                  onChange={(e) => setFormData({...formData, project_description: e.target.value})}
                  placeholder="Project Description"
                  rows="4"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e0e0e0', fontSize: '14px', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowCreateModal(false)}
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
                onClick={handleCreateProject}
                style={{
                  flex: 1,
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                Create Project
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