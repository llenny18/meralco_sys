import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface DefectReport {
  defect_id: number;
  inspection: number;
  inspection_date: string;
  project: number;
  project_code: string;
  project_name: string;
  vendor_id: number;
  vendor_name: string;
  defect_type: string;
  defect_category: string;
  severity: 'MINOR' | 'MAJOR' | 'CRITICAL';
  description: string;
  related_checklist_items: any[];
  photos: string[];
  inspection_photos: string[];
  defect_photos: string[];
  location_gps: string;
  qi_notes: string;
  qi_signature: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  correction_status: 'OPEN' | 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CLOSED';
  correction_due_date: string;
  correction_photos: string[];
  correction_notes: string;
  correction_submitted_at: string;
  correction_submitted_by: number;
  correction_submitted_by_name: string;
  failure_count: number;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  review_notes: string;
  is_escalated: boolean;
  escalated_at: string | null;
  escalation_reason: string;
}

interface InspectionStats {
  total_inspections: number;
  pending_corrections: number;
  submitted_corrections: number;
  approved_corrections: number;
  rejected_corrections: number;
  escalated_cases: number;
  overdue_corrections: number;
  avg_correction_time: number;
}

interface FilterOptions {
  severity: string;
  correction_status: string;
  vendor: string;
  date_from: string;
  date_to: string;
  search: string;
  show_escalated_only: boolean;
  show_overdue_only: boolean;
}

