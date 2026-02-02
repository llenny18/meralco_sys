import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface ChecklistItem {
  id: number;
  item_name: string;
  item_category: string;
  status: 'PASS' | 'FAIL' | 'NA' | 'PENDING';
  notes: string;
  photos: string[];
}

interface InspectionFlag {
  id: number;
  inspection: number;
  inspection_code: string;
  project_code: string;
  flag_type: string;
  item_count: number;
  status: string;
  ai_suggestions: {
    suggestions: AISuggestion[];
  };
  failed_items: ChecklistItem[];
  created_at: string;
}

interface AISuggestion {
  suggested_defect_type: string;
  suggested_severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  suggested_description: string;
  related_item_ids: number[];
  confidence_score: number;
  reasoning: string;
}

interface DefectFormData {
  defect_type: string;
  defect_category: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  description: string;
  related_checklist_items: number[];
  photos: string[];
  location_gps: string;
  qi_notes: string;
  is_ai_generated?: boolean;
  confidence_score?: number;
}

interface DefectReport {
  defect_id: number;
  project_code: string;
  vendor_name: string;
  defect_type: string;
  severity: string;
  description: string;
  correction_status: string;
  correction_due_date: string;
  created_at: string;
  days_overdue: number;
  failure_count: number;
  is_escalated: boolean;
  photos: string[];
  qi_notes: string;
  correction_photos: string[];
  correction_notes: string;
  review_notes: string;
  related_checklist_items: number[];
}

