import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, TrendingUp, FileText, Users, Plus, Edit2, 
  Trash2, X, Save, Eye, Clock, AlertTriangle, DollarSign, Calendar,
  Activity, Briefcase, ClipboardCheck, FileCheck, BarChart3, Settings,
  Download, Upload, Filter, Search, RefreshCw, Send, MessageSquare,
  Target, Award, Zap, TrendingDown, Package, CheckSquare, XCircle,
  UserCheck, Shield, Bell, BookOpen, FileWarning, PlayCircle
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

const TeamLeaderDashboard = () => {
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
    qiUsers: emptyPaged,
    supervisors: emptyPaged,
    penaltyRules: emptyPaged,
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
      const [vendors, sectors, statuses, users, penaltyRules] = await Promise.all([
        tempApi.get('/api/v1/vendors/'),
        tempApi.get('/api/v1/sectors/'),
        tempApi.get('/api/v1/project-statuses/'),
        tempApi.get('/api/v1/users/'),
        tempApi.get('/api/v1/penalty-rules/'),
      ]);
      
      const qiUsers = { ...users, results: users.results.filter(u => u.role_name === 'Quality Inspector') };
      const supervisors = { ...users, results: users.results.filter(u => u.role_name === 'WO Supervisor') };
      
      setMetadata({ vendors, sectors, statuses, users, qiUsers, supervisors, penaltyRules });
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
        projects: '/api/v1/projects/',
        workorders: '/api/v1/work-orders/',
        team: '/api/v1/users/',
        qiperformance: '/api/v1/qi-performance/',
        vendors: '/api/v1/vendors/',
        penalties: '/api/v1/penalties/',
        invoices: '/api/v1/invoices/',
        escalations: '/api/v1/escalations/',
        kpis: '/api/v1/kpi-dashboard/',
        delays: '/api/v1/project-delays/',
        ageing: '/api/v1/ageing-analysis/',
        pca: '/api/v1/pca-summary/',
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
        assignment: `/api/v1/work-orders/${form.wo_id}/`,
        penalty: modal.item ? `/api/v1/penalties/${modal.item.id}/` : '/api/v1/penalties/',
        waive_penalty: `/api/v1/penalties/${form.id}/`,
        escalation: `/api/v1/escalations/${form.id}/`,
        qi_target: `/api/v1/qi-daily-targets/${form.id}/`,
      };
      
      const method = modal.item ? 'patch' : 'post';
      await api[method](endpoints[modal.type] || endpoints.assignment, form);
      
      showSuccess(`${modal.type} ${modal.item ? 'updated' : 'created'} successfully`);
      closeModal();
      loadData(view);
    } catch (err) {
      showError(err.message || 'Operation failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const handleApprove = async (type, id, approved, reason = '') => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      if (type === 'penalty') {
        await api.patch(`/api/v1/penalties/${id}/`, {
          penalty_status: approved ? 'Issued' : 'Waived',
          waiver_reason: approved ? null : reason
        });
      } else if (type === 'vendor_blacklist') {
        await api.patch(`/api/v1/vendors/${id}/`, {
          is_blacklisted: approved
        });
      } else if (type === 'sla_waiver') {
        await api.patch(`/api/v1/sla-tracking/${id}/`, {
          status: 'Waived',
          waiver_reason: reason
        });
      }
      showSuccess(`${type} ${approved ? 'approved' : 'rejected'} successfully`);
      loadData(view);
    } catch (err) {
      showError(err.message || 'Approval failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const handleAssignment = async (woId, field, value) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      await api.patch(`/api/v1/work-orders/${woId}/`, { [field]: value });
      showSuccess('Assignment updated successfully');
      loadData('workorders');
    } catch (err) {
      showError(err.message || 'Assignment failed');
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
          { icon: FileCheck, label: 'Work Orders', value: data?.stats?.work_orders || 0, color: '#06b6d4' },
          { icon: AlertTriangle, label: 'Pending Approvals', value: data?.stats?.pending_approvals || 0, color: '#f59e0b' },
          { icon: Users, label: 'Team Members', value: data?.stats?.team_members || 0, color: '#8b5cf6' },
          { icon: UserCheck, label: 'QI Performance', value: `${data?.stats?.qi_performance_avg || 0}%`, color: '#10b981' },
          { icon: Shield, label: 'Active Vendors', value: data?.stats?.active_vendors || 0, color: '#f59e0b' },
          { icon: Bell, label: 'Open Escalations', value: data?.stats?.open_escalations || 0, color: '#ef4444' },
          { icon: DollarSign, label: 'Pending Penalties', value: data?.stats?.pending_penalties || 0, color: '#ef4444' },
          { icon: CheckCircle, label: 'SLA Compliance', value: `${data?.stats?.sla_compliance || 0}%`, color: '#10b981' },
          { icon: Target, label: 'KPI Score', value: `${data?.stats?.kpi_score || 0}%`, color: '#3b82f6' },
          { icon: TrendingUp, label: 'Projects On Track', value: `${data?.stats?.on_track_percentage || 0}%`, color: '#10b981' },
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
          Team Leader Functions & Quick Actions
        </h2>
        <div style={styles.featureGrid}>
          {[
            { icon: Briefcase, label: 'Project Oversight', desc: 'View all projects, timelines, documents, approve milestones', view: 'projects', color: '#3b82f6' },
            { icon: FileCheck, label: 'Work Order Management', desc: 'View all WOs, assign/reassign QI & supervisors, track statistics', view: 'workorders', color: '#10b981' },
            { icon: Users, label: 'Team Management', desc: 'View team members, QI & supervisor performance, assign to projects', view: 'team', color: '#8b5cf6' },
            { icon: Shield, label: 'Vendor Management', desc: 'View performance, approve blacklist, review disputes & productivity', view: 'vendors', color: '#f59e0b' },
            { icon: DollarSign, label: 'Penalties & Billing', desc: 'Approve penalties, waive penalties, review invoices & billing', view: 'penalties', color: '#ef4444' },
            { icon: ClipboardCheck, label: 'Quality & Compliance', desc: 'View inspection reports, review quality metrics, approve SLA waivers', view: 'quality', color: '#06b6d4' },
            { icon: Bell, label: 'Escalations', desc: 'Receive escalations, resolve issues, escalate critical problems', view: 'escalations', color: '#f43f5e' },
            { icon: BarChart3, label: 'Reports & Analytics', desc: 'Team reports, KPI reports, delay analysis, ageing reports', view: 'reports', color: '#14b8a6' },
            { icon: Target, label: 'KPI Dashboard', desc: 'View all KPIs, track performance metrics, monitor targets', view: 'kpis', color: '#3b82f6' },
            { icon: TrendingDown, label: 'Delay Analysis', desc: 'View project delays, analyze factors, monitor impact', view: 'delays', color: '#f59e0b' },
            { icon: Clock, label: 'Ageing Reports', desc: 'View ageing projects, track resolution times, identify bottlenecks', view: 'ageing', color: '#8b5cf6' },
            { icon: Award, label: 'PCA Summary', desc: 'Project completion analytics, conversion rates, performance index', view: 'pca', color: '#10b981' },
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

      {data?.critical_alerts && data.critical_alerts.length > 0 && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={28} color="#ef4444" />
            Critical Alerts Requiring Immediate Action
          </h3>
          {data.critical_alerts.map((alert, i) => (
            <div key={i} style={{...styles.detailCard, marginBottom: '0.75rem', borderLeft: '4px solid #ef4444'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.125rem' }}>{alert.title}</div>
                  <div style={{ color: '#cbd5e1', marginBottom: '0.5rem' }}>{alert.description}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{alert.timestamp}</div>
                </div>
                <button
                  onClick={() => setView(alert.action_view)}
                  style={{ ...styles.button, ...styles.buttonDanger }}
                >
                  <PlayCircle size={18} />
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {data?.recent_activity && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
            Recent Team Activity
          </h3>
          {data.recent_activity.map((activity, i) => (
            <div key={i} style={{...styles.detailCard, marginBottom: '0.75rem'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>{activity.description}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{activity.user} • {activity.timestamp}</div>
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
          Project Oversight
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back to Dashboard
        </button>
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
        <button onClick={() => loadData('projects')} style={{ ...styles.iconButton, backgroundColor: '#3b82f6', padding: '0.75rem' }}>
          <RefreshCw size={18} color="#fff" />
        </button>
      </div>

      <div style={styles.tabs}>
        {['All Projects', 'Active', 'Delayed', 'SLA Risk', 'Pending Milestones', 'Completed'].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTab(idx)}
            style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}
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
                <th style={styles.th}>Engineer</th>
                <th style={styles.th}>QI</th>
                <th style={styles.th}>Progress</th>
                <th style={styles.th}>Budget</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.results?.map((p) => (
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
                  <td style={styles.td}>{p.assigned_engineer?.username || 'Unassigned'}</td>
                  <td style={styles.td}>{p.assigned_qi?.username || 'Unassigned'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: '#10b981', width: `${p.progress || 0}%` }} />
                      </div>
                      <span>{p.progress || 0}%</span>
                    </div>
                  </td>
                  <td style={styles.td}>₱{(p.contract_value || 0).toLocaleString()}</td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button onClick={() => openModal('view', p)} style={{ ...styles.iconButton, backgroundColor: '#4338ca' }} title="View Details">
                        <Eye size={16} color="#fff" />
                      </button>
                      <button onClick={() => openModal('approve_milestone', p)} style={{ ...styles.iconButton, backgroundColor: '#10b981' }} title="Approve Milestone">
                        <CheckSquare size={16} color="#fff" />
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
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      <div style={styles.tabs}>
        {['All', 'New', 'For Audit', 'Audited', 'Delayed', 'Paid'].map((tab, idx) => (
          <button key={idx} onClick={() => setSelectedTab(idx)} style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}>
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
              <th style={styles.th}>Vendor</th>
              <th style={styles.th}>Supervisor</th>
              <th style={styles.th}>QI</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((wo) => (
              <tr key={wo.wo_id}>
                <td style={styles.td}>{wo.wo_no}</td>
                <td style={styles.td}>{wo.description}</td>
                <td style={styles.td}>{wo.vendor?.vendor_name || 'N/A'}</td>
                <td style={styles.td}>
                  <select
                    style={{ ...styles.select, padding: '0.5rem', fontSize: '0.875rem' }}
                    value={wo.supervisor?.user_id || ''}
                    onChange={(e) => handleAssignment(wo.wo_id, 'supervisor', e.target.value)}
                  >
                    <option value="">Select Supervisor</option>
                    {metadata.supervisors.results.map(s => (
                      <option key={s.user_id} value={s.user_id}>{s.username}</option>
                    ))}
                  </select>
                </td>
                <td style={styles.td}>
                  <select
                    style={{ ...styles.select, padding: '0.5rem', fontSize: '0.875rem' }}
                    value={wo.assigned_qi?.user_id || ''}
                    onChange={(e) => handleAssignment(wo.wo_id, 'assigned_qi', e.target.value)}
                  >
                    <option value="">Select QI</option>
                    {metadata.qiUsers.results.map(q => (
                      <option key={q.user_id} value={q.user_id}>{q.username}</option>
                    ))}
                  </select>
                </td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: '#1e3a8a', color: '#93c5fd' }}>
                    {wo.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => openModal('view', wo)} style={{ ...styles.iconButton, backgroundColor: '#4338ca' }}>
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
          Team Management
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      <div style={styles.tabs}>
        {['All Members', 'QI Performance', 'Supervisor Performance', 'Engineers'].map((tab, idx) => (
          <button key={idx} onClick={() => setSelectedTab(idx)} style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Role</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Active Projects</th>
              <th style={styles.th}>Performance</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((user) => (
              <tr key={user.user_id}>
                <td style={styles.td}>{user.first_name} {user.last_name}</td>
                <td style={styles.td}>{user.role?.role_name || 'N/A'}</td>
                <td style={styles.td}>{user.email}</td>
                <td style={styles.td}>{user.active_projects || 0}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: '#064e3b', color: '#6ee7b7' }}>
                    {user.performance_score || 0}%
                  </span>
                </td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: user.is_active ? '#064e3b' : '#7f1d1d',
                    color: user.is_active ? '#6ee7b7' : '#fca5a5'
                  }}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button onClick={() => openModal('view', user)} style={{ ...styles.iconButton, backgroundColor: '#4338ca' }}>
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

  const renderVendors = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Vendor Management
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      <div style={styles.tabs}>
        {['All Vendors', 'Performance Review', 'Disputes', 'Productivity', 'Blacklist Requests'].map((tab, idx) => (
          <button key={idx} onClick={() => setSelectedTab(idx)} style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Vendor Code</th>
              <th style={styles.th}>Vendor Name</th>
              <th style={styles.th}>Compliance Score</th>
              <th style={styles.th}>Active Projects</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((vendor) => (
              <tr key={vendor.vendor_id}>
                <td style={styles.td}>{vendor.vendor_code}</td>
                <td style={styles.td}>{vendor.vendor_name}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: '#064e3b', color: '#6ee7b7' }}>
                    {vendor.compliance_score || 0}%
                  </span>
                </td>
                <td style={styles.td}>{vendor.active_projects || 0}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: vendor.is_blacklisted ? '#7f1d1d' : '#064e3b',
                    color: vendor.is_blacklisted ? '#fca5a5' : '#6ee7b7'
                  }}>
                    {vendor.is_blacklisted ? 'Blacklisted' : 'Active'}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button onClick={() => openModal('view', vendor)} style={{ ...styles.iconButton, backgroundColor: '#4338ca' }}>
                      <Eye size={16} color="#fff" />
                    </button>
                    {!vendor.is_blacklisted && (
                      <button
                        onClick={() => handleApprove('vendor_blacklist', vendor.vendor_id, true)}
                        style={{ ...styles.iconButton, backgroundColor: '#ef4444' }}
                        title="Blacklist"
                      >
                        <XCircle size={16} color="#fff" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPenalties = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Penalties & Billing Management
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      <div style={styles.tabs}>
        {['Pending Approval', 'Issued', 'Waive Requests', 'Disputed', 'Invoices'].map((tab, idx) => (
          <button key={idx} onClick={() => setSelectedTab(idx)} style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}>
            {tab}
          </button>
        ))}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Project</th>
              <th style={styles.th}>Vendor</th>
              <th style={styles.th}>Penalty Type</th>
              <th style={styles.th}>Amount</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.results?.map((penalty) => (
              <tr key={penalty.id}>
                <td style={styles.td}>{penalty.project?.project_code}</td>
                <td style={styles.td}>{penalty.vendor?.vendor_name}</td>
                <td style={styles.td}>{penalty.penalty_rule?.rule_name}</td>
                <td style={styles.td}>₱{(penalty.penalty_amount || 0).toLocaleString()}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: penalty.penalty_status === 'Draft' ? '#78350f' : '#1e3a8a',
                    color: penalty.penalty_status === 'Draft' ? '#fde68a' : '#93c5fd'
                  }}>
                    {penalty.penalty_status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    {penalty.penalty_status === 'Draft' && (
                      <>
                        <button
                          onClick={() => handleApprove('penalty', penalty.id, true)}
                          style={{ ...styles.button, ...styles.buttonSuccess }}
                        >
                          <CheckCircle size={16} />
                          Approve
                        </button>
                        <button
                          onClick={() => openModal('waive_penalty', penalty)}
                          style={{ ...styles.button, ...styles.buttonWarning }}
                        >
                          Waive
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              {modal.type === 'view' ? 'View Details' : modal.type === 'waive_penalty' ? 'Waive Penalty' : 'Approve Action'}
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
          ) : modal.type === 'waive_penalty' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Waiver Reason *</label>
                <textarea
                  style={styles.textarea}
                  value={form.waiver_reason || ''}
                  onChange={(e) => setForm({ ...form, waiver_reason: e.target.value })}
                  placeholder="Enter reason for waiving penalty"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  onClick={() => handleApprove('penalty', modal.item.id, false, form.waiver_reason)}
                  style={{ ...styles.button, ...styles.buttonWarning, flex: 1 }}
                  disabled={state.loading || !form.waiver_reason}
                >
                  {state.loading ? 'Processing...' : 'Waive Penalty'}
                </button>
                <button onClick={closeModal} style={{ ...styles.button, ...styles.buttonSecondary }}>
                  Cancel
                </button>
              </div>
            </>
          ) : null}
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
            Please login to access the Team Leader Dashboard. You need valid authentication credentials.
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
            <h1 style={styles.title}>Team Leader Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome, {state.user?.first_name} {state.user?.last_name} - Complete Team & Project Oversight System
            </p>
          </div>
          <span style={{ ...styles.badge, backgroundColor: '#8b5cf6', color: '#fff', fontSize: '1rem', padding: '0.625rem 1.25rem', border: '2px solid #a78bfa' }}>
            {state.user?.role_name || 'TEAM LEADER'}
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
        {view === 'penalties' && renderPenalties()}
        {(view === 'quality' || view === 'escalations' || view === 'reports' || view === 'kpis' || view === 'delays' || view === 'ageing' || view === 'pca') && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>
              {view === 'quality' ? 'Quality & Compliance' :
               view === 'escalations' ? 'Escalation Management' :
               view === 'reports' ? 'Reports & Analytics' :
               view === 'kpis' ? 'KPI Dashboard' :
               view === 'delays' ? 'Delay Analysis' :
               view === 'ageing' ? 'Ageing Reports' : 'PCA Summary'}
            </h2>
            <p style={{ color: '#94a3b8' }}>
              {view === 'quality' ? 'View inspection reports, quality metrics, and approve SLA waivers' :
               view === 'escalations' ? 'Manage escalations, resolve issues, and track resolution status' :
               view === 'reports' ? 'Generate comprehensive team and project reports' :
               view === 'kpis' ? 'Monitor all key performance indicators and targets' :
               view === 'delays' ? 'Analyze project delays and identify improvement opportunities' :
               view === 'ageing' ? 'View ageing projects and track resolution times' : 'Project completion analytics and conversion rates'}
            </p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back to Dashboard
            </button>
          </div>
        )}
      </div>

      {renderModal()}
    </div>
  );
};

export default TeamLeaderDashboard;