import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, TrendingUp, FileText, Users, Plus, Edit2, 
  Trash2, X, Save, Eye, Clock, AlertTriangle, DollarSign, Calendar,
  Activity, Briefcase, ClipboardCheck, FileCheck, BarChart3, Settings,
  Download, Upload, Filter, Search, RefreshCw, Send, MessageSquare,
  Target, Award, Zap, TrendingDown, Package, CheckSquare, XCircle,
  Shield, Database, Bell, Lock, UserPlus, UserCheck, Sliders,
  PieChart, LineChart, TrendingUp as TrendingUpIcon, Server, Building
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  maxWidth: {
    maxWidth: '1800px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    backdropFilter: 'blur(10px)',
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
    fontSize: '3rem',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '1.25rem',
    fontWeight: '500',
  },
  button: {
    padding: '0.875rem 1.75rem',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '1rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    color: '#ffffff',
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#ffffff',
  },
  buttonDanger: {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    color: '#ffffff',
  },
  buttonWarning: {
    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    color: '#ffffff',
  },
  buttonSecondary: {
    backgroundColor: '#475569',
    color: '#cbd5e1',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
    borderRadius: '20px',
    padding: '2rem',
    textAlign: 'center',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  featureCard: {
    padding: '2rem',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '20px',
    cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%)',
    textAlign: 'left',
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.875rem',
    fontWeight: '700',
    display: 'inline-block',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem',
    overflow: 'auto',
    backdropFilter: 'blur(5px)',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: '20px',
    padding: '2.5rem',
    maxWidth: '1000px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '2px solid rgba(59, 130, 246, 0.3)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    color: '#cbd5e1',
    marginBottom: '0.5rem',
    fontWeight: '700',
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
  },
  input: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    border: '2px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
  },
  select: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    border: '2px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  textarea: {
    width: '100%',
    padding: '0.875rem',
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    border: '2px solid rgba(71, 85, 105, 0.5)',
    borderRadius: '12px',
    color: '#ffffff',
    fontSize: '1rem',
    minHeight: '120px',
    resize: 'vertical',
    transition: 'all 0.3s ease',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  th: {
    backgroundColor: 'rgba(51, 65, 85, 0.8)',
    padding: '1.25rem',
    textAlign: 'left',
    fontWeight: '800',
    color: '#cbd5e1',
    borderBottom: '3px solid rgba(59, 130, 246, 0.5)',
    fontSize: '0.95rem',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  td: {
    padding: '1.25rem',
    borderBottom: '1px solid rgba(51, 65, 85, 0.5)',
    color: '#cbd5e1',
    fontSize: '0.95rem',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  iconButton: {
    padding: '0.625rem',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  spinner: {
    border: '4px solid rgba(51, 65, 85, 0.3)',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    width: '64px',
    height: '64px',
    animation: 'spin 1s linear infinite',
  },
  alert: {
    padding: '1.25rem',
    borderRadius: '16px',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
  },
  alertSuccess: {
    background: 'linear-gradient(135deg, rgba(6, 78, 59, 0.9) 0%, rgba(5, 150, 105, 0.8) 100%)',
    border: '2px solid #10b981',
    color: '#6ee7b7',
  },
  alertError: {
    background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.9) 0%, rgba(220, 38, 38, 0.8) 100%)',
    border: '2px solid #ef4444',
    color: '#fca5a5',
  },
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    borderBottom: '2px solid rgba(51, 65, 85, 0.5)',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '1rem 1.75rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    color: '#94a3b8',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s ease',
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
  },
  tabActive: {
    color: '#60a5fa',
    borderBottomColor: '#60a5fa',
    background: 'linear-gradient(180deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)',
  },
  detailCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.6)',
    borderRadius: '16px',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '1px solid rgba(71, 85, 105, 0.5)',
    transition: 'all 0.3s ease',
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

