import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function QIWebDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    thisWeek: 0,
    capacity: 0
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const storedUser = localStorage?.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    setUserId(userObj?.user_id || '1');
    
    if (userObj?.user_id) {
      fetchAssignments(userObj.user_id);
    }
  }, [filter]);

  const fetchAssignments = async (qiId) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/qi-inspections/?assigned_qi=${qiId}&is_completed=false`;
      if (filter !== 'ALL') {
        url += `&urgency=${filter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      const inspections = data.results || data || [];
      
      // Sort by urgency
      const sorted = inspections.sort((a, b) => {
        const urgencyA = getUrgencyLevel(a);
        const urgencyB = getUrgencyLevel(b);
        return urgencyB - urgencyA;
      });
      
      setAssignments(sorted);
      calculateStats(sorted);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (inspections) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const stats = {
      pending: inspections.length,
      today: inspections.filter(i => {
        const schedDate = new Date(i.scheduled_date);
        return schedDate >= today && schedDate <= todayEnd;
      }).length,
      thisWeek: inspections.filter(i => {
        const schedDate = new Date(i.scheduled_date);
        return schedDate >= today && schedDate <= weekEnd;
      }).length,
      capacity: inspections.length > 0 ? Math.min(100, Math.round((inspections.length / 15) * 100)) : 0
    };

    setStats(stats);
  };

  const getUrgencyLevel = (inspection) => {
    if (!inspection.scheduled_date) return 0;
    const daysUntil = Math.floor((new Date(inspection.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) return 3; // URGENT
    if (daysUntil <= 7) return 2; // DUE THIS WEEK
    return 1; // SCHEDULED
  };

  const getUrgencyBadge = (inspection) => {
    const level = getUrgencyLevel(inspection);
    if (level === 3) return { text: 'URGENT', color: '#f44336', icon: '🔴' };
    if (level === 2) return { text: 'DUE THIS WEEK', color: '#ff9800', icon: '🟡' };
    return { text: 'SCHEDULED', color: '#2196f3', icon: '🟢' };
  };

  const handleAcceptAssignment = async (inspectionId) => {
    if (!confirm('Accept this inspection assignment?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/${inspectionId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignment_status: 'ACCEPTED',
          accepted_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        alert('✅ Assignment accepted!');
        fetchAssignments(userId);
      }
    } catch (err) {
      console.error('Error accepting assignment:', err);
      alert('❌ Error accepting assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReassignment = async (inspectionId) => {
    const reason = prompt('Enter reason for reassignment request:');
    if (!reason) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/${inspectionId}/request_reassignment/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason,
          requested_by: userId,
          requested_at: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        alert('✅ Reassignment request submitted to Clerk');
        fetchAssignments(userId);
      }
    } catch (err) {
      console.error('Error requesting reassignment:', err);
      alert('❌ Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (inspection) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/${inspection.inspection_id}/`);
      const data = await response.json();
      setSelectedAssignment(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityColor = (capacity) => {
    if (capacity >= 90) return '#f44336';
    if (capacity >= 75) return '#ff9800';
    return '#4caf50';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🎯 QI Assignment Dashboard</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Your inspection queue and schedule</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>PENDING ASSIGNMENTS</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#2196f3' }}>{stats.pending}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Total inspections</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>DUE TODAY</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#f44336' }}>{stats.today}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Urgent attention required</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>THIS WEEK</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#ff9800' }}>{stats.thisWeek}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Next 7 days</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>MY CAPACITY</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: getCapacityColor(stats.capacity) }}>
            {stats.capacity}%
          </div>
          <div style={{ width: '100%', background: '#e0e0e0', height: '6px', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${stats.capacity}%`,
              height: '100%',
              background: getCapacityColor(stats.capacity),
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>FILTER BY:</span>
          {['ALL', 'URGENT', 'DUE_THIS_WEEK', 'SCHEDULED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white',
                color: filter === f ? 'white' : '#666',
                border: filter === f ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: filter === f ? 'bold' : 'normal',
                transition: 'all 0.2s'
              }}>
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Inspection Queue */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Inspection Queue</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ fontSize: '16px', margin: 0 }}>Loading assignments...</p>
          </div>
        ) : assignments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <p style={{ fontSize: '18px', margin: 0 }}>No pending inspections</p>
            <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>All caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {assignments.map(assignment => {
              const urgency = getUrgencyBadge(assignment);
              const daysUntil = Math.floor((new Date(assignment.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={assignment.inspection_id} style={{
                  border: `2px solid ${urgency.color}`,
                  borderRadius: '12px',
                  padding: '24px',
                  background: urgency.level === 3 ? '#fff5f5' : '#fafafa',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.15)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>
                          Project #{assignment.project}
                        </h3>
                        <span style={{
                          background: urgency.color,
                          color: 'white',
                          padding: '6px 16px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {urgency.icon} {urgency.text}
                        </span>
                        {assignment.is_reinspection && (
                          <span style={{
                            background: '#9c27b0',
                            color: 'white',
                            padding: '6px 16px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            🔄 RE-INSPECTION
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>📅 SCHEDULED DATE</div>
                          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                            {assignment.scheduled_date ? new Date(assignment.scheduled_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            }) : 'Not scheduled'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>⏰ TIME</div>
                          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                            {assignment.scheduled_time || '09:00 AM'}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>⏳ DAYS UNTIL</div>
                          <div style={{ fontSize: '15px', fontWeight: 'bold', color: daysUntil <= 0 ? '#f44336' : '#1a1a2e' }}>
                            {daysUntil <= 0 ? 'OVERDUE' : daysUntil === 0 ? 'TODAY' : `${daysUntil} days`}
                          </div>
                        </div>

                        <div>
                          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>📋 TYPE</div>
                          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                            {assignment.inspection_type_name || 'General Inspection'}
                          </div>
                        </div>
                      </div>

                      {assignment.project_location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                          <span style={{ fontSize: '14px', color: '#666' }}>📍</span>
                          <span style={{ fontSize: '14px', color: '#666' }}>{assignment.project_location}</span>
                        </div>
                      )}

                      {assignment.assignment_status === 'PENDING' && (
                        <div style={{
                          marginTop: '12px',
                          padding: '12px',
                          background: '#fff9e6',
                          border: '1px solid #ffc107',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#1a1a2e'
                        }}>
                          ⚠️ <strong>Action Required:</strong> Please accept or request reassignment
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                      <button
                        onClick={() => handleViewDetails(assignment)}
                        style={{
                          background: '#2196f3',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                        📄 View Details
                      </button>

                      {assignment.assignment_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleAcceptAssignment(assignment.inspection_id)}
                            style={{
                              background: 'linear-gradient(45deg, #4caf50, #45a049)',
                              color: 'white',
                              border: 'none',
                              padding: '12px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              transition: 'transform 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            ✅ Accept
                          </button>

                          <button
                            onClick={() => handleRequestReassignment(assignment.inspection_id)}
                            style={{
                              background: '#fff',
                              color: '#666',
                              border: '1px solid #ddd',
                              padding: '12px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.borderColor = '#ff9800';
                              e.currentTarget.style.color = '#ff9800';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.borderColor = '#ddd';
                              e.currentTarget.style.color = '#666';
                            }}>
                            🔄 Request Reassignment
                          </button>
                        </>
                      )}

                      {assignment.assignment_status === 'ACCEPTED' && (
                        <button
                          onClick={() => window.location.href = `/qi/inspection?id=${assignment.inspection_id}`}
                          style={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                            transition: 'transform 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                          🚀 Start Inspection
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAssignment && (
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
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>
                  Inspection Details
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Project #{selectedAssignment.project}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '32px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: 0,
                  lineHeight: 1
                }}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>SCHEDULED DATE</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {new Date(selectedAssignment.scheduled_date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>TIME</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {selectedAssignment.scheduled_time || '09:00 AM'}
                </div>
              </div>
            </div>

            {selectedAssignment.project_description && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Project Description</h3>
                <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', color: '#1a1a2e' }}>
                  {selectedAssignment.project_description}
                </div>
              </div>
            )}

            {selectedAssignment.focus_items && selectedAssignment.focus_items.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>
                  Focus Items (Re-inspection)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedAssignment.focus_items.map((item, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: '#fff9f0',
                      borderLeft: '4px solid #ff9800',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#1a1a2e'
                    }}>
                      • {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}