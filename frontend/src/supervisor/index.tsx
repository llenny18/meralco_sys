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
    List
} from 'lucide-react';

interface CalendarEvent {
    id: string;
    date: string;
    type: 'project' | 'deadline' | 'inspection' | 'sla';
    title: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    status: string;
    project_code?: string;
    days_remaining?: number;
    is_overdue?: boolean;
    assigned_to?: string;
}

interface CalendarStats {
    total_events: number;
    overdue: number;
    this_week: number;
    by_type: {
        project: number;
        deadline: number;
        sla: number;
        inspection: number;
    };
    by_priority: {
        Critical: number;
        High: number;
        Medium: number;
        Low: number;
    };
}

const ProjectCalendarDashboard: React.FC = () => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [stats, setStats] = useState<CalendarStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [view, setView] = useState<'calendar' | 'list'>('calendar');

    const getAuthToken = (): string | null => {
        return 'your_actual_token_here';
    };

    useEffect(() => {
        loadCalendarData();
        loadStats();
    }, [filterType]);

    const loadCalendarData = async () => {
        setLoading(true);
        setError(null);

        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No authentication token found. Please log in.');
            }

            const params = new URLSearchParams({
                type: filterType,
                days: '90'
            });

            const response = await fetch(
                `http://localhost:8000/api/v1/calendar/upcoming-deadlines/?${params}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setEvents(data);
        } catch (err) {
            console.error('Error loading calendar:', err);
            setError(err instanceof Error ? err.message : 'Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(
                'http://localhost:8000/a-calendar/stats/',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (err) {
            console.error('Error loading stats:', err);
        }
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
        return events.filter(event => event.date === dateStr);
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

    const getEventColor = (type: string) => {
        const colors = {
            project: { bg: '#9333ea', light: '#f3e8ff', text: '#581c87' },
            deadline: { bg: '#f97316', light: '#ffedd5', text: '#9a3412' },
            sla: { bg: '#dc2626', light: '#fee2e2', text: '#991b1b' },
            inspection: { bg: '#3b82f6', light: '#dbeafe', text: '#1e40af' }
        };
        return colors[type] || colors.project;
    };

    const getPriorityColor = (priority: string, isOverdue: boolean) => {
        if (isOverdue) return { bg: '#fef2f2', text: '#991b1b', border: '#fca5a5' };
        const colors = {
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
                        minHeight: '120px',
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

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(currentDateObj)}
                    style={{
                        minHeight: '120px',
                        border: isToday ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                        backgroundColor: isToday ? '#eff6ff' : '#ffffff',
                        padding: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.5)' : 'none',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        marginBottom: '8px',
                        color: isToday ? '#1e40af' : '#374151'
                    }}>
                        {day}
                    </div>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '70px',
                        overflowY: 'auto'
                    }}>
                        {dayEvents.slice(0, 3).map((event, idx) => {
                            const colors = getEventColor(event.type);
                            return (
                                <div
                                    key={idx}
                                    style={{
                                        fontSize: '11px',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: colors.bg,
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title={event.title}
                                >
                                    <div style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        backgroundColor: '#ffffff',
                                        flexShrink: 0
                                    }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {event.title}
                                    </span>
                                </div>
                            );
                        })}
                        {dayEvents.length > 3 && (
                            <div style={{
                                fontSize: '11px',
                                color: '#6b7280',
                                fontWeight: '500',
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

        events.forEach(event => {
            if (!groupedEvents[event.date]) {
                groupedEvents[event.date] = [];
            }
            groupedEvents[event.date].push(event);
        });

        const sortedDates = Object.keys(groupedEvents).sort();

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {sortedDates.map(date => (
                    <div 
                        key={date} 
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            background: 'linear-gradient(to right, #2563eb, #1e40af)',
                            color: '#ffffff',
                            padding: '16px'
                        }}>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                margin: '0 0 4px 0'
                            }}>
                                <Clock size={20} />
                                {new Date(date).toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#bfdbfe',
                                margin: 0
                            }}>
                                {groupedEvents[date].length} event{groupedEvents[date].length !== 1 ? 's' : ''}
                            </p>
                        </div>
                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {groupedEvents[date].map((event, idx) => {
                                const colors = getEventColor(event.type);
                                const priorityColors = getPriorityColor(event.priority, event.is_overdue || false);
                                
                                return (
                                    <div 
                                        key={idx} 
                                        style={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: '16px',
                                            padding: '16px',
                                            border: '2px solid #f3f4f6',
                                            borderRadius: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#93c5fd';
                                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#f3f4f6';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <div style={{
                                            padding: '12px',
                                            borderRadius: '50%',
                                            backgroundColor: colors.bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {event.type === 'deadline' ? <FileText size={20} color="#ffffff" /> :
                                             event.type === 'sla' ? <AlertCircle size={20} color="#ffffff" /> :
                                             event.type === 'inspection' ? <CheckCircle size={20} color="#ffffff" /> :
                                             <Clock size={20} color="#ffffff" />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                marginBottom: '8px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <h4 style={{
                                                    fontWeight: 'bold',
                                                    color: '#1f2937',
                                                    margin: 0
                                                }}>
                                                    {event.title}
                                                </h4>
                                                <span style={{
                                                    padding: '4px 12px',
                                                    borderRadius: '9999px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold',
                                                    border: `2px solid ${priorityColors.border}`,
                                                    backgroundColor: priorityColors.bg,
                                                    color: priorityColors.text
                                                }}>
                                                    {event.is_overdue ? 'OVERDUE' : event.priority}
                                                </span>
                                            </div>
                                            <p style={{
                                                fontSize: '14px',
                                                color: '#6b7280',
                                                margin: '0 0 8px 0'
                                            }}>
                                                {event.description}
                                            </p>
                                            {event.project_code && (
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                    fontFamily: 'monospace',
                                                    backgroundColor: '#f3f4f6',
                                                    display: 'inline-block',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    margin: '0 0 4px 0'
                                                }}>
                                                    Project: {event.project_code}
                                                </p>
                                            )}
                                            {event.assigned_to && (
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                    margin: '4px 0 0 0'
                                                }}>
                                                    Assigned to: {event.assigned_to}
                                                </p>
                                            )}
                                        </div>
                                        {event.days_remaining !== undefined && (
                                            <div style={{ textAlign: 'right' }}>
                                                <p style={{
                                                    fontSize: '18px',
                                                    fontWeight: 'bold',
                                                    color: event.days_remaining < 0 ? '#dc2626' :
                                                           event.days_remaining <= 2 ? '#ea580c' :
                                                           '#16a34a',
                                                    margin: '0 0 4px 0'
                                                }}>
                                                    {event.days_remaining < 0 ? 
                                                        `${Math.abs(event.days_remaining)}d` :
                                                        `${event.days_remaining}d`
                                                    }
                                                </p>
                                                <p style={{
                                                    fontSize: '12px',
                                                    color: '#6b7280',
                                                    margin: 0
                                                }}>
                                                    {event.days_remaining < 0 ? 'overdue' : 'remaining'}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
                {sortedDates.length === 0 && (
                    <div style={{
                        backgroundColor: '#ffffff',
                        border: '2px dashed #d1d5db',
                        borderRadius: '8px',
                        padding: '48px',
                        textAlign: 'center'
                    }}>
                        <Clock size={64} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
                        <p style={{
                            color: '#6b7280',
                            fontSize: '18px',
                            margin: 0
                        }}>
                            No events found
                        </p>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)',
                padding: '24px'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
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
                        <p style={{ color: '#6b7280', margin: 0 }}>Loading calendar data...</p>
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
            <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{
                    background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
                    padding: '24px',
                    color: '#ffffff'
                }}>
                    <h1 style={{
                        fontSize: '30px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        margin: 0
                    }}>
                        Project Calendar & Deadlines
                    </h1>
                    <p style={{
                        color: '#bfdbfe',
                        margin: '8px 0 0 0'
                    }}>
                        Track and manage all your project deadlines in one place
                    </p>
                </div>

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
                                    Error Loading Calendar
                                </h3>
                                <p style={{
                                    fontSize: '14px',
                                    color: '#b91c1c',
                                    margin: '0 0 12px 0'
                                }}>
                                    {error}
                                </p>
                                <button 
                                    onClick={loadCalendarData}
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

                {stats && (
                    <div style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        padding: '20px',
                        borderLeft: '4px solid #3b82f6'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '16px'
                        }}>
                            <button 
                                style={{
                                    padding: '8px',
                                    color: 'black',
                                    borderRadius: '6px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onClick={() => navigateMonth('prev')}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <h2 style={{
                                fontSize: '20px',
                                fontWeight: 'bold',
                                color: '#1f2937',
                                minWidth: '200px',
                                textAlign: 'center',
                                margin: 0
                            }}>
                                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h2>
                            <button 
                                style={{
                                    padding: '8px',
                                    color: 'black',
                                    borderRadius: '6px',
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #d1d5db',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onClick={() => navigateMonth('next')}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button 
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    backgroundColor: '#2563eb',
                                    color: '#ffffff',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onClick={goToToday}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                            >
                                Today
                            </button>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <select 
                                value={filterType} 
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{
                                    padding: '8px 16px',
                                    color: 'black',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    backgroundColor: '#ffffff',
                                    fontWeight: '500',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="all">All Events</option>
                                <option value="project">Projects</option>
                                <option value="deadline">Deadlines</option>
                                <option value="sla">SLA Items</option>
                                <option value="inspection">Inspections</option>
                            </select>
                            
                            <div style={{
                                display: 'flex',
                                gap: '4px',
                                backgroundColor: '#e5e7eb',
                                borderRadius: '6px',
                                padding: '4px'
                            }}>
                                <button 
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontWeight: '500',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: view === 'calendar' ? '#ffffff' : 'transparent',
                                        color: view === 'calendar' ? '#1f2937' : '#6b7280',
                                        boxShadow: view === 'calendar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onClick={() => setView('calendar')}
                                    onMouseEnter={(e) => {
                                        if (view !== 'calendar') e.currentTarget.style.color = '#1f2937';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (view !== 'calendar') e.currentTarget.style.color = '#6b7280';
                                    }}
                                >
                                    <CalendarIcon size={16} />
                                    Calendar
                                </button>
                                <button 
                                    style={{
                                        padding: '8px 16px',
                                        borderRadius: '6px',
                                        fontWeight: '500',
                                        border: 'none',
                                        cursor: 'pointer',
                                        backgroundColor: view === 'list' ? '#ffffff' : 'transparent',
                                        color: view === 'list' ? '#1f2937' : '#6b7280',
                                        boxShadow: view === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                    onClick={() => setView('list')}
                                    onMouseEnter={(e) => {
                                        if (view !== 'list') e.currentTarget.style.color = '#1f2937';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (view !== 'list') e.currentTarget.style.color = '#6b7280';
                                    }}
                                >
                                    <List size={16} />
                                    List
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    padding: '24px'
                }}>
                    {view === 'calendar' ? renderCalendarView() : renderListView()}
                </div>
            </div>
        </div>
    );
};

export default ProjectCalendarDashboard;