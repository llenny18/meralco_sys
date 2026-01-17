import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function EngineeringAideCoordination() {
  const [reinspections, setReinspections] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [technicalIssues, setTechnicalIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchReinspections();
    fetchEscalations();
    fetchTechnicalIssues();
  }, []);

  const fetchReinspections = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/?is_reinspection=true&is_completed=false&ordering=scheduled_date`
      );
      const data = await response.json();
      setReinspections(data.results || data || []);
    } catch (err) {
      console.error('Error fetching re-inspections:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEscalations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/escalations/?status=Open`);
      const data = await response.json();
      setEscalations(data.results || data || []);
    } catch (err) {
      console.error('Error fetching escalations:', err);
    }
  };

  const fetchTechnicalIssues = async () => {
    try {
      // Fetch projects with multiple failures that may need technical review
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/?failure_count__gte=2&inspection_result=Fail`
      );
      const data = await response.json();
      setTechnicalIssues(data.results || data || []);
    } catch (err) {
      console.error('Error fetching technical issues:', err);
    }
  };

  const handleCoordinateReinspection = async (inspection) => {
    const confirmMsg = `Coordinate re-inspection for Project #${inspection.project}?\n\nThis will:\n- Notify the QI\n- Alert the vendor\n- Update project status`;
    
    if (!confirm(confirmMsg)) return;

    setLoading(true);
    try {
      // Send notifications
      await fetch(`${API_BASE_URL}/notifications/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_user: inspection.assigned_qi,
          notification_type: 'Push',
          subject: 'Re-Inspection Coordination',
          message: `Re-inspection for Project #${inspection.project} is scheduled for ${new Date(inspection.scheduled_date).toLocaleDateString()}. Please review previously failed items before arrival.`
        })
      });

      // Update inspection status
      await fetch(`${API_BASE_URL}/qi-inspections/${inspection.inspection_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coordination_status: 'COORDINATED',
          coordinated_by: localStorage.getItem('user_id'),
          coordination_date: new Date().toISOString()
        })
      });

      alert('✅ Re-inspection coordinated successfully!');
      fetchReinspections();
    } catch (err) {
      console.error('Error coordinating re-inspection:', err);
      alert('❌ Error coordinating re-inspection');
    } finally {
      setLoading(false);
    }
  };

  const handleTechnicalReview = (issue) => {
    setSelectedItem(issue);
    setNotes('');
    setShowDetailModal(true);
  };

  const handleSubmitTechnicalReview = async () => {
    if (!notes) {
      alert('Please add review notes');
      return;
    }

    setLoading(true);
    try {
      // Add technical review notes
      await fetch(
        `${API_BASE_URL}/qi-inspections/${selectedItem.inspection_id}/add_technical_review/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            review_notes: notes,
            reviewed_by: localStorage.getItem('user_id'),
            review_date: new Date().toISOString(),
            recommendation: 'TECHNICAL_EVALUATION_COMPLETE'
          })
        }
      );

      alert('✅ Technical review submitted!');
      setShowDetailModal(false);
      setSelectedItem(null);
      fetchTechnicalIssues();
    } catch (err) {
      console.error('Error submitting technical review:', err);
      alert('❌ Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateToHigherAuthority = async (issue) => {
    const reason = prompt('Enter escalation reason for higher authority:');
    if (!reason) return;

    setLoading(true);
    try {
      await fetch(`${API_BASE_URL}/escalations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: issue.project,
          escalation_rule: 2, // Higher authority escalation
          escalated_from_user: localStorage.getItem('user_id'),
          escalation_reason: `Technical review required. ${reason}. Failure count: ${issue.failure_count}`,
          status: 'Open',
          priority: 'High'
        })
      });

      alert('🚨 Issue escalated to higher authority!');
      fetchEscalations();
    } catch (err) {
      console.error('Error escalating:', err);
      alert('❌ Error escalating issue');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilInspection = (scheduledDate) => {
    const today = new Date();
    const inspectionDate = new Date(scheduledDate);
    const diffTime = inspectionDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (days) => {
    if (days < 0) return '#f44336';
    if (days <= 1) return '#ff9800';
    return '#2196f3';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>⚙️ Engineering Aide Dashboard</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Technical coordination and escalation monitoring</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2196f3' }}>{reinspections.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>RE-INSPECTIONS</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>{technicalIssues.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>TECH ISSUES</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9c27b0' }}>{escalations.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>ESCALATED</div>
            </div>
          </div>
        </div>
      </div>

      {/* Re-Inspection Coordination */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🔄 Re-Inspection Coordination</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
        ) : reinspections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No pending re-inspections</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reinspections.map(inspection => {
              const daysUntil = getDaysUntilInspection(inspection.scheduled_date);
              return (
                <div key={inspection.inspection_id} style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  background: '#fafafa',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>Project #{inspection.project}</h3>
                        <span style={{
                          background: '#9c27b0',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          RE-INSPECTION
                        </span>
                        <span style={{
                          background: getUrgencyColor(daysUntil),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {daysUntil < 0 ? 'OVERDUE' : daysUntil === 0 ? 'TODAY' : `${daysUntil} DAYS`}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                        📅 Scheduled: {new Date(inspection.scheduled_date).toLocaleDateString()}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                        👤 QI Assigned: #{inspection.assigned_qi}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        📍 Focus Items: {inspection.focus_items?.length || 0} failed items
                      </p>
                    </div>

                    <button
                      onClick={() => handleCoordinateReinspection(inspection)}
                      disabled={inspection.coordination_status === 'COORDINATED'}
                      style={{
                        background: inspection.coordination_status === 'COORDINATED' ? '#4caf50' : 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        cursor: inspection.coordination_status === 'COORDINATED' ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        opacity: inspection.coordination_status === 'COORDINATED' ? 0.7 : 1
                      }}>
                      {inspection.coordination_status === 'COORDINATED' ? '✅ Coordinated' : '📞 Coordinate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Technical Issues Review */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🔧 Technical Issues Requiring Review</h2>

        {technicalIssues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No technical issues pending</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {technicalIssues.map(issue => (
              <div key={issue.inspection_id} style={{
                border: '2px solid #f44336',
                borderRadius: '12px',
                padding: '20px',
                background: '#fff5f5',
                transition: 'box-shadow 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>Project #{issue.project}</h3>
                      <span style={{
                        background: issue.failure_count >= 3 ? '#f44336' : '#ff9800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {issue.failure_count >= 3 ? '🚨' : '⚠️'} {issue.failure_count} FAILURES
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                      Latest Inspection: {new Date(issue.inspection_date).toLocaleDateString()}
                    </p>
                    
                    {issue.findings && (
                      <div style={{
                        background: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        color: '#666',
                        marginTop: '8px'
                      }}>
                        <strong>Findings:</strong> {issue.findings.substring(0, 200)}
                        {issue.findings.length > 200 && '...'}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleTechnicalReview(issue)}
                      style={{
                        background: '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                      🔍 Technical Review
                    </button>
                    <button
                      onClick={() => handleEscalateToHigherAuthority(issue)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                      ⬆️ Escalate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Escalations */}
      {escalations.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🚨 Monitoring Active Escalations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {escalations.map(escalation => (
              <div key={escalation.id} style={{
                border: '2px solid #9c27b0',
                borderRadius: '12px',
                padding: '16px',
                background: '#f9f5ff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1a1a2e' }}>
                      Project #{escalation.project}
                    </h4>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      {escalation.escalation_reason}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#999' }}>
                      Escalated: {new Date(escalation.escalation_date).toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    background: '#9c27b0',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {escalation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Technical Review Modal */}
      {showDetailModal && selectedItem && (
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>🔍 Technical Review</h2>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
              Project: <strong>#{selectedItem.project}</strong> • Failure Count: <strong>{selectedItem.failure_count}</strong>
            </p>

            {/* Failed Items */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Failed Items:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {JSON.parse(selectedItem.checklist_results || '[]')
                  .filter(item => item.status === 'FAIL')
                  .map((item, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: '#fff5f5',
                      borderLeft: '4px solid #f44336',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1a1a2e' }}>
                        {idx + 1}. {item.item}
                      </div>
                      {item.notes && (
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                          {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            {/* Findings */}
            {selectedItem.findings && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>QI Findings:</h3>
                <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', color: '#1a1a2e' }}>
                  {selectedItem.findings}
                </div>
              </div>
            )}

            {/* Technical Review Notes */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Technical Evaluation:</h3>
              <textarea
                placeholder="Enter technical review notes, recommendations, and required actions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '150px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                Cancel
              </button>
              <button
                onClick={handleSubmitTechnicalReview}
                disabled={loading || !notes}
                style={{
                  background: (!notes || loading) ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: (!notes || loading) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                {loading ? 'Submitting...' : '✅ Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}