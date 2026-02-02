import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface DefectReport {
  project_id: number;
  project_code: string;
  project_name: string;
  inspection_id: number;
  inspection_date: string;
  failed_items: Array<{ item: string; notes?: string }>;
  findings: string;
  deadline: string;
  status: string;
  correction_status: string;
  failure_count: number;
  photos: Array<string | { url: string }>;
  correction_completed_at?: string;
}

interface SubmittedCorrection {
  inspection_id: number;
  project_code: string;
  project_name: string;
  submitted_at: string;
  correction_notes: string;
  correction_photos: string[];
  status: string;
}

interface Photo {
  file: File;
  url: string;
  timestamp: string;
}

export default function VendorCorrectionsInterface() {
  const [activeTab, setActiveTab] = useState<'pending' | 'submitted'>('pending');
  const [defectReports, setDefectReports] = useState<DefectReport[]>([]);
  const [submittedCorrections, setSubmittedCorrections] = useState<SubmittedCorrection[]>([]);
  const [selectedReport, setSelectedReport] = useState<DefectReport | null>(null);
  const [viewingCorrection, setViewingCorrection] = useState<SubmittedCorrection | null>(null);
  const [correctivePhotos, setCorrectivePhotos] = useState<Photo[]>([]);
  const [correctiveNotes, setCorrectiveNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [vendorId, setVendorId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) return;

        const userObj = JSON.parse(storedUser);
        if (!userObj?.user_id) return;

        setUserId(userObj.user_id);

        // Fetch vendor by user_id
        const vendorResponse = await fetch(
          `${API_BASE_URL}/vendors/?user_id=${userObj.user_id}`
        );
        const vendorData = await vendorResponse.json();

        if (!vendorData?.results?.length) return;

        const vendorId = vendorData.results[0].vendor_id;
        setVendorId(vendorId);

        fetchDefectReports(vendorId);
        fetchSubmittedCorrections(vendorId);
      } catch (error) {
        console.error('Failed to load vendor data:', error);
      }
    };

    fetchVendorData();
  }, []);

  const fetchDefectReports = async (vendorId: string) => {
    setLoading(true);
    try {
      // Fetch projects with failed inspections
      const response = await fetch(
        `${API_BASE_URL}/projects/?vendor=${vendorId}`
      );
      const data = await response.json();
      const projects = data.results || data || [];
      
      // Get defect reports for each project
      const reportsPromises = projects.map(async (project: any) => {
        const inspectionRes = await fetch(
          `${API_BASE_URL}/qi-inspections/?project=${project.project_id}&inspection_result=Fail&is_completed=true&ordering=-inspection_date`
        );
        const inspections = await inspectionRes.json();
        const inspectionsList = inspections.results || inspections || [];
        
        // Filter out already submitted inspections
        const pendingInspections = inspectionsList.filter((insp: any) => 
          !insp.correction_completed_at && 
          insp.correction_status !== 'SUBMITTED' &&
          insp.correction_status !== 'APPROVED'
        );
        
        const latestInspection = pendingInspections[0];
        
        if (latestInspection) {
          // Parse checklist results
          let failedItems = [];
          try {
            const checklistResults = typeof latestInspection.checklist_results === 'string' 
              ? JSON.parse(latestInspection.checklist_results)
              : latestInspection.checklist_results || [];
            failedItems = checklistResults.filter((item: any) => item.status === 'FAIL');
          } catch (e) {
            console.error('Error parsing checklist:', e);
          }

          return {
            project_id: project.project_id,
            project_code: project.project_code,
            project_name: project.project_name,
            inspection_id: latestInspection.inspection_id,
            inspection_date: latestInspection.inspection_date,
            failed_items: failedItems,
            findings: latestInspection.findings || '',
            deadline: latestInspection.correction_deadline || calculateDeadline(latestInspection.inspection_date),
            status: latestInspection.inspection_result || 'Fail',
            correction_status: latestInspection.correction_status || 'PENDING',
            failure_count: latestInspection.failure_count || 1,
            photos: latestInspection.photos || [],
            correction_completed_at: latestInspection.correction_completed_at
          };
        }
        return null;
      });

      const reports = (await Promise.all(reportsPromises)).filter((r): r is DefectReport => r !== null);
      setDefectReports(reports);
    } catch (err) {
      console.error('Error fetching defect reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedCorrections = async (vendorId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/?vendor=${vendorId}`
      );
      const data = await response.json();
      const projects = data.results || data || [];
      
      const submittedPromises = projects.map(async (project: any) => {
        const inspectionRes = await fetch(
          `${API_BASE_URL}/qi-inspections/?project=${project.project_id}&ordering=-inspection_date`
        );
        const inspections = await inspectionRes.json();
        const inspectionsList = inspections.results || inspections || [];
        
        // Only get submitted or approved corrections
        const submitted = inspectionsList.filter((insp: any) => 
          insp.correction_completed_at && 
          (insp.correction_status === 'SUBMITTED' || insp.correction_status === 'APPROVED')
        );
        
        return submitted.map((insp: any) => ({
          inspection_id: insp.inspection_id,
          project_code: project.project_code,
          project_name: project.project_name,
          submitted_at: insp.correction_completed_at,
          correction_notes: insp.correction_notes || '',
          correction_photos: insp.correction_photos || [],
          status: insp.correction_status || 'SUBMITTED'
        }));
      });

      const allSubmitted = (await Promise.all(submittedPromises)).flat();
      setSubmittedCorrections(allSubmitted);
    } catch (err) {
      console.error('Error fetching submitted corrections:', err);
    }
  };

  const calculateDeadline = (inspectionDate: string) => {
    const date = new Date(inspectionDate);
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': '#ff9800',
      'IN_PROGRESS': '#2196f3',
      'COMPLETED': '#4caf50',
      'SUBMITTED': '#9c27b0',
      'APPROVED': '#4caf50',
      'REJECTED': '#f44336'
    };
    return colors[status] || '#999';
  };

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining < 0) return '#f44336';
    if (daysRemaining <= 2) return '#ff9800';
    return '#4caf50';
  };

  const handleStartCorrection = (report: DefectReport) => {
    // Check if already submitted
    if (report.correction_status === 'SUBMITTED' || report.correction_status === 'APPROVED') {
      alert('⚠️ Corrections have already been submitted for this inspection.');
      return;
    }
    
    setSelectedReport(report);
    setCorrectivePhotos([]);
    setCorrectiveNotes('');
    setShowCorrectionModal(true);
  };

  const handleViewCorrection = (correction: SubmittedCorrection) => {
    setViewingCorrection(correction);
    setShowViewModal(true);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      alert('❌ Only image files (JPEG, PNG, GIF) are allowed!');
      return;
    }
    
    // Validate file size (max 5MB per file)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = files.filter(f => f.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      alert('❌ Each image must be less than 5MB!');
      return;
    }
    
    const newPhotos: Photo[] = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      timestamp: new Date().toISOString()
    }));
    
    setCorrectivePhotos(prev => [...prev, ...newPhotos]);
  };

  const removePhoto = (idx: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(correctivePhotos[idx].url);
    setCorrectivePhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmitCorrections = async () => {
  if (!selectedReport) return;
  
  // Validation
  if (!correctiveNotes.trim()) {
    alert('❌ Please provide correction notes!');
    return;
  }
  
  if (correctivePhotos.length === 0) {
    alert('❌ Please upload at least one photo showing the corrections!');
    return;
  }
  
  setLoading(true);
  
  try {
    const formData = new FormData();
    formData.append('correction_notes', correctiveNotes.trim());
    formData.append('uploaded_by', userId);
    
    // Add all photos
    correctivePhotos.forEach((photo) => {
      formData.append('corrective_photos', photo.file);
    });

    const response = await fetch(
      `${API_BASE_URL}/qi-inspections/${selectedReport.inspection_id}/submit_corrections/`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || result.error || 'Submission failed');
    }

    // Update project status
    try {
      await fetch(`${API_BASE_URL}/projects/${selectedReport.project_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 4 })
      });
    } catch (err) {
      console.warn('Failed to update project status:', err);
    }

    alert(`✅ Corrections submitted successfully!\n\n${result.photo_count} photos uploaded.`);
    
    setShowCorrectionModal(false);
    setSelectedReport(null);
    setCorrectivePhotos([]);
    setCorrectiveNotes('');
    
    // Refresh lists
    if (vendorId) {
      fetchDefectReports(vendorId);
      fetchSubmittedCorrections(vendorId);
    }
    
  } catch (err) {
    console.error('Error:', err);
    alert(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
  } finally {
    setLoading(false);
  }
};

  const handleRequestExtension = async (reportId: number, reason: string) => {
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
        alert('✅ Extension request submitted to supervisor for approval.');
        if (vendorId) fetchDefectReports(vendorId);
      } else {
        const error = await response.json();
        alert(`❌ Failed to request extension: ${error.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error requesting extension:', err);
      alert('❌ Failed to send extension request. Please try again.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '36px', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.5px' }}>
              🔧 Defect Corrections
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Review failed inspections and submit corrective actions
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ textAlign: 'center', padding: '16px 24px', background: '#fff5f5', borderRadius: '16px', border: '2px solid #f44336' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>{defectReports.length}</div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>PENDING</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 24px', background: '#f3f0ff', borderRadius: '16px', border: '2px solid #9c27b0' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#9c27b0' }}>{submittedCorrections.length}</div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>SUBMITTED</div>
            </div>
            <div style={{ textAlign: 'center', padding: '16px 24px', background: '#fff3e0', borderRadius: '16px', border: '2px solid #ff9800' }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
                {defectReports.filter(r => r.failure_count >= 2).length}
              </div>
              <div style={{ fontSize: '12px', color: '#666', fontWeight: '600' }}>RE-INSPECTIONS</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            flex: 1,
            padding: '16px',
            background: activeTab === 'pending' ? 'white' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'pending' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: activeTab === 'pending' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
          📋 Pending Corrections ({defectReports.length})
        </button>
        <button
          onClick={() => setActiveTab('submitted')}
          style={{
            flex: 1,
            padding: '16px',
            background: activeTab === 'submitted' ? 'white' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'submitted' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: activeTab === 'submitted' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
          ✅ Submitted Corrections ({submittedCorrections.length})
        </button>
      </div>

      {/* Pending Corrections Tab */}
      {activeTab === 'pending' && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>
            📋 Active Defect Reports
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ fontSize: '18px' }}>Loading reports...</p>
            </div>
          ) : defectReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>✅</div>
              <p style={{ fontSize: '20px', margin: 0, fontWeight: '600' }}>No pending defect corrections</p>
              <p style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>All inspections are up to date!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {defectReports.map(report => {
                const daysRemaining = getDaysRemaining(report.deadline);
                const isOverdue = daysRemaining < 0;
                const isSubmitted = report.correction_status === 'SUBMITTED' || report.correction_status === 'APPROVED';
                
                return (
                  <div key={report.inspection_id} style={{
                    border: `3px solid ${isOverdue ? '#f44336' : isSubmitted ? '#9c27b0' : '#e0e0e0'}`,
                    borderRadius: '16px',
                    padding: '28px',
                    background: isOverdue ? '#fff5f5' : isSubmitted ? '#f3f0ff' : '#fafafa',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                    opacity: isSubmitted ? 0.7 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitted) {
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e' }}>
                            {report.project_code}
                          </h3>
                          <span style={{
                            background: getStatusColor(report.correction_status),
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {report.correction_status.replace('_', ' ')}
                          </span>
                          {report.failure_count >= 2 && (
                            <span style={{
                              background: '#ff9800',
                              color: 'white',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              ⚠️ ATTEMPT {report.failure_count}
                            </span>
                          )}
                          {report.failure_count >= 3 && (
                            <span style={{
                              background: '#f44336',
                              color: 'white',
                              padding: '6px 14px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 'bold'
                            }}>
                              🚨 ESCALATED
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1a1a2e' }}>
                          {report.project_name}
                        </p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                          Inspection Date: {new Date(report.inspection_date).toLocaleDateString()}
                        </p>
                        
                        {!isSubmitted && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 20px',
                            background: getUrgencyColor(daysRemaining),
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 'bold'
                          }}>
                            ⏰ {isOverdue ? `${Math.abs(daysRemaining)} days OVERDUE` : `${daysRemaining} days remaining`}
                          </div>
                        )}
                      </div>

                      {!isSubmitted && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleStartCorrection(report)}
                            style={{
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '14px 28px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
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
                              color: '#667eea',
                              border: '2px solid #667eea',
                              padding: '14px 28px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.background = '#667eea';
                              e.currentTarget.style.color = 'white';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.background = '#fff';
                              e.currentTarget.style.color = '#667eea';
                            }}>
                            ⏱️ Request Extension
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Failed Items */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginTop: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <h4 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                        ❌ Failed Items ({report.failed_items.length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {report.failed_items.map((item, idx) => (
                          <div key={idx} style={{
                            padding: '16px',
                            background: '#fff5f5',
                            borderLeft: '4px solid #f44336',
                            borderRadius: '8px'
                          }}>
                            <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a1a2e', marginBottom: '4px' }}>
                              {idx + 1}. {item.item}
                            </div>
                            {item.notes && (
                              <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>
                                <strong>Notes:</strong> {item.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Inspection Photos */}
                    {report.photos && report.photos.length > 0 && (
                      <div style={{ marginTop: '20px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                          📷 Inspection Photos
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                          {report.photos.map((photo, idx) => {
                            const photoUrl = typeof photo === 'string' ? photo : photo.url;
                            return (
                              <img
                                key={idx}
                                src={photoUrl}
                                alt={`Inspection ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '140px',
                                  objectFit: 'cover',
                                  borderRadius: '12px',
                                  border: '3px solid #ddd',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease'
                                }}
                                onClick={() => window.open(photoUrl, '_blank')}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              />
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submitted Corrections Tab */}
      {activeTab === 'submitted' && (
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
          <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>
            ✅ Submitted Corrections History
          </h2>

          {submittedCorrections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>📝</div>
              <p style={{ fontSize: '20px', margin: 0, fontWeight: '600' }}>No corrections submitted yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {submittedCorrections.map(correction => (
                <div key={correction.inspection_id} style={{
                  border: '3px solid #e0e0e0',
                  borderRadius: '16px',
                  padding: '28px',
                  background: '#fafafa',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e' }}>
                          {correction.project_code}
                        </h3>
                        <span style={{
                          background: getStatusColor(correction.status),
                          color: 'white',
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {correction.status}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1a1a2e' }}>
                        {correction.project_name}
                      </p>
                      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                        Submitted: {new Date(correction.submitted_at).toLocaleString()}
                      </p>
                      
                      {/* Preview of correction notes */}
                      {correction.correction_notes && (
                        <div style={{
                          background: 'white',
                          padding: '16px',
                          borderRadius: '8px',
                          marginTop: '12px',
                          fontSize: '14px',
                          color: '#666',
                          maxHeight: '60px',
                          overflow: 'hidden',
                          position: 'relative'
                        }}>
                          {correction.correction_notes.substring(0, 150)}
                          {correction.correction_notes.length > 150 && '...'}
                        </div>
                      )}

                      {/* Photo thumbnails */}
                      {correction.correction_photos && correction.correction_photos.length > 0 && (
                        <div style={{ marginTop: '16px' }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                            {correction.correction_photos.slice(0, 4).map((photo, idx) => {
                              // Handle both full URLs and relative paths
                              const photoUrl = photo.startsWith('http') 
                                ? photo 
                                : `http://127.0.0.1:8000${photo}`;
                              
                              return (
                                <img
                                  key={idx}
                                  src={photoUrl}
                                  alt={`Correction ${idx + 1}`}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '2px solid #4caf50',
                                    cursor: 'pointer'
                                  }}
                                  onClick={() => window.open(photoUrl, '_blank')}
                                />
                              );
                            })}
                            {correction.correction_photos.length > 4 && (
                              <div style={{
                                width: '80px',
                                height: '80px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: '#f0f0f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#666'
                              }}>
                                +{correction.correction_photos.length - 4}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewCorrection(correction)}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '14px 28px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.5)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
                      }}>
                      👁️ View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Correction Submission Modal */}
      {showCorrectionModal && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          overflow: 'auto',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '36px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e' }}>
              🔧 Submit Corrective Actions
            </h2>
            <p style={{ margin: '0 0 28px 0', color: '#666', fontSize: '16px' }}>
              Project: <strong>{selectedReport.project_code}</strong>
            </p>

            {/* Failed Items Checklist */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Items to Correct:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {selectedReport.failed_items.map((item, idx) => (
                  <div key={idx} style={{
                    padding: '18px',
                    background: '#f5f5f5',
                    borderLeft: '5px solid #667eea',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a1a2e', marginBottom: '6px' }}>
                      ✓ {item.item}
                    </div>
                    {item.notes && (
                      <div style={{ fontSize: '14px', color: '#666', marginTop: '6px' }}>
                        Required action: {item.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Corrective Photos */}
            <div style={{ marginBottom: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  📸 Corrective Action Photos <span style={{ color: '#f44336', fontSize: '18px' }}>*</span>
                </h3>
                <label style={{
                  background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                  color: 'white',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                  transition: 'all 0.3s ease'
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                {correctivePhotos.map((photo, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img
                      src={photo.url}
                      alt={`Correction ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '160px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        border: '3px solid #4caf50'
                      }}
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                      }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {correctivePhotos.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '50px',
                  background: '#f5f5f5',
                  borderRadius: '12px',
                  color: '#999',
                  border: '2px dashed #ddd'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
                  <p style={{ margin: 0, fontSize: '16px' }}>Upload photos showing completed corrections</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#f44336' }}>At least one photo is required</p>
                </div>
              )}
            </div>

            {/* Corrective Notes */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                📝 Correction Details <span style={{ color: '#f44336', fontSize: '18px' }}>*</span>
              </h3>
              <textarea
                placeholder="Describe the corrective actions taken for each failed item..."
                value={correctiveNotes}
                onChange={(e) => setCorrectiveNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '12px',
                  border: '2px solid #ddd',
                  fontSize: '15px',
                  minHeight: '140px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCorrectionModal(false);
                  setSelectedReport(null);
                  setCorrectivePhotos([]);
                  setCorrectiveNotes('');
                }}
                disabled={loading}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #ddd',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!loading) e.currentTarget.style.background = '#f5f5f5';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fff';
                }}>
                Cancel
              </button>
              <button
                onClick={handleSubmitCorrections}
                disabled={loading || correctivePhotos.length === 0 || !correctiveNotes.trim()}
                style={{
                  background: (correctivePhotos.length === 0 || !correctiveNotes.trim()) 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: (correctivePhotos.length === 0 || !correctiveNotes.trim() || loading) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: (correctivePhotos.length === 0 || !correctiveNotes.trim()) 
                    ? 'none' 
                    : '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
                }}>
                {loading ? '⏳ Submitting...' : '✅ Submit Corrections'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Submitted Correction Modal */}
      {showViewModal && viewingCorrection && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          overflow: 'auto',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '36px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e' }}>
              👁️ Correction Submission Details
            </h2>
            <p style={{ margin: '0 0 28px 0', color: '#666', fontSize: '16px' }}>
              Project: <strong>{viewingCorrection.project_code}</strong>
            </p>

            {/* Submission Info */}
            <div style={{
              background: '#f5f5f5',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '28px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Status:</strong>{' '}
                <span style={{
                  background: getStatusColor(viewingCorrection.status),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {viewingCorrection.status}
                </span>
              </div>
              <div>
                <strong>Submitted:</strong> {new Date(viewingCorrection.submitted_at).toLocaleString()}
              </div>
            </div>

            {/* Correction Notes */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                📝 Correction Details
              </h3>
              <div style={{
                background: '#f5f5f5',
                padding: '20px',
                borderRadius: '12px',
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#333',
                whiteSpace: 'pre-wrap'
              }}>
                {viewingCorrection.correction_notes || 'No notes provided'}
              </div>
            </div>

            {/* Correction Photos */}
            {viewingCorrection.correction_photos && viewingCorrection.correction_photos.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  📸 Corrective Action Photos ({viewingCorrection.correction_photos.length})
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {viewingCorrection.correction_photos.map((photo, idx) => {
                    const photoUrl = photo.startsWith('http') 
                      ? photo 
                      : `http://127.0.0.1:8000${photo}`;
                    
                    return (
                      <img
                        key={idx}
                        src={photoUrl}
                        alt={`Correction ${idx + 1}`}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          border: '3px solid #4caf50',
                          cursor: 'pointer',
                          transition: 'transform 0.2s ease'
                        }}
                        onClick={() => window.open(photoUrl, '_blank')}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingCorrection(null);
                }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.3s ease'
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