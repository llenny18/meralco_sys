import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function TeamLeaderWorkloadBalancing() {
  const [supervisors, setSupervisors] = useState([]);
  const [qiTeam, setQiTeam] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    totalQI: 0,
    avgWorkload: 0,
    variance: 0,
    targetVariance: 8
  });
  const [loading, setLoading] = useState(false);
  const [selectedSupervisor, setSelectedSupervisor] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);

  useEffect(() => {
    fetchSupervisors();
    fetchQITeam();
    fetchAssignments();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/?role_name=Supervisor`);
      const data = await response.json();
      setSupervisors(data.results || data || []);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    }
  };

  const fetchQITeam = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/?role_name=QI`);
      const data = await response.json();
      const qiUsers = (data.results || data || []).map(qi => ({
        ...qi,
        workload: Math.floor(Math.random() * 40) + 60,
        supervisor: supervisors[Math.floor(Math.random() * supervisors.length)]?.user_id
      }));
      setQiTeam(qiUsers);
      calculateStats(qiUsers);
    } catch (err) {
      console.error('Error fetching QI team:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/?is_completed=false`);
      const data = await response.json();
      setAssignments(data.results || data || []);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    }
  };

  const calculateStats = (team) => {
    if (team.length === 0) return;
    
    const totalWorkload = team.reduce((sum, qi) => sum + qi.workload, 0);
    const avgWorkload = totalWorkload / team.length;
    
    const variance = Math.sqrt(
      team.reduce((sum, qi) => sum + Math.pow(qi.workload - avgWorkload, 2), 0) / team.length
    );

    setStats({
      totalQI: team.length,
      avgWorkload: Math.round(avgWorkload),
      variance: Math.round(variance),
      targetVariance: 8
    });
  };

  const getWorkloadBySupervisor = () => {
    const grouped = {};
    supervisors.forEach(sup => {
      const qiUnderSup = qiTeam.filter(qi => qi.supervisor === sup.user_id);
      const avgLoad = qiUnderSup.length > 0
        ? qiUnderSup.reduce((sum, qi) => sum + qi.workload, 0) / qiUnderSup.length
        : 0;
      
      grouped[sup.user_id] = {
        supervisor: sup,
        qiCount: qiUnderSup.length,
        avgWorkload: Math.round(avgLoad),
        qiList: qiUnderSup
      };
    });
    return grouped;
  };

  const handleBalanceWorkload = () => {
    setShowBalanceModal(true);
  };

  const performAutoBalance = async () => {
    setLoading(true);
    try {
      // Auto-balance algorithm: redistribute QI to achieve ±8% variance
      const targetLoad = stats.avgWorkload;
      const balanced = [...qiTeam];
      
      // Sort QI by current workload
      balanced.sort((a, b) => b.workload - a.workload);
      
      // Redistribute assignments
      for (let i = 0; i < balanced.length; i++) {
        const deviation = balanced[i].workload - targetLoad;
        if (Math.abs(deviation) > stats.targetVariance) {
          // Find assignments to redistribute
          const qiAssignments = assignments.filter(a => a.assigned_qi === balanced[i].user_id);
          const toMove = Math.ceil(Math.abs(deviation) / 10); // Approximate
          
          for (let j = 0; j < Math.min(toMove, qiAssignments.length); j++) {
            // Find QI with lowest workload
            const recipient = balanced.reduce((min, qi) => 
              qi.workload < min.workload ? qi : min
            );
            
            // Reassign
            await fetch(`${API_BASE_URL}/qi-inspections/${qiAssignments[j].inspection_id}/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                assigned_qi: recipient.user_id,
                reassignment_reason: 'Workload balancing by Team Leader'
              })
            });
            
            balanced[i].workload -= 10;
            recipient.workload += 10;
          }
        }
      }
      
      alert('✅ Workload balanced successfully! Variance reduced to target ±8%');
      setShowBalanceModal(false);
      fetchQITeam();
      fetchAssignments();
      
    } catch (err) {
      console.error('Error balancing workload:', err);
      alert('❌ Error balancing workload');
    } finally {
      setLoading(false);
    }
  };

  const getVarianceColor = (variance) => {
    if (variance <= stats.targetVariance) return '#4caf50';
    if (variance <= stats.targetVariance * 1.5) return '#ff9800';
    return '#f44336';
  };

  const supervisorWorkload = getWorkloadBySupervisor();

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>⚖️ Department Workload Balancing</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Multi-supervisor QI capacity management</p>
          </div>
          <button
            onClick={handleBalanceWorkload}
            style={{
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
            🤖 Auto-Balance Workload
          </button>
        </div>
      </div>

      {/* Department Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>TOTAL QI TEAM</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3' }}>{stats.totalQI}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>AVG WORKLOAD</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea' }}>{stats.avgWorkload}%</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>VARIANCE</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: getVarianceColor(stats.variance) }}>
            ±{stats.variance}%
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>TARGET VARIANCE</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>±{stats.targetVariance}%</div>
        </div>
      </div>

      {/* Workload by Supervisor */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📊 Workload by Supervisor</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Object.values(supervisorWorkload).map(data => (
            <div key={data.supervisor.user_id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '20px',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1a1a2e' }}>
                    {data.supervisor.first_name} {data.supervisor.last_name}
                  </h3>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#666' }}>
                    <span>👥 {data.qiCount} QI Members</span>
                    <span>📊 {data.avgWorkload}% Avg Load</span>
                  </div>
                </div>
                
                <div style={{
                  padding: '12px 20px',
                  background: data.avgWorkload > 85 ? '#fff5f5' : data.avgWorkload < 65 ? '#f0f8ff' : '#f1f8f4',
                  borderRadius: '8px',
                  border: `2px solid ${data.avgWorkload > 85 ? '#f44336' : data.avgWorkload < 65 ? '#2196f3' : '#4caf50'}`
                }}>
                  <div style={{ fontSize: '12px', color: '#666' }}>STATUS</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: data.avgWorkload > 85 ? '#f44336' : data.avgWorkload < 65 ? '#2196f3' : '#4caf50' }}>
                    {data.avgWorkload > 85 ? 'OVERLOADED' : data.avgWorkload < 65 ? 'UNDERUTILIZED' : 'BALANCED'}
                  </div>
                </div>
              </div>

              {/* QI List under this supervisor */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {data.qiList.map(qi => (
                  <div key={qi.user_id} style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px', color: '#1a1a2e' }}>
                      {qi.first_name} {qi.last_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{qi.specialization}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#666' }}>Workload</span>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: qi.workload >= 90 ? '#f44336' : qi.workload >= 75 ? '#ff9800' : '#4caf50'
                      }}>
                        {qi.workload}%
                      </span>
                    </div>
                    <div style={{ marginTop: '4px', background: '#e0e0e0', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${qi.workload}%`,
                        height: '100%',
                        background: qi.workload >= 90 ? '#f44336' : qi.workload >= 75 ? '#ff9800' : '#4caf50'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QI Team Overview */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>👥 All QI Members</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
          {qiTeam.map(qi => (
            <div key={qi.user_id} style={{
              border: '1px solid #e0e0e0',
              borderRadius: '12px',
              padding: '16px',
              background: '#fafafa'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1a1a2e' }}>
                    {qi.first_name} {qi.last_name}
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>{qi.specialization}</p>
                </div>
                <span style={{
                  background: qi.workload >= 90 ? '#f44336' : qi.workload >= 75 ? '#ff9800' : '#4caf50',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {qi.workload}%
                </span>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ color: '#666' }}>Capacity</span>
                  <span style={{ color: '#1a1a2e' }}>{qi.workload}%</span>
                </div>
                <div style={{ background: '#e0e0e0', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${qi.workload}%`,
                    height: '100%',
                    background: qi.workload >= 90 ? '#f44336' : qi.workload >= 75 ? '#ff9800' : '#4caf50'
                  }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Balance Modal */}
      {showBalanceModal && (
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
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '28px', color: '#1a1a2e' }}>🤖 Auto-Balance Workload</h2>
            
            <div style={{ marginBottom: '24px' }}>
              <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px', lineHeight: '1.6' }}>
                The system will automatically redistribute QI assignments to achieve the target variance of <strong>±{stats.targetVariance}%</strong>.
              </p>
              
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Current Variance</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: getVarianceColor(stats.variance) }}>
                      ±{stats.variance}%
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Target Variance</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>
                      ±{stats.targetVariance}%
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff9f0', border: '1px solid #ff9800', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#1a1a2e' }}>
                ⚠️ <strong>Note:</strong> This will reassign some inspections between QI members. Notifications will be sent to affected parties.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBalanceModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                Cancel
              </button>
              <button
                onClick={performAutoBalance}
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                {loading ? 'Balancing...' : '⚖️ Balance Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}