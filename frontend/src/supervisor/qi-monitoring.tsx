import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function SupervisorInspectionMonitoring() {
  const [inspections, setInspections] = useState([]);
  const [escalations, setEscalations] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    passed: 0,
    failed: 0,
    corrections: 0,
    escalated: 0
  });
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchInspections();
    fetchEscalations();
  }, [filter]);

  const fetchInspections = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/qi-inspections/`;
      if (filter !== 'ALL') {
        url += `?inspection_result=${filter}`;
      }
      
      const response = await fetch(url);
      const data = await response.json();
      const allInspections = data.results || data || [];
      
      setInspections(allInspections);
      
      // Calculate stats
      const stats = {
        pending: allInspections.filter(i => !i.is_completed).length,
        passed: allInspections.filter(i => i.inspection_result === 'Pass').length,
        failed: allInspections.filter(i => i.inspection_result === 'Fail').length,
        corrections: allInspections.filter(i => i.correction_status === 'PENDING' || i.correction_status === 'IN_PROGRESS').length,
        escalated: allInspections.filter(i => i.failure_count >= 3).length
      };
      setStats(stats);
    } catch (err) {
      console.error('Error fetching inspections:', err);
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

  const handleViewDetails = async (inspection) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/${inspection.inspection_id}/`);
      const data = await response.json();
      setSelectedInspection(data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching inspection details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCorrections = async (inspectionId) => {
    if (!confirm('Approve these corrections and schedule re-inspection?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/${inspectionId}/approve_corrections/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approved_by: localStorage.getItem('user_id'),
            approval_date: new Date().toISOString()
          })
        }
      );

      if (!response.ok) throw new Error('Approval failed');

      alert('✅ Corrections approved! Re-inspection scheduled with same QI.');
      setShowDetailModal(false);
      fetchInspections();
    } catch (err) {
      console.error('Error approving corrections:', err);
      alert('❌ Error approving corrections');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async (inspection) => {
    const reason = prompt('Enter escalation reason:');
    if (!reason) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/escalations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: inspection.project,
          escalation_rule: 1, // Default escalation rule
          escalated_from_user: localStorage.getItem('user_id'),
          escalated_to_user: null, // Will be assigned to Team Leader
          escalation_reason: `Inspection failed ${inspection.failure_count} times. ${reason}`,
          status: 'Open'
        })
      });

      if (!response.ok) throw new Error('Escalation failed');

      alert('🚨 Case escalated to Team Leader for review.');
      fetchInspections();
      fetchEscalations();
    } catch (err) {
      console.error('Error escalating:', err);
      alert('❌ Error escalating case');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (result) => {
    switch (result) {
      case 'Pass': return '#4caf50';
      case 'Fail': return '#f44336';
      case 'Conditional': return '#ff9800';
      default: return '#999';
    }
  };

  const getFailureColor = (count) => {
    if (count >= 3) return '#f44336';
    if (count >= 2) return '#ff9800';
    return '#2196f3';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🔍 Inspection Monitoring</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Quality control oversight and escalation management</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>PENDING INSPECTIONS</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3' }}>{stats.pending}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>PASSED</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50' }}>{stats.passed}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>FAILED</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f44336' }}>{stats.failed}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>CORRECTIONS</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800' }}>{stats.corrections}</div>
        </div>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>ESCALATED</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#9c27b0' }}>{stats.escalated}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['ALL', 'Pass', 'Fail', 'Conditional', 'PENDING'].map(f => (
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
                fontWeight: filter === f ? 'bold' : 'normal'
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Inspections List */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Inspection Records</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading...</div>
        ) : inspections.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <p style={{ fontSize: '18px', margin: 0 }}>No inspections found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {inspections.map(inspection => (
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
                      {inspection.inspection_result && (
                        <span style={{
                          background: getStatusColor(inspection.inspection_result),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {inspection.inspection_result}
                        </span>
                      )}
                      {inspection.failure_count > 0 && (
                        <span style={{
                          background: getFailureColor(inspection.failure_count),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {inspection.failure_count >= 3 ? '🚨' : '⚠️'} ATTEMPT {inspection.failure_count}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      QI: {inspection.assigned_qi_name || `ID ${inspection.assigned_qi}`}
                    </p>
                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                      Date: {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString() : 'Not completed'}
                    </p>
                    {inspection.correction_status && (
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        Correction Status: <strong>{inspection.correction_status.replace('_', ' ')}</strong>
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleViewDetails(inspection)}
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
                      📄 View Details
                    </button>
                    
                    {inspection.correction_status === 'COMPLETED' && (
                      <button
                        onClick={() => handleApproveCorrections(inspection.inspection_id)}
                        style={{
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '10px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                        ✅ Approve & Re-inspect
                      </button>
                    )}
                    
                    {inspection.failure_count >= 3 && (
                      <button
                        onClick={() => handleEscalate(inspection)}
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
                        🚨 Escalate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Escalations Panel */}
      {escalations.length > 0 && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🚨 Active Escalations</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {escalations.map(escalation => (
              <div key={escalation.id} style={{
                border: '2px solid #f44336',
                borderRadius: '12px',
                padding: '16px',
                background: '#fff5f5'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
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
                    background: '#f44336',
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

      {/* Detail Modal */}
      {showDetailModal && selectedInspection && (
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
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>Inspection Details</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Inspection ID: {selectedInspection.inspection_id}
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

            {/* Inspection Info */}
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>PROJECT</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    #{selectedInspection.project}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>QI ASSIGNED</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedInspection.assigned_qi_name || `ID ${selectedInspection.assigned_qi}`}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>INSPECTION DATE</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    {selectedInspection.inspection_date ? new Date(selectedInspection.inspection_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>RESULT</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: getStatusColor(selectedInspection.inspection_result) }}>
                    {selectedInspection.inspection_result || 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist Results */}
            {selectedInspection.checklist_results && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Checklist Results</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {JSON.parse(selectedInspection.checklist_results).map((item, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: item.status === 'PASS' ? '#f1f8f4' : item.status === 'FAIL' ? '#fff5f5' : '#f5f5f5',
                      borderLeft: `4px solid ${item.status === 'PASS' ? '#4caf50' : item.status === 'FAIL' ? '#f44336' : '#999'}`,
                      borderRadius: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', color: '#1a1a2e' }}>{item.item}</span>
                        <span style={{ fontWeight: 'bold', color: item.status === 'PASS' ? '#4caf50' : '#f44336' }}>
                          {item.status === 'PASS' ? '✓ PASS' : '✗ FAIL'}
                        </span>
                      </div>
                      {item.notes && (
                        <div style={{ marginTop: '4px', fontSize: '13px', color: '#666' }}>
                          {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Findings */}
            {selectedInspection.findings && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Findings</h3>
                <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', fontSize: '14px', lineHeight: '1.6', color: '#1a1a2e' }}>
                  {selectedInspection.findings}
                </div>
              </div>
            )}

            {/* Photos */}
            {selectedInspection.photos && selectedInspection.photos.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>
                  Photos ({selectedInspection.photos.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                  {selectedInspection.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo.url || photo}
                      alt={`Photo ${idx + 1}`}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
                    />
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