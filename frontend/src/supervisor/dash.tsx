import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, TrendingUp, FileText, Users, Plus, Edit2, 
  Trash2, X, Save, Eye, Clock, AlertTriangle, DollarSign, Calendar,
  Activity, Briefcase, ClipboardCheck, FileCheck, BarChart3, Settings,
  Download, Upload, Filter, Search, RefreshCw, Send, MessageSquare,
  Target, Award, Zap, TrendingDown, Package, CheckSquare, XCircle
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  maxWidth: {
    maxWidth: '1800px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: '1px solid #334155',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: '0.5rem',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.125rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
  },
  buttonSuccess: {
    backgroundColor: '#10b981',
    color: '#ffffff',
  },
  buttonDanger: {
    backgroundColor: '#ef4444',
    color: '#ffffff',
  },
  buttonWarning: {
    backgroundColor: '#f59e0b',
    color: '#ffffff',
  },
  buttonSecondary: {
    backgroundColor: '#475569',
    color: '#cbd5e1',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#334155',
    borderRadius: '16px',
    padding: '1.5rem',
    textAlign: 'center',
    border: '2px solid #475569',
    transition: 'all 0.3s ease',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  featureCard: {
    padding: '2rem',
    border: '3px solid #334155',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#1e293b',
    textAlign: 'left',
  },
  badge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '600',
    display: 'inline-block',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
    overflow: 'auto',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #334155',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    color: '#cbd5e1',
    marginBottom: '0.5rem',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#334155',
    border: '2px solid #475569',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#334155',
    border: '2px solid #475569',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#334155',
    border: '2px solid #475569',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    minHeight: '100px',
    resize: 'vertical',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  th: {
    backgroundColor: '#334155',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '700',
    color: '#cbd5e1',
    borderBottom: '2px solid #475569',
    fontSize: '0.95rem',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #334155',
    color: '#cbd5e1',
    fontSize: '0.95rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  iconButton: {
    padding: '0.5rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    border: '4px solid #334155',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    width: '56px',
    height: '56px',
    animation: 'spin 1s linear infinite',
  },
  alert: {
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  alertSuccess: {
    backgroundColor: '#064e3b',
    border: '2px solid #10b981',
    color: '#6ee7b7',
  },
  alertError: {
    backgroundColor: '#7f1d1d',
    border: '2px solid #ef4444',
    color: '#fca5a5',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #334155',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.875rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#94a3b8',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease',
    fontSize: '0.95rem',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  detailCard: {
    backgroundColor: '#334155',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '2px solid #475569',
  },
  searchBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '1rem',
  },
};

class APIService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Token ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const EngineerDashboard = () => {
  const [state, setState] = useState({
    user: null,
    token: null,
    loading: false,
    error: null,
    success: null,
    isAuth: false,
  });

  const [view, setView] = useState('dashboard');
  const [data, setData] = useState(null);
  const [modal, setModal] = useState({ show: false, type: '', item: null });
  const [form, setForm] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const emptyPaged = { count: 0, next: null, previous: null, results: [] };

const [metadata, setMetadata] = useState({
  vendors: emptyPaged,
  sectors: emptyPaged,
  statuses: emptyPaged,
  users: emptyPaged,
  inspectionTypes: emptyPaged,
  documentTypes: emptyPaged,
  delayFactors: emptyPaged,
});

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    vendor: '',
  });

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    const user = sessionStorage.getItem('user_data');
    if (token && user) {
      setState(p => ({ ...p, token, user: JSON.parse(user), isAuth: true }));
      loadMetadata(token);
      loadData('dashboard', token);
    }
  }, []);

  const api = state.token ? new APIService(API_BASE, state.token) : null;

  const loadMetadata = async (token) => {
    const tempApi = new APIService(API_BASE, token);
    try {
      const [vendors, sectors, statuses, users, inspectionTypes, documentTypes, delayFactors] = await Promise.all([
        tempApi.get('/api/v1/vendors/'),
        tempApi.get('/api/v1/sectors/'),
        tempApi.get('/api/v1/project-statuses/'),
        tempApi.get('/api/v1/users/'),
        tempApi.get('/api/v1/inspection-types/'),
        tempApi.get('/api/v1/document-types/'),
        tempApi.get('/api/v1/delay-factors/'),
      ]);
      setMetadata({ vendors, sectors, statuses, users, inspectionTypes, documentTypes, delayFactors });
      console.log('Metadata loaded:', { vendors, sectors, statuses, users, inspectionTypes, documentTypes, delayFactors });
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  const showSuccess = (message) => {
    setState(p => ({ ...p, success: message }));
    setTimeout(() => setState(p => ({ ...p, success: null })), 3000);
  };

  const showError = (message) => {
    setState(p => ({ ...p, error: message }));
    setTimeout(() => setState(p => ({ ...p, error: null })), 5000);
  };

  const loadData = async (v, tkn = state.token) => {
    setState(p => ({ ...p, loading: true, error: null }));
    try {
      const endpoints = {
        dashboard: '/api/v1/dashboard/user/',
        projects: '/api/v1/engineer/my_projects/',
        workorders: '/api/v1/work-orders/',
        approvals: '/api/v1/engineer/pending_approvals/',
        sla: '/api/v1/engineer/sla_compliance/',
        vendors: '/api/v1/engineer/vendor_performance/',
        documents: '/api/v1/project-documents/',
        costs: '/api/v1/projects/',
        delays: '/api/v1/project-delays/',
        milestones: '/api/v1/project-milestones/',
        team: '/api/v1/project-team/',
        inspections: '/api/v1/qi-inspections/',
      };
      
      const result = await fetch(`${API_BASE}${endpoints[v] || endpoints.dashboard}`, {
        headers: { 'Authorization': `Token ${tkn}` }
      }).then(r => r.json());
      
      setData(result);
    } catch (err) {
      showError(err.message || 'Failed to load data');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const openModal = (type, item = null) => {
    setModal({ show: true, type, item });
    setForm(item || {});
  };

  const closeModal = () => {
    setModal({ show: false, type: '', item: null });
    setForm({});
  };

  const handleSubmit = async () => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      const endpoints = {
        project: modal.item ? `/api/v1/projects/${modal.item.project_id}/` : '/api/v1/projects/',
        workorder: modal.item ? `/api/v1/work-orders/${modal.item.wo_id}/` : '/api/v1/work-orders/',
        document: '/api/v1/project-documents/',
        delay: '/api/v1/project-delays/',
        milestone: '/api/v1/project-milestones/',
        inspection: '/api/v1/qi-inspections/',
        team: '/api/v1/project-team/',
      };
      
      const method = modal.item ? 'put' : 'post';
      await api[method](endpoints[modal.type], form);
      
      showSuccess(`${modal.type} ${modal.item ? 'updated' : 'created'} successfully`);
      closeModal();
      loadData(view);
    } catch (err) {
      showError(err.message || 'Operation failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const handleDelete = async (type, id) => {
    if (!api || !confirm('Are you sure you want to delete this item?')) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      const endpoints = {
        project: `/api/v1/projects/${id}/`,
        workorder: `/api/v1/work-orders/${id}/`,
        document: `/api/v1/project-documents/${id}/`,
        delay: `/api/v1/project-delays/${id}/`,
        milestone: `/api/v1/project-milestones/${id}/`,
      };
      await api.delete(endpoints[type]);
      showSuccess('Deleted successfully');
      loadData(view);
    } catch (err) {
      showError(err.message || 'Delete failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const handleApprove = async (type, id, approved) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      if (type === 'document') {
        await api.put(`/api/v1/project-documents/${id}/`, {
          approval_status: approved ? 'Approved' : 'Rejected'
        });
      } else if (type === 'inspection') {
        await api.put(`/api/v1/qi-inspections/${id}/`, {
          is_completed: approved
        });
      }
      showSuccess(`${type} ${approved ? 'approved' : 'rejected'} successfully`);
      loadData('approvals');
    } catch (err) {
      showError(err.message || 'Approval failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const handleRequestInspection = async (projectId) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      await api.post('/api/v1/qi-inspections/', {
        project: projectId,
        scheduled_date: new Date().toISOString().split('T')[0],
      });
      showSuccess('Inspection requested successfully');
    } catch (err) {
      showError(err.message || 'Request failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const renderDashboard = () => (
    <div>
      <div style={styles.statsGrid}>
        {[
          { icon: Briefcase, label: 'Total Projects', value: data?.stats?.total_projects || 0, color: '#3b82f6' },
          { icon: Activity, label: 'Active Projects', value: data?.stats?.active_projects || 0, color: '#10b981' },
          { icon: AlertTriangle, label: 'Delayed', value: data?.stats?.delayed_projects || 0, color: '#f59e0b' },
          { icon: ClipboardCheck, label: 'Pending Approvals', value: data?.stats?.pending_approvals || 0, color: '#8b5cf6' },
          { icon: FileCheck, label: 'Work Orders', value: data?.stats?.work_orders || 0, color: '#06b6d4' },
          { icon: CheckCircle, label: 'SLA Compliance', value: `${data?.stats?.sla_compliance || 0}%`, color: '#10b981' },
          { icon: Users, label: 'Active Vendors', value: data?.stats?.active_vendors || 0, color: '#f59e0b' },
          { icon: DollarSign, label: 'Total Budget', value: `₱${(data?.stats?.total_budget || 0).toLocaleString()}`, color: '#ef4444' },
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <stat.icon size={40} color={stat.color} style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ color: '#94a3b8', fontWeight: '600' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', marginBottom: '1.5rem' }}>
          Engineer Functions & Quick Actions
        </h2>
        <div style={styles.featureGrid}>
          {[
            { icon: Briefcase, label: 'Project Management', desc: 'View, create, update projects and track timelines', view: 'projects', color: '#3b82f6' },
            { icon: FileCheck, label: 'Work Order Management', desc: 'Create work orders, update details, track progress', view: 'workorders', color: '#10b981' },
            { icon: ClipboardCheck, label: 'Approvals', desc: 'Review and approve technical documents & inspections', view: 'approvals', color: '#8b5cf6' },
            { icon: FileText, label: 'Technical Documents', desc: 'Upload, review, and approve engineering drawings', view: 'documents', color: '#06b6d4' },
            { icon: Users, label: 'Vendor Coordination', desc: 'Monitor performance, review submittals, approve specs', view: 'vendors', color: '#f59e0b' },
            { icon: DollarSign, label: 'Cost & Budget Tracking', desc: 'Track project costs, update contract values, billing', view: 'costs', color: '#ef4444' },
            { icon: TrendingUp, label: 'SLA Compliance', desc: 'Monitor SLA metrics and compliance tracking', view: 'sla', color: '#14b8a6' },
            { icon: Clock, label: 'Delay Analysis', desc: 'Analyze delays, report factors, provide solutions', view: 'delays', color: '#f43f5e' },
            { icon: Target, label: 'Project Milestones', desc: 'Track milestones, manage project timeline', view: 'milestones', color: '#8b5cf6' },
            { icon: Award, label: 'Quality Coordination', desc: 'Request QI inspections, review quality reports', view: 'inspections', color: '#10b981' },
            { icon: Users, label: 'Team Management', desc: 'Manage project team assignments and roles', view: 'team', color: '#06b6d4' },
            { icon: BarChart3, label: 'Analytics & Reports', desc: 'Generate project reports and view analytics', view: 'analytics', color: '#f59e0b' },
          ].map((feature, i) => (
            <button
              key={i}
              onClick={() => { setView(feature.view); loadData(feature.view); }}
              style={{ ...styles.featureCard, border: `3px solid ${feature.color}` }}
            >
              <feature.icon size={48} color={feature.color} style={{ marginBottom: '1rem' }} />
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#fff', marginBottom: '0.5rem' }}>
                {feature.label}
              </div>
              <div style={{ color: '#94a3b8', lineHeight: '1.5' }}>{feature.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {data?.recent_activity && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
            Recent Activity
          </h3>
          {data.recent_activity.map((activity, i) => (
            <div key={i} style={{...styles.detailCard, marginBottom: '0.75rem'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>{activity.description}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{activity.timestamp}</div>
                </div>
                <span style={{
                  ...styles.badge,
                  backgroundColor: activity.type === 'success' ? '#064e3b' : activity.type === 'warning' ? '#78350f' : '#1e3a8a',
                  color: activity.type === 'success' ? '#6ee7b7' : activity.type === 'warning' ? '#fde68a' : '#93c5fd'
                }}>
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjects = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Project Management
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('project')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Plus size={18} />
            New Project
          </button>
          <button
            onClick={() => setView('dashboard')}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div style={styles.searchBar}>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            placeholder="Search projects..."
            style={{ ...styles.input }}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <select
          style={{ ...styles.select, minWidth: '150px' }}
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
        >
          <option value="">All Status</option>
          {metadata.statuses.results.map(s => (
            <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
          ))}
        </select>
        <select
          style={{ ...styles.select, minWidth: '150px' }}
          value={filters.vendor}
          onChange={(e) => setFilters({...filters, vendor: e.target.value})}
        >
          <option value="">All Vendors</option>
          {metadata.vendors.results.map(v => (
            <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
          ))}
        </select>
        <button
          onClick={() => loadData('projects')}
          style={{ ...styles.iconButton, backgroundColor: '#3b82f6', padding: '0.75rem' }}
        >
          <RefreshCw size={18} color="#fff" />
        </button>
      </div>

      <div style={styles.tabs}>
        {['All Projects', 'Active', 'Pending Review', 'Delayed', 'SLA Risk', 'Completed'].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTab(idx)}
            style={{
              ...styles.tab,
              ...(selectedTab === idx ? styles.tabActive : {})
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {state.loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={styles.spinner} />
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Project Code</th>
                <th style={styles.th}>Project Name</th>
                <th style={styles.th}>Vendor</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Start Date</th>
                <th style={styles.th}>Completion</th>
                <th style={styles.th}>Budget</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.projects?.map((p) => (
                <tr key={p.project_id}>
                  <td style={styles.td}>{p.project_code}</td>
                  <td style={styles.td}>{p.project_name}</td>
                  <td style={styles.td}>{p.vendor?.vendor_name || 'N/A'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: p.is_delayed ? '#7f1d1d' : '#064e3b',
                      color: p.is_delayed ? '#fca5a5' : '#6ee7b7'
                    }}>
                      {p.status?.status_name || 'N/A'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: p.priority === 'Critical' ? '#7f1d1d' : p.priority === 'High' ? '#78350f' : '#1e3a8a',
                      color: p.priority === 'Critical' ? '#fca5a5' : p.priority === 'High' ? '#fde68a' : '#93c5fd'
                    }}>
                      {p.priority || 'Medium'}
                    </span>
                  </td>
                  <td style={styles.td}>{p.start_date || 'N/A'}</td>
                  <td style={styles.td}>{p.completion_date || 'N/A'}</td>
                  <td style={styles.td}>₱{(p.contract_value || 0).toLocaleString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => openModal('view', p)}
                        style={{ ...styles.iconButton, backgroundColor: '#4338ca' }}
                        title="View Details"
                      >
                        <Eye size={16} color="#fff" />
                      </button>
                      <button
                        onClick={() => openModal('project', p)}
                        style={{ ...styles.iconButton, backgroundColor: '#3b82f6' }}
                        title="Edit"
                      >
                        <Edit2 size={16} color="#fff" />
                      </button>
                      <button
                        onClick={() => handleRequestInspection(p.project_id)}
                        style={{ ...styles.iconButton, backgroundColor: '#10b981' }}
                        title="Request Inspection"
                      >
                        <CheckSquare size={16} color="#fff" />
                      </button>
                      <button
                        onClick={() => handleDelete('project', p.project_id)}
                        style={{ ...styles.iconButton, backgroundColor: '#ef4444' }}
                        title="Delete"
                      >
                        <Trash2 size={16} color="#fff" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderWorkOrders = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Work Order Management
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('workorder')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Plus size={18} />
            Create Work Order
          </button>
          <button
            onClick={() => setView('dashboard')}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Back
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        {['All', 'New', 'For Audit', 'Audited', 'No COC', 'Paid'].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTab(idx)}
            style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>WO No.</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Vendor</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.work_orders?.map((wo) => (
              <tr key={wo.wo_id}>
                <td style={styles.td}>{wo.wo_no}</td>
                <td style={styles.td}>{wo.description}</td>
                <td style={styles.td}>{wo.location}</td>
                <td style={styles.td}>{wo.vendor?.vendor_name || 'N/A'}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: '#1e3a8a', color: '#93c5fd' }}>
                    {wo.status}
                  </span>
                </td>
                <td style={styles.td}>{wo.priority}</td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => openModal('workorder', wo)}
                      style={{ ...styles.iconButton, backgroundColor: '#3b82f6' }}
                    >
                      <Edit2 size={16} color="#fff" />
                    </button>
                    <button
                      onClick={() => handleDelete('workorder', wo.wo_id)}
                      style={{ ...styles.iconButton, backgroundColor: '#ef4444' }}
                    >
                      <Trash2 size={16} color="#fff" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Pending Approvals
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      <div style={styles.tabs}>
        {[`Documents (${data?.documents?.count || 0})`, `Inspections (${data?.inspections?.count || 0})`, `Projects (${data?.projects?.count || 0})`].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTab(idx)}
            style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}
          >
            {tab}
          </button>
        ))}
      </div>

      {selectedTab === 0 && data?.documents?.items?.map((doc) => (
        <div key={doc.id} style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>{doc.document_name}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Project: {doc.project?.project_code}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
              </p>
            </div>
            <div style={styles.actionButtons}>
              <button
                onClick={() => openModal('view', doc)}
                style={{ ...styles.iconButton, backgroundColor: '#4338ca' }}
              >
                <Eye size={16} color="#fff" />
              </button>
              <button
                onClick={() => handleApprove('document', doc.id, true)}
                style={{ ...styles.button, ...styles.buttonSuccess }}
                disabled={state.loading}
              >
                <CheckCircle size={18} />
                Approve
              </button>
              <button
                onClick={() => handleApprove('document', doc.id, false)}
                style={{ ...styles.button, ...styles.buttonDanger }}
                disabled={state.loading}
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}

      {selectedTab === 1 && data?.inspections?.items?.map((insp) => (
        <div key={insp.id} style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
                {insp.inspection_type?.inspection_name}
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Project: {insp.project?.project_code}
              </p>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Result: {insp.inspection_result}
              </p>
            </div>
            <div style={styles.actionButtons}>
              <button
                onClick={() => handleApprove('inspection', insp.id, true)}
                style={{ ...styles.button, ...styles.buttonSuccess }}
              >
                <CheckCircle size={18} />
                Approve
              </button>
              <button
                onClick={() => handleApprove('inspection', insp.id, false)}
                style={{ ...styles.button, ...styles.buttonDanger }}
              >
                <XCircle size={18} />
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderModal = () => {
    if (!modal.show) return null;

    return (
      <div style={styles.modal} onClick={closeModal}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
              {modal.item && modal.type !== 'view' ? 'Edit' : modal.type === 'view' ? 'View' : 'Create'} {modal.type}
            </h2>
            <button onClick={closeModal} style={{ ...styles.iconButton, backgroundColor: '#475569' }}>
              <X size={20} color="#cbd5e1" />
            </button>
          </div>

          {modal.type === 'view' ? (
            <div style={{ color: '#cbd5e1' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.6', backgroundColor: '#334155', padding: '1.5rem', borderRadius: '8px' }}>
                {JSON.stringify(modal.item, null, 2)}
              </pre>
            </div>
          ) : modal.type === 'project' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Project Code *</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={form.project_code || ''}
                    onChange={(e) => setForm({ ...form, project_code: e.target.value })}
                    placeholder="Enter project code"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Project Type</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={form.project_type || ''}
                    onChange={(e) => setForm({ ...form, project_type: e.target.value })}
                    placeholder="e.g., Construction, Maintenance"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Project Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.project_name || ''}
                  onChange={(e) => setForm({ ...form, project_name: e.target.value })}
                  placeholder="Enter project name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={form.project_description || ''}
                  onChange={(e) => setForm({ ...form, project_description: e.target.value })}
                  placeholder="Enter project description"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Vendor</label>
                  <select
                    style={styles.select}
                    value={form.vendor || ''}
                    onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  >
                    <option value="">Select vendor</option>
                    {metadata.vendors.results.map(v => (
                      <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sector</label>
                  <select
                    style={styles.select}
                    value={form.sector || ''}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  >
                    <option value="">Select sector</option>
                    {metadata.sectors.results.map(s => (
                      <option key={s.sector_id} value={s.sector_id}>{s.sector_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.select}
                    value={form.priority || 'Medium'}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Risk Score</label>
                  <select
                    style={styles.select}
                    value={form.risk_score || 'Low'}
                    onChange={(e) => setForm({ ...form, risk_score: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Start Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.start_date || ''}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Completion Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.completion_date || ''}
                    onChange={(e) => setForm({ ...form, completion_date: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Contract Value (₱)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.contract_value || ''}
                    onChange={(e) => setForm({ ...form, contract_value: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Location</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={form.project_location || ''}
                    onChange={(e) => setForm({ ...form, project_location: e.target.value })}
                    placeholder="Project location"
                  />
                </div>
              </div>
            </>
          ) : modal.type === 'workorder' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>WO Number *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.wo_no || ''}
                  onChange={(e) => setForm({ ...form, wo_no: e.target.value })}
                  placeholder="Enter WO number"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description *</label>
                <textarea
                  style={styles.textarea}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Work order description"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Location</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={form.location || ''}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Priority</label>
                  <select
                    style={styles.select}
                    value={form.priority || 'Medium'}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="VIP">VIP</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Total Manhours</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.total_manhours || ''}
                    onChange={(e) => setForm({ ...form, total_manhours: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estimated Cost (₱)</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.total_estimated_cost || ''}
                    onChange={(e) => setForm({ ...form, total_estimated_cost: e.target.value })}
                  />
                </div>
              </div>
            </>
          ) : modal.type === 'document' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Document Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.document_name || ''}
                  onChange={(e) => setForm({ ...form, document_name: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Document Type</label>
                <select
                  style={styles.select}
                  value={form.doc_type || ''}
                  onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {metadata.documentTypes.results.map(dt => (
                    <option key={dt.doc_type_id} value={dt.doc_type_id}>{dt.doc_type_name}</option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={styles.textarea}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </>
          ) : modal.type === 'delay' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Delay Factor</label>
                <select
                  style={styles.select}
                  value={form.factor || ''}
                  onChange={(e) => setForm({ ...form, factor: e.target.value })}
                >
                  <option value="">Select factor</option>
                  {metadata.delayFactors.map(df => (
                    <option key={df.factor_id} value={df.factor_id}>{df.factor_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Delay Days</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.delay_days || ''}
                    onChange={(e) => setForm({ ...form, delay_days: parseInt(e.target.value) })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Responsible Party</label>
                  <select
                    style={styles.select}
                    value={form.responsible_party || ''}
                    onChange={(e) => setForm({ ...form, responsible_party: e.target.value })}
                  >
                    <option value="">Select</option>
                    <option value="Vendor">Vendor</option>
                    <option value="Internal">Internal</option>
                    <option value="External">External</option>
                  </select>
                </div>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={styles.textarea}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
            </>
          ) : null}

          {modal.type !== 'view' && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={handleSubmit}
                style={{ ...styles.button, ...styles.buttonPrimary, flex: 1 }}
                disabled={state.loading}
              >
                <Save size={18} />
                {state.loading ? 'Saving...' : modal.item ? 'Update' : 'Create'}
              </button>
              <button
                onClick={closeModal}
                style={{ ...styles.button, ...styles.buttonSecondary }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (!state.isAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#1e293b', padding: '3rem', borderRadius: '16px', textAlign: 'center', maxWidth: '500px', border: '1px solid #334155' }}>
          <AlertCircle size={64} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
            Authentication Required
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6' }}>
            Please login to access the Engineer Dashboard. You need valid authentication credentials.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:hover { opacity: 0.9; transform: translateY(-2px); }
        button:active { transform: translateY(0); }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
      `}</style>

      <div style={styles.maxWidth}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Engineer Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome, {state.user?.first_name} {state.user?.last_name} - Complete Engineering Management System
            </p>
          </div>
          <span style={{
            ...styles.badge,
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: '1rem',
            padding: '0.625rem 1.25rem',
            border: '2px solid #60a5fa'
          }}>
            {state.user?.role_name}
          </span>
        </div>

        {state.success && (
          <div style={{ ...styles.alert, ...styles.alertSuccess }}>
            <CheckCircle size={24} />
            <span style={{ fontWeight: '600' }}>{state.success}</span>
          </div>
        )}

        {state.error && (
          <div style={{ ...styles.alert, ...styles.alertError }}>
            <AlertCircle size={24} />
            <span style={{ fontWeight: '600' }}>{state.error}</span>
          </div>
        )}

        {view === 'dashboard' && renderDashboard()}
        {view === 'projects' && renderProjects()}
        {view === 'workorders' && renderWorkOrders()}
        {view === 'approvals' && renderApprovals()}
        {view === 'documents' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Document Management</h2>
            <p style={{ color: '#94a3b8' }}>Upload, review, and approve technical documents</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'vendors' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Vendor Performance</h2>
            <p style={{ color: '#94a3b8' }}>Monitor vendor compliance and performance metrics</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'costs' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Cost & Budget Tracking</h2>
            <p style={{ color: '#94a3b8' }}>Track project costs, update contract values, and review billing</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'sla' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>SLA Compliance</h2>
            <p style={{ color: '#94a3b8' }}>Monitor SLA metrics and compliance rates</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'delays' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Delay Analysis</h2>
            <p style={{ color: '#94a3b8' }}>Analyze delay factors and provide technical solutions</p>
            <button onClick={() => openModal('delay')} style={{ ...styles.button, ...styles.buttonPrimary, marginTop: '1rem', marginRight: '0.5rem' }}>
              <Plus size={18} />
              Report Delay
            </button>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
      </div>

      {renderModal()}
    </div>
  );
};

export default EngineerDashboard;