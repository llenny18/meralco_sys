import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface Photo {
  file: File;
  preview: string;
}

interface InspectionPhoto {
  photo_id: string;
  photo_file: string;
  photo_url: string;
  photo_url_full: string;
  caption: string;
  location_coordinates: string;
  uploaded_at: string;
}

export default function QIWebDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [completedInspections, setCompletedInspections] = useState([]);
  const [inspectionPhotos, setInspectionPhotos] = useState<InspectionPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<string | null>(null);
  const [stats, setStats] = useState({
    pending: 0,
    today: 0,
    thisWeek: 0,
    capacity: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('PENDING');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [showCompletedDetailModal, setShowCompletedDetailModal] = useState(false);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [submitErrors, setSubmitErrors] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Inspection form state
  const [inspectionForm, setInspectionForm] = useState({
    inspection_result: '',
    findings: '',
    recommendations: '',
    qi_remarks: '',
    photos: [] as Photo[],
    location_coordinates: '',
    is_completed: false
  });

  useEffect(() => {
    const storedUser = localStorage?.getItem('user');
    const userObj = storedUser ? JSON.parse(storedUser) : null;
    setUserId(userObj?.user_id || '1');
    setUserName(userObj?.first_name && userObj?.last_name 
      ? `${userObj.first_name} ${userObj.last_name}` 
      : userObj?.username || 'QI User');
    
    if (userObj?.user_id) {
      fetchAssignments(userObj.user_id);
      fetchCompletedInspections(userObj.user_id);
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
      
      const sorted = inspections.sort((a, b) => {
        const urgencyA = getUrgencyLevel(a);
        const urgencyB = getUrgencyLevel(b);
        return urgencyB - urgencyA;
      });
      
      setAssignments(sorted);
      calculateStats(sorted, completedInspections);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedInspections = async (qiId) => {
    try {
      const url = `${API_BASE_URL}/qi-inspections/?assigned_qi=${qiId}&is_completed=true&ordering=-completed_at`;
      const response = await fetch(url);
      const data = await response.json();
      const inspections = data.results || data || [];
      
      setCompletedInspections(inspections);
      calculateStats(assignments, inspections);
    } catch (err) {
      console.error('Error fetching completed inspections:', err);
    }
  };

  const fetchInspectionPhotos = async (inspectionId: number) => {
    setLoadingPhotos(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/qi-inspection-photos/?inspection_id=${inspectionId}`
      );
      const data = await response.json();
      const photos = data.results || data || [];
      setInspectionPhotos(photos);
    } catch (error) {
      console.error('Error fetching inspection photos:', error);
      setInspectionPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const calculateStats = (pendingInspections, completedInspectionsList) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);
    
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const stats = {
      pending: pendingInspections.length,
      today: pendingInspections.filter(i => {
        const schedDate = new Date(i.scheduled_date);
        return schedDate >= today && schedDate <= todayEnd;
      }).length,
      thisWeek: pendingInspections.filter(i => {
        const schedDate = new Date(i.scheduled_date);
        return schedDate >= today && schedDate <= weekEnd;
      }).length,
      capacity: pendingInspections.length > 0 ? Math.min(100, Math.round((pendingInspections.length / 15) * 100)) : 0,
      completed: completedInspectionsList.length
    };

    setStats(stats);
  };

  const getUrgencyLevel = (inspection) => {
    if (!inspection.scheduled_date) return 0;
    const daysUntil = Math.floor((new Date(inspection.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) return 3;
    if (daysUntil <= 7) return 2;
    return 1;
  };

  const getUrgencyBadge = (inspection) => {
    const level = getUrgencyLevel(inspection);
    if (level === 3) return { text: 'URGENT', color: '#f44336', icon: '🔴' };
    if (level === 2) return { text: 'DUE THIS WEEK', color: '#ff9800', icon: '🟡' };
    return { text: 'SCHEDULED', color: '#2196f3', icon: '🟢' };
  };

  const getResultBadge = (result) => {
    if (result === 'Pass') return { text: 'PASSED', color: '#4caf50', icon: '✅' };
    if (result === 'Conditional') return { text: 'CONDITIONAL', color: '#ff9800', icon: '⚠️' };
    if (result === 'Fail') return { text: 'FAILED', color: '#f44336', icon: '❌' };
    return { text: result, color: '#999', icon: '📋' };
  };

  const handleAcceptAssignment = async (inspectionId) => {
    const confirmed = window.confirm('Accept this inspection assignment?');
    if (!confirmed) return;

    setSubmitErrors([]);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/${inspectionId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assignment_status: 'ACCEPTED',
            accepted_at: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to accept assignment');
      }

      alert('✅ Assignment accepted successfully');
      fetchAssignments(userId);

    } catch (err) {
      console.error('Accept assignment error:', err);
      setSubmitErrors([err instanceof Error ? err.message : 'Failed to accept assignment.']);
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

  const handleViewCompletedDetails = async (inspection) => {
    setLoading(true);
    setInspectionPhotos([]);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/${inspection.inspection_id}/`);
      const data = await response.json();
      setSelectedAssignment(data);
      setShowCompletedDetailModal(true);
      
      // Fetch photos for this inspection
      fetchInspectionPhotos(inspection.inspection_id);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartInspection = async (inspection) => {
    setSelectedAssignment(inspection);
    setSubmitErrors([]);
    setInspectionForm({
      inspection_result: '',
      findings: '',
      recommendations: '',
      qi_remarks: '',
      photos: [],
      location_coordinates: '',
      is_completed: false
    });
    setShowInspectionModal(true);
  };

  const handleInspectionFormChange = (field, value) => {
    setInspectionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files) as File[];
    const newPhotos: Photo[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setInspectionForm(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const handleRemovePhoto = (index: number) => {
    setInspectionForm(prev => {
      const newPhotos = [...prev.photos];
      URL.revokeObjectURL(newPhotos[index].preview);
      newPhotos.splice(index, 1);
      return {
        ...prev,
        photos: newPhotos
      };
    });
  };

  const handleSubmitInspection = async () => {
    const errors = [];

    if (!inspectionForm.inspection_result) {
      errors.push('Inspection result is required.');
    }

    if (!inspectionForm.findings) {
      errors.push('Findings are required.');
    }

    if (!inspectionForm.qi_remarks) {
      errors.push('QI remarks are required.');
    }

    if (errors.length > 0) {
      setSubmitErrors(errors);
      return;
    }

    if (!confirm('Submit this inspection? This action cannot be undone.')) {
      return;
    }

    setSubmitErrors([]);
    setLoading(true);
    setUploadProgress(0);

    try {
       const inspectionData = {
      inspection_result: inspectionForm.inspection_result,
      findings: inspectionForm.findings,
      recommendations: inspectionForm.recommendations,
      inspection_date: new Date().toISOString().split('T')[0],
      location_coordinates: inspectionForm.location_coordinates,
      is_completed: true,
      photos_uploaded: inspectionForm.photos.length > 0
    };

    const inspectionResponse = await fetch(
      `${API_BASE_URL}/qi-inspections/${selectedAssignment.inspection_id}/`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspectionData)
      }
    );

    if (!inspectionResponse.ok) {
      const errorData = await inspectionResponse.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.error || 'Failed to update inspection');
    }

    setUploadProgress(20);

    // ============================================
    // 🔥 NEW: Trigger Auto-Detection for FAILED Inspections
    // ============================================
     let defectReportId = null;
    let defectCreationError = null;

    if (inspectionForm.inspection_result === 'Fail') {
      console.log('🚨 Creating defect report for failed inspection...');
      
      try {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 7); // 7 days to correct

        const defectPayload = {
          inspection: selectedAssignment.inspection_id,
          project: selectedAssignment.project,
          defect_type: 'Failed Inspection',
          defect_category: 'Quality Issue',
          severity: 'MAJOR',
          description: inspectionForm.findings,
          qi_notes: inspectionForm.recommendations || 'No additional recommendations',
          qi_signature: `QI-${userName}-${Date.now()}`,
          created_by: parseInt(userId),
          correction_due_date: dueDate.toISOString().split('T')[0],
          correction_status: 'OPEN',
          related_checklist_items: [],
          photos: [],
          location_gps: inspectionForm.location_coordinates || ''
        };

        console.log('📤 Sending defect report payload:', defectPayload);
      const authToken = localStorage.getItem('auth_token');

const defectResponse = await fetch(
  `${API_BASE_URL}/defect-reports/`,
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${authToken}`,
    },
    body: JSON.stringify(defectPayload),
  }
);


        const responseText = await defectResponse.text();
        console.log('📥 Defect report response:', responseText);

        if (!defectResponse.ok) {
          let errorMessage = `HTTP ${defectResponse.status}`;
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = JSON.stringify(errorData, null, 2);
          } catch {
            errorMessage = responseText;
          }
          throw new Error(`Failed to create defect report: ${errorMessage}`);
        }

        const defectData = JSON.parse(responseText);
        defectReportId = defectData.defect_id;
        console.log('✅ Defect report created successfully:', defectData);

      } catch (defectError) {
        console.error('❌ Defect report creation failed:', defectError);
        defectCreationError = defectError.message;
        // Continue with inspection submission but track the error
      }
    }

    setUploadProgress(25);

      // 2. Upload photos if any
      let uploadedPhotosCount = 0;
      if (inspectionForm.photos.length > 0) {
        const totalPhotos = inspectionForm.photos.length;
        
        for (let i = 0; i < inspectionForm.photos.length; i++) {
          const photo = inspectionForm.photos[i];
          try {
            const formData = new FormData();
            formData.append('inspection', selectedAssignment.inspection_id.toString());
            formData.append('photo_file', photo.file);
            formData.append('caption', `QI Inspection - ${inspectionForm.inspection_result}`);
            formData.append('location_coordinates', inspectionForm.location_coordinates || '');
            formData.append('uploaded_by', userId);

            const photoResponse = await fetch(`${API_BASE_URL}/qi-inspection-photos/`, {
              method: 'POST',
              body: formData
            });

            if (photoResponse.ok) {
              uploadedPhotosCount++;
              setUploadProgress(25 + ((i + 1) / totalPhotos) * 25);
            }
          } catch (photoError) {
            console.warn('Photo upload failed:', photoError);
          }
        }
      }

      setUploadProgress(50);

      // 3. Fetch work orders for this project
      let workOrders = [];
      try {
        const workOrdersResponse = await fetch(
          `${API_BASE_URL}/work-orders/?project_id=${selectedAssignment.project}`
        );
        
        if (workOrdersResponse.ok) {
          const workOrdersData = await workOrdersResponse.json();
          workOrders = workOrdersData.results || workOrdersData || [];
        }
      } catch (woError) {
        console.warn('Failed to fetch work orders:', woError);
      }

      setUploadProgress(65);

      // 4. Update work orders with QI remarks
      let updatedWOCount = 0;
      if (workOrders.length > 0) {
        const remarkText = `[QI: ${userName}] ${inspectionForm.qi_remarks}`;
        const currentDate = new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        for (let i = 0; i < workOrders.length; i++) {
          const workOrder = workOrders[i];
          try {
            const existingRemarks = workOrder.remarks_follow_up || '';
            const newRemarks = existingRemarks 
              ? `${existingRemarks}\n\n[${currentDate}] ${remarkText}`
              : `[${currentDate}] ${remarkText}`;

            const woResponse = await fetch(`${API_BASE_URL}/work-orders/${workOrder.id}/`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                remarks_follow_up: newRemarks,
                date_audit: new Date().toISOString().split('T')[0],
                audit_by: userName
              })
            });

            if (woResponse.ok) {
              updatedWOCount++;
              setUploadProgress(65 + ((i + 1) / workOrders.length) * 35);
            }
          } catch (woUpdateError) {
            console.warn(`Failed to update work order ${workOrder.id}:`, woUpdateError);
          }
        }
      }

      setUploadProgress(100);

       let alertMessage = '✅ Inspection submitted successfully!\n\n' +
          `• Inspection completed\n` +
          `• ${uploadedPhotosCount} photo(s) uploaded\n` +
          `• ${updatedWOCount} work order(s) updated with your remarks`;
 

    alert(alertMessage);
      
      // Clean up photo previews
      inspectionForm.photos.forEach(photo => URL.revokeObjectURL(photo.preview));
      
      setShowInspectionModal(false);
      setSelectedAssignment(null);
      setInspectionForm({
        inspection_result: '',
        findings: '',
        recommendations: '',
        qi_remarks: '',
        photos: [],
        location_coordinates: '',
        is_completed: false
      });
      fetchAssignments(userId);
      fetchCompletedInspections(userId);

    } catch (err) {
      console.error('Error submitting inspection:', err);
      setSubmitErrors([err instanceof Error ? err.message : 'Failed to submit inspection. Please check the console for details.']);
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Your inspection queue and schedule • Logged in as: <strong>{userName}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
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
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>COMPLETED</div>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#4caf50' }}>{stats.completed}</div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>Total finished</div>
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

      {/* Tab Navigation */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('PENDING')}
            style={{
              background: activeTab === 'PENDING' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white',
              color: activeTab === 'PENDING' ? 'white' : '#666',
              border: activeTab === 'PENDING' ? 'none' : '1px solid #ddd',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'PENDING' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}>
            📋 Pending Assignments ({stats.pending})
          </button>
          <button
            onClick={() => setActiveTab('COMPLETED')}
            style={{
              background: activeTab === 'COMPLETED' ? 'linear-gradient(45deg, #667eea, #764ba2)' : 'white',
              color: activeTab === 'COMPLETED' ? 'white' : '#666',
              border: activeTab === 'COMPLETED' ? 'none' : '1px solid #ddd',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: activeTab === 'COMPLETED' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}>
            ✅ Completed Inspections ({stats.completed})
          </button>
        </div>
      </div>

      {/* Filters (only for pending) */}
      {activeTab === 'PENDING' && (
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
      )}

      {/* Pending Assignments View */}
      {activeTab === 'PENDING' && (
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

                        <button
                          onClick={() => handleStartInspection(assignment)}
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
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Completed Inspections View */}
      {activeTab === 'COMPLETED' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>✅ Completed Inspections</h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ fontSize: '16px', margin: 0 }}>Loading completed inspections...</p>
            </div>
          ) : completedInspections.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
              <p style={{ fontSize: '18px', margin: 0 }}>No completed inspections yet</p>
              <p style={{ fontSize: '14px', margin: '8px 0 0 0' }}>Completed inspections will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {completedInspections.map(inspection => {
                const result = getResultBadge(inspection.inspection_result);
                
                return (
                  <div key={inspection.inspection_id} style={{
                    border: `2px solid ${result.color}`,
                    borderRadius: '12px',
                    padding: '24px',
                    background: '#f9f9f9',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.15)'}
                  onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                          <h3 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>
                            Project #{inspection.project}
                          </h3>
                          <span style={{
                            background: result.color,
                            color: 'white',
                            padding: '6px 16px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {result.icon} {result.text}
                          </span>
                          {inspection.is_reinspection && (
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
                          {inspection.photos_uploaded && (
                            <span style={{
                              background: '#2196f3',
                              color: 'white',
                              padding: '6px 16px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              📷 Has Photos
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>📅 INSPECTION DATE</div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                              {inspection.inspection_date ? new Date(inspection.inspection_date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              }) : 'N/A'}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>✅ COMPLETED AT</div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                              {inspection.completed_at ? new Date(inspection.completed_at).toLocaleString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'N/A'}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>📋 TYPE</div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1a1a2e' }}>
                              {inspection.inspection_type_name || 'General Inspection'}
                            </div>
                          </div>

                          <div>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>🔍 RESULT</div>
                            <div style={{ fontSize: '15px', fontWeight: 'bold', color: result.color }}>
                              {inspection.inspection_result || 'N/A'}
                            </div>
                          </div>
                        </div>

                        {inspection.findings && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: 'bold' }}>FINDINGS:</div>
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#1a1a2e', 
                              lineHeight: '1.5',
                              padding: '12px',
                              background: '#f5f5f5',
                              borderRadius: '8px',
                              maxHeight: '80px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {inspection.findings}
                            </div>
                          </div>
                        )}

                        {inspection.project_location && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                            <span style={{ fontSize: '14px', color: '#666' }}>📍</span>
                            <span style={{ fontSize: '14px', color: '#666' }}>{inspection.project_location}</span>
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '180px' }}>
                        <button
                          onClick={() => handleViewCompletedDetails(inspection)}
                          style={{
                            background: 'linear-gradient(45deg, #667eea, #764ba2)',
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
                          📄 View Full Report
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal (Pending) */}
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
              <div style={{ borderRadius: '8px', padding: '16px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>SCHEDULED DATE</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {new Date(selectedAssignment.scheduled_date).toLocaleDateString()}
                </div>
              </div>
              <div style={{ borderRadius: '8px', padding: '16px' }}>
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

      {/* Completed Detail Modal with Photos */}
      {showCompletedDetailModal && selectedAssignment && (
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
            maxWidth: '1000px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '24px' }}>
              <div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>
                  📋 Inspection Report
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Project #{selectedAssignment.project} • {selectedAssignment.inspection_type_name || 'General Inspection'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCompletedDetailModal(false);
                  setInspectionPhotos([]);
                }}
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

            {/* Result Badge */}
            <div style={{ marginBottom: '24px' }}>
              {(() => {
                const result = getResultBadge(selectedAssignment.inspection_result);
                return (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: result.color,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold'
                  }}>
                    {result.icon} {result.text}
                  </div>
                );
              })()}
            </div>

            {/* Inspection Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>INSPECTION DATE</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {selectedAssignment.inspection_date ? new Date(selectedAssignment.inspection_date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
              <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>COMPLETED AT</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  {selectedAssignment.completed_at ? new Date(selectedAssignment.completed_at).toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </div>
              </div>
            </div>

            {/* Findings */}
            {selectedAssignment.findings && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>🔍 Findings</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#f5f5f5', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#1a1a2e',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedAssignment.findings}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {selectedAssignment.recommendations && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>💡 Recommendations</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#f0f9ff', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#1a1a2e',
                  whiteSpace: 'pre-wrap'
                }}>
                  {selectedAssignment.recommendations}
                </div>
              </div>
            )}

            {/* Inspection Photos Section */}
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                📷 Inspection Photos
                {loadingPhotos && <span style={{ fontSize: '14px', color: '#999' }}>(Loading...)</span>}
              </h3>
              
              {loadingPhotos ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                  <p style={{ fontSize: '14px', margin: 0 }}>Loading photos...</p>
                </div>
              ) : inspectionPhotos.length === 0 ? (
                <div style={{ 
                  padding: '32px', 
                  background: '#f5f5f5', 
                  borderRadius: '8px', 
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
                  <p style={{ fontSize: '14px', margin: 0 }}>No photos uploaded for this inspection</p>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#666', 
                    marginBottom: '12px',
                    padding: '8px 12px',
                    background: '#e3f2fd',
                    borderRadius: '6px',
                    display: 'inline-block'
                  }}>
                    {inspectionPhotos.length} photo{inspectionPhotos.length !== 1 ? 's' : ''} • Click to view full size
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
                    gap: '16px' 
                  }}>
                    {inspectionPhotos.map((photo, index) => (
                      <div 
                        key={photo.photo_id} 
                        style={{
                          border: '2px solid #e0e0e0',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: 'white',
                          transition: 'all 0.2s',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={() => setSelectedPhotoModal(photo.photo_url_full || photo.photo_file)}>
                        <div style={{ position: 'relative', paddingTop: '75%', background: '#f5f5f5' }}>
                          <img 
                            src={photo.photo_url_full || photo.photo_file} 
                            alt={photo.caption || `Inspection Photo ${index + 1}`}
                            style={{ 
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover'
                            }}
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%23f0f0f0" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="%23999" font-size="16"%3EImage Error%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                        {(photo.caption || photo.uploaded_at) && (
                          <div style={{
                            padding: '12px',
                            background: 'white',
                            borderTop: '1px solid #e0e0e0'
                          }}>
                            {photo.caption && (
                              <div style={{
                                fontSize: '13px',
                                color: '#1a1a2e',
                                marginBottom: '4px',
                                fontWeight: '500',
                                lineHeight: '1.4'
                              }}>
                                {photo.caption}
                              </div>
                            )}
                            {photo.uploaded_at && (
                              <div style={{
                                fontSize: '11px',
                                color: '#999',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                🕒 {new Date(photo.uploaded_at).toLocaleString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            {selectedAssignment.location_coordinates && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>📍 Location Coordinates</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#f5f5f5', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  color: '#1a1a2e'
                }}>
                  {selectedAssignment.location_coordinates}
                </div>
              </div>
            )}

            {/* Project Description */}
            {selectedAssignment.project_description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>📄 Project Description</h3>
                <div style={{ 
                  padding: '16px', 
                  background: '#f5f5f5', 
                  borderRadius: '8px', 
                  fontSize: '14px', 
                  lineHeight: '1.6', 
                  color: '#1a1a2e'
                }}>
                  {selectedAssignment.project_description}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
              <button
                onClick={() => {
                  setShowCompletedDetailModal(false);
                  setInspectionPhotos([]);
                }}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhotoModal && (
        <div 
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
            padding: '20px'
          }}
          onClick={() => setSelectedPhotoModal(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button
              onClick={() => setSelectedPhotoModal(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              ×
            </button>
            <img 
              src={selectedPhotoModal} 
              alt="Full size inspection photo"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '90vh', 
                borderRadius: '8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {showInspectionModal && selectedAssignment && (
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
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>
                  🔍 Conduct Inspection
                </h2>
                <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
                  Project #{selectedAssignment.project} • {selectedAssignment.inspection_type_name || 'General Inspection'}
                </p>
                {submitErrors.length > 0 && (
                  <div style={{
                    background: '#fdecea',
                    border: '1px solid #f44336',
                    color: '#b71c1c',
                    padding: '16px',
                    borderRadius: '8px',
                    marginTop: '12px'
                  }}>
                    <strong>⚠️ Submission Error{submitErrors.length > 1 ? 's' : ''}:</strong>
                    <ul style={{ margin: '8px 0 0 20px' }}>
                      {submitErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowInspectionModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '32px',
                  cursor: 'pointer',
                  color: '#999',
                  padding: 0,
                  lineHeight: 1,
                  marginLeft: '16px'
                }}>
                ×
              </button>
            </div>

            {/* Upload Progress Bar */}
            {loading && uploadProgress > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Uploading...</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#667eea' }}>{uploadProgress}%</span>
                </div>
                <div style={{ width: '100%', background: '#e0e0e0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${uploadProgress}%`,
                    height: '100%',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            )}

            {/* Inspection Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Inspection Result */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                  Inspection Result *
                </label>
                <select
                  value={inspectionForm.inspection_result}
                  onChange={(e) => handleInspectionFormChange('inspection_result', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}>
                  <option value="">Select result...</option>
                  <option value="Pass">✅ PASSED</option>
                  <option value="Conditional">⚠️ CONDITIONAL</option>
                  <option value="Fail">❌ FAILED</option>
                </select>
              </div>

              {/* Findings */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                  Findings *
                </label>
                <textarea
                  value={inspectionForm.findings}
                  onChange={(e) => handleInspectionFormChange('findings', e.target.value)}
                  placeholder="Describe what you found during the inspection..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    minHeight: '100px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Recommendations */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                  Recommendations
                </label>
                <textarea
                  value={inspectionForm.recommendations}
                  onChange={(e) => handleInspectionFormChange('recommendations', e.target.value)}
                  placeholder="Any recommendations for improvement or corrective actions..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* QI Remarks */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                  QI Remarks for Work Order *
                </label>
                <textarea
                  value={inspectionForm.qi_remarks}
                  onChange={(e) => handleInspectionFormChange('qi_remarks', e.target.value)}
                  placeholder="This will be added to the work order's remarks_follow_up field with your name..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    minHeight: '80px',
                    resize: 'vertical',
                    background: '#f0f9ff',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  💡 This will appear in work orders as: [QI: {userName}] {inspectionForm.qi_remarks || '...'}
                </p>
              </div>

              {/* Location */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                  Location Coordinates
                </label>
                <input
                  type="text"
                  value={inspectionForm.location_coordinates}
                  onChange={(e) => handleInspectionFormChange('location_coordinates', e.target.value)}
                  placeholder="e.g., 14.5995, 120.9842 (optional)"
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
                  Inspection Photos
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px dashed #ddd',
                    fontSize: '14px',
                    cursor: 'pointer',
                    background: '#fafafa'
                  }}
                />
                
                {/* Photo Preview Grid */}
                {inspectionForm.photos.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      📷 {inspectionForm.photos.length} photo(s) selected
                    </p>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
                      gap: '12px' 
                    }}>
                      {inspectionForm.photos.map((photo, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img 
                            src={photo.preview} 
                            alt={`Preview ${index + 1}`}
                            style={{ 
                              width: '100%', 
                              height: '120px', 
                              objectFit: 'cover', 
                              borderRadius: '8px',
                              border: '2px solid #e0e0e0'
                            }}
                          />
                          <button
                            onClick={() => handleRemovePhoto(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '16px',
                              lineHeight: '24px',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                            ×
                          </button>
                          <div style={{
                            fontSize: '11px',
                            color: '#666',
                            marginTop: '4px',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {photo.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #eee' }}>
                <button
                  onClick={() => setShowInspectionModal(false)}
                  disabled={loading}
                  style={{
                    background: '#fff',
                    color: '#666',
                    border: '1px solid #ddd',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    opacity: loading ? 0.5 : 1
                  }}>
                  Cancel
                </button>
                <button
                  onClick={handleSubmitInspection}
                  disabled={loading}
                  style={{
                    background: loading ? '#ccc' : 'linear-gradient(45deg, #4caf50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: '14px 28px',
                    borderRadius: '8px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(76, 175, 80, 0.3)'
                  }}>
                  {loading ? '⏳ Submitting...' : '✅ Submit Inspection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}