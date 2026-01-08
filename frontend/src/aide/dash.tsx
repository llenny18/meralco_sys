import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, CheckCircle, Camera, FileText, Users, Plus, Edit2, 
  Trash2, X, Save, Eye, Clock, MapPin, Clipboard,
  Activity, Navigation, Image, Upload, RefreshCw, Send,
  Target, Package, CheckSquare, ListChecks, Ruler, FileImage,
  Shield, Tool, Wrench, Bell, Map, Folder
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
  imagePreview: {
    width: '100%',
    maxHeight: '300px',
    objectFit: 'cover',
    borderRadius: '8px',
    marginTop: '1rem',
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem',
  },
  photoCard: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #475569',
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
}

const EngineeringAideDashboard = () => {
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
  const [photos, setPhotos] = useState([]);
  const [measurements, setMeasurements] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem('auth_token');
    const user = sessionStorage.getItem('user_data');
    if (token && user) {
      setState(p => ({ ...p, token, user: JSON.parse(user), isAuth: true }));
      loadData('dashboard', token);
    }
  }, []);

  const api = state.token ? new APIService(API_BASE, state.token) : null;

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
        dashboard: '/api/v1/engineering-aide/dashboard/',
        tasks: '/api/v1/engineering-aide/assigned_tasks/',
        workorders: '/api/v1/engineering-aide/assigned_work_orders/',
        inspections: '/api/v1/engineering-aide/assist_inspections/',
        fielddata: '/api/v1/engineering-aide/field_data/',
        documents: '/api/v1/engineering-aide/documents/',
        photos: '/api/v1/engineering-aide/site_photos/',
        activities: '/api/v1/engineering-aide/daily_activities/',
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
    setPhotos([]);
    setMeasurements([]);
  };

  const closeModal = () => {
    setModal({ show: false, type: '', item: null });
    setForm({});
    setPhotos([]);
    setMeasurements([]);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      timestamp: new Date().toISOString(),
    }));
    setPhotos([...photos, ...newPhotos]);
  };

  const handleSubmit = async () => {
    if (!api) return;
    
    setState(p => ({ ...p, loading: true }));
    try {
      const endpoints = {
        fieldreport: '/api/v1/engineering-aide/field_reports/',
        measurement: '/api/v1/engineering-aide/measurements/',
        observation: '/api/v1/engineering-aide/observations/',
        photo: '/api/v1/engineering-aide/site_photos/',
        activity: '/api/v1/engineering-aide/daily_activities/',
      };
      
      const method = modal.item ? 'put' : 'post';
      const endpoint = modal.item 
        ? `${endpoints[modal.type]}${modal.item.id}/`
        : endpoints[modal.type];
      
      await api[method](endpoint, form);
      
      showSuccess(`${modal.type} ${modal.item ? 'updated' : 'created'} successfully`);
      closeModal();
      loadData(view);
    } catch (err) {
      showError(err.message || 'Operation failed');
    } finally {
      setState(p => ({ ...p, loading: false }));
    }
  };

  const renderDashboard = () => (
    <div>
      <div style={styles.statsGrid}>
        {[
          { icon: ListChecks, label: 'Assigned Tasks', value: data?.stats?.assigned_tasks || 0, color: '#3b82f6' },
          { icon: Package, label: 'Work Orders', value: data?.stats?.work_orders || 0, color: '#10b981' },
          { icon: CheckSquare, label: 'Inspections Assisted', value: data?.stats?.inspections_assisted || 0, color: '#8b5cf6' },
          { icon: Camera, label: 'Photos Taken', value: data?.stats?.photos_taken || 0, color: '#06b6d4' },
          { icon: Ruler, label: 'Measurements Recorded', value: data?.stats?.measurements_recorded || 0, color: '#f59e0b' },
          { icon: FileText, label: 'Field Reports', value: data?.stats?.field_reports || 0, color: '#14b8a6' },
          { icon: MapPin, label: 'Site Visits', value: data?.stats?.site_visits || 0, color: '#f43f5e' },
          { icon: Activity, label: 'Today\'s Activities', value: data?.stats?.today_activities || 0, color: '#a855f7' },
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
          Engineering Aide Functions & Quick Actions
        </h2>
        <div style={styles.featureGrid}>
          {[
            { icon: ListChecks, label: 'My Tasks', desc: 'View and track assigned daily tasks', view: 'tasks', color: '#3b82f6' },
            { icon: Package, label: 'Work Orders', desc: 'View assigned work orders and update status', view: 'workorders', color: '#10b981' },
            { icon: CheckSquare, label: 'Inspection Support', desc: 'Assist QI inspections and collect data', view: 'inspections', color: '#8b5cf6' },
            { icon: Camera, label: 'Site Photos', desc: 'Take and upload site photos with GPS', view: 'photos', color: '#06b6d4' },
            { icon: Ruler, label: 'Field Measurements', desc: 'Record site measurements and dimensions', view: 'fielddata', color: '#f59e0b' },
            { icon: FileText, label: 'Field Reports', desc: 'Submit daily field observation reports', view: 'reports', color: '#14b8a6' },
            { icon: Folder, label: 'Document Support', desc: 'Prepare and organize technical documents', view: 'documents', color: '#64748b' },
            { icon: Activity, label: 'Daily Activities', desc: 'Log and track daily field activities', view: 'activities', color: '#a855f7' },
            { icon: Users, label: 'Team Coordination', desc: 'Coordinate with vendors, QI, and supervisors', view: 'coordination', color: '#ec4899' },
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
          <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={28} color="#3b82f6" />
            Today's Schedule
          </h3>
          {data.today_schedule.map((item, i) => (
            <div key={i} style={{ ...styles.detailCard, marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: '600', marginBottom: '0.25rem' }}>{item.task}</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
                    <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {item.location} • {item.time}
                  </div>
                </div>
                <span style={{
                  ...styles.badge,
                  backgroundColor: item.status === 'completed' ? '#064e3b' : item.status === 'in_progress' ? '#78350f' : '#1e3a8a',
                  color: item.status === 'completed' ? '#6ee7b7' : item.status === 'in_progress' ? '#fde68a' : '#93c5fd'
                }}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTasks = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>My Tasks</h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back to Dashboard
        </button>
      </div>

      <div style={styles.tabs}>
        {['All Tasks', 'Today', 'This Week', 'Pending', 'Completed'].map((tab, idx) => (
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
        <div>
          {data?.tasks?.map((task, i) => (
            <div key={i} style={styles.detailCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem', fontSize: '1.125rem' }}>
                    {task.task_name}
                  </h4>
                  <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>{task.description}</p>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {task.location}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      {task.scheduled_time}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                      <Users size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Assigned by: {task.assigned_by}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: task.priority === 'High' ? '#7f1d1d' : task.priority === 'Medium' ? '#78350f' : '#1e3a8a',
                    color: task.priority === 'High' ? '#fca5a5' : task.priority === 'Medium' ? '#fde68a' : '#93c5fd'
                  }}>
                    {task.priority} Priority
                  </span>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: task.status === 'Completed' ? '#064e3b' : '#475569',
                    color: task.status === 'Completed' ? '#6ee7b7' : '#cbd5e1'
                  }}>
                    {task.status}
                  </span>
                  <button
                    onClick={() => openModal('task-update', task)}
                    style={{ ...styles.button, ...styles.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWorkOrders = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>Work Orders</h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>WO No.</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.work_orders?.map((wo) => (
              <tr key={wo.wo_id}>
                <td style={styles.td}>{wo.wo_no}</td>
                <td style={styles.td}>{wo.description}</td>
                <td style={styles.td}>{wo.location}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.badge, backgroundColor: '#1e3a8a', color: '#93c5fd' }}>
                    {wo.status}
                  </span>
                </td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => openModal('wo-update', wo)}
                      style={{ ...styles.iconButton, backgroundColor: '#3b82f6' }}
                      title="Update Field Status"
                    >
                      <Edit2 size={16} color="#fff" />
                    </button>
                    <button
                      onClick={() => openModal('photo', wo)}
                      style={{ ...styles.iconButton, backgroundColor: '#10b981' }}
                      title="Add Photos"
                    >
                      <Camera size={16} color="#fff" />
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

  const renderInspections = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>Inspection Support</h2>
        <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
          Back
        </button>
      </div>

      <div style={styles.tabs}>
        {['Scheduled', 'In Progress', 'Completed'].map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedTab(idx)}
            style={{ ...styles.tab, ...(selectedTab === idx ? styles.tabActive : {}) }}
          >
            {tab}
          </button>
        ))}
      </div>

      {data?.inspections?.map((insp, i) => (
        <div key={i} style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
                {insp.inspection_type}
              </h4>
              <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>
                Project: {insp.project_code}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {insp.location}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {insp.scheduled_date}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  <Users size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  QI: {insp.qi_name}
                </div>
              </div>
            </div>
            <div style={styles.actionButtons}>
              <button
                onClick={() => openModal('measurement', insp)}
                style={{ ...styles.button, ...styles.buttonPrimary, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Ruler size={16} />
                Measurements
              </button>
              <button
                onClick={() => openModal('photo', insp)}
                style={{ ...styles.button, ...styles.buttonSuccess, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <Camera size={16} />
                Photos
              </button>
              <button
                onClick={() => openModal('observation', insp)}
                style={{ ...styles.button, ...styles.buttonWarning, padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                <FileText size={16} />
                Observations
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPhotos = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>Site Photos</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('photo')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Camera size={18} />
            Take Photo
          </button>
          <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
            Back
          </button>
        </div>
      </div>

      <div style={styles.photoGrid}>
        {data?.photos?.map((photo, i) => (
          <div key={i} style={styles.photoCard}>
            <img src={photo.thumbnail || photo.url} alt={photo.description} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', padding: '0.5rem', fontSize: '0.75rem', color: '#fff' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{photo.location}</div>
              <div style={{ fontSize: '0.625rem', color: '#94a3b8' }}>{photo.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFieldData = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>Field Measurements</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('measurement')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <Ruler size={18} />
            New Measurement
          </button>
          <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
            Back
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Measurement Type</th>
              <th style={styles.th}>Value</th>
              <th style={styles.th}>Unit</th>
              <th style={styles.th}>Notes</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data?.measurements?.map((m) => (
              <tr key={m.id}>
                <td style={styles.td}>{m.date}</td>
                <td style={styles.td}>{m.location}</td>
                <td style={styles.td}>{m.type}</td>
                <td style={styles.td}>{m.value}</td>
                <td style={styles.td}>{m.unit}</td>
                <td style={styles.td}>{m.notes}</td>
                <td style={styles.td}>
                  <div style={styles.actionButtons}>
                    <button
                      onClick={() => openModal('measurement', m)}
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

  const renderReports = () => (
    <div style={styles.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#fff' }}>Field Reports</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => openModal('fieldreport')}
            style={{ ...styles.button, ...styles.buttonPrimary }}
          >
            <FileText size={18} />
            New Report
          </button>
          <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary }}>
            Back
          </button>
        </div>
      </div>

      {data?.reports?.map((report, i) => (
        <div key={i} style={styles.detailCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#fff', fontWeight: '700', marginBottom: '0.5rem' }}>
                {report.title}
              </h4>
              <p style={{ color: '#94a3b8', marginBottom: '0.5rem', lineHeight: '1.6' }}>
                {report.description}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  <Clock size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {report.date}
                </div>
                <div style={{ color: '#64748b', fontSize: '0.875rem' }}>
                  <MapPin size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  {report.location}
                </div>
              </div>
            </div>
            <button
              onClick={() => openModal('view', report)}
              style={{ ...styles.iconButton, backgroundColor: '#4338ca' }}
            >
              <Eye size={16} color="#fff" />
            </button>
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
              {modal.item ? 'Update' : 'New'} {modal.type.replace('-', ' ')}
            </h2>
            <button onClick={closeModal} style={{ ...styles.iconButton, backgroundColor: '#475569' }}>
              <X size={20} color="#cbd5e1" />
            </button>
          </div>

          {modal.type === 'photo' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Upload Photos</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  capture="environment"
                  onChange={handlePhotoUpload}
                  style={{ ...styles.input }}
                />
              </div>

              {photos.length > 0 && (
                <div style={styles.photoGrid}>
                  {photos.map((photo, i) => (
                    <div key={i} style={styles.photoCard}>
                      <img src={photo.preview} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.label}>Location</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Enter location"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={styles.textarea}
                  value={form.description || ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Photo description"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>GPS Coordinates (Auto-captured)</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.coordinates || 'Capturing...'}
                  readOnly
                />
              </div>
            </>
          )}

          {modal.type === 'measurement' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Measurement Type *</label>
                <select
                  style={styles.input}
                  value={form.type || ''}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="">Select type</option>
                  <option value="Length">Length</option>
                  <option value="Width">Width</option>
                  <option value="Height">Height</option>
                  <option value="Depth">Depth</option>
                  <option value="Diameter">Diameter</option>
                  <option value="Distance">Distance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    style={styles.input}
                    value={form.value || ''}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Unit *</label>
                  <select
                    style={styles.input}
                    value={form.unit || ''}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  >
                    <option value="">Unit</option>
                    <option value="m">meters (m)</option>
                    <option value="cm">centimeters (cm)</option>
                    <option value="mm">millimeters (mm)</option>
                    <option value="ft">feet (ft)</option>
                    <option value="in">inches (in)</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Measurement location"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea
                  style={styles.textarea}
                  value={form.notes || ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Additional notes or observations"
                />
              </div>
            </>
          )}

          {modal.type === 'observation' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Observation Title *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Brief title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Detailed Observation *</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '150px' }}
                  value={form.observation || ''}
                  onChange={(e) => setForm({ ...form, observation: e.target.value })}
                  placeholder="Describe what you observed in detail..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  style={styles.input}
                  value={form.category || ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  <option value="Safety">Safety Issue</option>
                  <option value="Quality">Quality Concern</option>
                  <option value="Progress">Progress Update</option>
                  <option value="Material">Material Issue</option>
                  <option value="Equipment">Equipment Status</option>
                  <option value="Weather">Weather Condition</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Severity</label>
                <select
                  style={styles.input}
                  value={form.severity || ''}
                  onChange={(e) => setForm({ ...form, severity: e.target.value })}
                >
                  <option value="Info">Information Only</option>
                  <option value="Minor">Minor</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Major">Major</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </>
          )}

          {modal.type === 'fieldreport' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Report Title *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.title || ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Daily field report title"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Date *</label>
                <input
                  type="date"
                  style={styles.input}
                  value={form.date || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Location *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.location || ''}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="Site location"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Activities Performed *</label>
                <textarea
                  style={{ ...styles.textarea, minHeight: '120px' }}
                  value={form.activities || ''}
                  onChange={(e) => setForm({ ...form, activities: e.target.value })}
                  placeholder="List all activities performed today..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Issues Encountered</label>
                <textarea
                  style={styles.textarea}
                  value={form.issues || ''}
                  onChange={(e) => setForm({ ...form, issues: e.target.value })}
                  placeholder="Any issues or problems encountered"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Recommendations</label>
                <textarea
                  style={styles.textarea}
                  value={form.recommendations || ''}
                  onChange={(e) => setForm({ ...form, recommendations: e.target.value })}
                  placeholder="Your recommendations or suggestions"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Weather Conditions</label>
                <input
                  type="text"
                  style={styles.input}
                  value={form.weather || ''}
                  onChange={(e) => setForm({ ...form, weather: e.target.value })}
                  placeholder="e.g., Sunny, Rainy, Cloudy"
                />
              </div>
            </>
          )}

          {modal.type === 'task-update' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Status *</label>
                <select
                  style={styles.input}
                  value={form.status || ''}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="">Select status</option>
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  style={styles.input}
                  value={form.progress || ''}
                  onChange={(e) => setForm({ ...form, progress: e.target.value })}
                  placeholder="0-100"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Update Notes</label>
                <textarea
                  style={styles.textarea}
                  value={form.update_notes || ''}
                  onChange={(e) => setForm({ ...form, update_notes: e.target.value })}
                  placeholder="Describe progress and any issues..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Time Spent (hours)</label>
                <input
                  type="number"
                  step="0.5"
                  style={styles.input}
                  value={form.time_spent || ''}
                  onChange={(e) => setForm({ ...form, time_spent: e.target.value })}
                  placeholder="0.0"
                />
              </div>
            </>
          )}

          {modal.type === 'wo-update' && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>Field Status Update</label>
                <textarea
                  style={styles.textarea}
                  value={form.field_status || ''}
                  onChange={(e) => setForm({ ...form, field_status: e.target.value })}
                  placeholder="Current status of work at the field..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Issues Found</label>
                <textarea
                  style={styles.textarea}
                  value={form.issues_found || ''}
                  onChange={(e) => setForm({ ...form, issues_found: e.target.value })}
                  placeholder="Any issues found on site"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Next Actions Required</label>
                <textarea
                  style={styles.textarea}
                  value={form.next_actions || ''}
                  onChange={(e) => setForm({ ...form, next_actions: e.target.value })}
                  placeholder="What needs to be done next"
                />
              </div>
            </>
          )}

          {modal.type === 'view' && (
            <div style={{ color: '#cbd5e1' }}>
              <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: '1.6', backgroundColor: '#334155', padding: '1.5rem', borderRadius: '8px' }}>
                {JSON.stringify(modal.item, null, 2)}
              </pre>
            </div>
          )}

          {modal.type !== 'view' && (
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={handleSubmit}
                style={{ ...styles.button, ...styles.buttonPrimary, flex: 1 }}
                disabled={state.loading}
              >
                <Save size={18} />
                {state.loading ? 'Saving...' : modal.item ? 'Update' : 'Submit'}
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
            Please login to access the Engineering Aide Dashboard.
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
            <h1 style={styles.title}>Engineering Aide Dashboard</h1>
            <p style={styles.subtitle}>
              Welcome, {state.user?.first_name} {state.user?.last_name} - Field Support & Data Collection
            </p>
          </div>
          <span style={{
            ...styles.badge,
            backgroundColor: '#06b6d4',
            color: '#fff',
            fontSize: '1rem',
            padding: '0.625rem 1.25rem',
            border: '2px solid #22d3ee'
          }}>
            Engineering Aide
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
        {view === 'tasks' && renderTasks()}
        {view === 'workorders' && renderWorkOrders()}
        {view === 'inspections' && renderInspections()}
        {view === 'photos' && renderPhotos()}
        {view === 'fielddata' && renderFieldData()}
        {view === 'reports' && renderReports()}
        {view === 'documents' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Document Support</h2>
            <p style={{ color: '#94a3b8' }}>Prepare and organize technical documents for projects</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'activities' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Daily Activities</h2>
            <p style={{ color: '#94a3b8' }}>Track and log your daily field activities</p>
            <button onClick={() => setView('dashboard')} style={{ ...styles.button, ...styles.buttonSecondary, marginTop: '1rem' }}>
              Back
            </button>
          </div>
        )}
        {view === 'coordination' && (
          <div style={styles.card}>
            <h2 style={{ color: '#fff', fontSize: '1.75rem', marginBottom: '1rem' }}>Team Coordination</h2>
            <p style={{ color: '#94a3b8' }}>Coordinate with vendors, QI, and supervisors</p>
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

export default EngineeringAideDashboard;