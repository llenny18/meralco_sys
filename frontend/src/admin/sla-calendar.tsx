import React, { useState, useEffect } from 'react';
import {
    Loader2, AlertCircle, FileText, Clock, ChevronLeft, ChevronRight, XCircle,
    AlertTriangle, TrendingUp, BarChart3, CheckCircle, Calendar as CalendarIcon,
    List, Users, Wrench, Shield, DollarSign, Package, Bell, Activity, Target,
    Flag, Truck, ClipboardCheck, BarChart2, FileCheck, UserCheck, CircleDot,
    RefreshCw, TrendingDown, Award, Zap, Timer, AlertOctagon, CheckCircle2
} from 'lucide-react';

interface CalendarEvent {
    id: string;
    date: string;
    type: 'project' | 'deadline' | 'inspection' | 'sla' | 'work_order' | 'milestone' | 
          'vendor_evaluation' | 'payment' | 'document' | 'crew_monitoring' | 'qi_target' |
          'pca_goal' | 'backjob' | 'escalation' | 'audit' | 'training' | 'penalty' | 
          'invoice' | 'workflow' | 'notification';
    title: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: string;
    project_code?: string;
    wo_number?: string;
    vendor_name?: string;
    assigned_to?: string;
    days_remaining?: number;
    is_overdue?: boolean;
    related_entity?: string;
    action_required?: string;
    completion_percentage?: number;
    sla_status?: 'on_time' | 'warning' | 'breached';
    delay_days?: number;
    penalty_amount?: number;
    project_value?: number;
}

interface SLAAnalytics {
    total_items: number;
    on_time: number;
    warning: number;
    breached: number;
    total_penalties: number;
    avg_delay_days: number;
    compliance_rate: number;
    critical_items: number;
}

interface PenaltyCalculation {
    id: string;
    wo_number: string;
    vendor: string;
    delay_days: number;
    project_value: number;
    penalty_rate: number;
    penalty_amount: number;
    status: 'pending_approval' | 'approved' | 'deducted' | 'waived';
    approval_deadline: string;
}

