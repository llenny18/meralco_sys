import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ClerkReInspectionScheduling() {
  const [pendingReinspections, setPendingReinspections] = useState([]);
  const [qiTeam, setQiTeam] = useState([]);
  const [scheduledInspections, setScheduledInspections] = useState([]);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [inspectionToDelete, setInspectionToDelete] = useState(null);
  const [inspectionToReschedule, setInspectionToReschedule] = useState(null);
  const [errorDetails, setErrorDetails] = useState({ title: '', message: '', details: '' });
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingReinspections();
    fetchQITeam();
    fetchScheduledInspections();
  }, []);

  const fetchPendingReinspections = async () => {
    setLoading(true);
    try {
      // Fetch inspections that need re-inspection (corrections completed)
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/?correction_status=COMPLETED&reinspection_scheduled=false`
      );
      const data = await response.json();
      setPendingReinspections(data.results || data || []);
    } catch (err) {
      console.error('Error fetching pending re-inspections:', err);
    } finally {
      setLoading(false);
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

  const fetchScheduledInspections = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/?scheduled_date__gte=${today}&is_completed=false&ordering=scheduled_date`
      );
      const data = await response.json();
      setScheduledInspections(data.results || data || []);
    } catch (err) {
      console.error('Error fetching scheduled inspections:', err);
    }
  };

  const handleScheduleReinspection = (inspection) => {
    setSelectedInspection(inspection);
    setScheduleDate('');
    setScheduleTime('09:00');
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      // Create new inspection record for re-inspection
      const response = await fetch(`${API_BASE_URL}/qi-inspections/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: selectedInspection.project,
          inspection_type: selectedInspection.inspection_type,
          assigned_qi: selectedInspection.assigned_qi, // Same QI assigned
          scheduled_date: scheduleDate,
          scheduled_time: scheduleTime,
          is_reinspection: true,
          previous_inspection: selectedInspection.inspection_id,
          focus_items: JSON.parse(selectedInspection.checklist_results || '[]')
            .filter(item => item.status === 'FAIL')
            .map(item => item.item)
        })
      });

      if (!response.ok) throw new Error('Scheduling failed');

      // Update original inspection
      await fetch(`${API_BASE_URL}/qi-inspections/${selectedInspection.inspection_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reinspection_scheduled: true,
          reinspection_date: scheduleDate
        })
      });

      // Send notification to QI
      await fetch(`${API_BASE_URL}/notifications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_user: selectedInspection.assigned_qi,
          notification_type: 'Push',
          subject: 'Re-Inspection Scheduled',
          message: `Re-inspection scheduled for Project #${selectedInspection.project} on ${new Date(scheduleDate).toLocaleDateString()} at ${scheduleTime}. Focus on previously failed items only.`,
          related_project: selectedInspection.project
        })
      });

      alert('✅ Re-inspection scheduled successfully! QI has been notified.');
      setShowScheduleModal(false);
      setSelectedInspection(null);
      fetchPendingReinspections();
      fetchScheduledInspections();
      
    } catch (err) {
      console.error('Error scheduling re-inspection:', err);
      alert('❌ Error scheduling re-inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleClick = (inspection) => {
    setInspectionToReschedule(inspection);
    setScheduleDate(inspection.scheduled_date || '');
    setScheduleTime(inspection.scheduled_time || '09:00');
    setShowRescheduleModal(true);
  };

  const handleConfirmReschedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select date and time');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/${inspectionToReschedule.inspection_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_date: scheduleDate,
          scheduled_time: scheduleTime
        })
      });

      if (!response.ok) throw new Error('Rescheduling failed');

      alert('✅ Inspection rescheduled successfully!');
      setShowRescheduleModal(false);
      setInspectionToReschedule(null);
      fetchScheduledInspections();
    } catch (err) {
      console.error('Error rescheduling:', err);
      alert('❌ Error rescheduling inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (inspection) => {
    setInspectionToDelete(inspection);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!inspectionToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/${inspectionToDelete.inspection_id}/`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Delete failed');
      }

      alert('✅ Inspection deleted successfully!');
      setShowDeleteModal(false);
      setInspectionToDelete(null);
      fetchPendingReinspections();
      fetchScheduledInspections();
      
    } catch (err) {
      console.error('Error deleting inspection:', err);
      alert(`❌ Error deleting inspection: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const archiveInspectionDocuments = async (inspectionId) => {
    if (!confirm('Archive all documents for this inspection?')) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/${inspectionId}/archive-documents/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            archived_by: localStorage.getItem('user_id'),
            archive_date: new Date().toISOString(),
            retention_period: 10 // 10 years
          })
        }
      );

      // Get response text first
      const responseText = await response.text();
      let errorData = {};
      
      // Try to parse as JSON
      try {
        errorData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        errorData = { detail: responseText || 'Unknown error' };
      }

      if (!response.ok) {
        // Show detailed error modal
        setErrorDetails({
          title: '❌ Archive Documents Failed',
          message: `HTTP ${response.status}: ${response.statusText}`,
          details: JSON.stringify(errorData, null, 2)
        });
        setShowErrorModal(true);
        return;
      }

      alert('✅ Documents archived successfully with 10-year retention!');
      fetchPendingReinspections();
      
    } catch (err) {
      console.error('Error archiving documents:', err);
      
      // Show detailed error modal for network/other errors
      setErrorDetails({
        title: '❌ Archive Documents Error',
        message: err.message || 'Network error or server unreachable',
        details: err.stack || 'No additional details available'
      });
      setShowErrorModal(true);
      
    } finally {
      setLoading(false);
    }
  };

  const getDayOfWeek = (dateString) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date(dateString).getDay()];
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>📅 Re-Inspection Scheduling</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Coordinate QI calendar and manage inspection schedules</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>{pendingReinspections.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>PENDING</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>{scheduledInspections.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>SCHEDULED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Re-Inspections */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🔄 Pending Re-Inspection Scheduling</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
        ) : pendingReinspections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No pending re-inspections</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingReinspections.map(inspection => (
              <div key={inspection.inspection_id} style={{
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
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>Project #{inspection.project}</h3>
                      <span style={{
                        background: '#ff9800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        RE-INSPECTION NEEDED
                      </span>
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      Original QI: {qiTeam.find(qi => qi.user_id === inspection.assigned_qi)?.first_name || 'N/A'}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      Corrections Submitted: {inspection.correction_completed_at ? new Date(inspection.correction_completed_at).toLocaleDateString() : 'N/A'}
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                      Failed Items: {JSON.parse(inspection.checklist_results || '[]').filter(item => item.status === 'FAIL').length}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleScheduleReinspection(inspection)}
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
                      📅 Schedule Re-Inspection
                    </button>
                    <button
                      onClick={() => archiveInspectionDocuments(inspection.inspection_id)}
                      style={{
                        background: '#fff',
                        color: '#666',
                        border: '1px solid #ddd',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                      📦 Archive Documents
                    </button>
                    <button
                      onClick={() => handleDeleteClick(inspection)}
                      style={{
                        background: '#fff',
                        color: '#f44336',
                        border: '1px solid #f44336',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Inspections Calendar */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📆 Upcoming Inspections</h2>

        {scheduledInspections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No upcoming inspections</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {scheduledInspections.map(inspection => (
              <div key={inspection.inspection_id} style={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '16px',
                background: '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#1a1a2e' }}>
                      Project #{inspection.project}
                    </h4>
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
                    📅 {new Date(inspection.scheduled_date).toLocaleDateString()} ({getDayOfWeek(inspection.scheduled_date)})
                    {inspection.scheduled_time && ` • ⏰ ${inspection.scheduled_time}`}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    👤 QI: {qiTeam.find(qi => qi.user_id === inspection.assigned_qi)?.first_name || 'N/A'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleRescheduleClick(inspection)}
                    style={{
                      background: '#fff',
                      color: '#666',
                      border: '1px solid #ddd',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}>
                    🔄 Reschedule
                  </button>
                  <button
                    onClick={() => handleDeleteClick(inspection)}
                    style={{
                      background: '#fff',
                      color: '#f44336',
                      border: '1px solid #f44336',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && selectedInspection && (
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
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>📅 Schedule Re-Inspection</h2>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
              Project: <strong>#{selectedInspection.project}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>ASSIGNED QI</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {qiTeam.find(qi => qi.user_id === selectedInspection.assigned_qi)?.first_name || 'N/A'} (Same as original)
                </div>
              </div>

              <div style={{ background: '#fff9f0', borderRadius: '8px', padding: '16px', marginBottom: '20px', border: '1px solid #ff9800' }}>
                <div style={{ fontSize: '12px', color: '#ff9800', marginBottom: '8px', fontWeight: 'bold' }}>
                  FOCUS ITEMS (Failed in previous inspection)
                </div>
                {JSON.parse(selectedInspection.checklist_results || '[]')
                  .filter(item => item.status === 'FAIL')
                  .map((item, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: '#666', marginBottom: '4px' }}>
                      • {item.item}
                    </div>
                  ))}
              </div>

              <label style={{ display: 'block', marginBottom: '16px' }}>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Inspection Date
                </span>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '20px' }}>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  Time
                </span>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowScheduleModal(false)}
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
                onClick={handleConfirmSchedule}
                disabled={loading || !scheduleDate}
                style={{
                  background: (!scheduleDate || loading) ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: (!scheduleDate || loading) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                {loading ? 'Scheduling...' : '✅ Confirm Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && inspectionToReschedule && (
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
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>🔄 Reschedule Inspection</h2>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
              Project: <strong>#{inspectionToReschedule.project}</strong>
              {inspectionToReschedule.is_reinspection && (
                <span style={{
                  background: '#9c27b0',
                  color: 'white',
                  padding: '3px 8px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  marginLeft: '8px'
                }}>
                  RE-INSPECTION
                </span>
              )}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>CURRENT SCHEDULE</div>
                <div style={{ fontSize: '14px', color: '#1a1a2e' }}>
                  📅 {new Date(inspectionToReschedule.scheduled_date).toLocaleDateString()} 
                  {inspectionToReschedule.scheduled_time && ` • ⏰ ${inspectionToReschedule.scheduled_time}`}
                </div>
                <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                  👤 QI: {qiTeam.find(qi => qi.user_id === inspectionToReschedule.assigned_qi)?.first_name || 'N/A'}
                </div>
              </div>

              <label style={{ display: 'block', marginBottom: '16px' }}>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  New Inspection Date
                </span>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '20px' }}>
                <span style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  New Time
                </span>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowRescheduleModal(false);
                  setInspectionToReschedule(null);
                }}
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
                onClick={handleConfirmReschedule}
                disabled={loading || !scheduleDate}
                style={{
                  background: (!scheduleDate || loading) ? '#ccc' : '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: (!scheduleDate || loading) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                {loading ? 'Rescheduling...' : '✅ Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && inspectionToDelete && (
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
            maxWidth: '450px',
            width: '100%'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#1a1a2e' }}>Delete Inspection?</h2>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Are you sure you want to delete this inspection for Project #{inspectionToDelete.project}?
              </p>
              <p style={{ margin: '12px 0 0 0', color: '#f44336', fontSize: '13px', fontWeight: 'bold' }}>
                This action cannot be undone.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setInspectionToDelete(null);
                }}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                style={{
                  background: loading ? '#ccc' : '#f44336',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                {loading ? 'Deleting...' : '🗑️ Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Details Modal */}
      {showErrorModal && (
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
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ margin: '0 0 12px 0', fontSize: '24px', color: '#f44336' }}>
                {errorDetails.title}
              </h2>
              <p style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#666', fontWeight: 'bold' }}>
                {errorDetails.message}
              </p>
              
              <div style={{ 
                background: '#f5f5f5', 
                borderRadius: '8px', 
                padding: '16px',
                border: '1px solid #ddd'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginBottom: '8px',
                  fontWeight: 'bold'
                }}>
                  ERROR DETAILS:
                </div>
                <pre style={{ 
                  margin: 0, 
                  fontSize: '13px', 
                  color: '#333',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace'
                }}>
                  {errorDetails.details}
                </pre>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                background: '#fff3cd',
                borderRadius: '8px',
                border: '1px solid #ffc107'
              }}>
                <div style={{ fontSize: '13px', color: '#856404' }}>
                  <strong>💡 Troubleshooting Tips:</strong>
                  <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                    <li>Check if the endpoint exists in your Django backend</li>
                    <li>Verify the URL path is correct (should be /api/v1/qi-inspections/[id]/archive-documents/)</li>
                    <li>Ensure the backend method handles POST requests</li>
                    <li>Check Django logs for server-side errors</li>
                    <li>Verify authentication and permissions</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorDetails({ title: '', message: '', details: '' });
                }}
                style={{
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '12px 32px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
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