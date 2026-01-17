import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function QIInspectionInterface() {
  const [inspection, setInspection] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [notes, setNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Project-specific checklists
  const checklistTemplates = {
    'Electrical': [
      { id: 1, item: 'Service entrance properly installed', required: true },
      { id: 2, item: 'Meter base secure and accessible', required: true },
      { id: 3, item: 'Grounding system compliant', required: true },
      { id: 4, item: 'Circuit breakers labeled correctly', required: true },
      { id: 5, item: 'Wiring meets code standards', required: true },
      { id: 6, item: 'No exposed conductors', required: true },
      { id: 7, item: 'Panel clearances adequate', required: false },
      { id: 8, item: 'Load calculations verified', required: false }
    ],
    'Civil': [
      { id: 1, item: 'Foundation depth meets specs', required: true },
      { id: 2, item: 'Concrete strength verified', required: true },
      { id: 3, item: 'Rebar placement correct', required: true },
      { id: 4, item: 'Formwork properly aligned', required: true },
      { id: 5, item: 'Drainage system functional', required: false }
    ],
    'Mechanical': [
      { id: 1, item: 'Equipment properly anchored', required: true },
      { id: 2, item: 'Clearances meet requirements', required: true },
      { id: 3, item: 'Ventilation adequate', required: true },
      { id: 4, item: 'Safety guards installed', required: true },
      { id: 5, item: 'Lubrication points accessible', required: false }
    ]
  };

  useEffect(() => {
    // Get inspection from URL params or localStorage
    const inspectionId = new URLSearchParams(window.location.search).get('id');
    if (inspectionId) {
      fetchInspectionDetails(inspectionId);
    }

    // Get GPS location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: new Date().toISOString()
          });
        },
        (error) => console.error('GPS Error:', error)
      );
    }

    // Check online/offline status
    const handleOnline = () => setOfflineMode(false);
    const handleOffline = () => setOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchInspectionDetails = async (inspectionId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/qi-inspections/${inspectionId}/`);
      const data = await response.json();
      setInspection(data);

      // Load appropriate checklist
      const projectType = data.project_type || 'Electrical';
      const template = checklistTemplates[projectType] || checklistTemplates['Electrical'];
      setChecklist(template.map(item => ({ ...item, status: null, notes: '', photos: [] })));
    } catch (err) {
      console.error('Error fetching inspection:', err);
      // If offline, load from localStorage
      const savedInspection = localStorage.getItem(`inspection_${inspectionId}`);
      if (savedInspection) {
        setInspection(JSON.parse(savedInspection));
        setOfflineMode(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistToggle = (itemId, status) => {
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, status } : item
    ));
  };

  const handleItemNotes = (itemId, notes) => {
    setChecklist(prev => prev.map(item =>
      item.id === itemId ? { ...item, notes } : item
    ));
  };

  const handlePhotoCapture = async (e, itemId = null) => {
    const files = Array.from(e.target.files || []);
    
    for (const file of files) {
      const photoData = {
        file,
        url: URL.createObjectURL(file),
        timestamp: new Date().toISOString(),
        location: currentLocation,
        itemId: itemId
      };

      if (itemId) {
        // Attach to specific checklist item
        setChecklist(prev => prev.map(item =>
          item.id === itemId ? { ...item, photos: [...(item.photos || []), photoData] } : item
        ));
      } else {
        // General inspection photo
        setPhotos(prev => [...prev, photoData]);
      }
    }
  };

  const startVoiceToText = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNotes(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  const saveOffline = () => {
    const inspectionData = {
      inspection,
      checklist,
      photos,
      notes,
      signature,
      location: currentLocation,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem(`inspection_${inspection.inspection_id}`, JSON.stringify(inspectionData));
    alert('Inspection saved offline. Will sync when online.');
  };

  const handleSubmitInspection = async () => {
    setLoading(true);

    const allPass = checklist.every(item => 
      !item.required || item.status === 'PASS'
    );
    const failedItems = checklist.filter(item => item.status === 'FAIL');

    try {
      const formData = new FormData();
      formData.append('inspection_result', allPass ? 'Pass' : 'Fail');
      formData.append('findings', notes);
      formData.append('is_completed', 'true');
      formData.append('checklist_results', JSON.stringify(checklist));
      formData.append('inspection_date', new Date().toISOString().split('T')[0]);

      if (currentLocation) {
        formData.append('location_coordinates', `${currentLocation.lat},${currentLocation.lng}`);
      }

      if (signature) {
        formData.append('digital_signature', signature);
      }

      // Add all photos
      photos.forEach((photo, idx) => {
        formData.append(`general_photo_${idx}`, photo.file);
        formData.append(`general_photo_${idx}_metadata`, JSON.stringify({
          timestamp: photo.timestamp,
          location: photo.location
        }));
      });

      // Add item-specific photos
      checklist.forEach((item, itemIdx) => {
        if (item.photos && item.photos.length > 0) {
          item.photos.forEach((photo, photoIdx) => {
            formData.append(`item_${itemIdx}_photo_${photoIdx}`, photo.file);
            formData.append(`item_${itemIdx}_photo_${photoIdx}_metadata`, JSON.stringify({
              itemId: item.id,
              itemName: item.item,
              timestamp: photo.timestamp,
              location: photo.location
            }));
          });
        }
      });

      const response = await fetch(
        `${API_BASE_URL}/qi-inspections/${inspection.inspection_id}/`,
        {
          method: 'PATCH',
          body: formData
        }
      );

      if (!response.ok) throw new Error('Submission failed');

      // If inspection failed, create defect report
      if (!allPass) {
        await fetch(
          `${API_BASE_URL}/projects/${inspection.project}/create_defect_report/`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inspection_id: inspection.inspection_id,
              failed_items: failedItems.map(item => ({
                item: item.item,
                notes: item.notes,
                photos: item.photos?.map(p => p.url) || []
              })),
              corrective_actions: failedItems.map(item => 
                `Correct: ${item.item}. ${item.notes || 'See inspection photos.'}`
              ),
              deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            })
          }
        );
      }

      // Clear offline storage
      localStorage.removeItem(`inspection_${inspection.inspection_id}`);

      alert(
        allPass
          ? '✅ Inspection APPROVED! Project ready for billing.'
          : '⚠️ Inspection FAILED. Defect report sent to vendor.'
      );

      window.location.href = '/qi/dashboard';

    } catch (err) {
      console.error('Error submitting inspection:', err);
      
      if (offlineMode) {
        saveOffline();
      } else {
        alert('Error submitting inspection. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getChecklistProgress = () => {
    const completed = checklist.filter(item => item.status !== null).length;
    return checklist.length > 0 ? Math.round((completed / checklist.length) * 100) : 0;
  };

  if (loading && !inspection) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: '#666', fontSize: '18px' }}>Loading inspection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', padding: '20px', paddingBottom: '100px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', color: '#1a1a2e' }}>📋 Quality Inspection</h1>
            <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
              Project: <strong>{inspection?.project || 'N/A'}</strong>
            </p>
            {currentLocation && (
              <p style={{ margin: 0, color: '#4caf50', fontSize: '13px' }}>
                📍 GPS: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {offlineMode && (
              <span style={{
                background: '#ff9800',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                📡 OFFLINE MODE
              </span>
            )}
            <div style={{ textAlign: 'center', padding: '12px 20px', background: '#f5f5f5', borderRadius: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>{getChecklistProgress()}%</div>
              <div style={{ fontSize: '11px', color: '#666' }}>COMPLETE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Digital Checklist */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#1a1a2e' }}>✅ Inspection Checklist</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {checklist.map((item, index) => (
            <div key={item.id} style={{
              border: `2px solid ${item.status === 'PASS' ? '#4caf50' : item.status === 'FAIL' ? '#f44336' : '#e0e0e0'}`,
              borderRadius: '12px',
              padding: '20px',
              background: item.status === 'PASS' ? '#f1f8f4' : item.status === 'FAIL' ? '#fff5f5' : '#fafafa',
              transition: 'all 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a1a2e' }}>
                      {index + 1}. {item.item}
                    </span>
                    {item.required && (
                      <span style={{ color: '#f44336', fontSize: '12px', fontWeight: 'bold' }}>*</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleChecklistToggle(item.id, 'PASS')}
                    style={{
                      background: item.status === 'PASS' ? '#4caf50' : 'white',
                      color: item.status === 'PASS' ? 'white' : '#4caf50',
                      border: '2px solid #4caf50',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '80px'
                    }}>
                    ✓ PASS
                  </button>
                  <button
                    onClick={() => handleChecklistToggle(item.id, 'FAIL')}
                    style={{
                      background: item.status === 'FAIL' ? '#f44336' : 'white',
                      color: item.status === 'FAIL' ? 'white' : '#f44336',
                      border: '2px solid #f44336',
                      padding: '8px 20px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      minWidth: '80px'
                    }}>
                    ✗ FAIL
                  </button>
                </div>
              </div>

              {item.status === 'FAIL' && (
                <div style={{ marginTop: '12px' }}>
                  <textarea
                    placeholder="Enter failure details and required corrective actions..."
                    value={item.notes}
                    onChange={(e) => handleItemNotes(item.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      minHeight: '80px',
                      marginBottom: '8px',
                      fontFamily: 'inherit'
                    }}
                  />
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <label style={{
                      background: '#2196f3',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      display: 'inline-block'
                    }}>
                      📷 Add Photos
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={(e) => handlePhotoCapture(e, item.id)}
                        style={{ display: 'none' }}
                      />
                    </label>

                    {item.photos && item.photos.length > 0 && (
                      <span style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: '6px', fontSize: '13px', color: '#666' }}>
                        {item.photos.length} photo(s) attached
                      </span>
                    )}
                  </div>

                  {item.photos && item.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                      {item.photos.map((photo, photoIdx) => (
                        <div key={photoIdx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                          <img
                            src={photo.url}
                            alt={`Photo ${photoIdx + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* General Photos */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>📸 General Inspection Photos</h2>
          <label style={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            📷 Capture Photos
            <input
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              onChange={(e) => handlePhotoCapture(e)}
              style={{ display: 'none' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {photos.map((photo, idx) => (
            <div key={idx} style={{ position: 'relative' }}>
              <img
                src={photo.url}
                alt={`Photo ${idx + 1}`}
                style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }}
              />
              <div style={{
                position: 'absolute',
                bottom: '8px',
                left: '8px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                {new Date(photo.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {photos.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>No photos captured yet</p>
        )}
      </div>

      {/* Notes & Voice Input */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', color: '#1a1a2e' }}>📝 Inspection Notes</h2>
          <button
            onClick={startVoiceToText}
            disabled={isRecording}
            style={{
              background: isRecording ? '#f44336' : '#4caf50',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: isRecording ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
            {isRecording ? '🔴 Recording...' : '🎤 Voice Input'}
          </button>
        </div>

        <textarea
          placeholder="Enter general observations, recommendations, or additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
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

      {/* Submit Section - Fixed Bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        padding: '20px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          {offlineMode && (
            <button
              onClick={saveOffline}
              style={{
                flex: '1',
                background: '#ff9800',
                color: 'white',
                border: 'none',
                padding: '16px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                minWidth: '200px'
              }}>
              💾 Save Offline
            </button>
          )}

          <button
            onClick={() => setShowSignatureModal(true)}
            disabled={loading || getChecklistProgress() < 100}
            style={{
              flex: '1',
              background: getChecklistProgress() < 100 ? '#ccc' : '#2196f3',
              color: 'white',
              border: 'none',
              padding: '16px 24px',
              borderRadius: '8px',
              cursor: getChecklistProgress() < 100 ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              minWidth: '200px'
            }}>
            ✍️ Add Signature & Submit
          </button>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>✍️ Digital Signature</h2>
            
            <p style={{ margin: '0 0 16px 0', color: '#666', fontSize: '14px' }}>
              By signing, you confirm that this inspection was conducted thoroughly and accurately.
            </p>

            <input
              type="text"
              placeholder="Type your full name"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '8px',
                border: '2px solid #667eea',
                fontSize: '18px',
                fontFamily: 'cursive',
                marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowSignatureModal(false)}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}>
                Cancel
              </button>
              <button
                onClick={handleSubmitInspection}
                disabled={loading || !signature}
                style={{
                  flex: 1,
                  background: signature ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#ccc',
                  color: 'white',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '8px',
                  cursor: signature && !loading ? 'pointer' : 'not-allowed',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}>
                {loading ? 'Submitting...' : '📤 Submit Inspection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}