export default function WOSupervisorDefectManagement() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'pending' | 'history' | 'escalated'>('dashboard');
  const [defectReports, setDefectReports] = useState<DefectReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<DefectReport[]>([]);
  const [selectedDefect, setSelectedDefect] = useState<DefectReport | null>(null);
  const [inspectionStats, setInspectionStats] = useState<InspectionStats>({
    total_inspections: 0,
    pending_corrections: 0,
    submitted_corrections: 0,
    approved_corrections: 0,
    rejected_corrections: 0,
    escalated_cases: 0,
    overdue_corrections: 0,
    avg_correction_time: 0
  });
  const [filters, setFilters] = useState<FilterOptions>({
    severity: 'ALL',
    correction_status: 'ALL',
    vendor: 'ALL',
    date_from: '',
    date_to: '',
    search: '',
    show_escalated_only: false,
    show_overdue_only: false
  });
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [userId, setUserId] = useState<string>('');
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userObj = JSON.parse(storedUser);
      setUserId(userObj.user_id);
    }
    
    fetchVendors();
    fetchDefectReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [defectReports, filters]);

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/`);
      const data = await response.json();
      setVendors(data.results || data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchDefectReports = async () => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/defect-reports/?ordering=-created_at`, {
        headers: {
          'Authorization': `Token ${authToken}`,
        }
      });
      const data = await response.json();
      const reports = data.results || data || [];
      
      // Enrich with project and vendor data
      const enrichedReports = await Promise.all(
        reports.map(async (report: any) => {
          try {
            // Fetch project data
            const projectRes = await fetch(`${API_BASE_URL}/projects/${report.project}/`);
            const projectData = await projectRes.json();
            
            // Fetch inspection data
            const inspectionRes = await fetch(`${API_BASE_URL}/qi-inspections/${report.inspection}/`);
            const inspectionData = await inspectionRes.json();
            
            // Fetch vendor data
            const vendorRes = await fetch(`${API_BASE_URL}/vendors/${projectData.vendor}/`);
            const vendorData = await vendorRes.json();
            
            // Fetch inspection photos from QIInspectionPhoto model
            let inspectionPhotos: string[] = [];
            try {
              const photosRes = await fetch(`${API_BASE_URL}/qi-inspection-photos/?inspection=${report.inspection}`);
              const photosData = await photosRes.json();
              const photosList = photosData.results || photosData || [];
              inspectionPhotos = photosList.map((p: any) => p.photo_url || p.photo_file).filter(Boolean);
            } catch (err) {
              console.warn('Could not fetch inspection photos:', err);
            }
            
            // Also check if inspection has photos in its data
            if (inspectionData.photos && Array.isArray(inspectionData.photos)) {
              inspectionPhotos = [...inspectionPhotos, ...inspectionData.photos];
            }
            
            // Fetch correction photos from QIInspectionCorrectionPhoto model
            let correctionPhotos: string[] = [];
            try {
              const correctionPhotosRes = await fetch(`${API_BASE_URL}/qi-inspection-correction-photos/?inspection=${report.inspection}`);
              const correctionPhotosData = await correctionPhotosRes.json();
              const correctionPhotosList = correctionPhotosData.results || correctionPhotosData || [];
              correctionPhotos = correctionPhotosList.map((p: any) => p.photo_file).filter(Boolean);
            } catch (err) {
              console.warn('Could not fetch correction photos:', err);
            }
            
            // Also check if inspection has correction_photos in its data
            if (inspectionData.correction_photos && Array.isArray(inspectionData.correction_photos)) {
              correctionPhotos = [...correctionPhotos, ...inspectionData.correction_photos];
            }
            
            // Parse defect report photos (from the photos field)
            let defectPhotos: string[] = [];
            if (report.photos) {
              if (typeof report.photos === 'string') {
                try {
                  defectPhotos = JSON.parse(report.photos);
                } catch {
                  defectPhotos = [report.photos];
                }
              } else if (Array.isArray(report.photos)) {
                defectPhotos = report.photos;
              }
            }
            
            // Parse correction photos from defect report
            let defectCorrectionPhotos: string[] = [];
            if (report.correction_photos) {
              if (typeof report.correction_photos === 'string') {
                try {
                  defectCorrectionPhotos = JSON.parse(report.correction_photos);
                } catch {
                  defectCorrectionPhotos = [report.correction_photos];
                }
              } else if (Array.isArray(report.correction_photos)) {
                defectCorrectionPhotos = report.correction_photos;
              }
            }
            
            // Fetch user names
            let createdByName = 'Unknown';
            let submittedByName = null;
            let reviewedByName = null;
            
            if (report.created_by) {
              const userRes = await fetch(`${API_BASE_URL}/users/${report.created_by}/`);
              const userData = await userRes.json();
              createdByName = userData.first_name + ' ' + userData.last_name;
            }
            
            if (report.correction_submitted_by) {
              const userRes = await fetch(`${API_BASE_URL}/users/${report.correction_submitted_by}/`);
              const userData = await userRes.json();
              submittedByName = userData.first_name + ' ' + userData.last_name;
            }
            
            if (report.reviewed_by) {
              const userRes = await fetch(`${API_BASE_URL}/users/${report.reviewed_by}/`);
              const userData = await userRes.json();
              reviewedByName = userData.first_name + ' ' + userData.last_name;
            }
            
            return {
              ...report,
              project_code: projectData.project_code,
              project_name: projectData.project_name,
              vendor_id: vendorData.vendor_id,
              vendor_name: vendorData.vendor_name,
              inspection_date: inspectionData.inspection_date,
              inspection_photos: inspectionPhotos,
              defect_photos: defectPhotos,
              correction_photos: [...correctionPhotos, ...defectCorrectionPhotos].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
              created_by_name: createdByName,
              correction_submitted_by_name: submittedByName,
              reviewed_by_name: reviewedByName
            };
          } catch (err) {
            console.error('Error enriching report:', err);
            return report;
          }
        })
      );
      
      setDefectReports(enrichedReports);
      calculateStats(enrichedReports);
    } catch (error) {
      console.error('Error fetching defect reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reports: DefectReport[]) => {
    const now = new Date();
    
    const stats: InspectionStats = {
      total_inspections: reports.length,
      pending_corrections: reports.filter(r => r.correction_status === 'PENDING' || r.correction_status === 'OPEN').length,
      submitted_corrections: reports.filter(r => r.correction_status === 'SUBMITTED').length,
      approved_corrections: reports.filter(r => r.correction_status === 'APPROVED').length,
      rejected_corrections: reports.filter(r => r.correction_status === 'REJECTED').length,
      escalated_cases: reports.filter(r => r.is_escalated).length,
      overdue_corrections: reports.filter(r => {
        if (!r.correction_due_date || r.correction_status === 'APPROVED' || r.correction_status === 'CLOSED') return false;
        return new Date(r.correction_due_date) < now;
      }).length,
      avg_correction_time: 0
    };
    
    // Calculate average correction time for approved corrections
    const approvedWithTimes = reports.filter(r => 
      r.correction_status === 'APPROVED' && 
      r.correction_submitted_at && 
      r.created_at
    );
    
    if (approvedWithTimes.length > 0) {
      const totalDays = approvedWithTimes.reduce((sum, r) => {
        const created = new Date(r.created_at);
        const submitted = new Date(r.correction_submitted_at);
        const days = Math.floor((submitted.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      stats.avg_correction_time = Math.round(totalDays / approvedWithTimes.length);
    }
    
    setInspectionStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...defectReports];
    
    // Severity filter
    if (filters.severity !== 'ALL') {
      filtered = filtered.filter(r => r.severity === filters.severity);
    }
    
    // Status filter
    if (filters.correction_status !== 'ALL') {
      filtered = filtered.filter(r => r.correction_status === filters.correction_status);
    }
    
    // Vendor filter
    if (filters.vendor !== 'ALL') {
      filtered = filtered.filter(r => r.vendor_id.toString() === filters.vendor);
    }
    
    // Date range filter
    if (filters.date_from) {
      filtered = filtered.filter(r => r.created_at >= filters.date_from);
    }
    if (filters.date_to) {
      filtered = filtered.filter(r => r.created_at <= filters.date_to);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(r => 
        r.project_code.toLowerCase().includes(searchLower) ||
        r.project_name.toLowerCase().includes(searchLower) ||
        r.defect_type.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Escalated only filter
    if (filters.show_escalated_only) {
      filtered = filtered.filter(r => r.is_escalated);
    }
    
    // Overdue only filter
    if (filters.show_overdue_only) {
      const now = new Date();
      filtered = filtered.filter(r => {
        if (!r.correction_due_date || r.correction_status === 'APPROVED' || r.correction_status === 'CLOSED') return false;
        return new Date(r.correction_due_date) < now;
      });
    }
    
    setFilteredReports(filtered);
  };

  const handleReviewDefect = (defect: DefectReport, action: 'approve' | 'reject') => {
    setSelectedDefect(defect);
    setReviewAction(action);
    setReviewNotes('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedDefect || !reviewAction) return;
    
    if (!reviewNotes.trim()) {
      alert('❌ Please provide review notes!');
      return;
    }
    
    setLoading(true);
    
    try {
      const authToken = localStorage.getItem('auth_token');

      const endpoint = reviewAction === 'approve' 
        ? `${API_BASE_URL}/defect-reports/${selectedDefect.defect_id}/approve_correction/`
        : `${API_BASE_URL}/defect-reports/${selectedDefect.defect_id}/reject_correction/`;
     
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${authToken}` },
        body: JSON.stringify({
          reviewed_by: userId,
          review_notes: reviewNotes.trim()
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Review submission failed');
      }
      
      const result = await response.json();
      
      // Handle different response scenarios
      if (reviewAction === 'approve') {
        // Show success message with status update confirmation
        alert(`✅ Correction approved successfully!\n\n📋 Project Status: Updated to Status 7 (Approved)\n🎯 Defect #${selectedDefect.defect_id} has been closed.`);
      } else if (reviewAction === 'reject') {
        // Check if auto-escalation occurred
        if (result.escalated) {
          alert(`⚠️ Correction rejected!\n\nThis defect has been automatically escalated to the Team Leader after ${selectedDefect.failure_count + 1} failed attempts.`);
        } else {
          alert(`❌ Correction rejected.\n\nVendor has been notified to resubmit corrections.\nAttempt ${selectedDefect.failure_count + 1} of 3 before auto-escalation.`);
        }
      }
      
      setShowReviewModal(false);
      setSelectedDefect(null);
      setReviewAction(null);
      setReviewNotes('');
      
      // Refresh data
      fetchDefectReports();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualEscalation = (defect: DefectReport) => {
    setSelectedDefect(defect);
    setEscalationReason('');
    setShowEscalateModal(true);
  };

  const submitEscalation = async () => {
    if (!selectedDefect) return;
    
    if (!escalationReason.trim()) {
      alert('❌ Please provide an escalation reason!');
      return;
    }
    
    setLoading(true);
    
    try {
      const authToken = localStorage.getItem('auth_token');
      const response = await fetch(
        `${API_BASE_URL}/defect-reports/${selectedDefect.defect_id}/escalate/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${authToken}` },
          body: JSON.stringify({
            escalation_reason: escalationReason.trim(),
            escalated_by: userId
          })
        }
      );
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Escalation failed');
      }
      
      alert('✅ Defect escalated to Team Leader successfully!');
      
      setShowEscalateModal(false);
      setSelectedDefect(null);
      setEscalationReason('');
      
      fetchDefectReports();
    } catch (error) {
      console.error('Error escalating defect:', error);
      alert(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      'MINOR': '#ff9800',
      'MAJOR': '#f44336',
      'CRITICAL': '#9c27b0'
    };
    return colors[severity] || '#999';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'OPEN': '#ff9800',
      'PENDING': '#2196f3',
      'SUBMITTED': '#9c27b0',
      'APPROVED': '#4caf50',
      'REJECTED': '#f44336',
      'CLOSED': '#666'
    };
    return colors[status] || '#999';
  };

  const getDaysRemaining = (dueDate: string) => {
    if (!dueDate) return null;
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const openPhotoGallery = (photos: string[], startIndex: number = 0) => {
    setSelectedPhotos(photos);
    setCurrentPhotoIndex(startIndex);
    setShowPhotoModal(true);
  };

  const navigatePhoto = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : selectedPhotos.length - 1);
    } else {
      setCurrentPhotoIndex(prev => prev < selectedPhotos.length - 1 ? prev + 1 : 0);
    }
  };

  const normalizePhotoUrl = (photo: string) => {
    if (!photo) return '';
    if (photo.startsWith('http')) return photo;
    if (photo.startsWith('/')) return `http://127.0.0.1:8000${photo}`;
    return `http://127.0.0.1:8000/${photo}`;
  };

  const getAllPhotos = (report: DefectReport) => {
    const allPhotos: { url: string; type: string; label: string }[] = [];
    
    // Add inspection photos
    if (report.inspection_photos && report.inspection_photos.length > 0) {
      report.inspection_photos.forEach((photo, idx) => {
        allPhotos.push({
          url: normalizePhotoUrl(photo),
          type: 'inspection',
          label: `QI Inspection ${idx + 1}`
        });
      });
    }
    
    // Add defect photos
    if (report.defect_photos && report.defect_photos.length > 0) {
      report.defect_photos.forEach((photo, idx) => {
        allPhotos.push({
          url: normalizePhotoUrl(photo),
          type: 'defect',
          label: `Defect Evidence ${idx + 1}`
        });
      });
    }
    
    // Add correction photos
    if (report.correction_photos && report.correction_photos.length > 0) {
      report.correction_photos.forEach((photo, idx) => {
        allPhotos.push({
          url: normalizePhotoUrl(photo),
          type: 'correction',
          label: `Correction ${idx + 1}`
        });
      });
    }
    
    return allPhotos;
  };

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '36px', fontWeight: '800', color: '#1a1a2e', letterSpacing: '-0.5px' }}>
              🎯 WO Supervisor - Defect Management
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Review, approve, and manage vendor defect corrections
            </p>
          </div>
          <button
            onClick={fetchDefectReports}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '15px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              opacity: loading ? 0.7 : 1
            }}>
            {loading ? '🔄 Refreshing...' : '🔄 Refresh Data'}
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>
          📊 Real-Time Inspection Statistics
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div style={{ textAlign: 'center', padding: '24px', background: '#f5f5f5', borderRadius: '16px', border: '2px solid #e0e0e0' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#667eea', marginBottom: '8px' }}>
              {inspectionStats.total_inspections}
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Total Inspections</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', background: '#fff3e0', borderRadius: '16px', border: '2px solid #ff9800' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
              {inspectionStats.pending_corrections}
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Pending Corrections</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', background: '#f3e5f5', borderRadius: '16px', border: '2px solid #9c27b0' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#9c27b0', marginBottom: '8px' }}>
              {inspectionStats.submitted_corrections}
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Awaiting Review</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', background: '#e8f5e9', borderRadius: '16px', border: '2px solid #4caf50' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
              {inspectionStats.approved_corrections}
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Approved</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', background: '#ffebee', borderRadius: '16px', border: '2px solid #f44336' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f44336', marginBottom: '8px' }}>
              {inspectionStats.rejected_corrections}
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Rejected</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', background: '#fce4ec', borderRadius: '16px', border: '2px solid #e91e63' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#e91e63', marginBottom: '8px' }}>
              {inspectionStats.escalated_cases}
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Escalated Cases</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', background: '#fff5f5', borderRadius: '16px', border: '2px solid #f44336' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f44336', marginBottom: '8px' }}>
              {inspectionStats.overdue_corrections}
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Overdue</div>
          </div>
          
          <div style={{ textAlign: 'center', padding: '24px', background: '#e3f2fd', borderRadius: '16px', border: '2px solid #2196f3' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3', marginBottom: '8px' }}>
              {inspectionStats.avg_correction_time}d
            </div>
            <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>Avg Correction Time</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>
          🔍 Filters
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>
              Severity
            </label>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '14px'
              }}>
              <option value="ALL">All Severities</option>
              <option value="MINOR">Minor</option>
              <option value="MAJOR">Major</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>
              Status
            </label>
            <select
              value={filters.correction_status}
              onChange={(e) => setFilters({ ...filters, correction_status: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '14px'
              }}>
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>
              Vendor
            </label>
            <select
              value={filters.vendor}
              onChange={(e) => setFilters({ ...filters, vendor: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '14px'
              }}>
              <option value="ALL">All Vendors</option>
              {vendors.map(v => (
                <option key={v.vendor_id} value={v.vendor_id}>
                  {v.vendor_name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>
              Date From
            </label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>
              Date To
            </label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: '#666' }}>
              Search
            </label>
            <input
              type="text"
              placeholder="Project code, name, defect type..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '2px solid #e0e0e0',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.show_escalated_only}
              onChange={(e) => setFilters({ ...filters, show_escalated_only: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
              🚨 Escalated Only
            </span>
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filters.show_overdue_only}
              onChange={(e) => setFilters({ ...filters, show_overdue_only: e.target.checked })}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#666' }}>
              ⏰ Overdue Only
            </span>
          </label>
          
          <button
            onClick={() => setFilters({
              severity: 'ALL',
              correction_status: 'ALL',
              vendor: 'ALL',
              date_from: '',
              date_to: '',
              search: '',
              show_escalated_only: false,
              show_overdue_only: false
            })}
            style={{
              background: '#f5f5f5',
              color: '#666',
              border: '2px solid #e0e0e0',
              padding: '8px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              marginLeft: 'auto'
            }}>
            🔄 Reset Filters
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('dashboard')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '16px',
            background: activeTab === 'dashboard' ? 'white' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'dashboard' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: activeTab === 'dashboard' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            flex: 1,
            minWidth: '200px',
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
          ⏳ Pending Review ({filteredReports.filter(r => r.correction_status === 'SUBMITTED').length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '16px',
            background: activeTab === 'history' ? 'white' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'history' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: activeTab === 'history' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
          📜 History
        </button>
        <button
          onClick={() => setActiveTab('escalated')}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '16px',
            background: activeTab === 'escalated' ? 'white' : 'rgba(255,255,255,0.2)',
            color: activeTab === 'escalated' ? '#667eea' : 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: activeTab === 'escalated' ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
            transition: 'all 0.3s ease'
          }}>
          🚨 Escalated ({filteredReports.filter(r => r.is_escalated).length})
        </button>
      </div>

      {/* Defect Reports List */}
      <div style={{ background: 'white', borderRadius: '20px', padding: '28px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}>
        <h2 style={{ margin: '0 0 24px 0', fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>
          {activeTab === 'dashboard' && '📋 All Defect Reports'}
          {activeTab === 'pending' && '⏳ Pending Review'}
          {activeTab === 'history' && '📜 Review History'}
          {activeTab === 'escalated' && '🚨 Escalated Cases'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ fontSize: '18px' }}>Loading defect reports...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
            <div style={{ fontSize: '80px', marginBottom: '20px' }}>📭</div>
            <p style={{ fontSize: '20px', margin: 0, fontWeight: '600' }}>No defect reports found</p>
            <p style={{ fontSize: '14px', color: '#aaa', marginTop: '8px' }}>Try adjusting your filters</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {filteredReports
              .filter(report => {
                if (activeTab === 'pending') return report.correction_status === 'SUBMITTED';
                if (activeTab === 'history') return ['APPROVED', 'REJECTED', 'CLOSED'].includes(report.correction_status);
                if (activeTab === 'escalated') return report.is_escalated;
                return true;
              })
              .map(report => {
                const daysRemaining = getDaysRemaining(report.correction_due_date);
                const isOverdue = daysRemaining !== null && daysRemaining < 0;
                
                return (
                  <div
                    key={report.defect_id}
                    style={{
                      border: `3px solid ${isOverdue ? '#f44336' : report.is_escalated ? '#e91e63' : '#e0e0e0'}`,
                      borderRadius: '16px',
                      padding: '28px',
                      background: isOverdue ? '#fff5f5' : report.is_escalated ? '#fce4ec' : '#fafafa',
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
                    
                    {/* Header Section */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#1a1a2e' }}>
                            Defect #{report.defect_id}: {report.project_code}
                          </h3>
                          <span style={{
                            background: getSeverityColor(report.severity),
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {report.severity}
                          </span>
                          <span style={{
                            background: getStatusColor(report.correction_status),
                            color: 'white',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {report.correction_status}
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
                          {report.is_escalated && (
                            <span style={{
                              background: '#e91e63',
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
                          <strong>Project:</strong> {report.project_name}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Vendor:</strong> {report.vendor_name}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Defect Type:</strong> {report.defect_type} {report.defect_category && `(${report.defect_category})`}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Inspection Date:</strong> {new Date(report.inspection_date).toLocaleDateString()}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Reported by:</strong> {report.created_by_name} on {new Date(report.created_at).toLocaleDateString()}
                        </p>
                        
                        {daysRemaining !== null && report.correction_status !== 'APPROVED' && report.correction_status !== 'CLOSED' && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 20px',
                            background: isOverdue ? '#f44336' : daysRemaining <= 2 ? '#ff9800' : '#4caf50',
                            color: 'white',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            marginTop: '12px'
                          }}>
                            ⏰ {isOverdue ? `${Math.abs(daysRemaining)} days OVERDUE` : `${daysRemaining} days remaining`}
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      {report.correction_status === 'SUBMITTED' && (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleReviewDefect(report, 'approve')}
                            style={{
                              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '14px 28px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 15px rgba(76, 175, 80, 0.4)',
                              transition: 'all 0.3s ease'
                            }}>
                            ✅ Approve
                          </button>
                          <button
                            onClick={() => handleReviewDefect(report, 'reject')}
                            style={{
                              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                              color: 'white',
                              border: 'none',
                              padding: '14px 28px',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              fontSize: '15px',
                              fontWeight: 'bold',
                              boxShadow: '0 4px 15px rgba(244, 67, 54, 0.4)',
                              transition: 'all 0.3s ease'
                            }}>
                            ❌ Reject
                          </button>
                        </div>
                      )}
                      
                      {!report.is_escalated && report.failure_count >= 2 && (
                        <button
                          onClick={() => handleManualEscalation(report)}
                          style={{
                            background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 28px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 15px rgba(233, 30, 99, 0.4)',
                            transition: 'all 0.3s ease'
                          }}>
                          🚨 Escalate to Team Leader
                        </button>
                      )}
                    </div>
                    
                    {/* Defect Description */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                        📝 Defect Description
                      </h4>
                      <p style={{ margin: 0, fontSize: '15px', color: '#333', lineHeight: '1.6' }}>
                        {report.description}
                      </p>
                    </div>
                    
                    {/* All Photos - Comprehensive View */}
                    {(() => {
                      const allPhotos = getAllPhotos(report);
                      if (allPhotos.length > 0) {
                        return (
                          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                              <h4 style={{ margin: 0, fontSize: '19px', fontWeight: 'bold', color: 'white' }}>
                                🖼️ All Photos ({allPhotos.length})
                              </h4>
                              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{ background: 'rgba(33, 150, 243, 0.9)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                  📷 {report.inspection_photos?.length || 0} Inspection
                                </span>
                                <span style={{ background: 'rgba(255, 152, 0, 0.9)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                  📸 {report.defect_photos?.length || 0} Defect
                                </span>
                                <span style={{ background: 'rgba(76, 175, 80, 0.9)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                                  ✅ {report.correction_photos?.length || 0} Correction
                                </span>
                              </div>
                            </div>
                            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>
                              Complete visual documentation from initial inspection through correction
                            </p>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                              {allPhotos.map((photo, idx) => {
                                const borderColors = {
                                  inspection: '#2196f3',
                                  defect: '#ff9800',
                                  correction: '#4caf50'
                                };
                                const bgColors = {
                                  inspection: 'rgba(33, 150, 243, 0.9)',
                                  defect: 'rgba(255, 152, 0, 0.9)',
                                  correction: 'rgba(76, 175, 80, 0.9)'
                                };
                                
                                return (
                                  <div key={idx} style={{ position: 'relative' }}>
                                    <img
                                      src={photo.url}
                                      alt={photo.label}
                                      style={{
                                        width: '100%',
                                        height: '180px',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                        border: `4px solid ${borderColors[photo.type as keyof typeof borderColors]}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                                      }}
                                      onClick={() => openPhotoGallery(allPhotos.map(p => p.url), idx)}
                                      onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                                      }}
                                      onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'scale(1) translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                                      }}
                                    />
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '8px',
                                      left: '8px',
                                      right: '8px',
                                      background: bgColors[photo.type as keyof typeof bgColors],
                                      color: 'white',
                                      padding: '6px 10px',
                                      borderRadius: '8px',
                                      fontSize: '11px',
                                      fontWeight: 'bold',
                                      textAlign: 'center',
                                      backdropFilter: 'blur(4px)'
                                    }}>
                                      {photo.label}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* QI Notes */}
                    {report.qi_notes && (
                      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                          👨‍🔧 QI Inspector Notes
                        </h4>
                        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                          {report.qi_notes}
                        </p>
                      </div>
                    )}
                    
                    {/* Failed Checklist Items */}
                    {report.related_checklist_items && report.related_checklist_items.length > 0 && (
                      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                          ❌ Failed Checklist Items ({report.related_checklist_items.length})
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {report.related_checklist_items.map((item: any, idx: number) => (
                            <div key={idx} style={{
                              padding: '16px',
                              background: '#fff5f5',
                              borderLeft: '4px solid #f44336',
                              borderRadius: '8px'
                            }}>
                              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#1a1a2e', marginBottom: '4px' }}>
                                {idx + 1}. {item.item_name || item.item || item}
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
                    )}
                    
                    {/* Vendor Correction Submission */}
                    {report.correction_submitted_at && (
                      <div style={{ background: '#f3f0ff', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '2px solid #9c27b0' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                          🔧 Vendor Correction Submission
                        </h4>
                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Submitted by:</strong> {report.correction_submitted_by_name || 'Unknown'}
                        </p>
                        <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Submitted on:</strong> {new Date(report.correction_submitted_at).toLocaleString()}
                        </p>
                        
                        {report.correction_notes && (
                          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                              Correction Details:
                            </h5>
                            <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                              {report.correction_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Review History */}
                    {report.reviewed_at && (
                      <div style={{
                        background: report.correction_status === 'APPROVED' ? '#e8f5e9' : '#ffebee',
                        borderRadius: '12px',
                        padding: '20px',
                        border: `2px solid ${report.correction_status === 'APPROVED' ? '#4caf50' : '#f44336'}`
                      }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                          👁️ Review History
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Reviewed by:</strong> {report.reviewed_by_name || 'Unknown'}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Reviewed on:</strong> {new Date(report.reviewed_at).toLocaleString()}
                        </p>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Decision:</strong>{' '}
                          <span style={{
                            background: getStatusColor(report.correction_status),
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            {report.correction_status}
                          </span>
                        </p>
                        {report.review_notes && (
                          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                              Review Notes:
                            </h5>
                            <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                              {report.review_notes}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Escalation Info */}
                    {report.is_escalated && (
                      <div style={{ background: '#fce4ec', borderRadius: '12px', padding: '20px', border: '2px solid #e91e63', marginTop: '20px' }}>
                        <h4 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 'bold', color: '#1a1a2e' }}>
                          🚨 Escalation Information
                        </h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                          <strong>Escalated on:</strong> {report.escalated_at ? new Date(report.escalated_at).toLocaleString() : 'N/A'}
                        </p>
                        {report.escalation_reason && (
                          <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
                            <h5 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                              Escalation Reason:
                            </h5>
                            <p style={{ margin: 0, fontSize: '14px', color: '#333', lineHeight: '1.6' }}>
                              {report.escalation_reason}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedDefect && reviewAction && (
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e' }}>
              {reviewAction === 'approve' ? '✅ Approve Correction' : '❌ Reject Correction'}
            </h2>
            <p style={{ margin: '0 0 28px 0', color: '#666', fontSize: '16px' }}>
              Defect #{selectedDefect.defect_id}: {selectedDefect.project_code}
            </p>

            {/* Defect Summary */}
            <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Defect Summary
              </h3>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Type:</strong> {selectedDefect.defect_type}
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Severity:</strong>{' '}
                <span style={{
                  background: getSeverityColor(selectedDefect.severity),
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {selectedDefect.severity}
                </span>
              </p>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                <strong>Attempts:</strong> {selectedDefect.failure_count}
              </p>
            </div>

            {/* Status Update Notice for Approval */}
            {reviewAction === 'approve' && (
              <div style={{
                background: '#e8f5e9',
                border: '2px solid #4caf50',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '28px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#2e7d32' }}>
                  📋 Project Status Update
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  Upon approval, the project status will be automatically updated to <strong>Status 7 (Approved)</strong>.
                </p>
              </div>
            )}

            {/* Warning for Rejection */}
            {reviewAction === 'reject' && selectedDefect.failure_count >= 2 && (
              <div style={{
                background: '#fff3e0',
                border: '2px solid #ff9800',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '28px'
              }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 'bold', color: '#f57c00' }}>
                  ⚠️ Warning
                </h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  This will be the {selectedDefect.failure_count + 1}rd rejection. 
                  {selectedDefect.failure_count + 1 >= 3 && (
                    <strong style={{ color: '#f44336' }}> The defect will be automatically escalated to the Team Leader.</strong>
                  )}
                </p>
              </div>
            )}

            {/* Review Notes */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                📝 Review Notes <span style={{ color: '#f44336', fontSize: '18px' }}>*</span>
              </h3>
              <textarea
                placeholder={reviewAction === 'approve' 
                  ? "Document why this correction is acceptable..." 
                  : "Explain what needs to be corrected and why this submission was rejected..."
                }
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
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
                  setShowReviewModal(false);
                  setSelectedDefect(null);
                  setReviewAction(null);
                  setReviewNotes('');
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
                }}>
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={loading || !reviewNotes.trim()}
                style={{
                  background: !reviewNotes.trim() 
                    ? '#ccc' 
                    : reviewAction === 'approve'
                    ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                    : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: (!reviewNotes.trim() || loading) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: !reviewNotes.trim() 
                    ? 'none' 
                    : reviewAction === 'approve'
                    ? '0 4px 15px rgba(76, 175, 80, 0.4)'
                    : '0 4px 15px rgba(244, 67, 54, 0.4)',
                  transition: 'all 0.3s ease'
                }}>
                {loading 
                  ? '⏳ Processing...' 
                  : reviewAction === 'approve' 
                  ? '✅ Approve Correction' 
                  : '❌ Reject & Request Re-work'
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      {showEscalateModal && selectedDefect && (
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
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ margin: '0 0 12px 0', fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e' }}>
              🚨 Escalate to Team Leader
            </h2>
            <p style={{ margin: '0 0 28px 0', color: '#666', fontSize: '16px' }}>
              Defect #{selectedDefect.defect_id}: {selectedDefect.project_code}
            </p>

            {/* Escalation Info */}
            <div style={{ background: '#fce4ec', border: '2px solid #e91e63', borderRadius: '12px', padding: '20px', marginBottom: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e' }}>
                ⚠️ Escalation Notice
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                This defect will be escalated to the Team Leader for review. The Team Leader will be notified and will take appropriate action.
              </p>
            </div>

            {/* Escalation Reason */}
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold', color: '#1a1a2e' }}>
                📝 Escalation Reason <span style={{ color: '#f44336', fontSize: '18px' }}>*</span>
              </h3>
              <textarea
                placeholder="Explain why this defect needs to be escalated to the Team Leader..."
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
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
                  setShowEscalateModal(false);
                  setSelectedDefect(null);
                  setEscalationReason('');
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
                }}>
                Cancel
              </button>
              <button
                onClick={submitEscalation}
                disabled={loading || !escalationReason.trim()}
                style={{
                  background: !escalationReason.trim() 
                    ? '#ccc' 
                    : 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '16px 32px',
                  borderRadius: '12px',
                  cursor: (!escalationReason.trim() || loading) ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  boxShadow: !escalationReason.trim() 
                    ? 'none' 
                    : '0 4px 15px rgba(233, 30, 99, 0.4)',
                  transition: 'all 0.3s ease'
                }}>
                {loading ? '⏳ Escalating...' : '🚨 Escalate Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showPhotoModal && selectedPhotos.length > 0 && (
        <div style={{
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
          padding: '20px'
        }}
        onClick={() => setShowPhotoModal(false)}>
          <div style={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
          onClick={(e) => e.stopPropagation()}>
            
            {/* Close Button */}
            <button
              onClick={() => setShowPhotoModal(false)}
              style={{
                position: 'absolute',
                top: '-50px',
                right: '0',
                background: 'white',
                color: '#333',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 10
              }}>
              ×
            </button>

            {/* Photo Counter */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              color: '#333',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              {currentPhotoIndex + 1} / {selectedPhotos.length}
            </div>

            {/* Main Photo */}
            <img
              src={selectedPhotos[currentPhotoIndex].startsWith('http') 
                ? selectedPhotos[currentPhotoIndex] 
                : `http://127.0.0.1:8000${selectedPhotos[currentPhotoIndex]}`
              }
              alt={`Photo ${currentPhotoIndex + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}
            />

            {/* Navigation Buttons */}
            {selectedPhotos.length > 1 && (
              <>
                <button
                  onClick={() => navigatePhoto('prev')}
                  style={{
                    position: 'absolute',
                    left: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'white',
                    color: '#333',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}>
                  ←
                </button>
                <button
                  onClick={() => navigatePhoto('next')}
                  style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'white',
                    color: '#333',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                  }}>
                  →
                </button>
              </>
            )}

            {/* Thumbnails */}
            {selectedPhotos.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '20px',
                maxWidth: '100%',
                overflowX: 'auto',
                padding: '10px'
              }}>
                {selectedPhotos.map((photo, idx) => {
                  const photoUrl = photo.startsWith('http') ? photo : `http://127.0.0.1:8000${photo}`;
                  return (
                    <img
                      key={idx}
                      src={photoUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: idx === currentPhotoIndex ? '3px solid #667eea' : '3px solid transparent',
                        cursor: 'pointer',
                        opacity: idx === currentPhotoIndex ? 1 : 0.5,
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setCurrentPhotoIndex(idx)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}