export default function QIDefectManagement() {
  const [activeTab, setActiveTab] = useState<'FLAGS' | 'DEFECTS'>('FLAGS');
  const [flags, setFlags] = useState<InspectionFlag[]>([]);
  const [defects, setDefects] = useState<DefectReport[]>([]);
  const [selectedFlag, setSelectedFlag] = useState<InspectionFlag | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedDefect, setSelectedDefect] = useState<DefectReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [qiCertified, setQiCertified] = useState(false);
  
  // Defect creation form
  const [defectForms, setDefectForms] = useState<DefectFormData[]>([]);
  const [qiSignature, setQiSignature] = useState('');
  
  // Photo viewing
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
  
  // Stats
  const [stats, setStats] = useState({
    pending_flags: 0,
    open_defects: 0,
    submitted_corrections: 0,
    escalated: 0,
    overdue: 0
  });

  useEffect(() => {
    const storedUser = localStorage?.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    setUserId(userObj?.user_id || '1');
    setUserName(userObj?.first_name && userObj?.last_name 
      ? `${userObj.first_name} ${userObj.last_name}` 
      : userObj?.username || 'QI User');
    
    if (userObj?.user_id) {
      fetchFlags(userObj.user_id);
      fetchDefects(userObj.user_id);
      fetchStats();
    }
  }, []);

  const fetchFlags = async (qiId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/inspection-flags/?qi=${qiId}&status=PENDING_QI_REVIEW`);
      const data = await response.json();
      setFlags(data.results || data || []);
    } catch (err) {
      console.error('Error fetching flags:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDefects = async (qiId: string) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      
      const response = await fetch(
        `${API_BASE_URL}/defect-reports/?created_by=${qiId}`,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        }
      );
      const data = await response.json();
      setDefects(data.results || data || []);
    } catch (err) {
      console.error('Error fetching defects:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/defect-reports/dashboard_stats/`,
        {
          headers: {
            'Authorization': `Token ${authToken}`,
          },
        });
      const data = await response.json();
      setStats({
        pending_flags: data.pending_flags || 0,
        open_defects: data.open || 0,
        submitted_corrections: data.submitted || 0,
        escalated: data.escalated || 0,
        overdue: data.overdue || 0
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleReviewFlag = async (flag: InspectionFlag) => {
    setSelectedFlag(flag);
    
    if (!flag.ai_suggestions?.suggestions?.length) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/inspection-flags/${flag.id}/generate_ai_suggestions/`, {
          method: 'POST'
        });
        const data = await response.json();
        
        const updatedFlag = { ...flag, ai_suggestions: { suggestions: data.suggestions } };
        setSelectedFlag(updatedFlag);
        
        const forms = data.suggestions.map((suggestion: AISuggestion) => ({
          defect_type: suggestion.suggested_defect_type,
          defect_category: '',
          severity: suggestion.suggested_severity,
          description: suggestion.suggested_description,
          related_checklist_items: suggestion.related_item_ids,
          photos: [],
          location_gps: '',
          qi_notes: suggestion.reasoning,
          is_ai_generated: true,
          confidence_score: suggestion.confidence_score
        }));
        setDefectForms(forms);
      } catch (err) {
        console.error('Error generating suggestions:', err);
      } finally {
        setLoading(false);
      }
    } else {
      const forms = flag.ai_suggestions.suggestions.map(suggestion => ({
        defect_type: suggestion.suggested_defect_type,
        defect_category: '',
        severity: suggestion.suggested_severity,
        description: suggestion.suggested_description,
        related_checklist_items: suggestion.related_item_ids,
        photos: [],
        location_gps: '',
        qi_notes: suggestion.reasoning,
        is_ai_generated: true,
        confidence_score: suggestion.confidence_score
      }));
      setDefectForms(forms);
    }
    
    setShowReviewModal(true);
  };

  const handleAddDefectForm = () => {
    setDefectForms([...defectForms, {
      defect_type: '',
      defect_category: '',
      severity: 'MAJOR',
      description: '',
      related_checklist_items: [],
      photos: [],
      location_gps: '',
      qi_notes: ''
    }]);
  };

  const handleUpdateDefectForm = (index: number, field: keyof DefectFormData, value: any) => {
    const updated = [...defectForms];
    updated[index] = { ...updated[index], [field]: value };
    setDefectForms(updated);
  };

  const handleRemoveDefectForm = (index: number) => {
    setDefectForms(defectForms.filter((_, i) => i !== index));
  };

  const handleFinalizeDefects = async () => {
    if (!qiSignature) {
      alert('❌ QI Signature is required for legal validity');
      return;
    }

    if (!qiCertified) {
      alert('❌ Please certify that you have reviewed all defects');
      return;
    }

    if (defectForms.length === 0) {
      alert('❌ At least one defect must be created');
      return;
    }

    const invalidForms = defectForms.filter(f => !f.defect_type || !f.severity || !f.description);
    if (invalidForms.length > 0) {
      alert('❌ All defects must have type, severity, and description');
      return;
    }

    if (!confirm(`Create ${defectForms.length} formal defect report(s)? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/defect-reports/finalize_from_flag/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flag_id: selectedFlag?.id,
          defects: defectForms,
          qi_signature: qiSignature
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create defects');
      }

      const data = await response.json();
      
      alert(`✅ Successfully created ${data.created_count} defect report(s)!\n\nVendor has been notified.`);
      
      setShowReviewModal(false);
      setSelectedFlag(null);
      setDefectForms([]);
      setQiSignature('');
      setQiCertified(false);
      
      fetchFlags(userId);
      fetchDefects(userId);
      fetchStats();

    } catch (err) {
      console.error('Error finalizing defects:', err);
      alert('❌ Error creating defects');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissFlag = async (flagId: number) => {
    const reason = prompt('Enter reason for dismissing this flag:');
    if (!reason) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/inspection-flags/${flagId}/dismiss/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        alert('✅ Flag dismissed');
        fetchFlags(userId);
      }
    } catch (err) {
      console.error('Error dismissing flag:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDefect = (defect: DefectReport) => {
    setSelectedDefect(defect);
    setShowDefectModal(true);
  };

  const handleApproveCorrection = async (defectId: number) => {
    const reviewNotes = prompt('Enter review notes (optional):');
    
    if (!confirm('Approve this correction?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/defect-reports/${defectId}/approve_correction/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_notes: reviewNotes || '' })
      });

      if (response.ok) {
        alert('✅ Correction approved');
        setShowDefectModal(false);
        fetchDefects(userId);
        fetchStats();
      }
    } catch (err) {
      console.error('Error approving correction:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectCorrection = async (defectId: number) => {
    const reviewNotes = prompt('Enter reason for rejection:');
    if (!reviewNotes) return;
    
    if (!confirm('Reject this correction?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/defect-reports/${defectId}/reject_correction/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_notes: reviewNotes })
      });

      if (response.ok) {
        const data = await response.json();
        
        let message = '⚠️ Correction rejected';
        if (data.escalated) {
          message += '\n\n🚨 ESCALATED: Failed 3 times - Management has been notified';
        }
        
        alert(message);
        setShowDefectModal(false);
        fetchDefects(userId);
        fetchStats();
      }
    } catch (err) {
      console.error('Error rejecting correction:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return '#f44336';
      case 'MAJOR': return '#ff9800';
      case 'MINOR': return '#2196f3';
      default: return '#999';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return '#ff9800';
      case 'SUBMITTED': return '#2196f3';
      case 'APPROVED': return '#4caf50';
      case 'REJECTED': return '#f44336';
      case 'CLOSED': return '#999';
      default: return '#999';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>
          🔧 Defect Management System
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Hybrid AI-Assisted Defect Reporting • Logged in as: <strong>{userName}</strong>
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>PENDING REVIEW</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#ff9800' }}>{stats.pending_flags}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Flags awaiting QI review</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>OPEN DEFECTS</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#f44336' }}>{stats.open_defects}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Active defect reports</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>PENDING APPROVAL</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#2196f3' }}>{stats.submitted_corrections}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Corrections submitted</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>ESCALATED</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#9c27b0' }}>{stats.escalated}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Failed 3+ times</div>
        </div>

        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>OVERDUE</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#f44336' }}>{stats.overdue}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Past due date</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('FLAGS')}
            style={{
              background: activeTab === 'FLAGS' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white',
              color: activeTab === 'FLAGS' ? 'white' : '#666',
              border: activeTab === 'FLAGS' ? 'none' : '1px solid #ddd',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'FLAGS' ? 'bold' : 'normal'
            }}>
            🚩 Review Flags ({stats.pending_flags})
          </button>
          <button
            onClick={() => setActiveTab('DEFECTS')}
            style={{
              background: activeTab === 'DEFECTS' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white',
              color: activeTab === 'DEFECTS' ? 'white' : '#666',
              border: activeTab === 'DEFECTS' ? 'none' : '1px solid #ddd',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'DEFECTS' ? 'bold' : 'normal'
            }}>
            📋 Defect Reports ({defects.length})
          </button>
        </div>
      </div>

      {/* FLAGS TAB */}
      {activeTab === 'FLAGS' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            🚩 Inspection Flags Pending Review
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>Loading flags...</p>
            </div>
          ) : flags.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <p style={{ fontSize: '18px', margin: 0 }}>No flags pending review</p>
              <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>All caught up!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {flags.map(flag => (
                <div key={flag.id} style={{
                  border: '2px solid #ff9800',
                  borderRadius: '12px',
                  padding: '24px',
                  background: '#fff9f0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>
                          Inspection #{flag.inspection_code}
                        </h3>
                        <span style={{
                          background: '#ff9800',
                          color: 'white',
                          padding: '6px 16px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          🚩 {flag.item_count} FAILED ITEMS
                        </span>
                      </div>

                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                        Project: <strong>{flag.project_code}</strong> • Created: {new Date(flag.created_at).toLocaleString()}
                      </div>

                      <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '12px', marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>
                          FAILED CHECKLIST ITEMS:
                        </div>
                        {flag.failed_items && flag.failed_items.slice(0, 5).map((item, idx) => (
                          <div key={idx} style={{
                            fontSize: '13px',
                            color: '#1a1a2e',
                            marginBottom: '4px',
                            paddingLeft: '16px'
                          }}>
                            • {item.item_name} {item.item_category ? `(${item.item_category})` : ''}
                          </div>
                        ))}
                        {flag.failed_items && flag.failed_items.length > 5 && (
                          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                            ... and {flag.failed_items.length - 5} more
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                      <button
                        onClick={() => handleReviewFlag(flag)}
                        style={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                        🔍 Review & Create Defects
                      </button>

                      <button
                        onClick={() => handleDismissFlag(flag.id)}
                        style={{
                          background: '#fff',
                          color: '#666',
                          border: '1px solid #ddd',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}>
                        ✖️ Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DEFECTS TAB */}
      {activeTab === 'DEFECTS' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            📋 Active Defect Reports
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p>Loading defects...</p>
            </div>
          ) : defects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
              <p style={{ fontSize: '18px', margin: 0 }}>No defect reports</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {defects.map(defect => (
                <div key={defect.defect_id} style={{
                  border: `2px solid ${getSeverityColor(defect.severity)}`,
                  borderRadius: '12px',
                  padding: '24px',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>
                          Defect #{defect.defect_id}
                        </h3>
                        <span style={{
                          background: getSeverityColor(defect.severity),
                          color: 'white',
                          padding: '6px 16px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {defect.severity}
                        </span>
                        <span style={{
                          background: getStatusColor(defect.correction_status),
                          color: 'white',
                          padding: '6px 16px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {defect.correction_status}
                        </span>
                        {defect.is_escalated && (
                          <span style={{
                            background: '#9c27b0',
                            color: 'white',
                            padding: '6px 16px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            🚨 ESCALATED
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                        {defect.defect_type}
                      </div>

                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                        Project: <strong>{defect.project_code}</strong> • Vendor: <strong>{defect.vendor_name}</strong>
                      </div>

                      {defect.days_overdue > 0 && (
                        <div style={{
                          background: '#fff5f5',
                          border: '1px solid #f44336',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#c62828',
                          marginBottom: '12px'
                        }}>
                          ⚠️ <strong>OVERDUE:</strong> {defect.days_overdue} days past due date
                        </div>
                      )}

                      {defect.failure_count > 0 && (
                        <div style={{
                          background: '#fff9f0',
                          border: '1px solid #ff9800',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          fontSize: '13px',
                          color: '#e65100',
                          marginBottom: '12px'
                        }}>
                          🔄 Correction rejected <strong>{defect.failure_count}</strong> time(s)
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                      <button
                        onClick={() => handleViewDefect(defect)}
                        style={{
                          background: 'linear-gradient(45deg, #667eea, #764ba2)',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                        📄 View Full Report
                      </button>

                      {defect.correction_status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleApproveCorrection(defect.defect_id)}
                            style={{
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              padding: '12px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleRejectCorrection(defect.defect_id)}
                            style={{
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              padding: '12px 20px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold'
                            }}>
                            ❌ Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEW MODAL */}
      {showReviewModal && selectedFlag && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
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
            maxWidth: '1200px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>
                  🔍 Review Failed Items & Create Defects
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Inspection #{selectedFlag.inspection_code} • Project {selectedFlag.project_code}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
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

            {/* AI Suggestions Info */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              color: 'white'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                🤖 AI-Assisted Review
              </div>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                The system has analyzed the failed items and grouped them into suggested defects.
                You can accept, modify, or create your own defects below.
              </div>
            </div>

            {/* Defect Forms */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}>
                  Defect Reports ({defectForms.length})
                </h3>
                <button
                  onClick={handleAddDefectForm}
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
                  ➕ Add Custom Defect
                </button>
              </div>

              {defectForms.map((form, index) => (
                <div key={index} style={{
                  border: form.is_ai_generated ? '2px solid #667eea' : '2px solid #ddd',
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '16px',
                  background: form.is_ai_generated ? '#f0f4ff' : '#f9f9f9'
                }}>
                  {form.is_ai_generated && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: 'white'
                    }}>
                      <span style={{ fontSize: '16px' }}>🤖</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                        AI SUGGESTED • Confidence: {((form.confidence_score || 0) * 100).toFixed(0)}%
                      </span>
                      <span style={{ flex: 1 }}></span>
                      <span style={{ fontSize: '11px', opacity: 0.8 }}>
                        (You can edit all fields below)
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ margin: 0, fontSize: '18px', color: '#1a1a2e' }}>
                      Defect #{index + 1}
                    </h4>
                    <button
                      onClick={() => handleRemoveDefectForm(index)}
                      style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}>
                      🗑️ Remove
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Defect Type *
                        {form.is_ai_generated && (
                          <span style={{ fontSize: '11px', color: '#667eea', marginLeft: '8px' }}>
                            (AI suggested - you can change)
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        value={form.defect_type}
                        onChange={(e) => handleUpdateDefectForm(index, 'defect_type', e.target.value)}
                        placeholder="e.g., Electrical Wiring Non-Compliance"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: form.is_ai_generated ? '2px solid #667eea' : '1px solid #ddd',
                          fontSize: '14px',
                          background: 'white'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Severity *
                        {form.is_ai_generated && (
                          <span style={{ fontSize: '11px', color: '#667eea', marginLeft: '8px' }}>
                            (AI suggested - you can change)
                          </span>
                        )}
                      </label>
                      <select
                        value={form.severity}
                        onChange={(e) => handleUpdateDefectForm(index, 'severity', e.target.value as 'MINOR' | 'MAJOR' | 'CRITICAL')}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: form.is_ai_generated ? '2px solid #667eea' : '1px solid #ddd',
                          fontSize: '14px',
                          background: 'white'
                        }}>
                        <option value="MINOR">MINOR</option>
                        <option value="MAJOR">MAJOR</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                      Description *
                      {form.is_ai_generated && (
                        <span style={{ fontSize: '11px', color: '#667eea', marginLeft: '8px' }}>
                          (AI generated - please review and edit as needed)
                        </span>
                      )}
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) => handleUpdateDefectForm(index, 'description', e.target.value)}
                      placeholder="Describe the defect in detail..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: form.is_ai_generated ? '2px solid #667eea' : '1px solid #ddd',
                        fontSize: '14px',
                        minHeight: '100px',
                        resize: 'vertical',
                        background: 'white'
                      }}
                    />
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                      Your QI Notes & Observations
                    </label>
                    <textarea
                      value={form.qi_notes}
                      onChange={(e) => handleUpdateDefectForm(index, 'qi_notes', e.target.value)}
                      placeholder="Add your professional assessment..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #4caf50',
                        fontSize: '14px',
                        minHeight: '80px',
                        resize: 'vertical',
                        background: '#f0fff4'
                      }}
                    />
                  </div>

                  {form.related_checklist_items.length > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', background: '#e3f2fd', borderRadius: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>
                        📋 Related Failed Items:
                      </div>
                      <div style={{ fontSize: '13px', color: '#1a1a2e' }}>
                        {form.related_checklist_items.length} checklist item(s) linked to this defect
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {defectForms.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <p>No defects created yet. Use "Add Custom Defect" button above.</p>
                </div>
              )}
            </div>

            {/* QI Approval Section */}
            <div style={{
              background: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#856404' }}>
                ✍️ QI Approval Required
              </h3>
              <p style={{ fontSize: '14px', color: '#856404', marginBottom: '16px', lineHeight: '1.6' }}>
                By signing below, you certify that you have reviewed all defects (AI-suggested and manual) and they accurately reflect the inspection findings. This signature has legal validity.
              </p>

              <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
                Digital Signature *
              </label>
              <input
                type="text"
                value={qiSignature}
                onChange={(e) => setQiSignature(e.target.value)}
                placeholder={`Type: QI-${userName}-${new Date().getTime()}`}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '8px',
                  border: '2px solid #ffc107',
                  fontSize: '14px',
                  background: 'white',
                  fontFamily: 'monospace'
                }}
              />
              
              <div style={{ display: 'flex', alignItems: 'start', gap: '8px', marginTop: '12px' }}>
                <input
                  type="checkbox"
                  id="qi-certification"
                  checked={qiCertified}
                  onChange={(e) => setQiCertified(e.target.checked)}
                  style={{ marginTop: '4px' }}
                />
                <label htmlFor="qi-certification" style={{ fontSize: '13px', color: '#856404', lineHeight: '1.5' }}>
                  I certify that I have personally reviewed all defects and they accurately reflect the inspection findings. I understand this has legal implications.
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '24px', borderTop: '1px solid #eee' }}>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '14px 28px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                Cancel
              </button>
              <button
                onClick={handleFinalizeDefects}
                disabled={loading || defectForms.length === 0 || !qiSignature || !qiCertified}
                style={{
                  background: loading || defectForms.length === 0 || !qiSignature || !qiCertified
                    ? '#ccc' 
                    : 'linear-gradient(45deg, #4caf50, #45a049)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '8px',
                  cursor: loading || defectForms.length === 0 || !qiSignature || !qiCertified ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)'
                }}>
                {loading ? '⏳ Creating...' : `✅ Finalize ${defectForms.length} Defect Report(s)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEFECT DETAIL MODAL */}
      {showDefectModal && selectedDefect && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
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
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>
                  📋 Defect Report #{selectedDefect.defect_id}
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  {selectedDefect.defect_type} • {selectedDefect.severity}
                </p>
              </div>
              <button
                onClick={() => setShowDefectModal(false)}
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

            {/* Status Badges */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span style={{
                background: getSeverityColor(selectedDefect.severity),
                color: 'white',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {selectedDefect.severity}
              </span>
              <span style={{
                background: getStatusColor(selectedDefect.correction_status),
                color: 'white',
                padding: '8px 16px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                {selectedDefect.correction_status}
              </span>
              {selectedDefect.is_escalated && (
                <span style={{
                  background: '#9c27b0',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  🚨 ESCALATED
                </span>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Description</h3>
              <div style={{ 
                padding: '16px', 
                background: '#f5f5f5', 
                borderRadius: '8px', 
                fontSize: '14px', 
                lineHeight: '1.6', 
                color: '#1a1a2e',
                whiteSpace: 'pre-wrap'
              }}>
                {selectedDefect.description}
              </div>
            </div>

            {/* Inspection Photos */}
            {selectedDefect.photos && selectedDefect.photos.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>
                  📸 Inspection Photos ({selectedDefect.photos.length})
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: '12px'
                }}>
                  {selectedDefect.photos.map((photo, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setViewingPhoto(photo)}
                      style={{
                        position: 'relative',
                        paddingBottom: '100%',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '2px solid #ddd',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.borderColor = '#667eea';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = '#ddd';
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Inspection photo ${idx + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}>
                        Photo {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QI Notes */}
            {selectedDefect.qi_notes && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>QI Notes</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#f0fff4', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#1a1a2e',
                  border: '1px solid #4caf50',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedDefect.qi_notes}
                </div>
              </div>
            )}

            {/* Correction Photos (if submitted) */}
            {selectedDefect.correction_photos && selectedDefect.correction_photos.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>
                  🔧 Correction Photos ({selectedDefect.correction_photos.length})
                </h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
                  gap: '12px'
                }}>
                  {selectedDefect.correction_photos.map((photo, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setViewingPhoto(photo)}
                      style={{
                        position: 'relative',
                        paddingBottom: '100%',
                        background: '#f5f5f5',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: '2px solid #4caf50',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.borderColor = '#2e7d32';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.borderColor = '#4caf50';
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Correction photo ${idx + 1}`}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'rgba(76, 175, 80, 0.9)',
                        color: 'white',
                        padding: '4px 8px',
                        fontSize: '12px',
                        textAlign: 'center'
                      }}>
                        Correction {idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correction Notes */}
            {selectedDefect.correction_notes && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Correction Notes</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#e3f2fd', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#1a1a2e',
                  border: '1px solid #2196f3',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedDefect.correction_notes}
                </div>
              </div>
            )}

            {/* Review Notes */}
            {selectedDefect.review_notes && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>Review Notes</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#fff3cd', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#856404',
                  border: '1px solid #ffc107',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedDefect.review_notes}
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>PROJECT</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {selectedDefect.project_code}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>VENDOR</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {selectedDefect.vendor_name}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>DUE DATE</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {selectedDefect.correction_due_date 
                    ? new Date(selectedDefect.correction_due_date).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>FAILURE COUNT</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: selectedDefect.failure_count > 0 ? '#f44336' : '#1a1a2e' }}>
                  {selectedDefect.failure_count}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedDefect.correction_status === 'SUBMITTED' && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                <button
                  onClick={() => handleRejectCorrection(selectedDefect.defect_id)}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                  ❌ Reject Correction
                </button>
                <button
                  onClick={() => handleApproveCorrection(selectedDefect.defect_id)}
                  style={{
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                  ✅ Approve Correction
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHOTO VIEWER MODAL */}
      {viewingPhoto && (
        <div 
          onClick={() => setViewingPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            padding: '40px',
            cursor: 'pointer'
          }}>
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh'
          }}>
            <img
              src={viewingPhoto}
              alt="Full size"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingPhoto(null);
              }}
              style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                background: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}