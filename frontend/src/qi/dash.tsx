import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, TrendingUp, FileText, Users, Plus, Edit2, 
  Trash2, X, Save, Eye, Clock, AlertTriangle, Calendar, Camera,
  Activity, ClipboardCheck, FileCheck, BarChart3, Target,
  Download, Upload, Filter, Search, RefreshCw, Send, MapPin,
  Award, Zap, CheckSquare, XCircle, Image, List, CheckCircleIcon
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

const QIInspectorDashboard = () => {
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
    projects: [],
    inspectionTypes: [],
    workOrders: [],
    documentTypes: [],
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    date: '',
    inspectionType: '',
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
      const [projects, inspectionTypes, workOrders, documentTypes] = await Promise.all([
        tempApi.get('/api/v1/projects/'),
        tempApi.get('/api/v1/inspection-types/'),
        tempApi.get('/api/v1/work-orders/'),
        tempApi.get('/api/v1/document-types/'),
      ]);
      setMetadata({ projects, inspectionTypes, workOrders, documentTypes });
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
        dashboard: '/api/v1/qi-mobile/dashboard/',
        inspections: '/api/v1/qi-mobile/my_inspections/',
        assigned: '/api/v1/qi-mobile/assigned_inspections/',
        daily: '/api/v1/qi-daily-targets/',
        weekly: '/api/v1/qi-weekly-accomplishments/',
        monthly: '/api/v1/qi-monthly-accomplishments/',
        performance: '/api/v1/qi-performance/',
        workorders: '/api/v1/qi-mobile/assigned_work_orders/',
        documents: '/api/v1/project-documents/',
        schedule: '/api/v1/qi-mobile/inspection_schedule/',
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
        inspection: modal.item ? `/api/v1/qi-inspections/${modal.item.inspection_id}/` : '/api/v1/qi-inspections/',
        daily: modal.item ? `/api/v1/qi-daily-targets/${modal.item.id}/` : '/api/v1/qi-daily-targets/',
        weekly: modal.item ? `/api/v1/qi-weekly-accomplishments/${modal.item.id}/` : '/api/v1/qi-weekly-accomplishments/',
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

  const handleComplete = async (inspectionId, result) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      await api.patch(`/api/v1/qi-inspections/${inspectionId}/`, {
        is_completed: true,
        inspection_result: result,
        inspection_date: new Date().toISOString().split('T')[0],
      });
      showSuccess('Inspection completed successfully');
      loadData(view);
    } catch (err) {
      showError(err.message || 'Failed to complete inspection');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const handleApprove = async (type, id, approved) => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      if (type === 'document') {
        await api.patch(`/api/v1/project-documents/${id}/`, {
          approval_status: approved ? 'Approved' : 'Rejected'
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

  const renderDashboard = () => (
    <div>
      <div style={styles.statsGrid}>
        {[
          { icon: ClipboardCheck, label: 'Total Inspections', value: data?.stats?.total_inspections || 0, color: '#3b82f6' },
          { icon: CheckCircle, label: 'Completed Today', value: data?.stats?.completed_today || 0, color: '#10b981' },
          { icon: Clock, label: 'Pending Inspections', value: data?.stats?.pending_inspections || 0, color: '#f59e0b' },
          { icon: Target, label: 'Daily Target', value: data?.stats?.daily_target || 0, color: '#8b5cf6' },
          { icon: Award, label: 'Target Achievement', value: `${data?.stats?.target_achievement || 0}%`, color: '#10b981' },
          { icon: FileCheck, label: 'Documents Reviewed', value: data?.stats?.documents_reviewed || 0, color: '#06b6d4' },
          { icon: AlertTriangle, label: 'Failed Inspections', value: data?.stats?.failed_inspections || 0, color: '#ef4444' },
          { icon: TrendingUp, label: 'Quality Score', value: `${data?.stats?.quality_score || 0}%`, color: '#10b981' },
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
          QI Inspector Functions & Quick Actions
        </h2>
        <div style={styles.featureGrid}>
          {[
            { icon: ClipboardCheck, label: 'My Inspections', desc: 'View, conduct, and submit inspection reports', view: 'inspections', color: '#3b82f6' },
            { icon: Calendar, label: 'Assigned Inspections', desc: 'View assigned inspections and schedule', view: 'assigned', color: '#10b981' },
            { icon: FileCheck, label: 'Document Review', desc: 'Review and approve project documents', view: 'documents', color: '#8b5cf6' },
            { icon: Target, label: 'Daily Targets', desc: 'Track daily inspection targets and accomplishments', view: 'daily', color: '#06b6d4' },
            { icon: BarChart3, label: 'Weekly Report', desc: 'View weekly inspection accomplishments', view: 'weekly', color: '#f59e0b' },
            { icon: TrendingUp, label: 'Monthly Performance', desc: 'Track monthly performance and KPIs', view: 'monthly', color: '#14b8a6' },
            { icon: Award, label: 'My Performance', desc: 'View personal performance metrics', view: 'performance', color: '#8b5cf6' },
            { icon: List, label: 'Work Orders', desc: 'View assigned work orders for inspection', view: 'workorders', color: '#06b6d4' },
            { icon: Camera, label: 'Upload Photos', desc: 'Upload inspection photos and evidence', view: 'photos', color: '#f59e0b' },
            { icon: MapPin, label: 'Inspection Schedule', desc: 'Manage inspection schedule and locations', view: 'schedule', color: '#10b981' },
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

      {data?.today_schedule && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>
            Today's Inspection Schedule
          </h3>
          {data.today_schedule.map((item, i) => (
            <div key={i} style={{...styles.detailCard, marginBottom: '0.75rem'}}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>{item.project_code}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {item.inspection_type} - {item.location}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    Scheduled: {item.scheduled_time}
                  </div>
                </div>
                <div style={styles.actionButtons}>
                  <button
                    onClick={() => openModal('inspection', item)}
                    style={{ ...styles.button, ...styles.buttonPrimary }}
                  >
                    <CheckSquare size={18} />
                    Start Inspection
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderInspections = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          My Inspections
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('inspection')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Plus size={18} />
            Log Inspection
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
            placeholder="Search inspections..."
            style={styles.input}
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
        <input
          type="date"
          style={{ ...styles.input, minWidth: '150px' }}
          value={filters.date}
          onChange={(e) => setFilters({...filters, date: e.target.value})}
        />
        <select
          style={{ ...styles.select, minWidth: '150px' }}
          value={filters.inspectionType}
          onChange={(e) => setFilters({...filters, inspectionType: e.target.value})}
        >
          <option value="">All Types</option>
          {metadata.inspectionTypes.map(t => (
            <option key={t.inspection_type_id} value={t.inspection_type_id}>{t.inspection_name}</option>
          ))}
        </select>
        <button
          onClick={() => loadData('inspections')}
          style={{ ...styles.iconButton, backgroundColor: '#3b82f6', padding: '0.75rem' }}
        >
          <RefreshCw size={18} color="#fff" />
        </button>
      </div>

      <div style={styles.tabs}>
        {['All Inspections', 'Scheduled', 'Completed', 'Pending', 'Failed'].map((tab, idx) => (
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
                <th style={styles.th}>Inspection Type</th>
                <th style={styles.th}>Scheduled Date</th>
                <th style={styles.th}>Inspection Date</th>
                <th style={styles.th}>Result</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.inspections?.map((insp) => (
                <tr key={insp.inspection_id}>
                  <td style={styles.td}>{insp.project?.project_code || 'N/A'}</td>
                  <td style={styles.td}>{insp.inspection_type?.inspection_name || 'N/A'}</td>
                  <td style={styles.td}>{insp.scheduled_date || 'N/A'}</td>
                  <td style={styles.td}>{insp.inspection_date || 'Not completed'}</td>
                  <td style={styles.td}>
                    {insp.inspection_result && (
                      <span style={{
                        ...styles.badge,
                        backgroundColor: insp.inspection_result === 'Pass' ? '#064e3b' : insp.inspection_result === 'Fail' ? '#7f1d1d' : '#78350f',
                        color: insp.inspection_result === 'Pass' ? '#6ee7b7' : insp.inspection_result === 'Fail' ? '#fca5a5' : '#fde68a'
                      }}>
                        {insp.inspection_result}
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: insp.is_completed ? '#064e3b' : '#1e3a8a',
                      color: insp.is_completed ? '#6ee7b7' : '#93c5fd'
                    }}>
                      {insp.is_completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => openModal('view', insp)}
                        style={{ ...styles.iconButton, backgroundColor: '#4338ca' }}
                        title="View Details"
                      >
                        <Eye size={16} color="#fff" />
                      </button>
                      {!insp.is_completed && (
                        <>
                          <button
                            onClick={() => openModal('inspection', insp)}
                            style={{ ...styles.iconButton, backgroundColor: '#3b82f6' }}
                            title="Edit"
                          >
                            <Edit2 size={16} color="#fff" />
                          </button>
                          <button
                            onClick={() => handleComplete(insp.inspection_id, 'Pass')}
                            style={{ ...styles.iconButton, backgroundColor: '#10b981' }}
                            title="Mark as Pass"
                          >
                            <CheckCircle size={16} color="#fff" />
                          </button>
                          <button
                            onClick={() => handleComplete(insp.inspection_id, 'Fail')}
                            style={{ ...styles.iconButton, backgroundColor: '#ef4444' }}
                            title="Mark as Fail"
                          >
                            <XCircle size={16} color="#fff" />
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
      )}
    </div>
  );

  const renderDailyTargets = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Daily Targets & Accomplishments
        </h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('daily')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Plus size={18} />
            Set Target
          </button>
          <button
            onClick={() => setView('dashboard')}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Back
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Target Audits</th>
              <th style={styles.th}>Actual Audits</th>
              <th style={styles.th}>Target Met</th>
              <th style={styles.th}>Achievement %</th>
              <th style={styles.th}>Reason Not Met</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.daily_targets?.map((target) => (
              <tr key={target.id}>
                <td style={styles.td}>{target.target_date}</td>
                <td style={styles.td}>{target.target_audits}</td>
                <td style={styles.td}>{target.actual_audits}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: target.target_met ? '#064e3b' : '#7f1d1d',
                    color: target.target_met ? '#6ee7b7' : '#fca5a5'
                  }}>
                    {target.target_met ? 'Yes' : 'No'}
                  </span>
                </td>
                <td style={styles.td}>
                  {target.target_audits > 0 ? Math.round((target.actual_audits / target.target_audits) * 100) : 0}%
                </td>
                <td style={styles.td}>{target.reason_not_met || '-'}</td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => openModal('daily', target)}
                      style={{ ...styles.iconButton, backgroundColor: '#3b82f6' }}
                    >
                      <Edit2 size={16} color="#fff" />
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

  const renderWeekly = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Weekly Accomplishments
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      {data?.weekly_accomplishments?.map((week) => (
        <div key={week.id} style={{...styles.detailCard, marginBottom: '1rem'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
                Week: {week.week_start_date} to {week.week_end_date}
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Total: {week.total_inspections} / Target: {week.target_inspections}
              </p>
            </div>
            <span style={{
              ...styles.badge,
              backgroundColor: week.target_met ? '#064e3b' : '#7f1d1d',
              color: week.target_met ? '#6ee7b7' : '#fca5a5'
            }}>
              {week.target_met ? 'Target Met' : 'Target Not Met'}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const counts = [week.monday_count, week.tuesday_count, week.wednesday_count, week.thursday_count, week.friday_count, week.saturday_count, week.sunday_count];
              return (
                <div key={idx} style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.25rem' }}>{day}</div>
                  <div style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '700' }}>{counts[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderMonthly = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Monthly Performance
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      {data?.monthly_accomplishments?.map((month) => (
        <div key={month.id} style={{...styles.detailCard, marginBottom: '1rem'}}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
                {new Date(month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                Total: {month.total_inspections} / Target: {month.target_inspections}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: month.target_met ? '#10b981' : '#ef4444', marginBottom: '0.25rem' }}>
                {month.achievement_percentage?.toFixed(1)}%
              </div>
              <span style={{
                ...styles.badge,
                backgroundColor: month.target_met ? '#064e3b' : '#7f1d1d',
                color: month.target_met ? '#6ee7b7' : '#fca5a5'
              }}>
                {month.target_met ? 'Target Met' : 'Target Not Met'}
              </span>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
            {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((week, idx) => {
              const counts = [month.week1_count, month.week2_count, month.week3_count, month.week4_count, month.week5_count];
              return (
                <div key={idx} style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{week}</div>
                  <div style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '700' }}>{counts[idx]}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPerformance = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          My Performance Metrics
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      {data?.performance_records?.map((perf) => (
        <div key={perf.id} style={{...styles.detailCard, marginBottom: '1rem'}}>
          <div style={{ marginBottom: '1rem' }}>
            <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
              Period: {perf.evaluation_period_start} to {perf.evaluation_period_end}
            </h4>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Inspections</div>
              <div style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '700' }}>{perf.total_inspections}</div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>On-Time Rate</div>
              <div style={{ color: '#10b981', fontSize: '1.75rem', fontWeight: '700' }}>{perf.on_time_percentage?.toFixed(1)}%</div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Avg Inspection Time</div>
              <div style={{ color: '#fff', fontSize: '1.75rem', fontWeight: '700' }}>{perf.average_inspection_time?.toFixed(1)}h</div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Targets Met</div>
              <div style={{ color: '#10b981', fontSize: '1.75rem', fontWeight: '700' }}>{perf.targets_met}</div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Targets Missed</div>
              <div style={{ color: '#ef4444', fontSize: '1.75rem', fontWeight: '700' }}>{perf.targets_missed}</div>
            </div>
            
            <div style={{ padding: '1rem', backgroundColor: '#1e293b', borderRadius: '8px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Quality Rating</div>
              <div style={{ color: '#f59e0b', fontSize: '1.75rem', fontWeight: '700' }}>{perf.quality_rating?.toFixed(1)}/5</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDocuments = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>
          Document Review
        </h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      {data?.pending_documents?.map((doc) => (
        <div key={doc.document_id} style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>{doc.document_name}</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Project: {doc.project?.project_code} - Type: {doc.doc_type?.doc_type_name}
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
                onClick={() => handleApprove('document', doc.document_id, true)}
                style={{ ...styles.button, ...styles.buttonSuccess }}
              >
                <CheckCircle size={18} />
                Approve
              </button>
              <button
                onClick={() => handleApprove('document', doc.document_id, false)}
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
          ) : modal.type === 'inspection' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Project *</label>
                <select
                  style={styles.select}
                  value={form.project || ''}
                  onChange={(e) => setForm({ ...form, project: e.target.value })}
                >
                  <option value="">Select project</option>
                  {metadata.projects.map(p => (
                    <option key={p.project_id} value={p.project_id}>{p.project_code} - {p.project_name}</option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Inspection Type *</label>
                <select
                  style={styles.select}
                  value={form.inspection_type || ''}
                  onChange={(e) => setForm({ ...form, inspection_type: e.target.value })}
                >
                  <option value="">Select type</option>
                  {metadata.inspectionTypes.map(t => (
                    <option key={t.inspection_type_id} value={t.inspection_type_id}>{t.inspection_name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Scheduled Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.scheduled_date || ''}
                    onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Inspection Date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.inspection_date || ''}
                    onChange={(e) => setForm({ ...form, inspection_date: e.target.value })}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Inspection Result</label>
                <select
                  style={styles.select}
                  value={form.inspection_result || ''}
                  onChange={(e) => setForm({ ...form, inspection_result: e.target.value })}
                >
                  <option value="">Select result</option>
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                  <option value="Conditional">Conditional</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Findings</label>
                <textarea
                  style={styles.textarea}
                  value={form.findings || ''}
                  onChange={(e) => setForm({ ...form, findings: e.target.value })}
                  placeholder="Enter inspection findings"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Recommendations</label>
                <textarea
                  style={styles.textarea}
                  value={form.recommendations || ''}
                  onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                  placeholder="Enter recommendations"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location Coordinates</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.location_coordinates || ''}
                  onChange={(e) => setForm({ ...form, location_coordinates: e.target.value })}
                  placeholder="e.g., 14.5995, 120.9842"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={form.photos_uploaded || false}
                    onChange={(e) => setForm({ ...form, photos_uploaded: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  Photos Uploaded
                </label>
              </div>

              <div style={styles.formGroup}>
                <label style={{ ...styles.label, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={form.is_completed || false}
                    onChange={(e) => setForm({ ...form, is_completed: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                  Mark as Completed
                </label>
              </div>
            </>
          ) : modal.type === 'daily' ? (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Date *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={form.target_date || ''}
                  onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target Audits *</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.target_audits || ''}
                    onChange={(e) => setForm({ ...form, target_audits: parseInt(e.target.value) })}
                    placeholder="e.g., 10"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Actual Audits</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.actual_audits || ''}
                    onChange={(e) => setForm({ ...form, actual_audits: parseInt(e.target.value) })}
                    placeholder="e.g., 8"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Reason Category</label>
                <select
                  style={styles.select}
                  value={form.reason_category || ''}
                  onChange={(e) => setForm({ ...form, reason_category: e.target.value })}
                >
                  <option value="">Select category</option>
                  <option value="Weather">Weather</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Access">Site Access Issues</option>
                  <option value="Documentation">Documentation Issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Reason Not Met (if applicable)</label>
                <textarea
                  style={styles.textarea}
                  value={form.reason_not_met || ''}
                  onChange={(e) => setForm({ ...form, reason_not_met: e.target.value })}
                  placeholder="Explain why target was not met"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={styles.textarea}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
            </>
          ) : modal.type === 'weekly' ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Week Start Date *</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.week_start_date || ''}
                    onChange={(e) => setForm({ ...form, week_start_date: e.target.value })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Week End Date *</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.week_end_date || ''}
                    onChange={(e) => setForm({ ...form, week_end_date: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Monday</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.monday_count || 0}
                    onChange={(e) => setForm({ ...form, monday_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Tuesday</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.tuesday_count || 0}
                    onChange={(e) => setForm({ ...form, tuesday_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Wednesday</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.wednesday_count || 0}
                    onChange={(e) => setForm({ ...form, wednesday_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Thursday</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.thursday_count || 0}
                    onChange={(e) => setForm({ ...form, thursday_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Friday</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.friday_count || 0}
                    onChange={(e) => setForm({ ...form, friday_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Saturday</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.saturday_count || 0}
                    onChange={(e) => setForm({ ...form, saturday_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Sunday</label>
                  <input
                    type="number"
                    style={styles.input}
                    value={form.sunday_count || 0}
                    onChange={(e) => setForm({ ...form, sunday_count: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Target Inspections</label>
                <input
                  type="number"
                  style={styles.input}
                  value={form.target_inspections || ''}
                  onChange={(e) => setForm({ ...form, target_inspections: parseInt(e.target.value) })}
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
            Please login to access the QI Inspector Dashboard. You need valid authentication credentials.
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
            <h1 style={styles.title}>QI Inspector Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome, {state.user?.first_name} {state.user?.last_name} - Quality Inspection Management System
            </p>
          </div>
          <span style={{
            ...styles.badge,
            backgroundColor: '#10b981',
            color: '#fff',
            fontSize: '1rem',
            padding: '0.625rem 1.25rem',
            border: '2px solid #6ee7b7'
          }}>
            {state.user?.role_name || 'QI Inspector'}
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
        {view === 'inspections' && renderInspections()}
        {view === 'daily' && renderDailyTargets()}
        {view === 'weekly' && renderWeekly()}
        {view === 'monthly' && renderMonthly()}
        {view === 'performance' && renderPerformance()}
        {view === 'documents' && renderDocuments()}
        {view === 'assigned' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Assigned Inspections</h2>
            <p style={{ color: '#94a3b8' }}>View your assigned inspections and schedule</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'workorders' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Work Orders for Inspection</h2>
            <p style={{ color: '#94a3b8' }}>View work orders assigned for quality inspection</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'photos' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Upload Inspection Photos</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Upload photos and evidence from inspections</p>
            <div style={styles.formGroup}>
              <label style={styles.label}>Select Inspection</label>
              <select style={styles.select}>
                <option value="">Choose an inspection...</option>
                {data?.inspections?.map(i => (
                  <option key={i.inspection_id} value={i.inspection_id}>
                    {i.project?.project_code} - {i.inspection_type?.inspection_name}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: '1rem', padding: '2rem', border: '2px dashed #475569', borderRadius: '12px', textAlign: 'center' }}>
              <Camera size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
              <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>Drag and drop photos here or click to browse</p>
              <button style={{ ...styles.button, ...styles.buttonPrimary }}>
                <Upload size={18} />
                Choose Files
              </button>
            </div>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'schedule' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Inspection Schedule</h2>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>View and manage your inspection schedule</p>
            
            <div style={styles.searchBar}>
              <input
                type="date"
                style={{ ...styles.input, minWidth: '200px' }}
                placeholder="Select date"
              />
              <button style={{ ...styles.button, ...styles.buttonPrimary }}>
                <Search size={18} />
                View Schedule
              </button>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '1rem' }}>Upcoming Inspections</h3>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ ...styles.detailCard, marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
                        Project ABC-{i} - Site Inspection
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
                        <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Location {i}, Sector {i}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        <Clock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                        Tomorrow, {8 + i}:00 AM
                      </div>
                    </div>
                    <button style={{ ...styles.button, ...styles.buttonPrimary }}>
                      View Details
                    </button>
                  </div>
                </div>
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

export default QIInspectorDashboard;