import React, { useState, useEffect } from 'react';
import {
    Loader2,
    AlertCircle,
    XCircle,
    Search,
    Building2,
    Briefcase,
    FileText,
    TrendingUp,
    TrendingDown,
    ChevronDown,
    ChevronUp,
    Filter,
    Download,
    Eye,
    Calendar,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    Clock,
    Users,
    BarChart3
} from 'lucide-react';

interface Vendor {
    vendor_id: string;
    vendor_code: string;
    vendor_name: string;
    company_name: string;
    email: string;
    phone_number: string;
    compliance_score: number;
    is_active: boolean;
    is_blacklisted: boolean;
    project_count: number;
    active_projects: number;
}

interface Project {
    project_id: number;
    project_code: string;
    project_name: string;
    status_name: string;
    status_color: string;
    start_date: string;
    completion_date: string;
    contract_value: number;
    priority: string;
    is_delayed: boolean;
    delay_days: number;
}

interface WorkOrder {
    wo_id: string;
    wo_no: string;
    description: string;
    location: string;
    status: string;
    priority: string;
    date_energized: string;
    total_resolution_days: number;
    is_delayed: boolean;
    delay_days: number;
    billed_cost: number;
}

const VendorManagementDashboard: React.FC = () => {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [vendorProjects, setVendorProjects] = useState<Project[]>([]);
    const [vendorWorkOrders, setVendorWorkOrders] = useState<WorkOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'blacklisted'>('active');
    const [expandedVendor, setExpandedVendor] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'projects' | 'workorders'>('projects');
    const [sortBy, setSortBy] = useState<'name' | 'compliance' | 'projects'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const getAuthToken = (): string | null => {
        return 'your_actual_token_here';
    };

    useEffect(() => {
        loadVendors();
    }, []);

    useEffect(() => {
        filterAndSortVendors();
    }, [vendors, searchTerm, filterStatus, sortBy, sortOrder]);

    const loadVendors = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const response = await fetch('http://localhost:8000/api/v1/vendors/');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setVendors(data);
        } catch (err) {
            console.error('Error loading vendors:', err);
            setError(err instanceof Error ? err.message : 'Failed to load vendor data');
        } finally {
            setLoading(false);
        }
    };

    const loadVendorDetails = async (vendorId: string) => {
        setDetailLoading(true);
        
        try {
            const token = getAuthToken();
            

            const projectsResponse = await fetch(
                `http://localhost:8000/api/v1/projects/?vendor=${vendorId}`
            );
            console.log("Projects Response:", projectsResponse);

            if (projectsResponse.ok) {
                const projectsData = await projectsResponse.json();
                setVendorProjects(projectsData.results);
            }

            const woResponse = await fetch(
                `http://localhost:8000/api/v1/work-orders/?vendor=${vendorId}`
            );

            if (woResponse.ok) {
                const woData = await woResponse.json();
                setVendorWorkOrders(woData.results);
            }
        } catch (err) {
            console.error('Error loading vendor details:', err);
        } finally {
            setDetailLoading(false);
        }
    };

       const filterAndSortVendors = () => {
        // Ensure vendors is a valid array before filtering
        if (!Array.isArray(vendors.results) || vendors.results.length === 0) {
            setFilteredVendors([]);
            return;
        }
        
        let filtered = [...vendors.results];

        if (searchTerm) {
            filtered = filtered.filter(vendor =>
                vendor.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.vendor_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                vendor.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterStatus === 'active') {
            filtered = filtered.filter(v => v.is_active && !v.is_blacklisted);
        } else if (filterStatus === 'blacklisted') {
            filtered = filtered.filter(v => v.is_blacklisted);
        }

        filtered.sort((a, b) => {
            let compareValue = 0;
            
            if (sortBy === 'name') {
                compareValue = a.vendor_name.localeCompare(b.vendor_name);
            } else if (sortBy === 'compliance') {
                compareValue = a.compliance_score - b.compliance_score;
            } else if (sortBy === 'projects') {
                compareValue = a.project_count - b.project_count;
            }

            return sortOrder === 'asc' ? compareValue : -compareValue;
        });

        setFilteredVendors(filtered);
    };

    const handleVendorClick = (vendor: Vendor) => {
        if (expandedVendor === vendor.vendor_id) {
            setExpandedVendor(null);
            setSelectedVendor(null);
        } else {
            setExpandedVendor(vendor.vendor_id);
            setSelectedVendor(vendor);
            loadVendorDetails(vendor.vendor_id);
        }
    };

    const getComplianceColor = (score: number) => {
        if (score >= 90) return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
        if (score >= 75) return { bg: '#fef9c3', text: '#854d0e', border: '#fde047' };
        if (score >= 60) return { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' };
        return { bg: '#fecaca', text: '#991b1b', border: '#fca5a5' };
    };

    const getPriorityColor = (priority: string) => {
        const colors = {
            'Critical': { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
            'High': { bg: '#fff7ed', text: '#9a3412', border: '#fdba74' },
            'Medium': { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
            'Low': { bg: '#f9fafb', text: '#374151', border: '#d1d5db' }
        };
        return colors[priority] || colors.Low;
    };

    const getStatusColor = (status: string) => {
        const statusLower = status.toLowerCase();
        if (statusLower.includes('complete') || statusLower.includes('paid')) {
            return { bg: '#dcfce7', text: '#166534' };
        }
        if (statusLower.includes('progress') || statusLower.includes('audit')) {
            return { bg: '#dbeafe', text: '#1e40af' };
        }
        if (statusLower.includes('delay') || statusLower.includes('overdue')) {
            return { bg: '#fecaca', text: '#991b1b' };
        }
        return { bg: '#f3f4f6', text: '#374151' };
    };

    const renderWorkOrders = () => {
        if (vendorWorkOrders.length === 0) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db'
                }}>
                    <FileText size={48} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#6b7280', margin: 0 }}>No work orders found for this vendor</p>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vendorWorkOrders.map(wo => {
                    const statusColors = getStatusColor(wo.status);
                    const priorityColors = getPriorityColor(wo.priority);

                    return (
                        <div
                            key={wo.wo_id}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '16px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#93c5fd';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            margin: 0
                                        }}>
                                            {wo.wo_no}
                                        </h4>
                                    </div>
                                    <p style={{
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        margin: '4px 0 0 0'
                                    }}>
                                        {wo.description}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: statusColors.bg,
                                        color: statusColors.text
                                    }}>
                                        {wo.status}
                                    </span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: priorityColors.bg,
                                        color: priorityColors.text,
                                        border: `1px solid ${priorityColors.border}`
                                    }}>
                                        {wo.priority}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                gap: '12px',
                                fontSize: '14px',
                                color: '#6b7280'
                            }}>
                                {wo.location && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        📍 {wo.location}
                                    </div>
                                )}
                                {wo.date_energized && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={16} />
                                        {new Date(wo.date_energized).toLocaleDateString()}
                                    </div>
                                )}
                                {wo.billed_cost > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <DollarSign size={16} />
                                        ₱{wo.billed_cost.toLocaleString()}
                                    </div>
                                )}
                                {wo.total_resolution_days > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Clock size={16} />
                                        {wo.total_resolution_days} days
                                    </div>
                                )}
                            </div>

                            {wo.is_delayed && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    color: '#991b1b'
                                }}>
                                    <AlertTriangle size={16} />
                                    Delayed by {wo.delay_days} days
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderProjects = () => {
        if (vendorProjects.length === 0) {
            return (
                <div style={{
                    padding: '40px',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    border: '2px dashed #d1d5db'
                }}>
                    <Briefcase size={48} color="#9ca3af" style={{ margin: '0 auto 12px' }} />
                    <p style={{ color: '#6b7280', margin: 0 }}>No projects found for this vendor</p>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {vendorProjects.map(project => {
                    const statusColors = getStatusColor(project.status_name);
                    const priorityColors = getPriorityColor(project.priority);

                    return (
                        <div
                            key={project.project_id}
                            style={{
                                backgroundColor: '#ffffff',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '16px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                e.currentTarget.style.borderColor = '#93c5fd';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            color: '#1f2937',
                                            margin: 0
                                        }}>
                                            {project.project_name}
                                        </h4>
                                        <span style={{
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            backgroundColor: '#f3f4f6',
                                            color: '#374151'
                                        }}>
                                            {project.project_code}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: statusColors.bg,
                                        color: statusColors.text
                                    }}>
                                        {project.status_name}
                                    </span>
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: priorityColors.bg,
                                        color: priorityColors.text,
                                        border: `1px solid ${priorityColors.border}`
                                    }}>
                                        {project.priority}
                                    </span>
                                </div>
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '12px',
                                fontSize: '14px',
                                color: '#6b7280'
                            }}>
                                {project.start_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Calendar size={16} />
                                        Start: {new Date(project.start_date).toLocaleDateString()}
                                    </div>
                                )}
                                {project.completion_date && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <CheckCircle size={16} />
                                        Complete: {new Date(project.completion_date).toLocaleDateString()}
                                    </div>
                                )}
                                {project.contract_value && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <DollarSign size={16} />
                                        ₱{project.contract_value.toLocaleString()}
                                    </div>
                                )}
                            </div>

                            {project.is_delayed && (
                                <div style={{
                                    marginTop: '12px',
                                    padding: '8px 12px',
                                    backgroundColor: '#fef2f2',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '13px',
                                    color: '#991b1b'
                                }}>
                                    <AlertTriangle size={16} />
                                    Delayed by {project.delay_days} days
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderVendorCard = (vendor: Vendor) => {
        const isExpanded = expandedVendor === vendor.vendor_id;
        const complianceColors = getComplianceColor(vendor.compliance_score);

        return (
            <div 
                key={vendor.vendor_id}
                style={{
                    backgroundColor: '#ffffff',
                    border: isExpanded ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxShadow: isExpanded ? '0 10px 15px rgba(0,0,0,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s'
                }}
            >
                <div 
                    onClick={() => handleVendorClick(vendor)}
                    style={{
                        padding: '20px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: vendor.is_blacklisted ? '#fef2f2' : '#eff6ff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Building2 size={24} color={vendor.is_blacklisted ? '#dc2626' : '#3b82f6'} />
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    color: '#1f2937',
                                    margin: 0
                                }}>
                                    {vendor.vendor_name}
                                </h3>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '9999px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    backgroundColor: '#f3f4f6',
                                    color: '#374151'
                                }}>
                                    {vendor.vendor_code}
                                </span>
                                {vendor.is_blacklisted && (
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#fef2f2',
                                        color: '#991b1b',
                                        border: '1px solid #fca5a5',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <AlertTriangle size={12} />
                                        BLACKLISTED
                                    </span>
                                )}
                                {!vendor.is_active && (
                                    <span style={{
                                        padding: '4px 12px',
                                        borderRadius: '9999px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        backgroundColor: '#f3f4f6',
                                        color: '#6b7280'
                                    }}>
                                        INACTIVE
                                    </span>
                                )}
                            </div>
                            
                            {vendor.company_name && (
                                <p style={{
                                    fontSize: '14px',
                                    color: '#6b7280',
                                    margin: '0 0 8px 0'
                                }}>
                                    {vendor.company_name}
                                </p>
                            )}

                            <div style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: '12px',
                                fontSize: '14px',
                                color: '#6b7280',
                                marginBottom: '12px'
                            }}>
                                {vendor.email && (
                                    <span>📧 {vendor.email}</span>
                                )}
                                {vendor.phone_number && (
                                    <span>📞 {vendor.phone_number}</span>
                                )}
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                gap: '12px'
                            }}>
                                <div style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    border: `2px solid ${complianceColors.border}`,
                                    backgroundColor: complianceColors.bg
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        color: complianceColors.text,
                                        marginBottom: '4px',
                                        fontWeight: '500'
                                    }}>
                                        Compliance Score
                                    </div>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: complianceColors.text
                                    }}>
                                        {vendor.compliance_score}%
                                    </div>
                                </div>

                                <div style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#eff6ff',
                                    border: '2px solid #93c5fd'
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#1e40af',
                                        marginBottom: '4px',
                                        fontWeight: '500'
                                    }}>
                                        Total Projects
                                    </div>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#1e40af'
                                    }}>
                                        {vendor.project_count}
                                    </div>
                                </div>

                                <div style={{
                                    padding: '12px',
                                    borderRadius: '6px',
                                    backgroundColor: '#dcfce7',
                                    border: '2px solid #86efac'
                                }}>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#166534',
                                        marginBottom: '4px',
                                        fontWeight: '500'
                                    }}>
                                        Active Projects
                                    </div>
                                    <div style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        color: '#166534'
                                    }}>
                                        {vendor.active_projects}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            {isExpanded ? <ChevronUp size={24} color="#6b7280" /> : <ChevronDown size={24} color="#6b7280" />}
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <div style={{
                        borderTop: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb'
                    }}>
                        <div style={{
                            display: 'flex',
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: '#ffffff'
                        }}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('projects');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'projects' ? '#eff6ff' : 'transparent',
                                    color: activeTab === 'projects' ? '#1e40af' : '#6b7280',
                                    fontWeight: activeTab === 'projects' ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'projects' ? '3px solid #3b82f6' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Briefcase size={18} />
                                Projects ({vendorProjects.length})
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTab('workorders');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '16px',
                                    border: 'none',
                                    backgroundColor: activeTab === 'workorders' ? '#eff6ff' : 'transparent',
                                    color: activeTab === 'workorders' ? '#1e40af' : '#6b7280',
                                    fontWeight: activeTab === 'workorders' ? 'bold' : 'normal',
                                    cursor: 'pointer',
                                    borderBottom: activeTab === 'workorders' ? '3px solid #3b82f6' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FileText size={18} />
                                Work Orders ({vendorWorkOrders.length})
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>
                            {detailLoading ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '40px'
                                }}>
                                    <Loader2 size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : activeTab === 'projects' ? (
                                renderProjects()
                            ) : (
                                renderWorkOrders()
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'transparent',
                padding: '24px'
            }}>
                <style>{`
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                        padding: '48px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Loader2 size={48} color="#2563eb" style={{
                            animation: 'spin 1s linear infinite',
                            marginBottom: '16px'
                        }} />
                        <p style={{ color: '#6b7280', margin: 0 }}>Loading vendors...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'transparent',
            padding: '24px'
        }}>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                    padding: '24px',
                    color: '#ffffff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                            <h1 style={{
                                fontSize: '30px',
                                fontWeight: 'bold',
                                margin: '0 0 8px 0'
                            }}>
                                Vendor Management
                            </h1>
                            <p style={{
                                color: '#bfdbfe',
                                margin: 0
                            }}>
                                Manage vendors, their projects, and work orders
                            </p>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '16px',
                            alignItems: 'center'
                        }}>
                            <div style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{vendors.results.length}</div>
                                <div style={{ fontSize: '12px', color: '#bfdbfe' }}>Total Vendors</div>
                            </div>
                            <div style={{
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                padding: '12px 20px',
                                borderRadius: '8px',
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                                    {vendors.results.filter(v => v.is_active && !v.is_blacklisted).length}
                                </div>
                                <div style={{ fontSize: '12px', color: '#bfdbfe' }}>Active</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '2px solid #fca5a5',
                        borderRadius: '8px',
                        padding: '16px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <XCircle size={24} color="#dc2626" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#991b1b',
                                    margin: '0 0 4px 0'
                                }}>
                                    Error Loading Vendors
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#b91c1c',
                                    margin: '0 0 12px 0'
                                }}>
                                    {error}
                                </p>
                                <button 
                                    onClick={loadVendors}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#dc2626',
                                        color: '#ffffff',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        borderRadius: '6px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    padding: '20px'
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '16px',
                        alignItems: 'end'
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Search Vendors
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Search 
                                    size={20} 
                                    color="#6b7280" 
                                    style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)'
                                    }}
                                />
                                <input
                                    type="text"
                                    placeholder="Search by name, code, or company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px 12px 10px 40px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        outline: 'none',
                                        transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Filter by Status
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'blacklisted')}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    color: '#374151',
                                    fontSize: '14px',
                                    backgroundColor: '#ffffff',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Vendors</option>
                                <option value="active">Active Only</option>
                                <option value="blacklisted">Blacklisted</option>
                            </select>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '8px'
                            }}>
                                Sort By
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'name' | 'compliance' | 'projects')}
                                    style={{
                                        flex: 1,
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        color: '#374151',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="name">Name</option>
                                    <option value="compliance">Compliance Score</option>
                                    <option value="projects">Project Count</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    style={{
                                        padding: '10px 12px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '6px',
                                        backgroundColor: '#ffffff',
                                        color: '#374151',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                                >
                                    {sortOrder === 'asc' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={{
                        marginTop: '16px',
                        paddingTop: '16px',
                        borderTop: '1px solid #e5e7eb',
                        fontSize: '14px',
                        color: '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <Filter size={16} />
                        Showing {filteredVendors.length} of {vendors.length} vendors
                    </div>
                </div>

                {/* Vendors List */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}>
                    {filteredVendors.length === 0 ? (
                        <div style={{
                            backgroundColor: '#ffffff',
                            border: '2px dashed #d1d5db',
                            borderRadius: '8px',
                            padding: '48px',
                            textAlign: 'center'
                        }}>
                            <Building2 size={64} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#374151',
                                margin: '0 0 8px 0'
                            }}>
                                No vendors found
                            </h3>
                            <p style={{
                                color: '#6b7280',
                                margin: 0
                            }}>
                                {searchTerm ? 
                                    'Try adjusting your search or filters' : 
                                    'No vendors available in the system'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredVendors.map(vendor => renderVendorCard(vendor))
                    )}
                </div>
            </div>
        </div>
    );
};

export default VendorManagementDashboard;