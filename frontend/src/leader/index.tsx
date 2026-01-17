import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function TeamLeaderPhase1Oversight() {
  const [projects, setProjects] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [qiUsers, setQiUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState('all');
  const [workloadModal, setWorkloadModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch projects
      const projectsRes = await fetch(`${API_BASE_URL}/projects/`);
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        setProjects(projectsData.results || projectsData || []);
      }

      // Fetch users
      const usersRes = await fetch(`${API_BASE_URL}/users/`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const allUsers = usersData.results || usersData || [];
        
        setSupervisors(allUsers.filter(u => u.role_name?.toLowerCase().includes('supervisor')));
        setQiUsers(allUsers.filter(u => u.role_name?.toLowerCase().includes('qi') || u.role_name?.toLowerCase().includes('inspector')));
      }

      // Fetch vendors
      const vendorsRes = await fetch(`${API_BASE_URL}/vendors/`);
      if (vendorsRes.ok) {
        const vendorsData = await vendorsRes.json();
        setVendors(vendorsData.results || vendorsData || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProjects = () => {
    if (selectedSupervisor === 'all') return projects;
    return projects.filter(p => p.wo_supervisor === parseInt(selectedSupervisor));
  };

  const getProjectStats = () => {
    const filtered = getFilteredProjects();
    return {
      total: filtered.length,
      created: filtered.filter(p => p.status === 1).length,
      inProgress: filtered.filter(p => p.status === 2).length,
      completed: filtered.filter(p => p.status === 3).length,
      awaitingDocs: filtered.filter(p => p.status === 4).length,
      approved: filtered.filter(p => p.status === 5).length
    };
  };

  const getQIWorkload = () => {
    return qiUsers.map(qi => {
      const assignedProjects = projects.filter(p => p.assigned_qi === qi.user_id);
      const capacity = Math.min(100, (assignedProjects.length / 10) * 100); // Assume 10 projects = 100%
      
      return {
        qiId: qi.user_id,
        qiName: `${qi.first_name} ${qi.last_name}`,
        assigned: assignedProjects.length,
        capacity: capacity,
        status: capacity > 90 ? 'overloaded' : capacity > 70 ? 'high' : capacity > 50 ? 'balanced' : 'low'
      };
    });
  };

  const getSupervisorPerformance = () => {
    return supervisors.map(sup => {
      const supProjects = projects.filter(p => p.wo_supervisor === sup.user_id);
      const onTime = supProjects.filter(p => !p.is_delayed).length;
      const onTimeRate = supProjects.length > 0 ? ((onTime / supProjects.length) * 100).toFixed(1) : 0;

      return {
        supervisorId: sup.user_id,
        supervisorName: `${sup.first_name} ${sup.last_name}`,
        totalProjects: supProjects.length,
        onTimeRate: onTimeRate,
        awaitingDocs: supProjects.filter(p => p.status === 4).length
      };
    });
  };

  const stats = getProjectStats();
  const qiWorkload = getQIWorkload();
  const supervisorPerf = getSupervisorPerformance();

  const getCapacityColor = (capacity) => {
    if (capacity > 90) return '#f44336';
    if (capacity > 70) return '#ff9800';
    if (capacity > 50) return '#4caf50';
    return '#2196f3';
  };

  return (
    <div style={{ minHeight: '100vh',padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: '700' }}>
              👔 Phase 1: Department Oversight
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Monitor supervisors → Balance QI workload → Ensure process compliance
            </p>
          </div>
          <button
            onClick={() => setWorkloadModal(true)}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
            }}
          >
            ⚖️ Balance Workload
          </button>
        </div>
      </div>

      {/* Filter */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
        <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', marginRight: '12px' }}>
          Filter by Supervisor:
        </label>
        <select
          value={selectedSupervisor}
          onChange={(e) => setSelectedSupervisor(e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: '2px solid #e0e0e0',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            minWidth: '200px'
          }}
        >
          <option value="all">All Supervisors</option>
          {supervisors.map(sup => (
            <option key={sup.user_id} value={sup.user_id}>
              {sup.first_name} {sup.last_name}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Projects', value: stats.total, color: '#2196f3', icon: '📊' },
          { label: 'In Progress', value: stats.inProgress, color: '#ff9800', icon: '⚙️' },
          { label: 'Awaiting Docs', value: stats.awaitingDocs, color: '#f44336', icon: '📄' },
          { label: 'Approved', value: stats.approved, color: '#4caf50', icon: '✅' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* QI Workload Distribution */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e', fontWeight: '700' }}>
          👥 QI Workload Distribution
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {qiWorkload.map((qi) => (
            <div key={qi.qiId} style={{
              border: '2px solid #e0e0e0',
              borderRadius: '12px',
              padding: '16px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = '#667eea'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = '#e0e0e0'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#1a1a2e' }}>
                    {qi.qiName}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                    {qi.assigned} projects assigned
                  </p>
                </div>
                <span style={{
                  background: getCapacityColor(qi.capacity),
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '13px',
                  fontWeight: 'bold'
                }}>
                  {qi.capacity.toFixed(0)}% Capacity
                </span>
              </div>

              {/* Capacity Bar */}
              <div style={{
                width: '100%',
                height: '12px',
                background: '#e0e0e0',
                borderRadius: '6px',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${Math.min(100, qi.capacity)}%`,
                  height: '100%',
                  background: getCapacityColor(qi.capacity),
                  transition: 'width 0.5s ease'
                }}></div>
              </div>

              {/* Warning for overload */}
              {qi.capacity > 90 && (
                <div style={{
                  marginTop: '12px',
                  background: '#ffebee',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #f44336'
                }}>
                  <p style={{ margin: 0, fontSize: '12px', color: '#f44336', fontWeight: 'bold' }}>
                    ⚠️ OVERLOADED - Consider reassigning projects
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Supervisor Performance */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 6px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e', fontWeight: '700' }}>
          📈 Supervisor Performance
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Supervisor</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Total Projects</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>On-Time Rate</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Awaiting Docs</th>
                <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold', color: '#999', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {supervisorPerf.map((sup) => {
                const isGood = sup.onTimeRate >= 90;
                const isWarning = sup.onTimeRate >= 70 && sup.onTimeRate < 90;
                
                return (
                  <tr key={sup.supervisorId} style={{
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'white'}>
                    <td style={{ padding: '16px' }}>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1a1a2e' }}>
                        {sup.supervisorName}
                      </p>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', color: '#2196f3' }}>
                      {sup.totalProjects}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: isGood ? '#4caf50' : isWarning ? '#ff9800' : '#f44336'
                      }}>
                        {sup.onTimeRate}%
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '16px', fontWeight: '600', color: '#ff9800' }}>
                      {sup.awaitingDocs}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <span style={{
                        background: isGood ? '#4caf50' : isWarning ? '#ff9800' : '#f44336',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {isGood ? '✓ Excellent' : isWarning ? '⚠️ Fair' : '✗ Needs Attention'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Workload Balance Modal */}
      {workloadModal && (
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
              ⚖️ Workload Balancing
            </h2>

            <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '2px solid #2196f3' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#2196f3' }}>
                📊 Department Variance Analysis
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#555' }}>
                Target: ±8% variance across all QI inspectors<br/>
                Current variance: <strong style={{ color: '#f44336' }}>±12%</strong> (Needs rebalancing)
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1a1a2e' }}>
                Recommended Actions:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {qiWorkload.filter(qi => qi.capacity > 80).map((qi) => (
                  <div key={qi.qiId} style={{
                    background: '#fff3e0',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '2px solid #ff9800'
                  }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 'bold', color: '#ff9800' }}>
                      ⚠️ {qi.qiName} - {qi.capacity.toFixed(0)}% capacity
                    </p>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#555' }}>
                      Suggestion: Reassign 2-3 lower priority projects to available QI members
                    </p>
                    <button
                      onClick={() => alert(`Initiating reassignment for ${qi.qiName}`)}
                      style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}
                    >
                      Auto-Balance
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setWorkloadModal(false)}
              style={{
                width: '100%',
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
              Close
            </button>
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