const AdminDashboard = () => {
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
    roles: emptyPaged,
    permissions: emptyPaged,
  });

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    role: '',
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
      const [vendors, sectors, statuses, users, roles, permissions] = await Promise.all([
        tempApi.get('/api/v1/vendors/'),
        tempApi.get('/api/v1/sectors/'),
        tempApi.get('/api/v1/project-statuses/'),
        tempApi.get('/api/v1/users/'),
        tempApi.get('/api/v1/user-roles/'),
        tempApi.get('/api/v1/permissions/'),
      ]);
      setMetadata({ vendors, sectors, statuses, users, roles, permissions });
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
        users: '/api/v1/users/',
        roles: '/api/v1/user-roles/',
        permissions: '/api/v1/permissions/',
        system_settings: '/api/v1/system-settings/',
        audit_logs: '/api/v1/audit-logs/',
        change_logs: '/api/v1/change-logs/',
        vendors: '/api/v1/vendors/',
        projects: '/api/v1/projects/',
        workorders: '/api/v1/work-orders/',
        kpi: '/api/v1/kpi-snapshots/',
        sla: '/api/v1/sla-tracking/',
        penalties: '/api/v1/penalties/',
        escalations: '/api/v1/escalations/',
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
        user: modal.item ? `/api/v1/users/${modal.item.user_id}/` : '/api/v1/users/',
        role: modal.item ? `/api/v1/user-roles/${modal.item.role_id}/` : '/api/v1/user-roles/',
        permission: modal.item ? `/api/v1/permissions/${modal.item.permission_id}/` : '/api/v1/permissions/',
        setting: modal.item ? `/api/v1/system-settings/${modal.item.setting_id}/` : '/api/v1/system-settings/',
        vendor: modal.item ? `/api/v1/vendors/${modal.item.vendor_id}/` : '/api/v1/vendors/',
        sla_rule: modal.item ? `/api/v1/sla-rules/${modal.item.sla_rule_id}/` : '/api/v1/sla-rules/',
        penalty_rule: modal.item ? `/api/v1/penalty-rules/${modal.item.rule_id}/` : '/api/v1/penalty-rules/',
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
        user: `/api/v1/users/${id}/`,
        role: `/api/v1/user-roles/${id}/`,
        permission: `/api/v1/permissions/${id}/`,
        setting: `/api/v1/system-settings/${id}/`,
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

  const handleDeactivateUser = async (userId, isActive) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      await api.patch(`/api/v1/users/${userId}/`, { is_active: !isActive });
      showSuccess(`User ${isActive ? 'deactivated' : 'activated'} successfully`);
      loadData('users');
    } catch (err) {
      showError(err.message || 'Operation failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const handleExportData = async (dataType) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      showSuccess(`Exporting ${dataType} data...`);
    } catch (err) {
      showError(err.message || 'Export failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const renderDashboard = () => {
    const statCardsData = [
      { icon: Users, label: 'Total Users', value: data?.stats?.total_users || 0, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
      { icon: UserCheck, label: 'Active Users', value: data?.stats?.active_users || 0, color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
      { icon: Briefcase, label: 'Total Projects', value: data?.stats?.total_projects || 0, color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
      { icon: FileCheck, label: 'Work Orders', value: data?.stats?.work_orders || 0, color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
      { icon: Building, label: 'Active Vendors', value: data?.stats?.active_vendors || 0, color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
      { icon: AlertTriangle, label: 'Pending Issues', value: data?.stats?.pending_issues || 0, color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' },
      { icon: CheckCircle, label: 'System Health', value: '98%', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
      { icon: TrendingUpIcon, label: 'SLA Compliance', value: `${data?.stats?.sla_compliance || 0}%`, color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    ];

    return (
      <div>
        <div style={styles.statsGrid}>
          {statCardsData.map((stat, i) => (
            <div key={i} style={{ ...styles.statCard, background: stat.gradient }} className="stat-card">
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', opacity: 0.2 }}>
                <stat.icon size={80} color="#fff" />
              </div>
              <stat.icon size={40} color="#fff" style={{ margin: '0 auto 1rem', position: 'relative', zIndex: 1 }} />
              <div style={{ fontSize: '2.75rem', fontWeight: '900', color: '#fff', marginBottom: '0.5rem', position: 'relative', zIndex: 1 }}>
                {stat.value}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={styles.card}>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '2rem', background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Administrator Control Panel
          </h2>
          <div style={styles.featureGrid}>
            {[
              { icon: Users, label: 'User Management', desc: 'Create, edit, delete users, assign roles and permissions', view: 'users', color: '#3b82f6' },
              { icon: Shield, label: 'Role & Permissions', desc: 'Manage user roles and configure system permissions', view: 'roles', color: '#8b5cf6' },
              { icon: Settings, label: 'System Configuration', desc: 'Configure SLA rules, penalties, workflows, and settings', view: 'system_settings', color: '#06b6d4' },
              { icon: Database, label: 'Data Management', desc: 'Import/export data, bulk operations, data integrity', view: 'data', color: '#10b981' },
              { icon: FileText, label: 'Audit & Change Logs', desc: 'View system audit trails and change history', view: 'audit_logs', color: '#f59e0b' },
              { icon: BarChart3, label: 'KPI Dashboard', desc: 'Monitor KPIs, set targets, view performance metrics', view: 'kpi', color: '#ef4444' },
              { icon: Briefcase, label: 'Project Oversight', desc: 'View all projects, monitor progress, track budgets', view: 'projects', color: '#14b8a6' },
              { icon: Building, label: 'Vendor Management', desc: 'Manage vendors, blacklist, performance evaluation', view: 'vendors', color: '#f43f5e' },
              { icon: Bell, label: 'Notifications & Alerts', desc: 'Configure notification templates and escalation rules', view: 'notifications', color: '#8b5cf6' },
              { icon: TrendingUp, label: 'Analytics & Reports', desc: 'Generate comprehensive system reports and analytics', view: 'analytics', color: '#10b981' },
              { icon: Clock, label: 'SLA & Compliance', desc: 'Monitor SLA compliance, configure rules, track breaches', view: 'sla', color: '#3b82f6' },
              { icon: DollarSign, label: 'Penalties & Billing', desc: 'Manage penalty rules, approve penalties, track billing', view: 'penalties', color: '#f59e0b' },
            ].map((feature, i) => (
              <button
                key={i}
                onClick={() => { setView(feature.view); loadData(feature.view); }}
                style={{
                  ...styles.featureCard,
                  border: `2px solid ${feature.color}`,
                  boxShadow: `0 4px 20px ${feature.color}33`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                  e.currentTarget.style.boxShadow = `0 12px 40px ${feature.color}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = `0 4px 20px ${feature.color}33`;
                }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.1 }}>
                  <feature.icon size={120} color={feature.color} />
                </div>
                <feature.icon size={52} color={feature.color} style={{ marginBottom: '1.25rem', position: 'relative', zIndex: 1 }} />
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#fff', marginBottom: '0.75rem', position: 'relative', zIndex: 1 }}>
                  {feature.label}
                </div>
                <div style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.95rem', position: 'relative', zIndex: 1 }}>{feature.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {data?.recent_activity && (
          <div style={styles.card}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fff', marginBottom: '1.5rem' }}>
              Recent System Activity
            </h3>
            {data.recent_activity.map((activity, i) => (
              <div key={i} style={{...styles.detailCard, marginBottom: '0.75rem'}}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.25rem', fontSize: '1rem' }}>{activity.description}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{activity.timestamp}</div>
                  </div>
                  <span style={{
                    ...styles.badge,
                    background: activity.type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                                activity.type === 'warning' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 
                                'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: '#fff'
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
  };

  const renderUsers = ()=> (
<div style={styles.card}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
<h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
User Management
</h2>
<div style={{ display: 'flex', gap: '0.75rem' }}>
<button
onClick={() => openModal('user')}
style={{ ...styles.button, ...styles.buttonPrimary }}
>
<UserPlus size={20} />
Create User
</button>
<button
onClick={() => handleExportData('users')}
style={{ ...styles.button, ...styles.buttonSuccess }}
>
<Download size={20} />
Export
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
        placeholder="Search users by name, email, or username..."
        style={{ ...styles.input }}
        value={filters.search}
        onChange={(e) => setFilters({...filters, search: e.target.value})}
      />
    </div>
    <select
      style={{ ...styles.select, minWidth: '150px' }}
      value={filters.role}
      onChange={(e) => setFilters({...filters, role: e.target.value})}
    >
      <option value="">All Roles</option>
      {metadata.roles.results.map(r => (
        <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
      ))}
    </select>
    <select
      style={{ ...styles.select, minWidth: '150px' }}
      value={filters.status}
      onChange={(e) => setFilters({...filters, status: e.target.value})}
    >
      <option value="">All Status</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    <button
      onClick={() => loadData('users')}
      style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', padding: '0.875rem' }}
    >
      <RefreshCw size={20} color="#fff" />
    </button>
  </div>

  <div style={styles.tabs}>
    {['All Users', 'Active', 'Inactive', 'Administrators', 'Engineers', 'QI', 'Vendors'].map((tab, idx) => (
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
            <th style={styles.th}>Username</th>
            <th style={styles.th}>Full Name</th>
            <th style={styles.th}>Email</th>
            <th style={styles.th}>Role</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Last Login</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.results?.map((u) => (
            <tr key={u.user_id}>
              <td style={styles.td}>{u.username}</td>
              <td style={styles.td}>{u.first_name} {u.last_name}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#fff'
                }}>
                  {u.role?.role_name || 'N/A'}
                </span>
              </td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: u.is_active ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: '#fff'
                }}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td style={styles.td}>{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
              <td style={styles.td}>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => openModal('user', u)}
                    style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                    title="Edit"
                  >
                    <Edit2 size={16} color="#fff" />
                  </button>
                  <button
                    onClick={() => handleDeactivateUser(u.user_id, u.is_active)}
                    style={{ ...styles.iconButton, background: u.is_active ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                    title={u.is_active ? 'Deactivate' : 'Activate'}
                  >
                    {u.is_active ? <Lock size={16} color="#fff" /> : <CheckCircle size={16} color="#fff" />}
                  </button>
                  <button
                    onClick={() => handleDelete('user', u.user_id)}
                    style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
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
const renderRoles = () => (
<div style={styles.card}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
<h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
Roles & Permissions Management
</h2>
<div style={{ display: 'flex', gap: '0.75rem' }}>
<button
onClick={() => openModal('role')}
style={{ ...styles.button, ...styles.buttonPrimary }}
>
<Plus size={20} />
Create Role
</button>
<button
onClick={() => openModal('permission')}
style={{ ...styles.button, ...styles.buttonSuccess }}
>
<Plus size={20} />
Create Permission
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
    {['Roles', 'Permissions', 'Role Assignments'].map((tab, idx) => (
      <button
        key={idx}
        onClick={() => setSelectedTab(idx)}
        style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}
      >
        {tab}
      </button>
    ))}
  </div>

  {selectedTab === 0 && (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Role Name</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Users Count</th>
            <th style={styles.th}>Permissions</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {metadata.roles.results.map((role) => (
            <tr key={role.role_id}>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  color: '#fff'
                }}>
                  {role.role_name}
                </span>
              </td>
              <td style={styles.td}>{role.role_description || 'N/A'}</td>
              <td style={styles.td}>{role.users_count || 0}</td>
              <td style={styles.td}>{role.permissions_count || 0} permissions</td>
              <td style={styles.td}>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => openModal('role', role)}
                    style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                  >
                    <Edit2 size={16} color="#fff" />
                  </button>
                  <button
                    onClick={() => openModal('view', role)}
                    style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                  >
                    <Eye size={16} color="#fff" />
                  </button>
                  <button
                    onClick={() => handleDelete('role', role.role_id)}
                    style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
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

  {selectedTab === 1 && (
    <div style={{ overflowX: 'auto' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Permission Name</th>
            <th style={styles.th}>Module</th>
            <th style={styles.th}>Description</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {metadata.permissions.results.map((perm) => (
            <tr key={perm.permission_id}>
              <td style={styles.td}>{perm.permission_name}</td>
              <td style={styles.td}>
                <span style={{
                  ...styles.badge,
                  background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                  color: '#fff'
                }}>
                  {perm.module_name || 'General'}
                </span>
              </td>
              <td style={styles.td}>{perm.permission_description || 'N/A'}</td>
              <td style={styles.td}>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => openModal('permission', perm)}
                    style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}
                  >
                    <Edit2 size={16} color="#fff" />
                  </button>
                  <button
                    onClick={() => handleDelete('permission', perm.permission_id)}
                    style={{ ...styles.iconButton, background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
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
const renderModal = () => {
if (!modal.show) return null;
return (
  <div style={styles.modal} onClick={closeModal}>
    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff' }}>
          {modal.item && modal.type !== 'view' ? 'Edit' : modal.type === 'view' ? 'View' : 'Create'} {modal.type}
        </h2>
        <button onClick={closeModal} style={{ ...styles.iconButton, backgroundColor: '#475569' }}>
          <X size={24} color="#cbd5e1" />
        </button>
      </div>

      {modal.type === 'view' ? (
        <div style={{ color: '#cbd5e1' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.8', backgroundColor: 'rgba(51, 65, 85, 0.8)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(71, 85, 105, 0.5)' }}>
            {JSON.stringify(modal.item, null, 2)}
          </pre>
        </div>
      ) : modal.type === 'user' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username *</label>
              <input
                type="text"
                style={styles.input}
                value={form.username || ''}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email *</label>
              <input
                type="email"
                style={styles.input}
                value={form.email || ''}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name *</label>
              <input
                type="text"
                style={styles.input}
                value={form.first_name || ''}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                placeholder="First name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name *</label>
              <input
                type="text"
                style={styles.input}
                value={form.last_name || ''}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                placeholder="Last name"
              />
            </div>
          </div>

          {!modal.item && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Password *</label>
              <input
                type="password"
                style={styles.input}
                value={form.password || ''}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter secure password"
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Role *</label>
              <select
                style={styles.select}
                value={form.role || ''}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="">Select role</option>
                {metadata.roles.results.map(r => (
                  <option key={r.role_id} value={r.role_id}>{r.role_name}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                style={styles.input}
                value={form.phone_number || ''}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  style={{ marginRight: '0.5rem' }}
                />
                Active User
              </label>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={form.is_super_user ?? false}
                  onChange={(e) => setForm({ ...form, is_super_user: e.target.checked })}
                  style={{ marginRight: '0.5rem' }}
                />
                Super User
              </label>
            </div>
          </div>
        </>
      ) : modal.type === 'role' ? (
        <>
          <div style={styles.formGroup}>
            <label style={styles.label}>Role Name *</label>
            <input
              type="text"
              style={styles.input}
              value={form.role_name || ''}
              onChange={(e) => setForm({ ...form, role_name: e.target.value })}
              placeholder="e.g., Project Manager"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={form.role_description || ''}
              onChange={(e) => setForm({ ...form, role_description: e.target.value })}
              placeholder="Describe the role and its responsibilities"
            />
          </div>
        </>
      ) : modal.type === 'permission' ? (
        <>
          <div style={styles.formGroup}>
            <label style={styles.label}>Permission Name *</label>
            <input
              type="text"
              style={styles.input}
              value={form.permission_name || ''}
              onChange={(e) => setForm({ ...form, permission_name: e.target.value })}
              placeholder="e.g., create_project"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Module Name</label>
            <input
              type="text"
              style={styles.input}
              value={form.module_name || ''}
              onChange={(e) => setForm({ ...form, module_name: e.target.value })}
              placeholder="e.g., Project Management"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={form.permission_description || ''}
              onChange={(e) => setForm({ ...form, permission_description: e.target.value })}
              placeholder="Describe what this permission allows"
            />
          </div>
        </>
      ) : modal.type === 'setting' ? (
        <>
          <div style={styles.formGroup}>
            <label style={styles.label}>Setting Key *</label>
            <input
              type="text"
              style={styles.input}
              value={form.setting_key || ''}
              onChange={(e) => setForm({ ...form, setting_key: e.target.value })}
              placeholder="e.g., sla_default_days"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Setting Value *</label>
            <input
              type="text"
              style={styles.input}
              value={form.setting_value || ''}
              onChange={(e) => setForm({ ...form, setting_value: e.target.value })}
              placeholder="Enter value"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Type</label>
            <select
              style={styles.select}
              value={form.setting_type || 'String'}
              onChange={(e) => setForm({ ...form, setting_type: e.target.value })}
            >
              <option value="String">String</option>
              <option value="Integer">Integer</option>
              <option value="Boolean">Boolean</option>
              <option value="JSON">JSON</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={form.setting_description || ''}
              onChange={(e) => setForm({ ...form, setting_description: e.target.value })}
              placeholder="Describe this setting"
            />
          </div>
        </>
      ) : null}

      {modal.type !== 'view' && (
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={handleSubmit}
            style={{ ...styles.button, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', flex: 1, color: '#fff' }}
            disabled={state.loading}
          >
            <Save size={20} />
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
<div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
<div style={{ background: 'rgba(30, 41, 59, 0.95)', padding: '3rem', borderRadius: '20px', textAlign: 'center', maxWidth: '500px', border: '2px solid rgba(59, 130, 246, 0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
<Shield size={80} color="#ef4444" style={{ marginBottom: '1.5rem' }} />
<h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
Administrator Access Required
</h2>
<p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6' }}>
You need administrator credentials to access this dashboard. Please login with proper authorization.
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
        button:hover { opacity: 0.95; }
        button:active { transform: scale(0.98); }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.2);
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.6);
        }
      `}</style>
  <div style={styles.maxWidth}>
    <div style={styles.header}>
      <div>
        <h1 style={styles.title}>System Administrator</h1>
        <p style={styles.subtitle}>
          Welcome, {state.user?.first_name} {state.user?.last_name} - Complete System Control & Management
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{
          ...styles.badge,
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#fff',
          fontSize: '1rem',
          padding: '0.75rem 1.5rem',
          border: '2px solid rgba(239, 68, 68, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Shield size={20} />
          {state.user?.role_name}
        </span>
      </div>
    </div>

    {state.success && (
      <div style={{ ...styles.alert, ...styles.alertSuccess }}>
        <CheckCircle size={28} />
        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{state.success}</span>
      </div>
    )}

    {state.error && (
      <div style={{ ...styles.alert, ...styles.alertError }}>
        <AlertCircle size={28} />
        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{state.error}</span>
      </div>
    )}

    {view === 'dashboard' && renderDashboard()}
    {view === 'users' && renderUsers()}
    {view === 'roles' && renderRoles()}
    {view === 'system_settings' && (
      <div style={styles.card}>
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>System Configuration</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Configure SLA rules, penalty formulas, workflow stages, notification templates, and system-wide settings
        </p>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back to Dashboard
        </button>
      </div>
    )}
    {view === 'data' && (
      <div style={styles.card}>
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Data Management</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Import/export data, perform bulk operations, manage data integrity and backups
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => handleExportData('all')} style={{ ...styles.button, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff' }}>
            <Download size={20} />
            Export All Data
          </button>
          <button onClick={() => openModal('import')} style={{ ...styles.button, background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#fff' }}>
            <Upload size={20} />
            Import Data
          </button>
          <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
            Back
          </button>
        </div>
      </div>
    )}
    {view === 'audit_logs' && (
      <div style={styles.card}>
        <h2 style={{ color: '#fff', fontSize: '2rem', marginBottom: '1rem', fontWeight: '800' }}>Audit & Change Logs</h2>
        <p style={{ color: '#94a3b8', fontSize: '1.125rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          View complete audit trail of system activities, user actions, and data changes
        </p>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>
    )}
  </div>

  {renderModal()}
</div>
);
};
export default AdminDashboard;