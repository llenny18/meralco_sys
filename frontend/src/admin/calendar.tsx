import React, { useState, useEffect } from 'react';
import {
    Loader2,
    AlertCircle,
    FileText,
    Clock,
    ChevronLeft,
    ChevronRight,
    XCircle,
    AlertTriangle,
    TrendingUp,
    BarChart3,
    CheckCircle,
    Calendar as CalendarIcon,
    List,
    Users,
    Wrench,
    Shield,
    DollarSign,
    Package,
    Bell,
    Activity,
    Target,
    Flag,
    Truck,
    ClipboardCheck,
    BarChart2,
    FileCheck,
    UserCheck,
    CircleDot,
    RefreshCw
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
}

interface CalendarStats {
    total_events: number;
    overdue: number;
    this_week: number;
    by_type: Record<string, number>;
    by_priority: Record<string, number>;
    by_status: Record<string, number>;
}

const ProjectCalendarDashboard: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [stats, setStats] = useState<CalendarStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [searchQuery, setSearchQuery] = useState('');

    const API_BASE_URL = 'http://localhost:8000/api/v1';

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (events.length > 0) {
            calculateStats();
        }
    }, [events, filterType, filterPriority, filterStatus]);

    const loadAllData = async () => {
        setLoading(true);
        setError(null);

        try {
            const allEvents: CalendarEvent[] = [];

            // Fetch Projects
            const projects = await fetchData(`${API_BASE_URL}/projects/`);
            projects.forEach((project: any) => {
                if (project.start_date) {
                    allEvents.push({
                        id: `project-${project.project_id}`,
                        date: project.start_date,
                        type: 'project',
                        title: `Project Start: ${project.project_name}`,
                        description: project.project_description || 'Project start date',
                        priority: project.priority || 'Medium',
                        status: project.status?.status_name || 'Active',
                        project_code: project.project_code,
                        vendor_name: project.vendor?.vendor_name,
                        assigned_to: project.assigned_engineer?.username
                    });
                }
                if (project.completion_date) {
                    const daysRemaining = Math.floor((new Date(project.completion_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    allEvents.push({
                        id: `project-deadline-${project.project_id}`,
                        date: project.completion_date,
                        type: 'deadline',
                        title: `Project Deadline: ${project.project_name}`,
                        description: 'Project completion deadline',
                        priority: daysRemaining < 7 ? 'Critical' : project.priority || 'High',
                        status: project.status?.status_name || 'Pending',
                        project_code: project.project_code,
                        days_remaining: daysRemaining,
                        is_overdue: daysRemaining < 0
                    });
                }
            });

            // Fetch Work Orders
            const workOrders = await fetchData(`${API_BASE_URL}/work-orders/`);
            workOrders.forEach((wo: any) => {
                if (wo.date_received_jacket_ps) {
                    allEvents.push({
                        id: `wo-received-${wo.id}`,
                        date: wo.date_received_jacket_ps,
                        type: 'work_order',
                        title: `WO Received: ${wo.wo_no}`,
                        description: wo.description || 'Work order received',
                        priority: wo.priority || 'Medium',
                        status: wo.status || 'NEW',
                        wo_number: wo.wo_no,
                        vendor_name: wo.vendor?.vendor_name,
                        assigned_to: wo.supervisor?.username
                    });
                }
                if (wo.date_sched) {
                    allEvents.push({
                        id: `wo-energized-${wo.id}`,
                        date: wo.date_sched,
                        type: 'work_order',
                        title: `WO Energized: ${wo.wo_no}`,
                        description: 'Work order energization completed',
                        priority: 'Medium',
                        status: wo.status || 'Completed',
                        wo_number: wo.wo_no
                    });
                }
                if (wo.date_received_by_vc) {
                    allEvents.push({
                        id: `wo-audit-${wo.id}`,
                        date: wo.date_received_by_vc,
                        type: 'audit',
                        title: `WO For Audit: ${wo.wo_no}`,
                        description: 'Work order ready for audit',
                        priority: 'High',
                        status: 'FOR AUDIT',
                        wo_number: wo.wo_no,
                        action_required: 'Audit required'
                    });
                }
            });

            // Fetch Milestones
            const milestones = await fetchData(`${API_BASE_URL}/project-milestones/`);
            milestones.forEach((milestone: any) => {
                if (milestone.target_date) {
                    const daysRemaining = Math.floor((new Date(milestone.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    allEvents.push({
                        id: `milestone-${milestone.milestone_id}`,
                        date: milestone.target_date,
                        type: 'milestone',
                        title: milestone.milestone_name,
                        description: milestone.milestone_description || 'Project milestone',
                        priority: daysRemaining < 7 ? 'High' : 'Medium',
                        status: milestone.is_completed ? 'Completed' : 'Pending',
                        project_code: milestone.project?.project_code,
                        days_remaining: daysRemaining,
                        is_overdue: !milestone.is_completed && daysRemaining < 0
                    });
                }
            });

            // Fetch QI Inspections
            const inspections = await fetchData(`${API_BASE_URL}/qi-inspections/`);
            inspections.forEach((inspection: any) => {
                if (inspection.scheduled_date) {
                    const daysRemaining = Math.floor((new Date(inspection.scheduled_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    allEvents.push({
                        id: `inspection-${inspection.inspection_id}`,
                        date: inspection.scheduled_date,
                        type: 'inspection',
                        title: `QI Inspection: ${inspection.inspection_type?.inspection_name || 'Inspection'}`,
                        description: inspection.findings || 'Quality inspection scheduled',
                        priority: daysRemaining < 3 ? 'High' : 'Medium',
                        status: inspection.is_completed ? 'Completed' : 'Scheduled',
                        project_code: inspection.project?.project_code,
                        assigned_to: inspection.assigned_qi?.username,
                        days_remaining: daysRemaining,
                        is_overdue: !inspection.is_completed && daysRemaining < 0
                    });
                }
            });

            // Fetch SLA Tracking
            const slaTracking = await fetchData(`${API_BASE_URL}/sla-tracking/`);
            slaTracking.forEach((sla: any) => {
                if (sla.due_date) {
                    const daysRemaining = Math.floor((new Date(sla.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
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
                        action_required: daysRemaining < 2 ? 'Immediate action required' : undefined
                    });
                }
            });

            // Fetch Vendor Performance
            const vendorPerformance = await fetchData(`${API_BASE_URL}/vendor-performance/`);
            vendorPerformance.forEach((perf: any) => {
                if (perf.evaluation_date) {
                    allEvents.push({
                        id: `vendor-eval-${perf.id}`,
                        date: perf.evaluation_date,
                        type: 'vendor_evaluation',
                        title: `Vendor Evaluation: ${perf.vendor?.vendor_name || 'Vendor'}`,
                        description: `Overall Rating: ${perf.overall_rating || 'N/A'}`,
                        priority: 'Medium',
                        status: 'Completed',
                        vendor_name: perf.vendor?.vendor_name
                    });
                }
            });

            // Fetch Invoices
            const invoices = await fetchData(`${API_BASE_URL}/invoices/`);
            invoices.forEach((invoice: any) => {
                if (invoice.due_date) {
                    const daysRemaining = Math.floor((new Date(invoice.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    allEvents.push({
                        id: `invoice-${invoice.id}`,
                        date: invoice.due_date,
                        type: 'invoice',
                        title: `Invoice Due: ${invoice.invoice_number}`,
                        description: `Amount: $${invoice.net_amount}`,
                        priority: daysRemaining < 5 ? 'High' : 'Medium',
                        status: invoice.payment_status || 'Unpaid',
                        vendor_name: invoice.vendor?.vendor_name,
                        days_remaining: daysRemaining,
                        is_overdue: invoice.payment_status === 'Overdue' || daysRemaining < 0
                    });
                }
            });

            // Fetch Payments
                        // Fetch Payments
            const authToken = localStorage.getItem('auth_token');

            const fetchPayments = async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/payments/`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Token ${authToken}`, // <-- add token here
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch payments: ${response.statusText}`);
                    }

                    const payments = await response.json();

                    payments.results.forEach((payment: any) => {
                        if (payment.payment_date) {
                            allEvents.push({
                                id: `payment-${payment.id}`,
                                date: payment.payment_date,
                                type: 'payment',
                                title: `Payment: ${payment.invoice?.invoice_number || 'Payment'}`,
                                description: `Amount: $${payment.payment_amount}`,
                                priority: 'Low',
                                status: 'Completed',
                                vendor_name: payment.invoice?.vendor?.vendor_name
                            });
                        }
                    });
                } catch (error) {
                    console.error(error);
                }
            };

            fetchPayments();

            
            // Fetch Document Compliance
            const docCompliance = await fetchData(`${API_BASE_URL}/document-compliance/`);
            docCompliance.forEach((doc: any) => {
                if (doc.due_date) {
                    const daysRemaining = Math.floor((new Date(doc.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    allEvents.push({
                        id: `doc-${doc.compliance_id}`,
                        date: doc.due_date,
                        type: 'document',
                        title: `Document Due: ${doc.doc_type?.doc_type_name || 'Document'}`,
                        description: 'Document submission deadline',
                        priority: daysRemaining < 3 ? 'High' : 'Medium',
                        status: doc.is_submitted ? 'Submitted' : 'Pending',
                        project_code: doc.project?.project_code,
                        days_remaining: daysRemaining,
                        is_overdue: doc.is_overdue || daysRemaining < 0,
                        action_required: !doc.is_submitted ? 'Submission required' : undefined
                    });
                }
            });

            // Fetch Penalties
            const penalties = await fetchData(`${API_BASE_URL}/penalties/`);
            penalties.forEach((penalty: any) => {
                if (penalty.violation_date) {
                    allEvents.push({
                        id: `penalty-${penalty.id}`,
                        date: penalty.violation_date,
                        type: 'penalty',
                        title: `Penalty: ${penalty.penalty_rule?.rule_name || 'Penalty'}`,
                        description: `Amount: $${penalty.penalty_amount}`,
                        priority: 'High',
                        status: penalty.penalty_status || 'Draft',
                        project_code: penalty.project?.project_code,
                        vendor_name: penalty.vendor?.vendor_name
                    });
                }
            });

            // Fetch Escalations
            const escalations = await fetchData(`${API_BASE_URL}/escalations/`);
            escalations.forEach((esc: any) => {
                if (esc.escalation_date) {
                    allEvents.push({
                        id: `escalation-${esc.id}`,
                        date: esc.escalation_date.split('T')[0],
                        type: 'escalation',
                        title: `Escalation: ${esc.escalation_rule?.rule_name || 'Issue'}`,
                        description: esc.escalation_reason || 'Project escalation',
                        priority: 'Critical',
                        status: esc.status || 'Open',
                        project_code: esc.project?.project_code,
                        action_required: esc.status === 'Open' ? 'Resolution required' : undefined
                    });
                }
            });

            // Fetch Backjobs
            const backjobs = await fetchData(`${API_BASE_URL}/backjob-monitoring/`);
            backjobs.forEach((backjob: any) => {
                if (backjob.target_resolution_date) {
                    const daysRemaining = Math.floor((new Date(backjob.target_resolution_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    allEvents.push({
                        id: `backjob-${backjob.id}`,
                        date: backjob.target_resolution_date,
                        type: 'backjob',
                        title: `Backjob: ${backjob.issue_category || 'Issue'}`,
                        description: backjob.issue_description || 'Backjob resolution required',
                        priority: backjob.is_overdue ? 'Critical' : 'High',
                        status: backjob.status || 'PENDING',
                        wo_number: backjob.work_order?.wo_no,
                        days_remaining: daysRemaining,
                        is_overdue: backjob.is_overdue || daysRemaining < 0,
                        action_required: 'Resolution required'
                    });
                }
            });

            // Fetch QI Daily Targets
            const qiTargets = await fetchData(`${API_BASE_URL}/qi-daily-targets/`);
            qiTargets.forEach((target: any) => {
                if (target.target_date) {
                    allEvents.push({
                        id: `qi-target-${target.id}`,
                        date: target.target_date,
                        type: 'qi_target',
                        title: `QI Target: ${target.qi_user?.username || 'QI'}`,
                        description: `Target: ${target.target_audits} audits`,
                        priority: target.target_met ? 'Low' : 'Medium',
                        status: target.target_met ? 'Met' : 'Pending',
                        assigned_to: target.qi_user?.username
                    });
                }
            });

            // Fetch Notifications
            const notifications = await fetchData(`${API_BASE_URL}/notifications/`);
            notifications.forEach((notif: any) => {
                if (notif.sent_at) {
                    allEvents.push({
                        id: `notification-${notif.id}`,
                        date: notif.sent_at.split('T')[0],
                        type: 'notification',
                        title: notif.subject || 'Notification',
                        description: notif.message || 'System notification',
                        priority: 'Low',
                        status: notif.status || 'Sent'
                    });
                }
            });

            setEvents(allEvents);
        } catch (err) {
            console.error('Error loading calendar data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (url: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Failed to fetch from ${url}: ${response.status}`);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : data.results || [];
        } catch (error) {
            console.warn(`Error fetching from ${url}:`, error);
            return [];
        }
    };

    const calculateStats = () => {
        const filtered = getFilteredEvents();
        
        const statsByType: Record<string, number> = {};
        const statsByPriority: Record<string, number> = {
            Critical: 0,
            High: 0,
            Medium: 0,
            Low: 0
        };
        const statsByStatus: Record<string, number> = {
            pending: 0,
            in_progress: 0,
            completed: 0,
            overdue: 0
        };

        let overdueCount = 0;
        let thisWeekCount = 0;
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);

        filtered.forEach(event => {
            statsByType[event.type] = (statsByType[event.type] || 0) + 1;
            statsByPriority[event.priority] = (statsByPriority[event.priority] || 0) + 1;

            if (event.is_overdue) {
                overdueCount++;
                statsByStatus.overdue++;
            } else if (event.status.toLowerCase().includes('complet')) {
                statsByStatus.completed++;
            } else if (event.status.toLowerCase().includes('progress')) {
                statsByStatus.in_progress++;
            } else {
                statsByStatus.pending++;
            }

            const eventDate = new Date(event.date);
            if (eventDate >= new Date() && eventDate <= weekFromNow) {
                thisWeekCount++;
            }
        });

        setStats({
            total_events: filtered.length,
            overdue: overdueCount,
            this_week: thisWeekCount,
            by_type: statsByType,
            by_priority: statsByPriority,
            by_status: statsByStatus
        });
    };

    const getFilteredEvents = () => {
        return events.filter(event => {
            const matchesType = filterType === 'all' || event.type === filterType;
            const matchesPriority = filterPriority === 'all' || event.priority === filterPriority;
            const matchesStatus = filterStatus === 'all' || 
                (filterStatus === 'overdue' && event.is_overdue) ||
                event.status.toLowerCase().includes(filterStatus.toLowerCase());
            const matchesSearch = searchQuery === '' || 
                event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (event.project_code && event.project_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (event.wo_number && event.wo_number.toLowerCase().includes(searchQuery.toLowerCase()));
            
            return matchesType && matchesPriority && matchesStatus && matchesSearch;
        });
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

    const getEventColor = (type: string) => {
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
            crew_monitoring: { bg: '#f59e0b', light: '#fef3c7', text: '#92400e', border: '#fbbf24' },
            qi_target: { bg: '#14b8a6', light: '#ccfbf1', text: '#134e4a', border: '#2dd4bf' },
            pca_goal: { bg: '#a855f7', light: '#f3e8ff', text: '#6b21a8', border: '#c084fc' },
            backjob: { bg: '#ef4444', light: '#fee2e2', text: '#991b1b', border: '#f87171' },
            escalation: { bg: '#f43f5e', light: '#ffe4e6', text: '#9f1239', border: '#fb7185' },
            audit: { bg: '#06b6d4', light: '#cffafe', text: '#155e75', border: '#22d3ee' },
            penalty: { bg: '#b91c1c', light: '#fee2e2', text: '#7f1d1d', border: '#dc2626' },
            invoice: { bg: '#059669', light: '#d1fae5', text: '#065f46', border: '#10b981' },
            workflow: { bg: '#7c3aed', light: '#ede9fe', text: '#5b21b6', border: '#8b5cf6' },
            notification: { bg: '#64748b', light: '#f1f5f9', text: '#334155', border: '#94a3b8' }
        };
        return colors[type] || colors.project;
    };

    const getPriorityColor = (priority: string, isOverdue: boolean) => {
        if (isOverdue) return { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' };
        const colors: Record<string, any> = {
            Critical: { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' },
            High: { bg: '#fff7ed', text: '#9a3412', border: '#fdba74' },
            Medium: { bg: '#eff6ff', text: '#1e40af', border: '#93c5fd' },
            Low: { bg: '#f9fafb', text: '#374151', border: '#d1d5db' }
        };
        return colors[priority] || colors.Low;
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
            const hasOverdue = dayEvents.some(e => e.is_overdue);

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
                        borderTop: hasOverdue ? '4px solid #dc2626' : undefined
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
                                backgroundColor: '#3b82f6',
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
                            const colors = getEventColor(event.type);
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
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                    }}
                                    title={`${event.title} - ${event.description}`}
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
                overflow: 'scroll',
                width: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
                {weekDays.map(day => (
                    <div 
                        key={day} 
                        style={{
                            backgroundColor: '#1f2937',
                            color: '#ffffff',
                            padding: '10px',
                            textAlign: 'center',
                            fontWeight: 'bold',
                            fontSize: '12px'
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
                                const colors = getEventColor(event.type);
                                const Icon = getEventIcon(event.type);
                                
                                return (
                                    <div key={idx} style={{ display: 'flex', gap: '16px', padding: '20px', border: '2px solid #f3f4f6', borderRadius: '8px' }}>
                                        <div style={{ padding: '14px', borderRadius: '50%', backgroundColor: colors.bg, display: 'flex' }}>
                                            <Icon size={24} color="#ffffff" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ fontWeight: 'bold', fontSize: '16px', margin: '0 0 8px 0' }}>{event.title}</h4>
                                            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 12px 0' }}>{event.description}</p>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                {event.project_code && <span style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px' }}>📋 {event.project_code}</span>}
                                                {event.wo_number && <span style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px' }}>🔧 {event.wo_number}</span>}
                                                {event.vendor_name && <span style={{ padding: '4px 8px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px' }}>🚚 {event.vendor_name}</span>}
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
            <div style={{ minHeight: '100vh', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <Loader2 size={48} color="#2563eb" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                    <p style={{ color: '#6b7280' }}>Loading calendar data from all sources...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', padding: '24px'}}>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '32px', color: '#ffffff', marginBottom: '24px' }}>
                    <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CalendarIcon size={40} />
                        Comprehensive Project Calendar
                    </h1>
                    <p style={{ margin: 0, opacity: 0.9 }}>Centralized tracking of all project activities and deadlines</p>
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

                {stats && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { label: 'Total Events', value: stats.total_events, color: '#3b82f6', icon: CalendarIcon },
                            { label: 'Overdue', value: stats.overdue, color: '#dc2626', icon: AlertTriangle },
                            { label: 'This Week', value: stats.this_week, color: '#10b981', icon: Clock },
                            { label: 'Critical', value: stats.by_priority.Critical || 0, color: '#ef4444', icon: AlertCircle }
                        ].map((stat, idx) => {
                            const Icon = stat.icon;
                            return (
                                <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '20px', border: '1px solid #e5e7eb' }}>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: `${stat.color}20` }}>
                                            <Icon size={24} color={stat.color} />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, margin: 0 }}>{stat.value}</p>
                                            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{stat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

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
                            <option value="project">Projects</option>
                            <option value="work_order">Work Orders</option>
                            <option value="milestone">Milestones</option>
                            <option value="inspection">Inspections</option>
                            <option value="sla">SLA</option>
                            <option value="deadline">Deadlines</option>
                            <option value="backjob">Backjobs</option>
                            <option value="escalation">Escalations</option>
                        </select>
                        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px' }}>
                            <option value="all">All Priorities</option>
                            <option value="Critical">Critical</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
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

                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', padding: '24px', width: '100%' }}>
                    {view === 'calendar' ? renderCalendarView() : renderListView()}
                </div>
            </div>
        </div>
    );
};

export default ProjectCalendarDashboard;