import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, TrendingUp, FileText, Users, Plus, Edit2, 
  Trash2, X, Save, Eye, Clock, AlertTriangle, DollarSign, Calendar,
  Activity, Briefcase, ClipboardCheck, FileCheck, BarChart3, Settings,
  Download, Upload, Filter, Search, RefreshCw, Send, MessageSquare,
  Target, Award, Zap, TrendingDown, Package, CheckSquare, XCircle,
  Building2, MapPin, UserCheck, PieChart, TrendingUp as Up, Database
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%)',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  maxWidth: {
    maxWidth: '1800px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#2d3748',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: '1px solid #4a5568',
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
    color: '#a0aec0',
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
    backgroundColor: '#4299e1',
    color: '#ffffff',
  },
  buttonSuccess: {
    backgroundColor: '#48bb78',
    color: '#ffffff',
  },
  buttonDanger: {
    backgroundColor: '#f56565',
    color: '#ffffff',
  },
  buttonWarning: {
    backgroundColor: '#ed8936',
    color: '#ffffff',
  },
  buttonSecondary: {
    backgroundColor: '#4a5568',
    color: '#cbd5e1',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#4a5568',
    borderRadius: '16px',
    padding: '1.5rem',
    textAlign: 'center',
    border: '2px solid #718096',
    transition: 'all 0.3s ease',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  featureCard: {
    padding: '2rem',
    border: '3px solid #4a5568',
    borderRadius: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#2d3748',
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
    backgroundColor: '#2d3748',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '1px solid #4a5568',
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
    backgroundColor: '#4a5568',
    border: '2px solid #718096',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4a5568',
    border: '2px solid #718096',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#4a5568',
    border: '2px solid #718096',
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
    backgroundColor: '#4a5568',
    padding: '1rem',
    textAlign: 'left',
    fontWeight: '700',
    color: '#cbd5e1',
    borderBottom: '2px solid #718096',
    fontSize: '0.95rem',
  },
  td: {
    padding: '1rem',
    borderBottom: '1px solid #4a5568',
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
    border: '4px solid #4a5568',
    borderTop: '4px solid #4299e1',
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
    backgroundColor: '#22543d',
    border: '2px solid #48bb78',
    color: '#9ae6b4',
  },
  alertError: {
    backgroundColor: '#742a2a',
    border: '2px solid #f56565',
    color: '#fc8181',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid #4a5568',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.875rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontWeight: '600',
    color: '#a0aec0',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease',
    fontSize: '0.95rem',
  },
  tabActive: {
    color: '#4299e1',
    borderBottomColor: '#4299e1',
  },
  detailCard: {
    backgroundColor: '#4a5568',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '2px solid #718096',
  },
  searchBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  chartContainer: {
    backgroundColor: '#4a5568',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
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

const SectorManagerDashboard = () => {
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
  const [metadata, setMetadata] = useState({
    vendors: [],
    sectors: [],
    statuses: [],
    users: [],
    inspectionTypes: [],
    documentTypes: [],
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    vendor: '',
    dateFrom: '',
    dateTo: '',
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
      const [vendors, sectors, statuses, users, inspectionTypes, documentTypes] = await Promise.all([
        tempApi.get('/api/v1/vendors/'),
        tempApi.get('/api/v1/sectors/'),
        tempApi.get('/api/v1/project-statuses/'),
        tempApi.get('/api/v1/users/'),
        tempApi.get('/api/v1/inspection-types/'),
        tempApi.get('/api/v1/document-types/'),
      ]);
      setMetadata({ vendors, sectors, statuses, users, inspectionTypes, documentTypes });
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
        dashboard: '/api/v1/sector-manager/dashboard/',
        projects: '/api/v1/sector-manager/sector_projects/',
        workorders: '/api/v1/sector-manager/sector_work_orders/',
        team: '/api/v1/sector-manager/sector_team/',
        vendors: '/api/v1/sector-manager/sector_vendors/',
        budget: '/api/v1/sector-manager/sector_budget/',
        kpis: '/api/v1/sector-manager/sector_kpis/',
        inspections: '/api/v1/sector-manager/quality_metrics/',
        documents: '/api/v1/project-documents/',
        milestones: '/api/v1/project-milestones/',
        sla: '/api/v1/sla-tracking/',
        invoices: '/api/v1/invoices/',
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
        sector: modal.item ? `/api/v1/sectors/${modal.item.sector_id}/` : '/api/v1/sectors/',
        resource: '/api/v1/project-team/',
        note: '/api/v1/projects/',
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

  const generateReport = async (reportType) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      const report = await api.post('/api/v1/sector-manager/generate_report/', {
        report_type: reportType,
        filters: filters,
      });
      
      showSuccess('Report generated successfully');
      // Handle report download or display
      console.log('Report data:', report);
    } catch (err) {
      showError(err.message || 'Report generation failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const renderDashboard = () => (
    <div>
      <div style={styles.statsGrid}>
        {[
          { icon: Briefcase, label: 'Sector Projects', value: data?.stats?.total_projects || 0, color: '#4299e1' },
          { icon: Activity, label: 'Active Projects', value: data?.stats?.active_projects || 0, color: '#48bb78' },
          { icon: FileCheck, label: 'Work Orders', value: data?.stats?.work_orders || 0, color: '#ed8936' },
          { icon: Users, label: 'Team Members', value: data?.stats?.team_members || 0, color: '#9f7aea' },
          { icon: Package, label: 'Sector Vendors', value: data?.stats?.sector_vendors || 0, color: '#38b2ac' },
          { icon: Target, label: 'Milestones Due', value: data?.stats?.milestones_due || 0, color: '#f56565' },
          { icon: DollarSign, label: 'Sector Budget', value: `₱${(data?.stats?.sector_budget || 0).toLocaleString()}`, color: '#ed8936' },
          { icon: CheckCircle, label: 'SLA Compliance', value: `${data?.stats?.sla_compliance || 0}%`, color: '#48bb78' },
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <stat.icon size={40} color={stat.color} style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ color: '#a0aec0', fontWeight: '600' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.card}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', marginBottom: '1.5rem' }}>
          Sector Manager Functions
        </h2>
        <div style={styles.featureGrid}>
          {[
            { icon: Building2, label: 'Sector Management', desc: 'Manage sector information and resource allocation', view: 'sector', color: '#4299e1' },
            { icon: Briefcase, label: 'Sector Projects', desc: 'View and monitor all sector projects', view: 'projects', color: '#48bb78' },
            { icon: FileCheck, label: 'Work Orders', desc: 'Track sector work orders and progress', view: 'workorders', color: '#ed8936' },
            { icon: Users, label: 'Team Coordination', desc: 'Manage sector team members and assignments', view: 'team', color: '#9f7aea' },
            { icon: Package, label: 'Vendor Coordination', desc: 'Monitor vendor performance and compliance', view: 'vendors', color: '#38b2ac' },
            { icon: DollarSign, label: 'Budget Tracking', desc: 'Track sector budget and project costs', view: 'budget', color: '#f56565' },
            { icon: BarChart3, label: 'Sector KPIs', desc: 'Monitor sector key performance indicators', view: 'kpis', color: '#4299e1' },
            { icon: Award, label: 'Quality Metrics', desc: 'Review inspection results and quality metrics', view: 'inspections', color: '#48bb78' },
            { icon: FileText, label: 'Documents', desc: 'Review and manage project documents', view: 'documents', color: '#ed8936' },
            { icon: Target, label: 'Milestones', desc: 'Track project milestones and timelines', view: 'milestones', color: '#9f7aea' },
            { icon: Clock, label: 'SLA Compliance', desc: 'Monitor SLA compliance across sector', view: 'sla', color: '#38b2ac' },
            { icon: FileText, label: 'Reports', desc: 'Generate sector performance reports', view: 'reports', color: '#f56565' },
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
              <div style={{ color: '#a0aec0', lineHeight: '1.5' }}>{feature.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {data?.recent_activity && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
            Recent Sector Activity
          </h3>
          {data.recent_activity.map((activity, i) => (
            <div key={i} style={{...styles.detailCard, marginBottom: '0.75rem'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>{activity.description}</div>
                  <div style={{ color: '#a0aec0', fontSize: '0.875rem' }}>{activity.timestamp}</div>
                </div>
                <span style={{
                  ...styles.badge,
                  backgroundColor: activity.type === 'success' ? '#22543d' : activity.type === 'warning' ? '#7c2d12' : '#1e3a8a',
                  color: activity.type === 'success' ? '#9ae6b4' : activity.type === 'warning' ? '#fbd38d' : '#90cdf4'
                }}>
                  {activity.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.sector_alerts && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={24} color="#ed8936" />
            Sector Alerts & Notifications
          </h3>
          {data.sector_alerts.map((alert, i) => (
            <div key={i} style={{...styles.detailCard, marginBottom: '0.75rem', borderLeft: `4px solid ${alert.priority === 'high' ? '#f56565' : '#ed8936'}`}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>{alert.title}</div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>{alert.message}</div>
                </div>
                <button
                  style={{ ...styles.button, ...styles.buttonPrimary, padding: '0.5rem 1rem' }}
                  onClick={() => setView(alert.action_view)}
                >
                  View
                </button>
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
          Sector Projects
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => generateReport('projects')}
            style={{ ...styles.button, ...styles.buttonSuccess }}
          >
            <Download size={18} />
            Export Report
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
          {metadata.statuses.map(s => (
            <option key={s.status_id} value={s.status_id}>{s.status_name}</option>
          ))}
        </select>
        <select
          style={{ ...styles.select, minWidth: '150px' }}
          value={filters.vendor}
          onChange={(e) => setFilters({...filters, vendor: e.target.value})}
        >
          <option value="">All Vendors</option>
          {metadata.vendors.map(v => (
            <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
          ))}
        </select>
        <button
          onClick={() => loadData('projects')}
          style={{ ...styles.iconButton, backgroundColor: '#4299e1', padding: '0.75rem' }}
        >
          <RefreshCw size={18} color="#fff" />
        </button>
      </div>

      <div style={styles.tabs}>
        {['All Projects', 'Active', 'On Track', 'At Risk', 'Delayed', 'Completed'].map((tab, idx) => (
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
                <th style={styles.th}>Progress</th>
                <th style={styles.th}>Budget</th>
                <th style={styles.th}>Timeline</th>
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
                      backgroundColor: p.is_delayed ? '#742a2a' : '#22543d',
                      color: p.is_delayed ? '#fc8181' : '#9ae6b4'
                    }}>
                      {p.status?.status_name || 'N/A'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={{ width: '100%', backgroundColor: '#4a5568', borderRadius: '8px', height: '8px' }}>
                      <div style={{
                        width: `${p.progress || 0}%`,
                        backgroundColor: p.progress > 75 ? '#48bb78' : p.progress > 50 ? '#ed8936' : '#f56565',
                        height: '100%',
                        borderRadius: '8px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', color: '#a0aec0' }}>{p.progress || 0}%</span>
                  </td>
                  <td style={styles.td}>₱{(p.contract_value || 0).toLocaleString()}</td>
                  <td style={styles.td}>
                    <div style={{ fontSize: '0.875rem' }}>
                      <div style={{ color: '#cbd5e1' }}>Start: {p.start_date || 'N/A'}</div>
                      <div style={{ color: '#cbd5e1' }}>End: {p.completion_date || 'N/A'}</div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => openModal('note', p)}
                        style={{ ...styles.iconButton, backgroundColor: '#4299e1' }}
                        title="Add Note"
                      >
                        <MessageSquare size={16} color="#fff" />
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
          Sector Work Orders
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => generateReport('workorders')}
            style={{ ...styles.button, ...styles.buttonSuccess }}
          >
            <Download size={18} />
            Export
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
        {['All', 'New', 'For Audit', 'Audited', 'Delayed', 'Completed'].map((tab, idx) => (
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
              <th style={styles.th}>Supervisor</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Days Open</th>
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
                <td style={styles.td}>{wo.supervisor?.first_name || 'N/A'}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: wo.is_delayed ? '#742a2a' : '#1e3a8a',
                    color: wo.is_delayed ? '#fc8181' : '#90cdf4'
                  }}>
                    {wo.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{ color: wo.total_resolution_days > 60 ? '#fc8181' : '#9ae6b4' }}>
                    {wo.total_resolution_days || 0} days
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => openModal('view', wo)}
                    style={{ ...styles.iconButton, backgroundColor: '#5a67d8' }}
                  >
                    <Eye size={16} color="#fff" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTeam = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Sector Team Management
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('resource')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Plus size={18} />
            Assign Resource
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
        {['All Team', 'Engineers', 'Supervisors', 'QI Inspectors', 'Support Staff'].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTab(idx)}
            style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={styles.statsGrid}>
        {[
          { label: 'Total Team Members', value: data?.team_stats?.total || 0, color: '#4299e1' },
          { label: 'Active Members', value: data?.team_stats?.active || 0, color: '#48bb78' },
          { label: 'Projects Assigned', value: data?.team_stats?.projects || 0, color: '#ed8936' },
          { label: 'Avg Workload', value: `${data?.team_stats?.avg_workload || 0}%`, color: '#9f7aea' },
        ].map((stat, i) => (
          <div key={i} style={{...styles.statCard, textAlign: 'left'}}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color, marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ color: '#a0aec0', fontWeight: '600' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {data?.team_members?.map((member) => (
        <div key={member.user_id} style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                {member.first_name} {member.last_name}
              </h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                <span style={{ color: '#a0aec0', fontSize: '0.95rem' }}>
                  <UserCheck size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {member.role?.role_name}
                </span>
                <span style={{ color: '#a0aec0', fontSize: '0.95rem' }}>
                  <Briefcase size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {member.assigned_projects || 0} Projects
                </span>
              </div>
              <div style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>
                Email: {member.email} | Phone: {member.phone_number}
              </div>
            </div>
            <div style={styles.actionButtons}>
              <button
                onClick={() => openModal('view', member)}
                style={{ ...styles.button, ...styles.buttonPrimary }}
              >
                <Eye size={16} />
                View Details
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderVendors = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Sector Vendor Performance
        </h2>
        <button
          onClick={() => setView('dashboard')}
          style={{ ...styles.button, ...styles.buttonSecondary }}
        >
          Back
        </button>
      </div>

      <div style={styles.statsGrid}>
        {[
          { label: 'Active Vendors', value: data?.vendor_stats?.active || 0, color: '#4299e1' },
          { label: 'Avg Compliance', value: `${data?.vendor_stats?.avg_compliance || 0}%`, color: '#48bb78' },
          { label: 'On-time Rate', value: `${data?.vendor_stats?.ontime_rate || 0}%`, color: '#ed8936' },
          { label: 'Quality Score', value: `${data?.vendor_stats?.quality_score || 0}%`, color: '#9f7aea' },
        ].map((stat, i) => (
          <div key={i} style={{...styles.statCard, textAlign: 'left'}}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color, marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ color: '#a0aec0', fontWeight: '600' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {data?.vendors?.map((vendor) => (
        <div key={vendor.vendor_id} style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                {vendor.vendor_code} - {vendor.vendor_name}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Compliance Score</div>
                  <div style={{ color: '#48bb78', fontWeight: '700', fontSize: '1.25rem' }}>
                    {vendor.compliance_score}%
                  </div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Active Projects</div>
                  <div style={{ color: '#4299e1', fontWeight: '700', fontSize: '1.25rem' }}>
                    {vendor.active_projects || 0}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '0.875rem' }}>On-time Rate</div>
                  <div style={{ color: '#ed8936', fontWeight: '700', fontSize: '1.25rem' }}>
                    {vendor.ontime_rate || 0}%
                  </div>
                </div>
                <div>
                  <div style={{ color: '#a0aec0', fontSize: '0.875rem' }}>Quality Score</div>
                  <div style={{ color: '#9f7aea', fontWeight: '700', fontSize: '1.25rem' }}>
                    {vendor.quality_score || 0}%
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => openModal('view', vendor)}
              style={{ ...styles.button, ...styles.buttonPrimary }}
            >
              <Eye size={16} />
              View Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderBudget = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Sector Budget & Cost Tracking
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => generateReport('budget')}
            style={{ ...styles.button, ...styles.buttonSuccess }}
          >
            <Download size={18} />
            Export Budget Report
          </button>
          <button
            onClick={() => setView('dashboard')}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Back
          </button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        {[
          { label: 'Total Budget', value: `₱${(data?.budget?.total_budget || 0).toLocaleString()}`, color: '#4299e1' },
          { label: 'Allocated', value: `₱${(data?.budget?.allocated || 0).toLocaleString()}`, color: '#48bb78' },
          { label: 'Spent', value: `₱${(data?.budget?.spent || 0).toLocaleString()}`, color: '#ed8936' },
          { label: 'Remaining', value: `₱${(data?.budget?.remaining || 0).toLocaleString()}`, color: '#9f7aea' },
        ].map((stat, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: stat.color, marginBottom: '0.5rem' }}>
              {stat.value}
            </div>
            <div style={{ color: '#a0aec0', fontWeight: '600' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={styles.chartContainer}>
        <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' }}>Budget Utilization</h3>
        <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '1rem 0' }}>
          {data?.budget_breakdown?.map((item, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: `${(item.amount / data.budget.total_budget) * 200}px`,
                backgroundColor: ['#4299e1', '#48bb78', '#ed8936', '#9f7aea'][i % 4],
                borderRadius: '8px 8px 0 0',
                marginBottom: '0.5rem',
              }} />
              <div style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '600' }}>
                {item.category}
              </div>
              <div style={{ color: '#a0aec0', fontSize: '0.75rem' }}>
                ₱{item.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' }}>Project Cost Summary</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Contract Value</th>
              <th style={styles.th}>Spent</th>
              <th style={styles.th}>Remaining</th>
              <th style={styles.th}>% Used</th>
            </tr>
          </thead>
          <tbody>
            {data?.project_costs?.map((pc) => (
              <tr key={pc.project_id}>
                <td style={styles.td}>{pc.project_code}</td>
                <td style={styles.td}>₱{pc.contract_value.toLocaleString()}</td>
                <td style={styles.td}>₱{pc.spent.toLocaleString()}</td>
                <td style={styles.td}>₱{pc.remaining.toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={{ color: pc.percentage > 90 ? '#fc8181' : pc.percentage > 70 ? '#fbd38d' : '#9ae6b4' }}>
                    {pc.percentage}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderKPIs = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Sector KPIs & Performance
        </h2>
        <button
          onClick={() => setView('dashboard')}
          style={{ ...styles.button, ...styles.buttonSecondary }}
        >
          Back
        </button>
      </div>

      <div style={styles.statsGrid}>
        {[
          { label: 'Project Completion Rate', value: `${data?.kpis?.completion_rate || 0}%`, target: 85, color: '#48bb78' },
          { label: 'On-Time Delivery', value: `${data?.kpis?.ontime_delivery || 0}%`, target: 90, color: '#4299e1' },
          { label: 'Budget Adherence', value: `${data?.kpis?.budget_adherence || 0}%`, target: 95, color: '#ed8936' },
          { label: 'Quality Score', value: `${data?.kpis?.quality_score || 0}%`, target: 90, color: '#9f7aea' },
          { label: 'SLA Compliance', value: `${data?.kpis?.sla_compliance || 0}%`, target: 95, color: '#38b2ac' },
          { label: 'Vendor Performance', value: `${data?.kpis?.vendor_performance || 0}%`, target: 85, color: '#f56565' },
        ].map((kpi, i) => (
          <div key={i} style={styles.statCard}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: kpi.color, marginBottom: '0.5rem' }}>
              {kpi.value}
            </div>
            <div style={{ color: '#a0aec0', fontWeight: '600', marginBottom: '0.5rem' }}>{kpi.label}</div>
            <div style={{ fontSize: '0.875rem', color: '#718096' }}>Target: {kpi.target}%</div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#4a5568',
              borderRadius: '2px',
              marginTop: '0.5rem',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${Math.min(100, (parseFloat(kpi.value) / kpi.target) * 100)}%`,
                height: '100%',
                backgroundColor: kpi.color,
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderModal = () => {
    if (!modal.show) return null;

    return (
      <div style={styles.modal} onClick={closeModal}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
              {modal.type === 'view' ? 'View Details' : modal.item ? 'Edit' : 'Create'} {modal.type}
            </h2>
            <button onClick={closeModal} style={{ ...styles.iconButton, backgroundColor: '#4a5568' }}>
              <X size={20} color="#cbd5e1" />
            </button>
          </div>

          {modal.type === 'view' ? (
            <div style={{ color: '#cbd5e1' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.6', backgroundColor: '#4a5568', padding: '1.5rem', borderRadius: '8px' }}>
                {JSON.stringify(modal.item, null, 2)}
              </pre>
            </div>
          ) : modal.type === 'sector' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sector Code *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.sector_code || ''}
                  onChange={(e) => setForm({ ...form, sector_code: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sector Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.sector_name || ''}
                  onChange={(e) => setForm({ ...form, sector_name: e.target.value })}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
            </>
          ) : modal.type === 'resource' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Team Member *</label>
                <select
                  style={styles.select}
                  value={form.user || ''}
                  onChange={(e) => setForm({ ...form, user: e.target.value })}
                >
                  <option value="">Select team member</option>
                  {metadata.users.map(u => (
                    <option key={u.user_id} value={u.user_id}>
                      {u.first_name} {u.last_name} - {u.role?.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Role in Project</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.role_in_project || ''}
                  onChange={(e) => setForm({ ...form, role_in_project: e.target.value })}
                />
              </div>
            </>
          ) : modal.type === 'note' ? (
            <div style={styles.formGroup}>
              <label style={styles.label}>Notes</label>
              <textarea
                style={styles.textarea}
                value={form.notes || ''}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Add coordination notes..."
              />
            </div>
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
      <div style={{ minHeight: '100vh', background: '#1a1f2e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ background: '#2d3748', padding: '3rem', borderRadius: '16px', textAlign: 'center', maxWidth: '500px', border: '1px solid #4a5568' }}>
          <AlertCircle size={64} color="#f56565" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
            Authentication Required
          </h2>
          <p style={{ color: '#a0aec0', fontSize: '1.125rem', lineHeight: '1.6' }}>
            Please login to access the Sector Manager Dashboard.
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
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }
      `}</style>

      <div style={styles.maxWidth}>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Sector Manager Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome, {state.user?.first_name} {state.user?.last_name} - Comprehensive Sector Management
            </p>
          </div>
          <span style={{
            ...styles.badge,
            backgroundColor: '#4299e1',
            color: '#fff',
            fontSize: '1rem',
            padding: '0.625rem 1.25rem',
            border: '2px solid #63b3ed'
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
        {view === 'team' && renderTeam()}
        {view === 'vendors' && renderVendors()}
        {view === 'budget' && renderBudget()}
        {view === 'kpis' && renderKPIs()}
        {view === 'sector' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Sector Information Management</h2>
            <button onClick={() => openModal('sector')} style={{ ...styles.button, ...styles.buttonPrimary, marginRight: '0.5rem' }}>
              <Edit2 size={18} />
              Edit Sector Info
            </button>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
              Back
            </button>
          </div>
        )}
        {view === 'inspections' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Quality Metrics & Inspections</h2>
            <p style={{ color: '#a0aec0' }}>Review inspection results and monitor quality metrics across sector</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'documents' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Project Documents</h2>
            <p style={{ color: '#a0aec0' }}>Review and manage sector project documentation</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'milestones' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Project Milestones</h2>
            <p style={{ color: '#a0aec0' }}>Track milestones and project timelines across sector</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'sla' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>SLA Compliance Monitoring</h2>
            <p style={{ color: '#a0aec0' }}>Monitor SLA compliance across all sector projects</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'reports' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1.5rem' }}>Sector Reports & Analytics</h2>
            <div style={styles.featureGrid}>
              {[
                { label: 'Project Summary Report', type: 'projects' },
                { label: 'Work Order Report', type: 'workorders' },
                { label: 'Budget Report', type: 'budget' },
                { label: 'Vendor Performance Report', type: 'vendors' },
                { label: 'Team Performance Report', type: 'team' },
                { label: 'KPI Dashboard Report', type: 'kpis' },
              ].map((report, i) => (
                <button
                  key={i}
                  onClick={() => generateReport(report.type)}
                  style={{ ...styles.featureCard, border: '2px solid #4299e1' }}
                >
                  <Download size={32} color="#4299e1" style={{ marginBottom: '0.5rem' }} />
                  <div style={{ color: '#fff', fontWeight: '700' }}>{report.label}</div>
                </button>
              ))}
            </div>
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

export default SectorManagerDashboard;