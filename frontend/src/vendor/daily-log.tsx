import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function VendorActivityDashboard() {
  const [activities, setActivities] = useState([]);
  const [todayActivity, setTodayActivity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSignOnModal, setShowSignOnModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [vendorId, setVendorId] = useState('');
  
  // Dropdown options
  const [offices, setOffices] = useState([]);
  const [teamLeaders, setTeamLeaders] = useState([]);
  const [designEngineers, setDesignEngineers] = useState([]);
  const [crews, setCrews] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  
  const [formData, setFormData] = useState({
    office: '', team_leader: '', design_engineer: '', crew_name: '',
    activity_description: '', has_caution: false, caution_details: '',
    work_orders: [], crew_composition: {}
  });
  
  const [photoData, setPhotoData] = useState({
    photo_type: 'SIGN_ON', caption: '', photo_file: null
  });

  useEffect(() => {
    const userRole = localStorage?.getItem('userRole');
    if (userRole !== 'vendor') {
      window.location.href = '/unauthorized';
      return;
    }
    
    const storedVendorId = localStorage?.getItem('user')?.user_id || '1';
    setVendorId(storedVendorId);
    fetchTodayActivity(storedVendorId);
    fetchWeeklyActivities(storedVendorId);
    
    // Fetch dropdown data
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      // Fetch sectors for offices
      const sectorsRes = await fetch(`${API_BASE_URL}/sectors/`);
      if (sectorsRes.ok) {
        const sectorsData = await sectorsRes.json();
        setOffices(sectorsData.results || sectorsData || []);
      }
      
      // Fetch users with Team Leader role
      const usersRes = await fetch(`${API_BASE_URL}/users/`);
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        const allUsers = usersData.results || usersData || [];
        console.log('Fetched users:', allUsers);
        
        // Filter team leaders
        const leaders = allUsers.filter(u => 
          u.role_name?.toLowerCase().includes('team leader')
        );
        setTeamLeaders(leaders);
        console.log('Filtered team leaders:', leaders);

        // Filter design engineers
        const engineers = allUsers.filter(u =>
          u.role_name?.toLowerCase() === 'engineer'
        );

        setDesignEngineers(engineers);
        console.log('Filtered design engineers:', engineers);
      }
      
      // Fetch crew types
      const crewRes = await fetch(`${API_BASE_URL}/crew-types/`);
      if (crewRes.ok) {
        const crewData = await crewRes.json();
        setCrews(crewData.results || crewData || []);
      }
      
      // Fetch work orders
      const woRes = await fetch(`${API_BASE_URL}/work-orders/?status=INPRG`);
      if (woRes.ok) {
        const woData = await woRes.json();
        setWorkOrders(woData.results || woData || []);
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err);
    }
  };

  const fetchTodayActivity = async (vId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-daily-activities/today_activities/?vendor_id=${vId}`);
      if (!response.ok) throw new Error('Failed to fetch today\'s activity');
      const data = await response.json();
      if (data && data.length > 0) setTodayActivity(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyActivities = async (vId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-daily-activities/weekly_summary/?vendor_id=${vId}`);
      if (!response.ok) throw new Error('Failed to fetch weekly activities');
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (err) {
      console.error('Error fetching weekly activities:', err);
    }
  };

  const handleSignOn = async () => {
    if (!vendorId) {
      setError('Vendor ID not found');
      return;
    }

    try {
      const payload = {
        vendor: vendorId,
        activity_date: new Date().toISOString().split('T')[0],
        ...formData,
        signed_on_by: localStorage?.getItem('user')?.user_id || 0
      };

      const response = await fetch(`${API_BASE_URL}/vendor-daily-activities/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      setSuccessMessage('Successfully signed on for today!');
      setShowSignOnModal(false);
      fetchTodayActivity(vendorId);
      fetchWeeklyActivities(vendorId);
      
      setFormData({
        office: '', team_leader: '', design_engineer: '', crew_name: '',
        activity_description: '', has_caution: false, caution_details: '',
        work_orders: [], crew_composition: {}
      });
    } catch (err) {
      setError('Error signing on: ' + err.message);
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoData.photo_file || !selectedActivity) {
      setError('Please select a photo and activity');
      return;
    }
    const userVal = JSON.parse(localStorage?.getItem('user'));
    console.log(userVal);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('photo', photoData.photo_file);
      formDataToSend.append('photo_type', photoData.photo_type);
      formDataToSend.append('caption', photoData.caption);
      formDataToSend.append('uploaded_by', userVal?.user_id || 0);

      const response = await fetch(
        `${API_BASE_URL}/vendor-daily-activities/${selectedActivity.activity_id}/upload_photo/`,
        { method: 'POST', body: formDataToSend }
      );

      if (!response.ok) throw new Error('Failed to upload photo');

      setSuccessMessage('Photo uploaded successfully!');
      setShowPhotoModal(false);
      fetchTodayActivity(vendorId);
      setPhotoData({ photo_type: 'SIGN_ON', caption: '', photo_file: null });
    } catch (err) {
      setError('Error uploading photo: ' + err.message);
    }
  };

  const handleMarkCompleted = async (activityId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/vendor-daily-activities/${activityId}/mark_completed/`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ completion_notes: 'Work completed' })
        }
      );

      if (!response.ok) throw new Error('Failed to mark as completed');

      setSuccessMessage('Activity marked as completed!');
      fetchTodayActivity(vendorId);
      fetchWeeklyActivities(vendorId);
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const addWorkOrder = () => {
    setFormData(prev => ({
      ...prev,
      work_orders: [...prev.work_orders, { wo_no: '', location: '', nature_of_work: '', circuit: '', tln: '' }]
    }));
  };

  const updateWorkOrder = (index, field, value) => {
    const updated = [...formData.work_orders];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, work_orders: updated }));
  };

  const removeWorkOrder = (index) => {
    const updated = [...formData.work_orders];
    updated.splice(index, 1);
    setFormData(prev => ({ ...prev, work_orders: updated }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SIGNED_ON': return '#2196f3';
      case 'IN_PROGRESS': return '#ff9800';
      case 'COMPLETED': return '#4caf50';
      case 'CAUTION': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>📋 Daily Activity Sign-On</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {!todayActivity && (
            <button
              onClick={() => setShowSignOnModal(true)}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              ➕ Sign On Today
            </button>
          )}
        </div>
      </div>

      {/* Today's Activity */}
      {todayActivity && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>Today's Activity</h2>
              <span style={{
                background: getStatusColor(todayActivity.status),
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {todayActivity.status.replace('_', ' ')}
              </span>
              {todayActivity.has_caution && (
                <span style={{
                  background: '#f44336',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  ⚠️ CAUTION
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setSelectedActivity(todayActivity); setShowPhotoModal(true); }}
                style={{
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                📷 Add Photo
              </button>
              {todayActivity.status !== 'COMPLETED' && (
                <button
                  onClick={() => handleMarkCompleted(todayActivity.activity_id)}
                  style={{
                    background: '#4caf50',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ✅ Mark Complete
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Office Details */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '18px' }}>🏢 Office Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <p style={{ margin: 0, color: '#1a1a2e' }}><strong>Office:</strong> {todayActivity.office}</p>
                <p style={{ margin: 0, color: '#1a1a2e' }}><strong>Team Leader:</strong> {todayActivity.team_leader}</p>
                <p style={{ margin: 0, color: '#1a1a2e' }}><strong>Design Engineer:</strong> {todayActivity.design_engineer}</p>
                <p style={{ margin: 0, color: '#1a1a2e' }}><strong>Crew:</strong> {todayActivity.crew_name}</p>
              </div>
            </div>

            {/* Work Orders */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#667eea', fontSize: '18px' }}>📍 Work Orders</h3>
              {todayActivity.work_orders && todayActivity.work_orders.length > 0 ? (
                todayActivity.work_orders.map((wo, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: idx < todayActivity.work_orders.length - 1 ? '1px solid #ddd' : 'none' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '14px', color: '#1a1a2e' }}>{wo.wo_no}</p>
                    <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: '#1a1a2e' }}>{wo.location}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#1a1a2e' }}>{wo.nature_of_work}</p>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>No work orders</p>
              )}
            </div>
          </div>

          {/* Activity Description */}
          <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>📝 Activity Description</h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#1a1a2e' }}>{todayActivity.activity_description}</p>
          </div>

          {/* Photos */}
          <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e' }}>
              📸 Activity Photos ({todayActivity.photos?.length || 0})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {todayActivity.photos && todayActivity.photos.length > 0 ? (
                todayActivity.photos.map((photo, idx) => (
                  <div key={idx} style={{ border: '2px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      src={photo.photo_url || photo.photo_file}
                      alt={photo.caption}
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                    />
                    <p style={{ margin: '8px', fontSize: '12px', color: '#666' }}>{photo.caption}</p>
                  </div>
                ))
              ) : (
                <p style={{ margin: 0, color: '#999', fontSize: '14px', color: '#1a1a2e' }}>No photos uploaded yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📅 Recent Activities (Last 7 Days)</h2>
        {activities.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#1a1a2e' }}>
            {activities.map((activity) => (
              <div
                key={activity.activity_id}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'box-shadow 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1a1a2e' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{activity.crew_name}</h3>
                    <span style={{
                      background: getStatusColor(activity.status),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {activity.status}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#1a1a2e' }}>
                    {new Date(activity.activity_date).toLocaleDateString()}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1a1a2e' }}>
                    {activity.office} - {activity.team_leader}
                  </p>
                </div>
                <div style={{
                  background: '#2196f3',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '50%',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  📸 {activity.photos?.length || 0}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px 0', fontSize: '16px' }}>
            No activities in the past week
          </p>
        )}
      </div>

      {/* Sign On Modal */}
      {showSignOnModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
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
            padding: '24px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>📋 Sign On for Today</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              {/* Office Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Office</label>
                <select
                  value={formData.office}
                  onChange={(e) => setFormData({...formData, office: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                >
                  <option value="">Select Office</option>
                  {offices.map((office) => (
                    <option key={office.sector_id} value={office.sector_name}>
                      {office.sector_code} - {office.sector_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Team Leader Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Team Leader</label>
                <select
                  value={formData.team_leader}
                  onChange={(e) => setFormData({...formData, team_leader: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                >
                  <option value="">Select Team Leader</option>
                  {teamLeaders.map((leader) => (
                    <option key={leader.user_id} value={`${leader.first_name} ${leader.last_name}`}>
                      {leader.first_name} {leader.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Design Engineer Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Design Engineer</label>
                <select
                  value={formData.design_engineer}
                  onChange={(e) => setFormData({...formData, design_engineer: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                >
                  <option value="">Select Design Engineer</option>
                  {designEngineers.map((engineer) => (
                    <option key={engineer.user_id} value={`${engineer.first_name} ${engineer.last_name}`}>
                      {engineer.first_name} {engineer.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crew Name Dropdown */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Crew Name</label>
                <select
                  value={formData.crew_name}
                  onChange={(e) => setFormData({...formData, crew_name: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' }}
                >
                  <option value="">Select Crew</option>
                  {crews.map((crew) => (
                    <option key={crew.crew_code} value={crew.crew_name}>
                      {crew.crew_code} - {crew.crew_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Work Orders Section */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Work Orders</label>
                <button
                  onClick={addWorkOrder}
                  style={{
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  + Add Work Order
                </button>
              </div>

              {formData.work_orders.map((wo, idx) => (
                <div key={idx} style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '12px', position: 'relative' }}>
                  <button
                    onClick={() => removeWorkOrder(idx)}
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
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>

                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold' }}>WO Number</label>
                  <select
                    value={wo.wo_no}
                    onChange={(e) => {
                      const selectedWO = workOrders.find(w => w.wo_no === e.target.value);
                      if (selectedWO) {
                        updateWorkOrder(idx, 'wo_no', selectedWO.wo_no);
                        updateWorkOrder(idx, 'location', selectedWO.location || '');
                        updateWorkOrder(idx, 'nature_of_work', selectedWO.description || '');
                      } else {
                        updateWorkOrder(idx, 'wo_no', e.target.value);
                      }
                    }}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  >
                    <option value="">Select Work Order</option>
                    {workOrders.map((order) => (
                      <option key={order.wo_no} value={order.wo_no}>
                        {order.wo_no} - {order.description?.substring(0, 50)}
                      </option>
                    ))}
                  </select>

                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold' }}>Location</label>
                  <input
                    type="text"
                    placeholder="Location"
                    value={wo.location}
                    onChange={(e) => updateWorkOrder(idx, 'location', e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                  />

                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold' }}>Nature of Work</label>
                  <textarea
                    placeholder="Nature of Work"
                    value={wo.nature_of_work}
                    onChange={(e) => updateWorkOrder(idx, 'nature_of_work', e.target.value)}
                    style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px', minHeight: '60px' }}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold' }}>Circuit</label>
                      <input
                        type="text"
                        placeholder="Circuit"
                        value={wo.circuit}
                        onChange={(e) => updateWorkOrder(idx, 'circuit', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '13px', fontWeight: 'bold' }}>TLN</label>
                      <input
                        type="text"
                        placeholder="TLN"
                        value={wo.tln}
                        onChange={(e) => updateWorkOrder(idx, 'tln', e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <textarea
              placeholder="Activity Description"
              value={formData.activity_description}
              onChange={(e) => setFormData({...formData, activity_description: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px', minHeight: '100px', fontSize: '14px' }}
            />

            <button
              onClick={() => setFormData({...formData, has_caution: !formData.has_caution})}
              style={{
                background: formData.has_caution ? '#f44336' : '#fff',
                color: formData.has_caution ? 'white' : '#f44336',
                border: '2px solid #f44336',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              ⚠️ {formData.has_caution ? 'Caution Required' : 'No Caution'}
            </button>

            {formData.has_caution && (
              <textarea
                placeholder="Caution Details"
                value={formData.caution_details}
                onChange={(e) => setFormData({...formData, caution_details: e.target.value})}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px', minHeight: '80px', fontSize: '14px' }}
              />
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSignOnModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSignOn}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Sign On
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Upload Modal */}
      {showPhotoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>📷 Upload Photo</h2>
            
            <select
              value={photoData.photo_type}
              onChange={(e) => setPhotoData({...photoData, photo_type: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px', fontSize: '14px' }}
            >
              <option value="SIGN_ON">Sign On Photo</option>
              <option value="PROGRESS">Progress Photo</option>
              <option value="COMPLETION">Completion Photo</option>
              <option value="CAUTION">Caution/Safety Photo</option>
            </select>

            <input
              type="text"
              placeholder="Caption"
              value={photoData.caption}
              onChange={(e) => setPhotoData({...photoData, caption: e.target.value})}
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '16px', fontSize: '14px' }}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoData({...photoData, photo_file: e.target.files?.[0] || null})}
              style={{ width: '100%', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowPhotoModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePhotoUpload}
                style={{
                  background: '#2196f3',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#4caf50',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 2000,
          fontSize: '14px'
        }}>
          ✅ {successMessage}
        </div>
      )}
      
      {error && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#f44336',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 2000,
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}