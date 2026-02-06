import React, { useState, useEffect } from 'react';
import {
    MapPin, Camera, CheckCircle, XCircle, Clock, Navigation,
    FileText, Send, Edit3, Mic, Image, AlertCircle, Wifi,
    WifiOff, Loader2, ChevronRight, Home, List, User, Settings
} from 'lucide-react';

const QIMobileInspection = () => {
    const [currentView, setCurrentView] = useState('dashboard');
    const [workOrders, setWorkOrders] = useState([]);
    const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);
    const [checklistItems, setChecklistItems] = useState([]);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    const [inspectionData, setInspectionData] = useState({});
    const [isOnline, setIsOnline] = useState(true);
    const [loading, setLoading] = useState(false);
    const [gpsLocation, setGPSLocation] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });

    const API_BASE = 'http://localhost:8000/api/v1';

    // Check online status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Simulate GPS
    useEffect(() => {
        if (currentView === 'inspection') {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setGPSLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        });
                    },
                    () => {
                        // Fallback location
                        setGPSLocation({ lat: 14.4713, lng: 121.0419 });
                    }
                );
            }
        }
    }, [currentView]);

    // Load current QI user
    useEffect(() => {
        loadCurrentUser();
    }, []);

    // Load work orders when user is loaded
    useEffect(() => {
        if (currentUser?.user_id) {
            loadWorkOrders();
            loadStats();
        }
    }, [currentUser]);

    const loadCurrentUser = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userID = user.user_id;

            if (!userID) {
                // Fallback for demo
                setCurrentUser({
                    user_id: 1,
                    username: 'juan.cruz',
                    first_name: 'Juan',
                    last_name: 'Cruz',
                    role: { role_name: 'QI Inspector' }
                });
                return;
            }

            // Fetch user details from API
            const response = await fetch(`${API_BASE}/users/${userID}/`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCurrentUser(data);
            } else {
                // Fallback for demo
                setCurrentUser({
                    user_id: userID,
                    username: 'juan.cruz',
                    first_name: 'Juan',
                    last_name: 'Cruz',
                    role: { role_name: 'QI Inspector' }
                });
            }
        } catch (error) {
            console.error('Error loading user:', error);
            // Fallback
            setCurrentUser({
                user_id: 1,
                username: 'QI-001',
                first_name: 'Juan',
                last_name: 'Cruz',
                role: { role_name: 'QI Inspector' }
            });
        }
    };

    const loadWorkOrders = async () => {
        setLoading(true);
        try {
            // Step 1: Get projects assigned to this QI inspector
            const projectsResponse = await fetch(`${API_BASE}/projects/?assigned_qi=${currentUser.user_id}`);
            console.log('Fetching projects assigned to QI:', `${API_BASE}/projects/?assigned_qi=${currentUser.user_id}`);

            if (!projectsResponse.ok) {
                console.error('Failed to load projects');
                setWorkOrders([]);
                setLoading(false);
                return;
            }

            const projectsData = await projectsResponse.json();
            const projects = projectsData.results || projectsData;
            
            console.log('Projects assigned to QI:', projects);

            if (!projects || projects.length === 0) {
                console.log('No projects assigned to this QI');
                setWorkOrders([]);
                setLoading(false);
                return;
            }

            // Step 2: Get all work orders for these projects
            const allWorkOrders = [];

            for (const project of projects) {
                try {
                    // Fetch work orders for this project
                    const woResponse = await fetch(`${API_BASE}/work-orders/?project_id=${project.project_id}`);
                    console.log(`Fetching work orders for project ${project.project_id}`);

                    if (woResponse.ok) {
                        const woData = await woResponse.json();
                        const projectWorkOrders = woData.results || woData;
                        console.log(`Work orders for project ${project.project_id}:`, projectWorkOrders);

                        // Filter work orders that need QI inspection
                        const inspectionReadyWOs = projectWorkOrders;

                        // Add project information to each work order
                        const enrichedWOs = inspectionReadyWOs.map(wo => ({
                            ...wo,
                            project_info: {
                                project_id: project.project_id,
                                project_code: project.project_code,
                                project_name: project.project_name,
                                sector: project.sector,
                                vendor: project.vendor
                            }
                        }));

                        allWorkOrders.push(...enrichedWOs);
                    }
                } catch (error) {
                    console.error(`Error loading work orders for project ${project.project_id}:`, error);
                }
            }

            console.log('All work orders for inspection:', allWorkOrders);
            setWorkOrders(allWorkOrders);

        } catch (error) {
            console.error('Error loading work orders:', error);
            setWorkOrders([]);
        }
        setLoading(false);
    };

    const loadStats = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];

            // Get today's inspections for this QI
            const response = await fetch(
                `${API_BASE}/qi-inspections/?assigned_qi=${currentUser?.user_id}&inspection_date=${today}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                const inspections = data.results || data;

                setStats({
                    total: inspections.length,
                    completed: inspections.filter(i => i.is_completed).length,
                    pending: inspections.filter(i => !i.is_completed).length
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
            // Set default stats
            setStats({ total: 0, completed: 0, pending: 0 });
        }
    };

    const getInspectionType = (workOrder) => {
        // Determine inspection type from work order description
        const desc = workOrder.description?.toLowerCase() || '';

        if (desc.includes('electrical') || desc.includes('electric') || desc.includes('meter')) return 'Electrical';
        if (desc.includes('hvac') || desc.includes('mechanical')) return 'Mechanical';
        if (desc.includes('civil') || desc.includes('structural') || desc.includes('pole')) return 'Civil';
        if (desc.includes('safety')) return 'Safety';

        return 'General';
    };

    const getPriorityFromWO = (workOrder) => {
        if (workOrder.vip) return 'Critical';

        const status = workOrder.status?.toLowerCase() || '';
        if (status.includes('urgent') || status.includes('critical')) return 'High';
        if (status.includes('normal')) return 'Medium';

        // Check ageing
        if (workOrder.ageing_days && workOrder.ageing_days > 30) return 'High';

        return 'Medium';
    };

    const startInspection = async (workOrder) => {
        setSelectedWorkOrder(workOrder);

        // Load inspection type and checklist
        const inspectionType = getInspectionType(workOrder);

        try {
            // Fetch inspection type details
            const response = await fetch(`${API_BASE}/inspection-types/`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                const types = data.results || data;

                // Find matching inspection type
                const matchingType = types.find(t =>
                    t.inspection_name?.toLowerCase().includes(inspectionType.toLowerCase())
                );

                if (matchingType) {
                    // Load predefined checklist or create default one
                    loadChecklistForType(inspectionType);
                } else {
                    loadChecklistForType(inspectionType);
                }
            }
        } catch (error) {
            console.error('Error loading inspection type:', error);
            loadChecklistForType(inspectionType);
        }

        setInspectionData({
            work_order_id: workOrder.id,
            project_id: workOrder.project_info?.project_id || workOrder.project_id,
            wo_no: workOrder.wo_no,
            startTime: new Date().toISOString(),
            location: gpsLocation,
            items: {}
        });
        setCurrentItemIndex(0);
        setCurrentView('inspection');
    };

    const loadChecklistForType = (type) => {
        // Define checklists based on inspection type
        const checklists = {
            'Electrical': [
                { id: 1, item: 'Service entrance properly grounded', category: 'Safety' },
                { id: 2, item: 'Meter installation meets specifications', category: 'Installation' },
                { id: 3, item: 'Panel board correctly sized and labeled', category: 'Equipment' },
                { id: 4, item: 'Circuit breakers properly rated', category: 'Safety' },
                { id: 5, item: 'Wiring meets code requirements', category: 'Code Compliance' },
                { id: 6, item: 'All connections secure and tested', category: 'Safety' },
                { id: 7, item: 'Safety clearances maintained', category: 'Safety' },
                { id: 8, item: 'Site cleaned and restored', category: 'Completion' }
            ],
            'Mechanical': [
                { id: 1, item: 'HVAC units properly installed', category: 'Installation' },
                { id: 2, item: 'Ductwork sealed and insulated', category: 'Installation' },
                { id: 3, item: 'Refrigerant lines properly secured', category: 'Safety' },
                { id: 4, item: 'Thermostat calibrated correctly', category: 'Equipment' },
                { id: 5, item: 'Air flow meets specifications', category: 'Performance' },
                { id: 6, item: 'Drainage system functioning', category: 'Installation' },
                { id: 7, item: 'Site cleaned and restored', category: 'Completion' }
            ],
            'Civil': [
                { id: 1, item: 'Foundation properly constructed', category: 'Structural' },
                { id: 2, item: 'Concrete strength meets specifications', category: 'Materials' },
                { id: 3, item: 'Reinforcement properly placed', category: 'Structural' },
                { id: 4, item: 'Surface finish acceptable', category: 'Quality' },
                { id: 5, item: 'Dimensions within tolerance', category: 'Compliance' },
                { id: 6, item: 'Site cleaned and restored', category: 'Completion' }
            ],
            'General': [
                { id: 1, item: 'Work completed as specified', category: 'Compliance' },
                { id: 2, item: 'Quality meets standards', category: 'Quality' },
                { id: 3, item: 'Safety protocols followed', category: 'Safety' },
                { id: 4, item: 'Documentation complete', category: 'Documentation' },
                { id: 5, item: 'Site cleaned and restored', category: 'Completion' }
            ]
        };

        setChecklistItems(checklists[type] || checklists['General']);
    };

    const handleItemInspection = (itemId, status, notes = '', photos = []) => {
        setInspectionData(prev => ({
            ...prev,
            items: {
                ...prev.items,
                [itemId]: {
                    status,
                    notes,
                    photos,
                    timestamp: new Date().toISOString(),
                    location: gpsLocation
                }
            }
        }));
    };

    const nextItem = () => {
        if (currentItemIndex < checklistItems.length - 1) {
            setCurrentItemIndex(currentItemIndex + 1);
        } else {
            setCurrentView('results');
        }
    };

    const submitInspection = async () => {
        setLoading(true);

        const allPass = Object.values(inspectionData.items).every(i => i.status === 'PASS');
        const hasFails = Object.values(inspectionData.items).some(i => i.status === 'FAIL');

        // First, get or create inspection type ID
        let inspectionTypeId = null;
        try {
            const inspectionType = getInspectionType(selectedWorkOrder);
            const typesResponse = await fetch(`${API_BASE}/inspection-types/`);
            if (typesResponse.ok) {
                const typesData = await typesResponse.json();
                const types = typesData.results || typesData;
                const matchingType = types.find(t =>
                    t.inspection_name?.toLowerCase().includes(inspectionType.toLowerCase())
                );
                if (matchingType) {
                    inspectionTypeId = matchingType.inspection_type_id;
                }
            }
        } catch (error) {
            console.error('Error getting inspection type:', error);
        }

        const inspectionReport = {
            project: inspectionData.project_id,
            inspection_type: inspectionTypeId,
            assigned_qi: currentUser?.user_id,
            inspection_date: new Date().toISOString().split('T')[0],
            scheduled_date: new Date().toISOString().split('T')[0],
            inspection_result: allPass ? 'Pass' : (hasFails ? 'Fail' : 'Conditional'),
            findings: JSON.stringify(inspectionData.items),
            recommendations: generateRecommendations(),
            photos_uploaded: Object.values(inspectionData.items).some(i => i.photos?.length > 0),
            location_coordinates: gpsLocation ? `${gpsLocation.lat},${gpsLocation.lng}` : null,
            is_completed: true
        };

        try {
            // Create QI Inspection record
            const response = await fetch(`${API_BASE}/qi-inspections/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inspectionReport)
            });

            if (response.ok) {
                const inspectionResult = await response.json();

                // Update work order with audit information
                await fetch(`${API_BASE}/work-orders/${selectedWorkOrder.id}/`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        date_audit: new Date().toISOString().split('T')[0],
                        audit_by: `${currentUser?.first_name} ${currentUser?.last_name}`,
                        status: allPass ? 'Inspection Passed' : 'Inspection Failed'
                    })
                });

                // If there are failed items, create defect reports
                if (hasFails) {
                    await createDefectReports(inspectionResult.inspection_id);
                }

                alert('Inspection submitted successfully!');
                setCurrentView('dashboard');
                setSelectedWorkOrder(null);
                setInspectionData({});
                loadWorkOrders();
                loadStats();
            } else {
                const error = await response.json();
                console.error('API Error:', error);
                alert(`Failed to submit: ${JSON.stringify(error)}`);
            }
        } catch (error) {
            console.error('Error submitting inspection:', error);
            alert('Failed to submit. Check console for details.');
        }

        setLoading(false);
    };

    const createDefectReports = async (inspectionId) => {
        const failedItems = Object.entries(inspectionData.items)
            .filter(([_, data]) => data.status === 'FAIL');

        for (const [itemId, data] of failedItems) {
            const item = checklistItems.find(i => i.id === parseInt(itemId));
            
            try {
                await fetch(`${API_BASE}/defect-reports/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        inspection: inspectionId,
                        project: inspectionData.project_id,
                        defect_type: item?.category || 'General',
                        defect_category: item?.category || 'Quality',
                        severity: 'MAJOR',
                        description: `${item?.item}: ${data.notes || 'Failed inspection'}`,
                        related_checklist_items: JSON.stringify([itemId]),
                        photos: data.photos || [],
                        location_gps: gpsLocation ? `${gpsLocation.lat},${gpsLocation.lng}` : null,
                        qi_notes: data.notes,
                        created_by: currentUser?.user_id,
                        correction_status: 'OPEN'
                    })
                });
            } catch (error) {
                console.error('Error creating defect report:', error);
            }
        }
    };

    const generateRecommendations = () => {
        const failedItems = Object.entries(inspectionData.items)
            .filter(([_, data]) => data.status === 'FAIL')
            .map(([id, data]) => {
                const item = checklistItems.find(i => i.id === parseInt(id));
                return `${item?.item}: ${data.notes || 'Needs correction'}`;
            });

        if (failedItems.length === 0) {
            return 'All inspection items passed. Work order approved for completion.';
        }

        return `Failed items require correction:\n${failedItems.join('\n')}`;
    };

    const calculateDistance = (location) => {
        // Simplified distance calculation
        // In production, use proper geolocation distance formula
        return `${(Math.random() * 10 + 1).toFixed(1)} km`;
    };

    // Dashboard View
    const renderDashboard = () => (
        <div>
            {/* Stats Overview */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '32px'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '12px',
                    padding: '24px',
                    color: '#ffffff'
                }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', opacity: 0.9 }}>Today's Date</h2>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2563eb', marginBottom: '8px' }}>
                        {stats.total}
                    </div>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>Today's Inspections</div>
                </div>

                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>
                        {stats.completed}
                    </div>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>Completed</div>
                </div>

                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>
                        {stats.pending}
                    </div>
                    <div style={{ fontSize: '16px', color: '#6b7280' }}>Pending</div>
                </div>
            </div>

            {/* Assigned Work Orders */}
            <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                padding: '28px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>
                    Work Orders for Inspection ({workOrders.length})
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader2 size={48} color="#2563eb" style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                        <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading work orders...</p>
                    </div>
                ) : workOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        <FileText size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                        <p>No work orders assigned for inspection</p>
                        <p style={{ fontSize: '14px', marginTop: '8px' }}>
                            Work orders will appear here when projects are assigned to you
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                        {workOrders.map(wo => (
                            <div
                                key={wo.id}
                                style={{
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    transition: 'all 0.2s',
                                    cursor: 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59,130,246,0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '6px' }}>
                                            {wo.wo_no}
                                        </div>
                                        <div style={{ fontSize: '16px', color: '#374151', marginBottom: '8px' }}>
                                            {wo.description || 'No description'}
                                        </div>
                                        {wo.project_info && (
                                            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>
                                                Project: {wo.project_info.project_name || wo.project_info.project_code}
                                            </div>
                                        )}
                                        <div style={{
                                            display: 'inline-block',
                                            padding: '4px 10px',
                                            borderRadius: '6px',
                                            backgroundColor: '#eff6ff',
                                            color: '#1e40af',
                                            fontSize: '13px',
                                            fontWeight: '600'
                                        }}>
                                            {getInspectionType(wo)}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '6px 12px',
                                        borderRadius: '8px',
                                        backgroundColor: wo.vip ? '#fee2e2' : '#dbeafe',
                                        color: wo.vip ? '#991b1b' : '#1e40af',
                                        fontSize: '13px',
                                        fontWeight: '700'
                                    }}>
                                        {wo.vip ? 'VIP' : getPriorityFromWO(wo)}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#6b7280' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <MapPin size={16} />
                                        <span>{wo.location || wo.municipality || 'Location not specified'}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <Navigation size={16} />
                                        <span>{calculateDistance(wo.location)} away</span>
                                    </div>
                                    {wo.date_sched && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <Clock size={16} />
                                            <span>Scheduled: {new Date(wo.date_sched).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    {wo.date_fcomp && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                            <CheckCircle size={16} />
                                            <span>Field Completed: {new Date(wo.date_fcomp).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <User size={16} />
                                        <span>{wo.assigned || 'Unassigned'}</span>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // Inspection View
    const renderInspection = () => {
        const currentItem = checklistItems[currentItemIndex];
        const itemData = inspectionData.items[currentItem?.id] || {};

        return (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                {/* Back Button & Progress */}
                <div style={{ marginBottom: '24px' }}>
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#ffffff',
                            border: '2px solid #e5e7eb',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        ← Back to Dashboard
                    </button>

                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ marginBottom: '12px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>
                                {selectedWorkOrder?.wo_no} - {selectedWorkOrder?.description}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6b7280' }}>
                                Item {currentItemIndex + 1} of {checklistItems.length}
                            </div>
                        </div>
                        <div style={{
                            height: '8px',
                            backgroundColor: '#e5e7eb',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: `${((currentItemIndex + 1) / checklistItems.length) * 100}%`,
                                background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
                                transition: 'width 0.3s'
                            }} />
                        </div>
                    </div>
                </div>

                {/* Inspection Item */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '32px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '24px'
                }}>
                    <div style={{
                        padding: '8px 16px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1e40af',
                        marginBottom: '16px',
                        display: 'inline-block'
                    }}>
                        {currentItem.category}
                    </div>

                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '32px', color: '#111827' }}>
                        {currentItem.item}
                    </h2>

                    {/* Pass/Fail Buttons */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                        <button
                            onClick={() => handleItemInspection(currentItem.id, 'PASS', itemData.notes, itemData.photos)}
                            style={{
                                flex: 1,
                                padding: '20px',
                                backgroundColor: itemData.status === 'PASS' ? '#10b981' : '#ffffff',
                                color: itemData.status === 'PASS' ? '#ffffff' : '#10b981',
                                border: `3px solid #10b981`,
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (itemData.status !== 'PASS') {
                                    e.currentTarget.style.backgroundColor = '#dcfce7';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (itemData.status !== 'PASS') {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }
                            }}
                        >
                            <CheckCircle size={28} />
                            PASS
                        </button>
                        <button
                            onClick={() => handleItemInspection(currentItem.id, 'FAIL', itemData.notes, itemData.photos)}
                            style={{
                                flex: 1,
                                padding: '20px',
                                backgroundColor: itemData.status === 'FAIL' ? '#ef4444' : '#ffffff',
                                color: itemData.status === 'FAIL' ? '#ffffff' : '#ef4444',
                                border: `3px solid #ef4444`,
                                borderRadius: '12px',
                                fontWeight: '700',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '12px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                if (itemData.status !== 'FAIL') {
                                    e.currentTarget.style.backgroundColor = '#fee2e2';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (itemData.status !== 'FAIL') {
                                    e.currentTarget.style.backgroundColor = '#ffffff';
                                }
                            }}
                        >
                            <XCircle size={28} />
                            FAIL
                        </button>
                    </div>

                    {/* Notes Section */}
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                            Notes / Comments
                        </label>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                value={itemData.notes || ''}
                                onChange={(e) => handleItemInspection(currentItem.id, itemData.status, e.target.value, itemData.photos)}
                                placeholder="Add detailed notes about this inspection item..."
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    paddingRight: '50px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '10px',
                                    fontSize: '15px',
                                    minHeight: '120px',
                                    fontFamily: 'inherit',
                                    resize: 'vertical'
                                }}
                            />
                            <button
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    bottom: '12px',
                                    padding: '10px',
                                    backgroundColor: '#f3f4f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                            >
                                <Mic size={20} color="#6b7280" />
                            </button>
                        </div>
                    </div>

                    {/* Photos Section */}
                    <div>
                        <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
                            Photos {itemData.photos?.length > 0 && `(${itemData.photos.length})`}
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <div
                                    key={i}
                                    style={{
                                        aspectRatio: '1',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        border: '2px dashed #d1d5db',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#e5e7eb';
                                        e.currentTarget.style.borderColor = '#9ca3af';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                                        e.currentTarget.style.borderColor = '#d1d5db';
                                    }}
                                >
                                    <Image size={32} color="#9ca3af" />
                                </div>
                            ))}
                        </div>
                        <button
                            style={{
                                padding: '14px 24px',
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '15px',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                        >
                            <Camera size={20} />
                            Take Photo
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', gap: '16px' }}>
                    {currentItemIndex > 0 && (
                        <button
                            onClick={() => setCurrentItemIndex(currentItemIndex - 1)}
                            style={{
                                flex: 1,
                                padding: '16px',
                                backgroundColor: '#ffffff',
                                color: '#374151',
                                border: '2px solid #e5e7eb',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '16px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                        >
                            ← Previous Item
                        </button>
                    )}
                    <button
                        onClick={nextItem}
                        disabled={!itemData.status}
                        style={{
                            flex: 2,
                            padding: '16px',
                            backgroundColor: itemData.status ? '#10b981' : '#d1d5db',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '10px',
                            fontWeight: '700',
                            fontSize: '16px',
                            cursor: itemData.status ? 'pointer' : 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (itemData.status) e.currentTarget.style.backgroundColor = '#059669';
                        }}
                        onMouseLeave={(e) => {
                            if (itemData.status) e.currentTarget.style.backgroundColor = '#10b981';
                        }}
                    >
                        {currentItemIndex < checklistItems.length - 1 ? 'Next Item' : 'Review Results'}
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    // Results View
    const renderResults = () => {
        const totalItems = checklistItems.length;
        const completedItems = Object.keys(inspectionData.items).length;
        const passedItems = Object.values(inspectionData.items).filter(i => i.status === 'PASS').length;
        const failedItems = Object.values(inspectionData.items).filter(i => i.status === 'FAIL').length;

        return (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        backgroundColor: failedItems === 0 ? '#dcfce7' : '#fef3c7',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        {failedItems === 0 ? (
                            <CheckCircle size={40} color="#10b981" />
                        ) : (
                            <AlertCircle size={40} color="#f59e0b" />
                        )}
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Inspection {failedItems === 0 ? 'Complete' : 'Needs Attention'}
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                        {selectedWorkOrder?.wo_no} - {selectedWorkOrder?.description}
                    </p>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        marginTop: '20px'
                    }}>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb' }}>{totalItems}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Items</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{passedItems}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Passed</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{failedItems}</div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>Failed</div>
                        </div>
                    </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                    Inspection Summary
                </h3>

                <div style={{ marginBottom: '20px' }}>
                    {checklistItems.map(item => {
                        const itemData = inspectionData.items[item.id];
                        if (!itemData) return null;

                        return (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    padding: '16px',
                                    marginBottom: '8px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    borderLeft: `4px solid ${itemData.status === 'PASS' ? '#10b981' : '#ef4444'}`
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                            {item.item}
                                        </div>
                                        {itemData.notes && (
                                            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                                                {itemData.notes}
                                            </div>
                                        )}
                                    </div>
                                    <div style={{
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: itemData.status === 'PASS' ? '#dcfce7' : '#fee2e2',
                                        color: itemData.status === 'PASS' ? '#166534' : '#991b1b',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        marginLeft: '8px'
                                    }}>
                                        {itemData.status}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{
                    backgroundColor: '#fffbeb',
                    border: '2px solid #fbbf24',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <AlertCircle size={20} color="#f59e0b" />
                        <span style={{ fontWeight: '600', color: '#92400e' }}>Before Submitting</span>
                    </div>
                    <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#92400e' }}>
                        <li>Review all checklist items</li>
                        <li>Ensure all photos are clear and relevant</li>
                        <li>Add detailed notes for any failed items</li>
                        <li>This will update the work order status</li>
                    </ul>
                </div>

                <button
                    onClick={submitInspection}
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '16px',
                        backgroundColor: loading ? '#9ca3af' : '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    {loading ? (
                        <>
                            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Submit Inspection
                        </>
                    )}
                </button>
            </div>
        );
    };

    return (
        <div style={{
            width: '100%',
            backgroundColor: 'transparent',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * {
          box-sizing: border-box;
        }
      `}</style>

            {/* Main Content */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '24px'
            }}>
                {currentView === 'dashboard' && renderDashboard()}
                {currentView === 'inspection' && renderInspection()}
                {currentView === 'results' && renderResults()}
            </div>
        </div>
    );
};

export default QIMobileInspection;