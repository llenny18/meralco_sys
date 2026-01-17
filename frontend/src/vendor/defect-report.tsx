import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function VendorCorrectionsInterface() {
  const [defectReports, setDefectReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [correctivePhotos, setCorrectivePhotos] = useState([]);
  const [correctiveNotes, setCorrectiveNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [vendorId, setVendorId] = useState('');

  useEffect(() => {
    const storedUser = localStorage?.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    setVendorId(userObj?.vendor_id || '1');
    
    fetchDefectReports();
  }, []);

  const fetchDefectReports = async () => {
    setLoading(true);
    try {
      // Fetch projects with failed inspections
      const response = await fetch(`${API_BASE_URL}/projects/?vendor=${vendorId}&inspection_status=FAILED`);
      const data = await response.json();
      const projects = data.results || data || [];
      
      // Get defect reports for each project
      const reportsPromises = projects.map(async (project) => {
        const inspectionRes = await fetch(`${API_BASE_URL}/qi-inspections/?project=${project.project_id}&inspection_result=Fail&ordering=-inspection_date`);
        const inspections = await inspectionRes.json();
        const latestInspection = (inspections.results || inspections || [])[0];
        
        if (latestInspection) {
          return {
            project_id: project.project_id,
            project_code: project.project_code,
            project_name: project.project_name,
            inspection_id: latestInspection.inspection_id,
            inspection_date: latestInspection.inspection_date,
            failed_items: JSON.parse(latestInspection.checklist_results || '[]').filter(item => item.status === 'FAIL'),
            findings: latestInspection.findings,
            deadline: latestInspection.correction_deadline || calculateDeadline(latestInspection.inspection_date),
            status: latestInspection.correction_status || 'PENDING',
            failure_count: latestInspection.failure_count || 1,
            photos: latestInspection.photos || []
          };
        }
        return null;
      });

      const reports = (await Promise.all(reportsPromises)).filter(r => r !== null);
      setDefectReports(reports);
    } catch (err) {
      console.error('Error fetching defect reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDeadline = (inspectionDate) => {
    const date = new Date(inspectionDate);
    date.setDate(date.getDate() + 7); // 7 days to correct
    return date.toISOString().split('T')[0];
  };

  const getDaysRemaining = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return '#ff9800';
      case 'IN_PROGRESS': return '#2196f3';
      case 'COMPLETED': return '#4caf50';
      case 'RE_INSPECTION_SCHEDULED': return '#9c27b0';
      default: return '#999';
    }
  };

  const getUrgencyColor = (daysRemaining) => {
    if (daysRemaining < 0) return '#f44336';
    if (daysRemaining <= 2) return '#ff9800';
    return '#4caf50';
  };

  const handleStartCorrection = (report) => {
    setSelectedReport(report);
    setCorrectivePhotos([]);
    setCorrectiveNotes('');
    setShowCorrectionModal(true);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      timestamp: new Date().toISOString()
    }));
    setCorrectivePhotos(prev => [...prev, ...newPhotos]);
  };

  const handleSubmitCorrections = async () => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('correction_notes', correctiveNotes);
      formData.append('correction_completed_at', new Date().toISOString());
      formData.append('correction_status', 'COMPLETED');
      
      // Add corrective photos
      correctivePhotos.forEach((photo, idx) => {
        formData.append(`corrective_photo_${idx}`, photo.file);
        formData.append(`corrective_photo_${idx}_timestamp`, photo.timestamp);
      });

      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/${selectedReport.inspection_id}/submit_corrections/`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) throw new Error('Submission failed');

      // Update project status
      await fetch(`${API_BASE_URL}/projects/${selectedReport.project_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'CORRECTIONS_SUBMITTED',
          last_updated: new Date().toISOString()
        })
      });

      alert('✅ Corrections submitted successfully! Re-inspection will be scheduled.');
      setShowCorrectionModal(false);
      setSelectedReport(null);
      fetchDefectReports();
      
    } catch (err) {
      console.error('Error submitting corrections:', err);
      alert('❌ Error submitting corrections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExtension = async (reportId, reason) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/${reportId}/request_extension/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason, requested_days: 3 })
        }
      );

      if (response.ok) {
        alert('Extension request submitted to supervisor for approval.');
        fetchDefectReports();
      }
    } catch (err) {
      console.error('Error requesting extension:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🔧 Defect Reports & Corrections</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Review failed inspections and submit corrective actions</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f44336' }}>{defectReports.length}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>PENDING</div>
            </div>
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff9800' }}>
                {defectReports.filter(r => r.failure_count >= 2).length}
              </div>
              <div style={{ fontSize: '11px', color: '#666' }}>RE-INSPECTIONS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Defect Reports List */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Active Defect Reports</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>Loading reports...</div>
        ) : defectReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <p style={{ fontSize: '18px', margin: 0 }}>No pending defect corrections</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {defectReports.map(report => {
              const daysRemaining = getDaysRemaining(report.deadline);
              const isOverdue = daysRemaining < 0;
              
              return (
                <div key={report.inspection_id} style={{
                  border: `2px solid ${isOverdue ? '#f44336' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  padding: '24px',
                  background: isOverdue ? '#fff5f5' : '#fafafa',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}>{report.project_code}</h3>
                        <span style={{
                          background: getStatusColor(report.status),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          {report.status.replace('_', ' ')}
                        </span>
                        {report.failure_count >= 2 && (
                          <span style={{
                            background: '#ff9800',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            ⚠️ ATTEMPT {report.failure_count}
                          </span>
                        )}
                        {report.failure_count >= 3 && (
                          <span style={{
                            background: '#f44336',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            🚨 ESCALATED
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1a1a2e' }}>{report.project_name}</p>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        Inspection Date: {new Date(report.inspection_date).toLocaleDateString()}
                      </p>
                      
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: getUrgencyColor(daysRemaining),
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}>
                        ⏰ {isOverdue ? `${Math.abs(daysRemaining)} days OVERDUE` : `${daysRemaining} days remaining`}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleStartCorrection(report)}
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
                        🔧 Submit Corrections
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for deadline extension:');
                          if (reason) handleRequestExtension(report.inspection_id, reason);
                        }}
                        style={{
                          background: '#fff',
                          color: '#666',
                          border: '1px solid #ddd',
                          padding: '12px 24px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}>
                        ⏱️ Request Extension
                      </button>
                    </div>
                  </div>

                  {/* Failed Items */}
                  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', marginTop: '16px' }}>
                    <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1a1a2e' }}>❌ Failed Items ({report.failed_items.length})</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {report.failed_items.map((item, idx) => (
                        <div key={idx} style={{
                          padding: '12px',
                          background: '#fff5f5',
                          borderLeft: '4px solid #f44336',
                          borderRadius: '4px'
                        }}>
                          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#1a1a2e', marginBottom: '4px' }}>
                            {idx + 1}. {item.item}
                          </div>
                          {item.notes && (
                            <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                              <strong>Notes:</strong> {item.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Inspection Photos */}
                  {report.photos && report.photos.length > 0 && (
                    <div style={{ marginTop: '16px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1a1a2e' }}>📷 Inspection Photos</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
                        {report.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo.url || photo}
                            alt={`Inspection ${idx + 1}`}
                            style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Correction Submission Modal */}
      {showCorrectionModal && selectedReport && (
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
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>🔧 Submit Corrective Actions</h2>
            <p style={{ margin: '0 0 24px 0', color: '#666', fontSize: '14px' }}>
              Project: <strong>{selectedReport.project_code}</strong>
            </p>

            {/* Failed Items Checklist */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1a1a2e' }}>Items to Correct:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedReport.failed_items.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '16px',
                    background: '#f5f5f5',
                    borderLeft: '4px solid #667eea',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a1a2e', marginBottom: '4px' }}>
                      ✓ {item.item}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        Required action: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Corrective Photos */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>📸 Corrective Action Photos</h3>
                <label style={{
                  background: '#2196f3',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  📷 Add Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                {correctivePhotos.map((photo, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img
                      src={photo.url}
                      alt={`Correction ${idx + 1}`}
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #4caf50' }}
                    />
                    <button
                      onClick={() => setCorrectivePhotos(prev => prev.filter((_, i) => i !== idx))}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {correctivePhotos.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', background: '#f5f5f5', borderRadius: '8px', color: '#999' }}>
                  <p style={{ margin: 0 }}>Upload photos showing completed corrections</p>
                </div>
              )}
            </div>

            {/* Corrective Notes */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>📝 Correction Details</h3>
              <textarea
                placeholder="Describe the corrective actions taken for each failed item..."
                value={correctiveNotes}
                onChange={(e) => setCorrectiveNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '120px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCorrectionModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                Cancel
              </button>
              <button
                onClick={handleSubmitCorrections}
                disabled={loading || correctivePhotos.length === 0 || !correctiveNotes}
                style={{
                  background: (correctivePhotos.length === 0 || !correctiveNotes) ? '#ccc' : 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  cursor: (correctivePhotos.length === 0 || !correctiveNotes || loading) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                {loading ? 'Submitting...' : '✅ Submit Corrections'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}