const SLAComplianceCalendar: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [analytics, setAnalytics] = useState<SLAAnalytics | null>(null);
    const [penalties, setPenalties] = useState<PenaltyCalculation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterSLA, setFilterSLA] = useState<string>('all');
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [analyticsView, setAnalyticsView] = useState<'dashboard' | 'list'>('dashboard');
    const [searchQuery, setSearchQuery] = useState('');

    const API_BASE_URL = 'http://localhost:8000/api/v1';

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            calculateAnalytics();
            calculatePenalties();
        }
    }, [events]);

    const calculateSLAStatus = (event: CalendarEvent): 'on_time' | 'warning' | 'breached' => {
        if (event.is_overdue) return 'breached';
        if (event.days_remaining !== undefined) {
            if (event.days_remaining <= 2) return 'warning';
            return 'on_time';
        }
        return 'on_time';
    };

    const calculatePenaltyAmount = (projectValue: number, delayDays: number, penaltyRate: number = 0.1): number => {
        return projectValue * (penaltyRate / 100) * delayDays;
    };

    const loadAllData = async () => {
        setLoading(true);
        setError(null);

        try {
            const allEvents: CalendarEvent[] = [];

            // Fetch Work Orders with SLA tracking
            const workOrders = await fetchData(`${API_BASE_URL}/work-orders/`);
            workOrders.forEach((wo: any) => {
                const projectValue = 100000; // This should come from actual data
                
                if (wo.date_received_jacket_ps) {
                    const daysRemaining = wo.date_received_by_vc ? 
                        Math.floor((new Date(wo.date_received_by_vc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 
                        undefined;
                    
                    const delayDays = wo.ageing_submission_coc || 0;
                    
                    allEvents.push({
                        id: `wo-${wo.id}`,
                        date: wo.date_received_jacket,
                        type: 'work_order',
                        title: `WO: ${wo.wo_no}`,
                        description: wo.description || 'Work order received',
                        priority: wo.vip ? 'Critical' : (wo.priority || 'Medium'),
                        status: wo.status || 'NEW',
                        wo_number: wo.wo_no,
                        vendor_name: wo.vendor?.vendor_name,
                        assigned_to: wo.assigned,
                        days_remaining: daysRemaining,
                        is_overdue: delayDays > 0,
                        delay_days: delayDays,
                        project_value: projectValue,
                        penalty_amount: delayDays > 0 ? calculatePenaltyAmount(projectValue, delayDays) : 0
                    });
                }

                // Add deadline events
                if (wo.date_received_by_vc) {
                    const daysRemaining = Math.floor((new Date(wo.date_received_by_vc).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const delayDays = wo.ageing_submission_coc || 0;
                    
                    allEvents.push({
                        id: `wo-deadline-${wo.id}`,
                        date: wo.date_received_by_vc,
                        type: 'deadline',
                        title: `COC Deadline: ${wo.wo_no}`,
                        description: 'Certificate of Completion deadline',
                        priority: daysRemaining < 2 ? 'Critical' : 'High',
                        status: delayDays > 0 ? 'BREACHED' : (daysRemaining <= 2 ? 'WARNING' : 'ON_TIME'),
                        wo_number: wo.wo_no,
                        days_remaining: daysRemaining,
                        is_overdue: delayDays > 0,
                        delay_days: delayDays,
                        project_value: projectValue,
                        penalty_amount: delayDays > 0 ? calculatePenaltyAmount(projectValue, delayDays) : 0,
                        action_required: delayDays > 0 ? 'Penalty calculation required' : undefined
                    });
                }
            });

            // Fetch SLA Tracking
            const slaTracking = await fetchData(`${API_BASE_URL}/sla-tracking/`);
            slaTracking.forEach((sla: any) => {
                if (sla.due_date) {
                    const daysRemaining = Math.floor((new Date(sla.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const delayDays = sla.breach_days || 0;
                    const projectValue = 100000;
                    
                    allEvents.push({
                        id: `sla-${sla.sla_tracking_id}`,
                        date: sla.due_date,
                        type: 'sla',
                        title: `SLA: ${sla.sla_rule?.rule_name || 'SLA Deadline'}`,
                        description: sla.sla_rule?.rule_description || 'SLA compliance deadline',
                        priority: daysRemaining < 2 ? 'Critical' : 'High',
                        status: sla.status || 'Open',
                        project_code: sla.project?.project_code,
                        days_remaining: daysRemaining,
                        is_overdue: sla.is_breached || daysRemaining < 0,
                        delay_days: delayDays,
                        project_value: projectValue,
                        penalty_amount: sla.is_breached ? calculatePenaltyAmount(projectValue, delayDays) : 0,
                        action_required: daysRemaining < 2 ? 'Immediate action required' : undefined
                    });
                }
            });

            // Fetch Document Compliance
            const docCompliance = await fetchData(`${API_BASE_URL}/document-compliance/`);
            docCompliance.forEach((doc: any) => {
                if (doc.due_date) {
                    const daysRemaining = Math.floor((new Date(doc.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const delayDays = doc.overdue_days || 0;
                    const projectValue = 100000;
                    
                    allEvents.push({
                        id: `doc-${doc.compliance_id}`,
                        date: doc.due_date,
                        type: 'document',
                        title: `Document: ${doc.doc_type?.doc_type_name || 'Document'}`,
                        description: 'Document submission deadline',
                        priority: daysRemaining < 3 ? 'High' : 'Medium',
                        status: doc.is_submitted ? 'Submitted' : 'Pending',
                        project_code: doc.project?.project_code,
                        days_remaining: daysRemaining,
                        is_overdue: doc.is_overdue || daysRemaining < 0,
                        delay_days: delayDays,
                        project_value: projectValue,
                        penalty_amount: doc.is_overdue ? calculatePenaltyAmount(projectValue, delayDays) : 0,
                        action_required: !doc.is_submitted ? 'Submission required' : undefined
                    });
                }
            });

            // Add SLA status to all events
            allEvents.forEach(event => {
                event.sla_status = calculateSLAStatus(event);
            });

            setEvents(allEvents);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (url: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) return [];
            const data = await response.json();
            return Array.isArray(data) ? data : data.results || [];
        } catch (error) {
            return [];
        }
    };

    const calculateAnalytics = () => {
        const onTime = events.filter(e => e.sla_status === 'on_time').length;
        const warning = events.filter(e => e.sla_status === 'warning').length;
        const breached = events.filter(e => e.sla_status === 'breached').length;
        const totalPenalties = events.reduce((sum, e) => sum + (e.penalty_amount || 0), 0);
        const delayedEvents = events.filter(e => e.delay_days && e.delay_days > 0);
        const avgDelay = delayedEvents.length > 0 ? 
            delayedEvents.reduce((sum, e) => sum + (e.delay_days || 0), 0) / delayedEvents.length : 0;
        const complianceRate = events.length > 0 ? (onTime / events.length) * 100 : 0;
        const critical = events.filter(e => e.priority === 'Critical').length;

        setAnalytics({
            total_items: events.length,
            on_time: onTime,
            warning: warning,
            breached: breached,
            total_penalties: totalPenalties,
            avg_delay_days: avgDelay,
            compliance_rate: complianceRate,
            critical_items: critical
        });
    };

    const calculatePenalties = () => {
        const penaltyList: PenaltyCalculation[] = [];
        
        events.filter(e => e.is_overdue && e.delay_days && e.delay_days > 0).forEach(event => {
            const approvalDeadline = new Date();
            approvalDeadline.setDate(approvalDeadline.getDate() + 2);
            
            penaltyList.push({
                id: event.id,
                wo_number: event.wo_number || event.project_code || 'N/A',
                vendor: event.vendor_name || 'Unknown',
                delay_days: event.delay_days || 0,
                project_value: event.project_value || 100000,
                penalty_rate: 0.1,
                penalty_amount: event.penalty_amount || 0,
                status: 'pending_approval',
                approval_deadline: approvalDeadline.toISOString().split('T')[0]
            });
        });

        setPenalties(penaltyList);
    };

    const getFilteredEvents = () => {
        return events.filter(event => {
            const matchesType = filterType === 'all' || event.type === filterType;
            const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
            const matchesSLA = filterSLA === 'all' || event.sla_status === filterSLA;
            const matchesSearch = searchQuery === '' || 
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase());
            
            return matchesType && matchesPriority && matchesSLA && matchesSearch;
        });
    };

    const getSLAColor = (status?: string) => {
        switch (status) {
            case 'on_time': return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
            case 'warning': return { bg: '#fef3c7', text: '#92400e', border: '#fbbf24' };
            case 'breached': return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
        }
    };

    const renderAnalyticsDashboard = () => {
        if (!analytics) return null;

        return (
            <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '28px', marginBottom: '24px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <BarChart3 size={28} color="#2563eb" />
                        SLA Compliance Analytics
                    </h2>
                    <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '4px' }}>
                        <button 
                            onClick={() => setAnalyticsView('dashboard')}
                            style={{ 
                                padding: '10px 20px', 
                                borderRadius: '6px', 
                                border: 'none', 
                                cursor: 'pointer',
                                backgroundColor: analyticsView === 'dashboard' ? '#2563eb' : 'transparent',
                                color: analyticsView === 'dashboard' ? '#ffffff' : '#374151',
                                fontWeight: '600'
                            }}
                        >
                            Dashboard
                        </button>
                        <button 
                            onClick={() => setAnalyticsView('list')}
                            style={{ 
                                padding: '10px 20px', 
                                borderRadius: '6px', 
                                border: 'none', 
                                cursor: 'pointer',
                                backgroundColor: analyticsView === 'list' ? '#2563eb' : 'transparent',
                                color: analyticsView === 'list' ? '#ffffff' : '#374151',
                                fontWeight: '600'
                            }}
                        >
                            List View
                        </button>
                    </div>
                </div>

                {analyticsView === 'dashboard' ? (
                    <>
                        {/* Key Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                            {[
                                { label: 'Compliance Rate', value: `${analytics.compliance_rate.toFixed(1)}%`, color: '#10b981', icon: Award, trend: 'up' },
                                { label: 'On Time', value: analytics.on_time, color: '#22c55e', icon: CheckCircle2, subtext: 'GREEN Status' },
                                { label: 'Warning (≤2 days)', value: analytics.warning, color: '#f59e0b', icon: AlertTriangle, subtext: 'YELLOW Status' },
                                { label: 'Breached', value: analytics.breached, color: '#ef4444', icon: AlertOctagon, subtext: 'RED Status' },
                                { label: 'Total Penalties', value: `₱${analytics.total_penalties.toLocaleString()}`, color: '#dc2626', icon: DollarSign },
                                { label: 'Avg Delay', value: `${analytics.avg_delay_days.toFixed(1)} days`, color: '#f97316', icon: Timer },
                                { label: 'Critical Items', value: analytics.critical_items, color: '#991b1b', icon: Zap },
                                { label: 'Total Tracked', value: analytics.total_items, color: '#3b82f6', icon: Target }
                            ].map((metric, idx) => {
                                const Icon = metric.icon;
                                return (
                                    <div key={idx} style={{ 
                                        backgroundColor: '#ffffff', 
                                        borderRadius: '10px', 
                                        padding: '20px', 
                                        border: `2px solid ${metric.color}20`,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div style={{ 
                                                padding: '12px', 
                                                borderRadius: '10px', 
                                                backgroundColor: `${metric.color}15`
                                            }}>
                                                <Icon size={24} color={metric.color} />
                                            </div>
                                            {metric.trend && (
                                                <TrendingUp size={18} color="#10b981" />
                                            )}
                                        </div>
                                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: metric.color, marginBottom: '4px' }}>
                                            {metric.value}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>
                                            {metric.label}
                                        </div>
                                        {metric.subtext && (
                                            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                                {metric.subtext}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Automated Penalty Workflow */}
                        <div style={{ 
                            background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)', 
                            borderRadius: '10px', 
                            padding: '24px',
                            border: '2px solid #fca5a5',
                            marginBottom: '24px'
                        }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <AlertCircle size={22} color="#dc2626" />
                                Automated Penalty Workflow (Active: {penalties.length})
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                                {[
                                    { step: '1', label: 'Calculate Delay', desc: 'Auto-compute delay days', color: '#ef4444' },
                                    { step: '2', label: 'Compute Penalty', desc: '0.1% per day rate', color: '#f97316' },
                                    { step: '3', label: 'Generate Memo', desc: 'Auto-populate template', color: '#f59e0b' },
                                    { step: '4', label: 'Route Approval', desc: '2-day deadline', color: '#eab308' },
                                    { step: '5', label: 'Track Resolution', desc: 'Deduct from billing', color: '#84cc16' }
                                ].map((step, idx) => (
                                    <div key={idx} style={{ 
                                        backgroundColor: '#ffffff', 
                                        borderRadius: '8px', 
                                        padding: '16px',
                                        border: `2px solid ${step.color}40`
                                    }}>
                                        <div style={{ 
                                            fontSize: '24px', 
                                            fontWeight: 'bold', 
                                            color: step.color,
                                            marginBottom: '8px'
                                        }}>
                                            Step {step.step}
                                        </div>
                                        <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                            {step.label}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                            {step.desc}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Active Penalties Table */}
                        {penalties.length > 0 && (
                            <div style={{ marginTop: '24px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <DollarSign size={22} color="#dc2626" />
                                    Pending Penalty Approvals
                                </h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>WO Number</th>
                                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Vendor</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Delay Days</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Project Value</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Penalty Rate</th>
                                                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Penalty Amount</th>
                                                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {penalties.slice(0, 10).map((penalty, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '12px', fontWeight: '600' }}>{penalty.wo_number}</td>
                                                    <td style={{ padding: '12px' }}>{penalty.vendor}</td>
                                                    <td style={{ padding: '12px', textAlign: 'right', color: '#dc2626', fontWeight: '600' }}>
                                                        {penalty.delay_days} days
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                                        ₱{penalty.project_value.toLocaleString()}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right' }}>
                                                        {penalty.penalty_rate}% / day
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#dc2626' }}>
                                                        ₱{penalty.penalty_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </td>
                                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                                        <span style={{ 
                                                            padding: '4px 12px', 
                                                            borderRadius: '12px', 
                                                            backgroundColor: '#fef3c7',
                                                            color: '#92400e',
                                                            fontSize: '12px',
                                                            fontWeight: '600'
                                                        }}>
                                                            PENDING
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    /* List View of All Items */
                    <div>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <select 
                                value={filterSLA} 
                                onChange={(e) => setFilterSLA(e.target.value)}
                                style={{ padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px', flex: 1, minWidth: '150px' }}
                            >
                                <option value="all">All Status</option>
                                <option value="on_time">✅ On Time (GREEN)</option>
                                <option value="warning">⚠️ Warning (YELLOW)</option>
                                <option value="breached">🔴 Breached (RED)</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                            {getFilteredEvents().map((event, idx) => {
                                const slaColors = getSLAColor(event.sla_status);
                                return (
                                    <div key={idx} style={{ 
                                        backgroundColor: slaColors.bg,
                                        border: `2px solid ${slaColors.border}`,
                                        borderRadius: '8px',
                                        padding: '16px',
                                        display: 'flex',
                                        gap: '16px',
                                        alignItems: 'flex-start'
                                    }}>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0', color: slaColors.text }}>
                                                {event.title}
                                            </h4>
                                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 8px 0' }}>
                                                {event.description}
                                            </p>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {event.wo_number && <span style={{ padding: '4px 8px', backgroundColor: '#ffffff', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>WO: {event.wo_number}</span>}
                                                {event.vendor_name && <span style={{ padding: '4px 8px', backgroundColor: '#ffffff', borderRadius: '4px', fontSize: '12px' }}>Vendor: {event.vendor_name}</span>}
                                                {event.delay_days && event.delay_days > 0 && (
                                                    <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        Delay: {event.delay_days} days
                                                    </span>
                                                )}
                                                {event.penalty_amount && event.penalty_amount > 0 && (
                                                    <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        Penalty: ₱{event.penalty_amount.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {event.days_remaining !== undefined && (
                                            <div style={{ 
                                                textAlign: 'center', 
                                                padding: '16px', 
                                                backgroundColor: event.is_overdue ? '#fee2e2' : (event.sla_status === 'warning' ? '#fef3c7' : '#dcfce7'),
                                                borderRadius: '8px',
                                                minWidth: '100px'
                                            }}>
                                                <p style={{ 
                                                    fontSize: '28px', 
                                                    fontWeight: 'bold', 
                                                    color: event.is_overdue ? '#dc2626' : (event.sla_status === 'warning' ? '#f59e0b' : '#16a34a'),
                                                    margin: 0 
                                                }}>
                                                    {Math.abs(event.days_remaining)}
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                                    {event.is_overdue ? 'days overdue' : 'days left'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const getEventsForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return getFilteredEvents().filter(event => event.date === dateStr);
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    };

    const getEventIcon = (type: string) => {
        const iconMap: Record<string, any> = {
            project: Flag,
            deadline: Clock,
            sla: AlertTriangle,
            inspection: CheckCircle,
            work_order: Wrench,
            milestone: Target,
            vendor_evaluation: Users,
            payment: DollarSign,
            document: FileText,
            crew_monitoring: Users,
            qi_target: Shield,
            pca_goal: Target,
            backjob: AlertCircle,
            escalation: TrendingUp,
            audit: FileCheck,
            penalty: XCircle,
            invoice: DollarSign,
            workflow: Activity,
            notification: Bell,
            training: UserCheck
        };
        return iconMap[type] || CircleDot;
    };

    const getEventColor = (type: string, slaStatus?: string) => {
        // Override with SLA status colors if provided
        if (slaStatus === 'breached') {
            return { bg: '#dc2626', light: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
        }
        if (slaStatus === 'warning') {
            return { bg: '#f59e0b', light: '#fef3c7', text: '#92400e', border: '#fbbf24' };
        }
        if (slaStatus === 'on_time') {
            return { bg: '#10b981', light: '#dcfce7', text: '#166534', border: '#86efac' };
        }

        const colors: Record<string, any> = {
            project: { bg: '#9333ea', light: '#f3e8ff', text: '#581c87', border: '#c084fc' },
            deadline: { bg: '#f97316', light: '#ffedd5', text: '#9a3412', border: '#fb923c' },
            sla: { bg: '#dc2626', light: '#fee2e2', text: '#991b1b', border: '#f87171' },
            inspection: { bg: '#3b82f6', light: '#dbeafe', text: '#1e40af', border: '#60a5fa' },
            work_order: { bg: '#0891b2', light: '#cffafe', text: '#155e75', border: '#22d3ee' },
            milestone: { bg: '#8b5cf6', light: '#ede9fe', text: '#5b21b6', border: '#a78bfa' },
            vendor_evaluation: { bg: '#ec4899', light: '#fce7f3', text: '#9f1239', border: '#f472b6' },
            payment: { bg: '#10b981', light: '#d1fae5', text: '#065f46', border: '#34d399' },
            document: { bg: '#6366f1', light: '#e0e7ff', text: '#3730a3', border: '#818cf8' },
            penalty: { bg: '#b91c1c', light: '#fee2e2', text: '#7f1d1d', border: '#dc2626' }
        };
        return colors[type] || colors.project;
    };

    const renderCalendarView = () => {
        const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
        const days = [];
        const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(
                <div 
                    key={`empty-${i}`} 
                    style={{
                        minHeight: '140px',
                        backgroundColor: '#f9fafb',
                        border: '1px solid #e5e7eb'
                    }}
                />
            );
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const currentDateObj = new Date(year, month, day);
            const dayEvents = getEventsForDate(currentDateObj);
            const isToday = currentDateObj.toDateString() === new Date().toDateString();
            const isSelected = selectedDate && currentDateObj.toDateString() === selectedDate.toDateString();
            
            // Determine overall day status based on worst event
            const hasBreached = dayEvents.some(e => e.sla_status === 'breached');
            const hasWarning = dayEvents.some(e => e.sla_status === 'warning');
            const dayStatus = hasBreached ? 'breached' : (hasWarning ? 'warning' : 'on_time');
            const dayBorderColor = hasBreached ? '#dc2626' : (hasWarning ? '#f59e0b' : '#10b981');

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(currentDateObj)}
                    style={{
                        minHeight: '140px',
                        border: isToday ? '3px solid #3b82f6' : '1px solid #e5e7eb',
                        backgroundColor: isToday ? '#eff6ff' : '#ffffff',
                        padding: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.5)' : 'none',
                        position: 'relative',
                        borderTop: dayEvents.length > 0 ? `4px solid ${dayBorderColor}` : undefined
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <div style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: isToday ? '#1e40af' : '#374151'
                        }}>
                            {day}
                        </div>
                        {dayEvents.length > 0 && (
                            <div style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                backgroundColor: dayBorderColor,
                                color: '#ffffff',
                                padding: '2px 6px',
                                borderRadius: '9999px',
                                minWidth: '20px',
                                textAlign: 'center'
                            }}>
                                {dayEvents.length}
                            </div>
                        )}
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '90px',
                        overflowY: 'auto'
                    }}>
                        {dayEvents.slice(0, 3).map((event, idx) => {
                            const colors = getEventColor(event.type, event.sla_status);
                            const Icon = getEventIcon(event.type);
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        fontSize: '11px',
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        backgroundColor: colors.bg,
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                        border: event.is_overdue ? '2px solid #ffffff' : 'none'
                                    }}
                                    title={`${event.title} - ${event.description}${event.sla_status ? ` [${event.sla_status.toUpperCase()}]` : ''}`}
                                >
                                    <Icon size={12} color="#ffffff" style={{ flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>
                                        {event.title}
                                    </span>
                                    {event.is_overdue && (
                                        <AlertTriangle size={12} color="#ffffff" style={{ flexShrink: 0 }} />
                                    )}
                                </div>
                            );
                        })}
                        {dayEvents.length > 3 && (
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontWeight: '600',
                                paddingLeft: '8px'
                            }}>
                                +{dayEvents.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                {weekDays.map(day => (
                    <div 
                        key={day} 
                        style={{
                            backgroundColor: '#1f2937',
                            color: '#ffffff',
                            padding: '12px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '14px'
                        }}
                    >
                        {day}
                    </div>
                ))}
                {days}
            </div>
        );
    };

    const renderListView = () => {
        const groupedEvents: { [key: string]: CalendarEvent[] } = {};
        const filtered = getFilteredEvents();

        filtered.forEach(event => {
            if (!groupedEvents[event.date]) {
                groupedEvents[event.date] = [];
            }
            groupedEvents[event.date].push(event);
        });

        const sortedDates = Object.keys(groupedEvents).sort();

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sortedDates.map(date => (
                    <div key={date} style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ background: 'linear-gradient(to right, #2563eb, #1e40af)', color: '#ffffff', padding: '20px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
                                <CalendarIcon size={24} />
                                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                        </div>
                        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {groupedEvents[date].map((event, idx) => {
                                const colors = getEventColor(event.type, event.sla_status);
                                const slaColors = getSLAColor(event.sla_status);
                                const Icon = getEventIcon(event.type);
                                
                                return (
                                    <div key={idx} style={{ 
                                        display: 'flex', 
                                        gap: '16px', 
                                        padding: '20px', 
                                        border: `2px solid ${slaColors.border}`, 
                                        borderRadius: '8px',
                                        backgroundColor: slaColors.bg
                                    }}>
                                        <div style={{ padding: '14px', borderRadius: '50%', backgroundColor: colors.bg, display: 'flex' }}>
                                            <Icon size={24} color="#ffffff" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <h4 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{event.title}</h4>
                                                {event.sla_status && (
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        borderRadius: '12px',
                                                        fontSize: '11px',
                                                        fontWeight: '700',
                                                        backgroundColor: event.sla_status === 'breached' ? '#dc2626' : (event.sla_status === 'warning' ? '#f59e0b' : '#10b981'),
                                                        color: '#ffffff'
                                                    }}>
                                                        {event.sla_status === 'breached' ? '🔴 RED' : (event.sla_status === 'warning' ? '🟡 YELLOW' : '🟢 GREEN')}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>{event.description}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {event.project_code && <span style={{ padding: '4px 8px', backgroundColor: '#ffffff', borderRadius: '4px', fontSize: '12px' }}>📋 {event.project_code}</span>}
                                                {event.wo_number && <span style={{ padding: '4px 8px', backgroundColor: '#ffffff', borderRadius: '4px', fontSize: '12px' }}>🔧 {event.wo_number}</span>}
                                                {event.vendor_name && <span style={{ padding: '4px 8px', backgroundColor: '#ffffff', borderRadius: '4px', fontSize: '12px' }}>🚚 {event.vendor_name}</span>}
                                                {event.delay_days && event.delay_days > 0 && (
                                                    <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        ⏱️ Delay: {event.delay_days} days
                                                    </span>
                                                )}
                                                {event.penalty_amount && event.penalty_amount > 0 && (
                                                    <span style={{ padding: '4px 8px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                                                        💰 Penalty: ₱{event.penalty_amount.toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {event.days_remaining !== undefined && (
                                            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: event.is_overdue ? '#fee2e2' : '#dcfce7', borderRadius: '8px' }}>
                                                <p style={{ fontSize: '24px', fontWeight: 'bold', color: event.is_overdue ? '#dc2626' : '#16a34a', margin: 0 }}>
                                                    {Math.abs(event.days_remaining)}
                                                </p>
                                                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                                                    {event.is_overdue ? 'overdue' : 'days left'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} color="#2563eb" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading SLA compliance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '24px', backgroundColor: '#f3f4f6' }}>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '32px', color: '#ffffff', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CalendarIcon size={40} />
                        SLA Compliance & Penalty Management System
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9 }}>Real-time tracking with automated penalty workflow • Color-coded status indicators</p>
                </div>

                {error && (
                    <div style={{ backgroundColor: '#fef2f2', border: '2px solid #dc2626', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <XCircle size={24} color="#dc2626" />
                            <div>
                                <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>Error Loading Data</p>
                                <p style={{ margin: 0 }}>{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Analytics Dashboard */}
                {renderAnalyticsDashboard()}

                {/* Calendar Section */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
                        <button onClick={() => navigateMonth('prev')} style={{ padding: '10px', borderRadius: '6px', border: '2px solid #d1d5db', backgroundColor: '#ffffff', color: '#000000', cursor: 'pointer' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#000000', minWidth: '220px', textAlign: 'center', margin: 0 }}>
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button onClick={() => navigateMonth('next')} style={{ padding: '10px', borderRadius: '6px', border: '2px solid #d1d5db', backgroundColor: '#ffffff', color: '#000000', cursor: 'pointer' }}>
                            <ChevronRight size={20} />
                        </button>
                        <button onClick={goToToday} style={{ padding: '10px 20px', borderRadius: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                            Today
                        </button>
                        <button onClick={loadAllData} style={{ padding: '10px 20px', borderRadius: '6px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', cursor: 'pointer', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto' }}>
                            <RefreshCw size={16} />
                            Refresh Data
                        </button>
                    </div>

                    {/* SLA Status Legend */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#10b981' }}></div>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>🟢 GREEN = On Time</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#f59e0b' }}></div>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>🟡 YELLOW = Warning (≤2 days)</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: '#dc2626' }}></div>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>🔴 RED = Breached/Overdue</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <input
                            type="text"
                            placeholder="Search events..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ flex: 1, minWidth: '200px', padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px' }}
                        />
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px' }}>
                            <option value="all">All Types</option>
                            <option value="work_order">Work Orders</option>
                            <option value="deadline">Deadlines</option>
                            <option value="sla">SLA</option>
                            <option value="document">Documents</option>
                        </select>
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px' }}>
                            <option value="all">All Priorities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                        <select value={filterSLA} onChange={(e) => setFilterSLA(e.target.value)} style={{ padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px' }}>
                            <option value="all">All SLA Status</option>
                            <option value="on_time">🟢 On Time</option>
                            <option value="warning">🟡 Warning</option>
                            <option value="breached">🔴 Breached</option>
                        </select>
                        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#e5e7eb', borderRadius: '6px', padding: '4px' }}>
                            <button onClick={() => setView('calendar')} style={{ padding: '10px 16px', color: '#000000', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer', backgroundColor: view === 'calendar' ? '#ffffff' : 'transparent' }}>
                                Calendar
                            </button>
                            <button onClick={() => setView('list')} style={{ padding: '10px 16px', color: '#000000', borderRadius: '6px', fontWeight: '600', border: 'none', cursor: 'pointer', backgroundColor: view === 'list' ? '#ffffff' : 'transparent' }}>
                                List
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar/List View */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px' }}>
                    {view === 'calendar' ? renderCalendarView() : renderListView()}
                </div>
            </div>
        </div>
    );
};

export default SLAComplianceCalendar;