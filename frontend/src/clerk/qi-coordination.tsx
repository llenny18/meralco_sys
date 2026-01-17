import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ClerkQICoordination() {
  const [scheduleChanges, setScheduleChanges] = useState([]);
  const [qiCalendar, setQiCalendar] = useState([]);
  const [reassignmentRequests, setReassignmentRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [qiTeam, setQiTeam] = useState([]);

  useEffect(() => {
    fetchScheduleChanges();
    fetchQICalendar();
    fetchReassignmentRequests();
    fetchQITeam();
  }, []);

  const fetchScheduleChanges = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/?schedule_change_pending=true`);
      const data = await response.json();
      setScheduleChanges(data.results || data || []);
    } catch (err) {
      console.error('Error fetching schedule changes:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQICalendar = async () => {
    try {
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/?scheduled_date__gte=${today.toISOString().split('T')[0]}&scheduled_date__lte=${nextWeek.toISOString().split('T')[0]}&ordering=scheduled_date`
      );
      const data = await response.json();
      setQiCalendar(data.results || data || []);
    } catch (err) {
      console.error('Error fetching QI calendar:', err);
    }
  };

  const fetchReassignmentRequests = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/?reassignment_requested=true&reassignment_status=PENDING`);
      const data = await response.json();
      setReassignmentRequests(data.results || data || []);
    } catch (err) {
      console.error('Error fetching reassignment requests:', err);
    }
  };

  const fetchQITeam = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/?role_name=QI`);
      const data = await response.json();
      setQiTeam(data.results || data || []);
    } catch (err) {
      console.error('Error fetching QI team:', err);
    }
  };

  const handleProcessRequest = (request) => {
    setSelectedRequest(request);
    setShowProcessModal(true);
  };

  const handleApproveReassignment = async (newQiId) => {
    if (!newQiId) {
      alert('Please select a new QI');
      return;
    }

    setLoading(true);
    try {
      // Update inspection with new QI
      await fetch(`${API_BASE_URL}/qi-inspections/${selectedRequest.inspection_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assigned_qi: newQiId,
          reassignment_status: 'APPROVED',
          reassigned_by: localStorage.getItem('user_id'),
          reassignment_date: new Date().toISOString()
        })
      });

      // Send notifications
      await fetch(`${API_BASE_URL}/notifications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_user: newQiId,
          notification_type: 'Push',
          subject: 'New Inspection Assignment',
          message: `You have been assigned to inspection for Project #${selectedRequest.project}. Scheduled for ${new Date(selectedRequest.scheduled_date).toLocaleDateString()}.`,
          related_project: selectedRequest.project
        })
      });

      // Auto-calendar integration
      await fetch(`${API_BASE_URL}/calendar/events/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: newQiId,
          event_type: 'INSPECTION',
          title: `Inspection - Project #${selectedRequest.project}`,
          start_date: selectedRequest.scheduled_date,
          duration: 120, // 2 hours default
          project_id: selectedRequest.project
        })
      });

      alert('✅ Reassignment approved! Calendar updated and notifications sent.');
      setShowProcessModal(false);
      setSelectedRequest(null);
      fetchReassignmentRequests();
      fetchQICalendar();
      
    } catch (err) {
      console.error('Error approving reassignment:', err);
      alert('❌ Error processing reassignment');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectReassignment = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/qi-inspections/${selectedRequest.inspection_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reassignment_status: 'REJECTED',
          reassignment_rejection_reason: reason
        })
      });

      alert('Reassignment request rejected.');
      setShowProcessModal(false);
      setSelectedRequest(null);
      fetchReassignmentRequests();
      
    } catch (err) {
      console.error('Error rejecting reassignment:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeek = (dateString) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[new Date(dateString).getDay()];
  };

  const groupCalendarByDate = () => {
    const grouped = {};
    qiCalendar.forEach(inspection => {
      const date = inspection.scheduled_date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(inspection);
    });
    return grouped;
  };

  const calendarByDate = groupCalendarByDate();

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>📅 QI Coordination Center</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Schedule management and reassignment coordination</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>{reassignmentRequests.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>REQUESTS</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>{qiCalendar.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>SCHEDULED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassignment Requests */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🔄 Reassignment Requests</h2>

        {reassignmentRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No pending reassignment requests</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reassignmentRequests.map(request => (
              <div key={request.inspection_id} style={{
                border: '2px solid #ff9800',
                borderRadius: '12px',
                padding: '20px',
                background: '#fff9f0',
                transition: 'box-shadow 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>Project #{request.project}</h3>
                      <span style={{
                        background: '#ff9800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        REASSIGNMENT REQUESTED
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      Current QI: {qiTeam.find(qi => qi.user_id === request.assigned_qi)?.first_name || 'N/A'}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      Scheduled: {new Date(request.scheduled_date).toLocaleDateString()}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      Reason: {request.reassignment_reason || 'Not specified'}
                    </p>
                  </div>

                  <button
                    onClick={() => handleProcessRequest(request)}
                    style={{
                      background: 'linear-gradient(45deg, #667eea, #764ba2)',
                      color: 'white',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                    }}>
                    🔄 Process Request
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QI Calendar - Next 7 Days */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📆 QI Calendar (Next 7 Days)</h2>

        {Object.keys(calendarByDate).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No inspections scheduled</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.keys(calendarByDate).sort().map(date => (
              <div key={date} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '20px',
                background: '#fafafa'
              }}>
                <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #667eea' }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '20px', color: '#1a1a2e' }}>
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    {calendarByDate[date].length} inspection{calendarByDate[date].length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {calendarByDate[date].map(inspection => (
                    <div key={inspection.inspection_id} style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                            Project #{inspection.project}
                          </span>
                          {inspection.is_reinspection && (
                            <span style={{
                              background: '#9c27b0',
                              color: 'white',
                              padding: '3px 8px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}>
                              RE-INSPECTION
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>
                          {inspection.scheduled_time && `⏰ ${inspection.scheduled_time}`}
                          {' • '}👤 {qiTeam.find(qi => qi.user_id === inspection.assigned_qi)?.first_name || 'N/A'}
                        </div>
                      </div>

                      <div style={{
                        padding: '6px 12px',
                        background: '#f5f5f5',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: '#666'
                      }}>
                        📍 {inspection.project_location || 'Location TBD'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Process Reassignment Modal */}
      {showProcessModal && selectedRequest && (
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
            maxWidth: '600px',
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>🔄 Process Reassignment</h2>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
              Project: <strong>#{selectedRequest.project}</strong>
            </p>

            <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>CURRENT QI</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {qiTeam.find(qi => qi.user_id === selectedRequest.assigned_qi)?.first_name || 'N/A'} {qiTeam.find(qi => qi.user_id === selectedRequest.assigned_qi)?.last_name || ''}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>REASON FOR REQUEST</div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                  {selectedRequest.reassignment_reason || 'Not specified'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>SCHEDULED DATE</div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                  {new Date(selectedRequest.scheduled_date).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Assign New QI
              </label>
              <select
                id="newQI"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}>
                <option value="">Select QI...</option>
                {qiTeam
                  .filter(qi => qi.user_id !== selectedRequest.assigned_qi)
                  .map(qi => (
                    <option key={qi.user_id} value={qi.user_id}>
                      {qi.first_name} {qi.last_name} - {qi.specialization}
                    </option>
                  ))}
              </select>
            </div>

            <div style={{ background: '#e3f2fd', border: '1px solid #2196f3', borderRadius: '8px', padding: '12px', marginBottom: '20px', fontSize: '13px', color: '#1a1a2e' }}>
              ℹ️ <strong>Note:</strong> Approving will send notifications and auto-update calendars for both QI members.
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleRejectReassignment}
                style={{
                  background: '#fff',
                  color: '#f44336',
                  border: '1px solid #f44336',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                ✗ Reject
              </button>
              <button
                onClick={() => setShowProcessModal(false)}
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
                onClick={() => {
                  const newQiId = document.getElementById('newQI').value;
                  handleApproveReassignment(newQiId);
                }}
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
                {loading ? 'Processing...' : '✓ Approve & Reassign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}