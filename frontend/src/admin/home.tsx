import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Loader2,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Users,
    FileText,
    ClipboardCheck,
    DollarSign,
    BarChart3
} from 'lucide-react';

// Types
interface User {
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role_name: string;
    permissions: Permission[];
}

interface Permission {
    permission_name: string;
    permission_description: string;
    module_name: string;
}

interface DashboardState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    data: any;
}

// API Service
class APIService {
    private baseURL: string;
    private token: string;

    constructor(baseURL: string, token: string) {
        this.baseURL = baseURL;
        this.token = token;
    }

    private async request(endpoint: string, options: RequestInit = {}) {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers: {
                'Authorization': `Token ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json();
    }

    async get(endpoint: string) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint: string, data: any) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }
}

// Main Dashboard Component
const Dashboard: React.FC = () => {
    const [state, setState] = useState<DashboardState>({
        user: null,
        token: localStorage.getItem('token'),
        loading: true,
        error: null,
        data: null,
    });

    const [selectedRole, setSelectedRole] = useState<string>('');
    const [selectedFeature, setSelectedFeature] = useState<string>('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setState(prev => ({ ...prev, user, loading: false }));
            setSelectedRole(user.role_name);
        }
    }, []);

    const api = state.token ? new APIService('http://localhost:8000', state.token) : null;

    // Feature configurations for all user roles
    const userRoleFeatures = {
        'Vendor Representative': [
            { id: 'my_projects', label: 'My Projects', endpoint: '/api/v1/vendor-portal/my_projects/' },
            { id: 'pending_docs', label: 'Pending Documents', endpoint: '/api/v1/vendor-portal/pending_documents/' },
            { id: 'payment_summary', label: 'Payment Summary', endpoint: '/api/v1/vendor-portal/payment_summary/' },
            { id: 'upload_document', label: 'Upload Document', endpoint: '/api/v1/vendor-portal/upload_document/', type: 'form' },
            { id: 'submit_dispute', label: 'Submit Dispute', endpoint: '/api/v1/vendor-portal/submit_dispute/', type: 'form' },
        ],
        'Clerk': [
            { id: 'pending_documents', label: 'Pending Documents', endpoint: '/api/v1/clerk/pending_documents/' },
            { id: 'upload_history', label: 'My Upload History', endpoint: '/api/v1/clerk/my_upload_history/' },
            { id: 'missing_docs', label: 'Missing Documents Report', endpoint: '/api/v1/clerk/missing_documents_report/' },
            { id: 'send_reminder', label: 'Send Reminder', endpoint: '/api/v1/clerk/send_reminder/', type: 'form' },
            { id: 'bulk_upload', label: 'Bulk Upload Documents', endpoint: '/api/v1/clerk/bulk_upload_documents/', type: 'form' },
        ],
        'Engineering Aide': [
            { id: 'workflow_overview', label: 'Workflow Overview', endpoint: '/api/v1/engineering-aide/workflow_overview/' },
            { id: 'workflow_viz', label: 'Workflow Visualization', endpoint: '/api/v1/engineering-aide/workflow_visualization/', type: 'param' },
            { id: 'doc_compliance', label: 'Document Compliance', endpoint: '/api/v1/engineering-aide/document_compliance_summary/' },
            { id: 'upcoming_deadlines', label: 'Upcoming Deadlines', endpoint: '/api/v1/engineering-aide/upcoming_deadlines/' },
            { id: 'summary_report', label: 'Summary Report', endpoint: '/api/v1/engineering-aide/summary_report/' },
        ],
        'Quality Inspector': [
            { id: 'today_schedule', label: "Today's Schedule", endpoint: '/api/v1/qi-mobile/today_schedule/' },
            { id: 'daily_progress', label: 'Daily Progress', endpoint: '/api/v1/qi-mobile/daily_progress/' },
            { id: 'complete_inspection', label: 'Complete Inspection', endpoint: '/api/v1/qi-mobile/complete_inspection/', type: 'form' },
            { id: 'log_missed', label: 'Log Missed Target', endpoint: '/api/v1/qi-mobile/log_missed_target/', type: 'form' },
        ],
        'Engineer': [
            { id: 'my_projects', label: 'My Projects', endpoint: '/api/v1/engineer/my_projects/' },
            { id: 'pending_approvals', label: 'Pending Approvals', endpoint: '/api/v1/engineer/pending_approvals/' },
            { id: 'sla_compliance', label: 'SLA Compliance', endpoint: '/api/v1/engineer/sla_compliance/' },
            { id: 'vendor_performance', label: 'Vendor Performance', endpoint: '/api/v1/engineer/vendor_performance/' },
            { id: 'approve_doc', label: 'Approve Document', endpoint: '/api/v1/engineer/approve_document/', type: 'form' },
            { id: 'chatbot', label: 'AI Chatbot', endpoint: '/api/v1/engineer/use_chatbot/', type: 'form' },
        ],
        'WO Supervisor': [
            { id: 'full_dashboard', label: 'Full Dashboard', endpoint: '/api/v1/wo-supervisor/full_dashboard/' },
            { id: 'manage_penalties', label: 'Manage Penalties', endpoint: '/api/v1/wo-supervisor/manage_penalties/' },
            { id: 'escalations', label: 'Manage Escalations', endpoint: '/api/v1/wo-supervisor/manage_escalation/', type: 'form' },
            { id: 'predictive', label: 'Predictive Analytics', endpoint: '/api/v1/wo-supervisor/predictive_analytics/' },
        ],
        'Team Leader': [
            { id: 'org_overview', label: 'Organization Overview (TV Mode)', endpoint: '/api/v1/team-leader/organization_overview/' },
            { id: 'pending_approvals', label: 'Pending Approvals', endpoint: '/api/v1/team-leader/pending_approvals/' },
            { id: 'performance_trends', label: 'Performance Trends', endpoint: '/api/v1/team-leader/performance_trends/' },
            { id: 'comparison', label: 'Comparison Report', endpoint: '/api/v1/team-leader/comparison_report/' },
            { id: 'ai_suggestions', label: 'AI Suggestions', endpoint: '/api/v1/team-leader/ai_suggestions/' },
            { id: 'approve_penalty', label: 'Approve Penalty', endpoint: '/api/v1/team-leader/approve_penalty/', type: 'form' },
        ],
        'Sector Manager': [
            { id: 'executive_dashboard', label: 'Executive Dashboard', endpoint: '/api/v1/sector-manager/executive_dashboard/' },
            { id: 'sector_trends', label: 'Sector Trends', endpoint: '/api/v1/sector-manager/sector_trends/', type: 'param' },
            { id: 'vendor_rankings', label: 'Vendor Rankings', endpoint: '/api/v1/sector-manager/vendor_rankings/' },
            { id: 'strategic_recs', label: 'Strategic Recommendations', endpoint: '/api/v1/sector-manager/strategic_recommendations/' },
        ],
        'System Administrator': [
            { id: 'system_health', label: 'System Health', endpoint: '/api/v1/system-admin/system_health/' },
            { id: 'user_management', label: 'User Management', endpoint: '/api/v1/system-admin/user_management/' },
            { id: 'audit_logs', label: 'Audit Logs', endpoint: '/api/v1/system-admin/audit_logs/' },
            { id: 'security_report', label: 'Security Report', endpoint: '/api/v1/system-admin/security_report/' },
            { id: 'create_user', label: 'Create User', endpoint: '/api/v1/system-admin/create_user/', type: 'form' },
            { id: 'backup', label: 'Database Backup', endpoint: '/api/v1/system-admin/database_backup/', type: 'action' },
        ],
    };

    const loadFeatureData = async (feature: any) => {
        if (!api) return;

        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const data = await api.get(feature.endpoint);
            setState(prev => ({ ...prev, data, loading: false }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Unknown error',
                loading: false
            }));
        }
    };

    const handleFeatureSelect = (featureId: string) => {
        setSelectedFeature(featureId);
        const features = userRoleFeatures[selectedRole as keyof typeof userRoleFeatures] || [];
        const feature = features.find(f => f.id === featureId);

        if (feature && feature.type !== 'form' && feature.type !== 'action') {
            loadFeatureData(feature);
        }
    };

    const renderFeatureContent = () => {
        if (!selectedFeature) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to Your Dashboard</CardTitle>
                        <CardDescription>
                            Select a feature from the dropdown above to get started
                        </CardDescription>
                    </CardHeader>
                </Card>
            );
        }

        if (state.loading) {
            return (
                <Card>
                    <CardContent className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin" />
                    </CardContent>
                </Card>
            );
        }

        if (state.error) {
            return (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{state.error}</AlertDescription>
                </Alert>
            );
        }

        const features = userRoleFeatures[selectedRole as keyof typeof userRoleFeatures] || [];
        const feature = features.find(f => f.id === selectedFeature);

        if (feature?.type === 'form') {
            return renderFormContent(feature);
        }

        return renderDataContent();
    };

    const renderFormContent = (feature: any) => {
        // Different forms based on feature
        switch (feature.id) {
            case 'upload_document':
                return <UploadDocumentForm api={api!} />;
            case 'submit_dispute':
                return <SubmitDisputeForm api={api!} />;
            case 'send_reminder':
                return <SendReminderForm api={api!} />;
            case 'complete_inspection':
                return <CompleteInspectionForm api={api!} />;
            case 'approve_doc':
                return <ApproveDocumentForm api={api!} />;
            case 'chatbot':
                return <ChatbotForm api={api!} />;
            case 'escalations':
                return <EscalationForm api={api!} />;
            case 'approve_penalty':
                return <ApprovePenaltyForm api={api!} />;
            case 'create_user':
                return <CreateUserForm api={api!} />;
            default:
                return <div>Form not implemented</div>;
        }
    };

    const renderDataContent = () => {
        if (!state.data) return null;

        // Render based on selected role and feature
        switch (selectedRole) {
            case 'Vendor Representative':
                return <VendorRepresentativeView data={state.data} featureId={selectedFeature} />;
            case 'Clerk':
                return <ClerkView data={state.data} featureId={selectedFeature} />;
            case 'Engineering Aide':
                return <EngineeringAideView data={state.data} featureId={selectedFeature} />;
            case 'Quality Inspector':
                return <QualityInspectorView data={state.data} featureId={selectedFeature} />;
            case 'Engineer':
                return <EngineerView data={state.data} featureId={selectedFeature} />;
            case 'WO Supervisor':
                return <WOSupervisorView data={state.data} featureId={selectedFeature} />;
            case 'Team Leader':
                return <TeamLeaderView data={state.data} featureId={selectedFeature} />;
            case 'Sector Manager':
                return <SectorManagerView data={state.data} featureId={selectedFeature} />;
            case 'System Administrator':
                return <SystemAdministratorView data={state.data} featureId={selectedFeature} />;
            default:
                return <pre>{JSON.stringify(state.data, null, 2)}</pre>;
        }
    };

    const availableRoles = Object.keys(userRoleFeatures);
    const currentFeatures = userRoleFeatures[selectedRole as keyof typeof userRoleFeatures] || [];

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-gray-600">
                        {state.user ? `Welcome, ${state.user.first_name} ${state.user.last_name}` : 'Loading...'}
                    </p>
                </div>
                {state.user && (
                    <Badge variant="outline" className="text-lg px-4 py-2">
                        {state.user.role_name}
                    </Badge>
                )}
            </div>

            {/* Role and Feature Selection */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Role & Feature</CardTitle>
                    <CardDescription>
                        Choose a user role and feature to explore
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">User Role</label>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableRoles.map(role => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Feature</label>
                            <Select
                                value={selectedFeature}
                                onValueChange={handleFeatureSelect}
                                disabled={!selectedRole}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a feature" />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentFeatures.map(feature => (
                                        <SelectItem key={feature.id} value={feature.id}>
                                            {feature.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Content */}
            <div className="min-h-[400px]">
                {renderFeatureContent()}
            </div>
        </div>
    );
};

// ============================================
// VENDOR REPRESENTATIVE VIEW COMPONENTS
// ============================================

const VendorRepresentativeView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'my_projects') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>All projects assigned to your vendor</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data && data.length > 0 ? (
                            data.map((project: any) => (
                                <Card key={project.project_id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold">{project.project_code}</h3>
                                                <p className="text-sm text-gray-600">{project.project_name}</p>
                                            </div>
                                            <Badge>{project.status}</Badge>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Start Date</p>
                                                <p className="font-medium">{project.start_date || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Completion</p>
                                                <p className="font-medium">{project.completion_date || 'Pending'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Priority</p>
                                                <Badge variant={project.priority === 'Critical' ? 'destructive' : 'default'}>
                                                    {project.priority}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No projects found</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (featureId === 'payment_summary') {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₱{data.total_invoiced?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            ₱{data.total_paid?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                            ₱{data.outstanding?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Penalties</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            ₱{data.penalties?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (featureId === 'pending_docs') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pending Documents</CardTitle>
                    <CardDescription>Documents pending submission</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data && data.length > 0 ? (
                            data.map((doc: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <FileText className="h-8 w-8 text-blue-600" />
                                        <div>
                                            <p className="font-medium">{doc.doc_type?.doc_type_name}</p>
                                            <p className="text-sm text-gray-600">{doc.project?.project_code}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">Due: {doc.due_date}</p>
                                        {doc.is_overdue && (
                                            <Badge variant="destructive">Overdue</Badge>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No pending documents</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

// ============================================
// CLERK VIEW COMPONENTS
// ============================================

const ClerkView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'pending_documents') {
        return (
            <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Pending Upload</TabsTrigger>
                    <TabsTrigger value="approval">Pending Approval</TabsTrigger>
                </TabsList>
                <TabsContent value="upload">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents Pending Upload</CardTitle>
                            <CardDescription>
                                {data.stats?.total_pending_upload || 0} documents need to be uploaded
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.pending_upload?.map((doc: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{doc.doc_type?.doc_type_name}</p>
                                                <p className="text-sm text-gray-600">{doc.project?.project_code}</p>
                                            </div>
                                            <Badge variant={doc.is_overdue ? "destructive" : "default"}>
                                                {doc.is_overdue ? "Overdue" : "Pending"}
                                            </Badge>
                                        </div>
                                        <p className="text-sm mt-2">Due: {doc.due_date}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="approval">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents Pending Approval</CardTitle>
                            <CardDescription>
                                {data.stats?.total_pending_approval || 0} documents awaiting approval
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.pending_approval?.map((doc: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{doc.document_name}</p>
                                                <p className="text-sm text-gray-600">{doc.project?.project_code}</p>
                                            </div>
                                            <Badge>Pending Approval</Badge>
                                        </div>
                                        <p className="text-sm mt-2">
                                            Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        );
    }

    if (featureId === 'upload_history') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Upload History</CardTitle>
                    <CardDescription>Recent document uploads</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold">{data.stats?.total_uploaded || 0}</div>
                                    <p className="text-xs text-gray-600">Total Uploaded</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-green-600">
                                        {data.stats?.approved || 0}
                                    </div>
                                    <p className="text-xs text-gray-600">Approved</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-orange-600">
                                        {data.stats?.pending || 0}
                                    </div>
                                    <p className="text-xs text-gray-600">Pending</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="text-2xl font-bold text-red-600">
                                        {data.stats?.rejected || 0}
                                    </div>
                                    <p className="text-xs text-gray-600">Rejected</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Upload list */}
                        <div className="space-y-2">
                            {data.uploads?.map((upload: any) => (
                                <div key={upload.id} className="flex items-center justify-between p-3 border rounded">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="h-5 w-5" />
                                        <div>
                                            <p className="font-medium text-sm">{upload.document_name}</p>
                                            <p className="text-xs text-gray-600">
                                                {new Date(upload.upload_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={
                                        upload.approval_status === 'Approved' ? 'default' :
                                            upload.approval_status === 'Rejected' ? 'destructive' :
                                                'secondary'
                                    }>
                                        {upload.approval_status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (featureId === 'missing_docs') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Missing Documents Report</CardTitle>
                    <CardDescription>
                        {data.total_missing || 0} documents missing ({data.overdue_count || 0} overdue)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Object.entries(data.by_vendor || {}).map(([vendor, docs]: [string, any]) => (
                            <Card key={vendor}>
                                <CardHeader>
                                    <CardTitle className="text-lg">{vendor}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {docs.map((doc: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                                <div>
                                                    <p className="font-medium text-sm">{doc.project_code}</p>
                                                    <p className="text-xs text-gray-600">{doc.document_type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs">Due: {doc.due_date}</p>
                                                    {doc.is_overdue && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            {doc.overdue_days} days overdue
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// ENGINEERING AIDE VIEW COMPONENTS
// ============================================
const EngineeringAideView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'workflow_overview') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold">{data.total_active || 0}</div>
                            <p className="text-xs text-gray-600">Active Workflows</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-red-600">{data.blocked || 0}</div>
                            <p className="text-xs text-gray-600">Blocked</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-2xl font-bold text-orange-600">{data.overdue || 0}</div>
                            <p className="text-xs text-gray-600">Overdue</p>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Workflows by Stage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Object.entries(data.by_stage || {}).map(([stage, stageData]: [string, any]) => (
                                <Card key={stage}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{stage}</CardTitle>
                                            <Badge>{stageData.count} projects</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {stageData.projects?.map((project: any, index: number) => (
                                                <div key={index} className="p-3 bg-gray-50 rounded">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-medium">{project.project_code}</p>
                                                            <p className="text-sm text-gray-600">{project.project_name}</p>
                                                            {project.assigned_to && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    Assigned: {project.assigned_to}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right">
                                                            <Badge variant={
                                                                project.status === 'Blocked' ? 'destructive' : 'default'
                                                            }>
                                                                {project.status}
                                                            </Badge>
                                                            {project.due_date && (
                                                                <p className="text-xs mt-1">Due: {project.due_date}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'doc_compliance') {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Compliance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <div className="text-2xl font-bold">{data.overall?.total_required || 0}</div>
                                <p className="text-xs text-gray-600">Total Required</p>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {data.overall?.submitted || 0}
                                </div>
                                <p className="text-xs text-gray-600">Submitted</p>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {data.overall?.approved || 0}
                                </div>
                                <p className="text-xs text-gray-600">Approved</p>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-red-600">
                                    {data.overall?.overdue || 0}
                                </div>
                                <p className="text-xs text-gray-600">Overdue</p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Compliance Rate</span>
                                <span className="text-sm font-bold">{data.overall?.compliance_rate || 0}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-green-600 h-2 rounded-full transition-all"
                                    style={{ width: ${data.overall?.compliance_rate || 0}% }}
/>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>By Document Type</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.by_type?.map((type: any, index: number) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium">{type.doc_type__doc_type_name}</h4>
                                        <Badge>{type.total} total</Badge>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-600">Submitted</p>
                                            <p className="font-medium text-green-600">{type.submitted}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Approved</p>
                                            <p className="font-medium text-blue-600">{type.approved}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-600">Overdue</p>
                                            <p className="font-medium text-red-600">{type.overdue}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'upcoming_deadlines') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Deadlines</CardTitle>
                    <CardDescription>{data.total_upcoming || 0} deadlines in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.deadlines?.map((deadline: any, index: number) => (
                            <div
                                key={index}
                                className={p - 4 border-l-4 rounded-lg ${                   deadline.urgency === 'critical' ? 'border-red-500 bg-red-50' : deadline.urgency === 'high' ? 'border-orange-500 bg-orange-50' : 'border-blue-500 bg-blue-50'}}
>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-medium">{deadline.project_code}</p>
                                <p className="text-sm text-gray-600">{deadline.stage_name}</p>
                                {deadline.assigned_to && (
                                    <p className="text-xs text-gray-500 mt-1">Assigned: {deadline.assigned_to}</p>
                                )}
                            </div>
                            <div className="text-right">
                                <Badge variant={
                                    deadline.urgency === 'critical' ? 'destructive' :
                                        deadline.urgency === 'high' ? 'default' :
                                            'secondary'
                                }>
                                    {deadline.days_until} days
                                </Badge>
                                <p className="text-xs mt-1">{deadline.due_date}</p>
                            </div>
                        </div>
                    </div>
))}
                </div>
            </CardContent>
</Card >
);
}
return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// QUALITY INSPECTOR VIEW COMPONENTS
// ============================================
const QualityInspectorView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'today_schedule') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Today's Inspection Schedule</CardTitle>
                    <CardDescription>{data.length || 0} inspections scheduled</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data && data.length > 0 ? (
                            data.map((inspection: any) => (
                                <Card key={inspection.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{inspection.project?.project_code}</h4>
                                                <p className="text-sm text-gray-600">{inspection.inspection_type?.inspection_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Location: {inspection.project?.project_location || 'N/A'}
                                                </p>
                                            </div>
                                            <Badge variant={inspection.is_completed ? 'default' : 'secondary'}>
                                                {inspection.is_completed ? 'Completed' : 'Pending'}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No inspections scheduled for today</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (featureId === 'daily_progress') {
        const percentage = data?.percentage || 0;
        const isOnTrack = percentage >= 80;
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600">{data?.target || 0}</div>
                                <p className="text-sm text-gray-600">Target</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600">{data?.actual || 0}</div>
                                <p className="text-sm text-gray-600">Completed</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-orange-600">{data?.remaining || 0}</div>
                                <p className="text-sm text-gray-600">Remaining</p>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Progress</span>
                                <span className="text-sm font-bold">{percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className={`h-4 rounded-full transition-all ${isOnTrack ? 'bg-green-600' : 'bg-orange-600'
                                        }`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                        </div>

                        {data?.target_met ? (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Great job! You've met today's target.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Alert variant={isOnTrack ? 'default' : 'destructive'}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {isOnTrack
                                        ? 'You\'re on track to meet today\'s target!'
                                        : 'You need to complete more inspections to meet your target.'
                                    }
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// ENGINEER VIEW COMPONENTS
// ============================================
const EngineerView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'my_projects') {
        return (
            <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="pending">Pending Review</TabsTrigger>
                    <TabsTrigger value="delayed">Delayed</TabsTrigger>
                    <TabsTrigger value="sla">SLA Risk</TabsTrigger>
                </TabsList>
                {['active', 'pending', 'delayed', 'sla'].map(tab => (
                    <TabsContent key={tab} value={tab}>
                        <Card>
                            <CardHeader>
                                <CardTitle className="capitalize">{tab} Projects</CardTitle>
                                <CardDescription>
                                    {data.categorized?.[tab === 'sla' ? 'sla_risk' : tab === 'pending' ? 'pending_review' : tab]?.length || 0} projects
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {data.categorized?.[tab === 'sla' ? 'sla_risk' : tab === 'pending' ? 'pending_review' : tab]?.map((project: any) => (
                                        <Card key={project.project_id}>
                                            <CardContent className="pt-6">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold">{project.project_code}</h4>
                                                        <p className="text-sm text-gray-600">{project.project_name}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Vendor: {project.vendor?.vendor_name || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <Badge>{project.status}</Badge>
                                                        {project.is_delayed && (
                                                            <Badge variant="destructive" className="ml-2">
                                                                Delayed
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        );
    }
    if (featureId === 'pending_approvals') {
        return (
            <Tabs defaultValue="documents" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="documents">Documents ({data.documents?.count || 0})</TabsTrigger>
                    <TabsTrigger value="inspections">Inspections ({data.inspections?.count || 0})</TabsTrigger>
                    <TabsTrigger value="projects">Projects ({data.projects?.count || 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents Pending Approval</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.documents?.items?.map((doc: any) => (
                                    <div key={doc.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{doc.document_name}</p>
                                                <p className="text-sm text-gray-600">{doc.project?.project_code}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge>Pending</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="inspections">
                    <Card>
                        <CardHeader>
                            <CardTitle>Inspections Pending Approval</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.inspections?.items?.map((inspection: any) => (
                                    <div key={inspection.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{inspection.inspection_type?.inspection_name}</p>
                                                <p className="text-sm text-gray-600">{inspection.project?.project_code}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Result: {inspection.inspection_result}
                                                </p>
                                            </div>
                                            <Badge variant={
                                                inspection.inspection_result === 'Pass' ? 'default' : 'destructive'
                                            }>
                                                {inspection.inspection_result}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle>Projects Pending Approval</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.projects?.items?.map((project: any) => (
                                    <Card key={project.project_id}>
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{project.project_code}</h4>
                                                    <p className="text-sm text-gray-600">{project.project_name}</p>
                                                </div>
                                                <Badge>Pending Approval</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        );
    }
    if (featureId === 'sla_compliance') {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    {data.summary?.map((item: any, index: number) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="text-2xl font-bold">{item.count}</div>
                                <p className="text-sm text-gray-600 capitalize">{item.status}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>SLAs At Risk</CardTitle>
                        <CardDescription>
                            {data.at_risk?.length || 0} SLAs due in next 3 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.at_risk?.map((sla: any) => (
                                <div key={sla.sla_tracking_id} className="p-4 border-l-4 border-orange-500 rounded-lg bg-orange-50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{sla.project?.project_code}</p>
                                            <p className="text-sm text-gray-600">{sla.sla_rule?.rule_name}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">Due: {sla.due_date}</p>
                                            <Badge variant="destructive">At Risk</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Overall Breach Rate</span>
                            <span className="text-2xl font-bold">{data.breach_rate || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                                className="bg-red-600 h-2 rounded-full transition-all"
                                style={{ width: `${data.breach_rate || 0}%` }}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'vendor_performance') {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Vendor Performance Summary</CardTitle>
                        <CardDescription>
                            {data.summary?.total_vendors || 0} vendors |
                            Avg On-Time Rate: {data.summary?.avg_on_time_rate || 0}%
                        </CardDescription>
                    </CardHeader>
                </Card>
                <div className="space-y-3">
                    {data.vendors?.map((vendor: any, index: number) => (
                        <Card key={index}>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-semibold">{vendor.vendor_name}</h4>
                                        <p className="text-sm text-gray-600">{vendor.vendor_code}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">
                                            {vendor.compliance_score.toFixed(1)}
                                        </div>
                                        <p className="text-xs text-gray-600">Compliance Score</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Total Projects</p>
                                        <p className="font-bold">{vendor.total_projects}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Completed</p>
                                        <p className="font-bold text-green-600">{vendor.completed}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Delayed</p>
                                        <p className="font-bold text-red-600">{vendor.delayed}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">On-Time Rate</p>
                                        <p className="font-bold">{vendor.on_time_rate}%</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-gray-600">Performance</span>
                                        <span className="text-xs font-medium">{vendor.on_time_rate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className={`h-2 rounded-full transition-all ${vendor.on_time_rate >= 80 ? 'bg-green-600' :
                                                    vendor.on_time_rate >= 60 ? 'bg-orange-600' :
                                                        'bg-red-600'
                                                }`}
                                            style={{ width: `${vendor.on_time_rate}%` }}
                                        />
                                    </div>
                                </div>

                                {vendor.total_penalties > 0 && (
                                    <div className="mt-3 p-2 bg-red-50 rounded">
                                        <p className="text-sm text-red-800">
                                            Total Penalties: ₱{vendor.total_penalties.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// WO SUPERVISOR VIEW COMPONENTS
// ============================================
const WOSupervisorView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'full_dashboard') {
        return (
            <div className="space-y-6">
                {/* Projects Overview */}
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.projects?.total || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {data.projects?.active || 0} active
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Delayed</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{data.projects?.delayed || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {data.projects?.completion_rate || 0}% completion rate
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{data.sla?.breaches || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {data.sla?.at_risk || 0} at risk
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Escalations</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.escalations || 0}</div>
                            <p className="text-xs text-muted-foreground">Open</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Penalties */}
                <Card>
                    <CardHeader>
                        <CardTitle>Penalties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Pending Approval</p>
                                <p className="text-2xl font-bold">{data.penalties?.pending || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Amount</p>
                                <p className="text-2xl font-bold">₱{data.penalties?.total_amount?.toLocaleString() || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* QI Workload */}
                <Card>
                    <CardHeader>
                        <CardTitle>QI Workload Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.qi_workload?.map((qi: any, index: number) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-medium">{qi.qi_name}</p>
                                            <p className="text-sm text-gray-600">
                                                Target: {qi.daily_target} | Completed: {qi.completed_today}
                                            </p>
                                        </div>
                                        <Badge variant={qi.target_met ? 'default' : 'destructive'}>
                                            {qi.target_met ? 'On Track' : 'Behind'}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Pending Inspections: {qi.pending_inspections}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Billing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total Invoiced</p>
                                <p className="text-xl font-bold">₱{data.billing?.total_invoiced?.toLocaleString() || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Paid</p>
                                <p className="text-xl font-bold text-green-600">
                                    ₱{data.billing?.total_paid?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Outstanding</p>
                                <p className="text-xl font-bold text-orange-600">
                                    ₱{data.billing?.outstanding?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'manage_penalties') {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Penalty Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold">{data.summary?.total || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Draft</p>
                                <p className="text-2xl font-bold text-orange-600">{data.summary?.draft || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Issued</p>
                                <p className="text-2xl font-bold">{data.summary?.issued || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Paid</p>
                                <p className="text-2xl font-bold text-green-600">{data.summary?.paid || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Penalties by Vendor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.by_vendor?.map((vendor: any, index: number) => (
                                <div key={index} className="p-4 border rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium">{vendor.vendor__vendor_name}</p>
                                            <p className="text-sm text-gray-600">
                                                {vendor.total_penalties} penalties
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-red-600">
                                                ₱{vendor.total_amount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>All Penalties</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.penalties?.map((penalty: any) => (
                                <div key={penalty.id} className="p-3 border rounded">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{penalty.project?.project_code}</p>
                                            <p className="text-sm text-gray-600">{penalty.penalty_rule?.rule_name}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Vendor: {penalty.vendor?.vendor_name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">₱{penalty.penalty_amount?.toLocaleString()}</p>
                                            <Badge>{penalty.penalty_status}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'predictive') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Predictive Analytics - At-Risk Projects</CardTitle>
                    <CardDescription>
                        {data.total_at_risk || 0} projects identified as high risk
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.at_risk_projects?.map((project: any, index: number) => (
                            <div
                                key={index}
                                className={p - 4 border-l-4 rounded-lg ${                   project.risk_level === 'Critical' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50'}}
>
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="font-semibold">{project.project_code}</h4>
                                <p className="text-sm text-gray-600">{project.project_name}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant={project.risk_level === 'Critical' ? 'destructive' : 'default'}>
                                    {project.risk_level}
                                </Badge>
                                <p className="text-sm font-bold mt-1">Risk: {project.risk_score}/100</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">Delayed</p>
                                <p className="font-medium">{project.factors.is_delayed ? 'Yes' : 'No'}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">SLA Breaches</p>
                                <p className="font-medium">{project.factors.sla_breaches}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Overdue Docs</p>
                                <p className="font-medium">{project.factors.overdue_documents}</p>
                            </div>
                        </div>
                    </div>
        ))}
                </div>
            </CardContent>
  </Card >
);
}
return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// TEAM LEADER VIEW COMPONENTS
// ============================================
const TeamLeaderView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'org_overview') {
        return (
            <div className="space-y-6">
                {/* Organization Metrics */}
                <div className="grid grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold">{data.overview?.total_projects || 0}</div>
                            <p className="text-sm text-gray-600">Total Projects</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-blue-600">
                                {data.overview?.active_projects || 0}
                            </div>
                            <p className="text-sm text-gray-600">Active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-red-600">
                                {data.overview?.delayed_projects || 0}
                            </div>
                            <p className="text-sm text-gray-600">Delayed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-green-600">
                                {data.overview?.on_time_percentage || 0}%
                            </div>
                            <p className="text-sm text-gray-600">On-Time Rate</p>
                        </CardContent>
                    </Card>
                </div>
                {/* Team Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="engineers">
                            <TabsList>
                                <TabsTrigger value="engineers">Engineers</TabsTrigger>
                                <TabsTrigger value="qi">Quality Inspectors</TabsTrigger>
                            </TabsList>

                            <TabsContent value="engineers">
                                <div className="space-y-3">
                                    {data.team_performance?.engineers?.map((engineer: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-medium">{engineer.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {engineer.assigned_projects} projects assigned
                                                    </p>
                                                </div>
                                                <Badge variant={engineer.on_time_rate >= 80 ? 'default' : 'destructive'}>
                                                    {engineer.on_time_rate}% on-time
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Completed</p>
                                                    <p className="font-medium">{engineer.completed}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Delayed</p>
                                                    <p className="font-medium text-red-600">{engineer.delayed}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Performance</p>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                        <div
                                                            className="bg-green-600 h-2 rounded-full"
                                                            style={{ width: `${engineer.on_time_rate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="qi">
                                <div className="space-y-3">
                                    {data.team_performance?.quality_inspectors?.map((qi: any, index: number) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium">{qi.name}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {qi.completed} / {qi.total_inspections} inspections
                                                    </p>
                                                </div>
                                                <Badge variant={qi.target_met ? 'default' : 'destructive'}>
                                                    {qi.target_met ? 'Target Met' : 'Behind Target'}
                                                </Badge>
                                            </div>
                                            <div className="mt-2 text-sm">
                                                <p className="text-gray-600">
                                                    Monthly: {qi.monthly_actual} / {qi.monthly_target}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Vendor Rankings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Vendor Rankings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.vendor_rankings?.map((vendor: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                                        <div>
                                            <p className="font-medium">{vendor.vendor_name}</p>
                                            <p className="text-sm text-gray-600">
                                                {vendor.total_projects} projects | {vendor.on_time_rate}% on-time
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold">{vendor.compliance_score.toFixed(1)}</p>
                                        <p className="text-xs text-gray-600">Compliance Score</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total Contract Value</p>
                                <p className="text-2xl font-bold">
                                    ₱{data.financial?.total_contract_value?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Penalties</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ₱{data.financial?.total_penalties?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Outstanding Payments</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    ₱{data.financial?.outstanding_payments?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Critical Alerts */}
                {data.alerts && data.alerts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Critical Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {data.alerts.map((alert: any, index: number) => (
                                    <Alert
                                        key={index}
                                        variant={alert.severity === 'critical' ? 'destructive' : 'default'}
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            <div className="flex items-center justify-between">
                                                <span>{alert.message}</span>
                                                <Badge>{alert.count}</Badge>
                                            </div>
                                        </AlertDescription>
                                    </Alert>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    }
    if (featureId === 'pending_approvals') {
        return (
            <Tabs defaultValue="penalties" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="penalties">
                        Penalties ({data.penalties?.count || 0})
                    </TabsTrigger>
                    <TabsTrigger value="invoices">
                        Invoices ({data.invoices?.count || 0})
                    </TabsTrigger>
                    <TabsTrigger value="projects">
                        Projects ({data.projects?.count || 0})
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="penalties">
                    <Card>
                        <CardHeader>
                            <CardTitle>Penalties Pending Approval</CardTitle>
                            <CardDescription>
                                Total Amount: ₱{data.penalties?.total_amount?.toLocaleString() || 0}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.penalties?.items?.map((penalty: any) => (
                                    <div key={penalty.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{penalty.project?.project_code}</p>
                                                <p className="text-sm text-gray-600">{penalty.penalty_rule?.rule_name}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Vendor: {penalty.vendor?.vendor_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">
                                                    ₱{penalty.penalty_amount?.toLocaleString()}
                                                </p>
                                                <Badge>Draft</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="invoices">
                    <Card>
                        <CardHeader>
                            <CardTitle>High-Value Invoices Pending Approval</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.invoices?.items?.map((invoice: any) => (
                                    <div key={invoice.id} className="p-4 border rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium">{invoice.invoice_number}</p>
                                                <p className="text-sm text-gray-600">{invoice.project?.project_code}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Vendor: {invoice.vendor?.vendor_name}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold">
                                                    ₱{invoice.invoice_amount?.toLocaleString()}
                                                </p>
                                                <Badge>Pending</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="projects">
                    <Card>
                        <CardHeader>
                            <CardTitle>Projects Pending Approval</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {data.projects?.items?.map((project: any) => (
                                    <Card key={project.project_id}>
                                        <CardContent className="pt-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold">{project.project_code}</h4>
                                                    <p className="text-sm text-gray-600">{project.project_name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Vendor: {project.vendor?.vendor_name}
                                                    </p>
                                                </div>
                                                <Badge>Pending Approval</Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        );
    }
    if (featureId === 'performance_trends') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Last {data.period_months || 12} months</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.monthly_trends?.map((month: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="font-medium">
                                        {new Date(month.month).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long'
                                        })}
                                    </h4>
                                    <Badge>{month.total} projects</Badge>
                                </div>
                                <div className="grid grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-600">Completed</p>
                                        <p className="font-bold text-green-600">{month.completed}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Delayed</p>
                                        <p className="font-bold text-red-600">{month.delayed}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">On-Time %</p>
                                        <p className="font-bold">{month.on_time_percentage || 0}%</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600">Completion %</p>
                                        <p className="font-bold">{month.completion_rate || 0}%</p>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-green-600 h-2 rounded-full transition-all"
                                            style={{ width: ${month.on_time_percentage || 0}% }}
/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (featureId === 'comparison') {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Current vs Previous Period Comparison</CardTitle>
                    </CardHeader>
                </Card>
                <div className="grid grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Projects Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current:</span>
                                    <span className="font-bold">{data.projects_completed?.current || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Previous:</span>
                                    <span className="font-bold">{data.projects_completed?.previous || 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-gray-600">Change:</span>
                                    <div className="flex items-center space-x-2">
                                        <span className={`font-bold ${(data.projects_completed?.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {data.projects_completed?.change >= 0 ? '+' : ''}
                                            {data.projects_completed?.change || 0}
                                        </span>
                                        <Badge variant={
                                            (data.projects_completed?.change_percentage || 0) >= 0 ? 'default' : 'destructive'
                                        }>
                                            {data.projects_completed?.change_percentage >= 0 ? '+' : ''}
                                            {data.projects_completed?.change_percentage || 0}%
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">On-Time Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current:</span>
                                    <span className="font-bold">{data.on_time_rate?.current || 0}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Previous:</span>
                                    <span className="font-bold">{data.on_time_rate?.previous || 0}%</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-gray-600">Change:</span>
                                    <Badge variant={
                                        (data.on_time_rate?.change || 0) >= 0 ? 'default' : 'destructive'
                                    }>
                                        {data.on_time_rate?.change >= 0 ? '+' : ''}
                                        {data.on_time_rate?.change || 0}%
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Total Penalties</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Current:</span>
                                    <span className="font-bold">₱{data.total_penalties?.current?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Previous:</span>
                                    <span className="font-bold">₱{data.total_penalties?.previous?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="text-gray-600">Change:</span>
                                    <span className={`font-bold ${(data.total_penalties?.change || 0) <= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        ₱{data.total_penalties?.change?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }
    if (featureId === 'ai_suggestions') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Improvement Suggestions</CardTitle>
                    <CardDescription>
                        Generated at {new Date(data.generated_at).toLocaleString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.suggestions?.map((suggestion: any, index: number) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={p - 3 rounded-full ${                       suggestion.priority === 'high' ? 'bg-red-100' : suggestion.priority === 'medium' ? 'bg-orange-100' : 'bg-blue-100'}}>
                                        <TrendingUp className={h - 6 w-6 ${                         suggestion.priority === 'high' ? 'text-red-600' : suggestion.priority === 'medium' ? 'text-orange-600' : 'text-blue-600'}} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">{suggestion.title}</h4>
                                            <Badge variant={
                                                suggestion.priority === 'high' ? 'destructive' :
                                                    suggestion.priority === 'medium' ? 'default' :
                                                        'secondary'
                                            }>
                                                {suggestion.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                                        <p className="text-sm font-medium text-green-600 mb-3">
                                            💡 {suggestion.potential_impact}
                                        </p>
                                        {suggestion.action_items && (
                                            <div className="bg-gray-50 p-3 rounded">
                                                <p className="text-xs font-medium text-gray-700 mb-2">Action Items:</p>
                                                <ul className="text-xs space-y-1">
                                                    {suggestion.action_items.map((item: string, i: number) => (
                                                        <li key={i} className="flex items-start">
                                                            <span className="mr-2">•</span>
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
</Card>
))}
                </div>
            </CardContent>
</Card >
);
}
return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// SECTOR MANAGER VIEW COMPONENTS
// ============================================
const SectorManagerView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'executive_dashboard') {
        return (
            <div className="space-y-6">
                {/* KPI Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Key Performance Indicators</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {Object.entries(data.kpi_summary || {}).map(([key, kpi]: [string, any]) => (
                                <Card key={key}>
                                    <CardContent className="pt-6">
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-600 uppercase">{key.replace(/_/g, ' ')}</p>
                                            <div className="text-2xl font-bold">{kpi.value?.toFixed(2)}</div>
                                            {kpi.target && (
                                                <p className="text-xs text-gray-500">Target: {kpi.target}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <Badge variant={
                                                    kpi.status === 'green' ? 'default' :
                                                        kpi.status === 'yellow' ? 'secondary' :
                                                            'destructive'
                                                }>
                                                    {kpi.achievement}%
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                {/* Sector Comparison */}
                <Card>
                    <CardHeader>
                        <CardTitle>Sector Performance Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.sector_comparison?.map((sector: any, index: number) => (
                                <Card key={index}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h4 className="font-semibold text-lg">{sector.sector_name}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {sector.total_projects} total projects
                                                </p>
                                            </div>
                                            <div className="text-right"><p className="text-sm text-gray-600">Contract Value</p>
                                                <p className="text-lg font-bold">
                                                    ₱{sector.contract_value?.toLocaleString() || 0}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                                            <div>
                                                <p className="text-gray-600">Completed</p>
                                                <p className="font-bold text-green-600">{sector.completed}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Delayed</p>
                                                <p className="font-bold text-red-600">{sector.delayed}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">On-Time</p>
                                                <p className="font-bold">{sector.on_time_rate}%</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600">Completion</p>
                                                <p className="font-bold">{sector.completion_rate}%</p>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs text-gray-600">Performance</span>
                                                <span className="text-xs font-medium">{sector.on_time_rate}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${sector.on_time_rate >= 80 ? 'bg-green-600' :
                                                            sector.on_time_rate >= 60 ? 'bg-orange-600' :
                                                                'bg-red-600'
                                                        }`}
                                                    style={{ width: `${sector.on_time_rate}%` }}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Financial Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total Contract Value</p>
                                <p className="text-2xl font-bold">
                                    ₱{data.financial_performance?.total_contract_value?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed Value</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₱{data.financial_performance?.completed_value?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Billed Amount</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    ₱{data.financial_performance?.billed_amount?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Collected</p>
                                <p className="text-2xl font-bold text-green-600">
                                    ₱{data.financial_performance?.collected_amount?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Penalties</p>
                                <p className="text-2xl font-bold text-red-600">
                                    ₱{data.financial_performance?.total_penalties?.toLocaleString() || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Outstanding Receivables</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    ₱{data.financial_performance?.outstanding_receivables?.toLocaleString() || 0}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Strategic Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Strategic Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Active Vendors</p>
                                <p className="text-3xl font-bold">{data.strategic_metrics?.active_vendors || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Avg Project Duration</p>
                                <p className="text-3xl font-bold">{data.strategic_metrics?.avg_project_duration_days || 0}</p>
                                <p className="text-xs text-gray-500">days</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Quality Pass Rate</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {data.strategic_metrics?.quality_pass_rate || 0}%
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">SLA Compliance</p>
                                <p className="text-3xl font-bold text-blue-600">
                                    {data.strategic_metrics?.sla_compliance_rate || 0}%
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'vendor_rankings') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Vendor Performance Rankings</CardTitle>
                    <CardDescription>
                        {data.total_vendors || 0} vendors ranked by compliance score
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {data.rankings?.map((vendor: any, index: number) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="text-3xl font-bold text-gray-300">
                                            #{index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-semibold">{vendor.vendor_name}</h4>
                                                    <p className="text-sm text-gray-600">{vendor.vendor_code}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold">{vendor.compliance_score.toFixed(1)}</p>
                                                    <p className="text-xs text-gray-600">Compliance Score</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">Projects</p>
                                                    <p className="font-bold">{vendor.total_projects}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Completion</p>
                                                    <p className="font-bold text-green-600">{vendor.completion_rate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">On-Time</p>
                                                    <p className="font-bold text-blue-600">{vendor.on_time_rate}%</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">Penalties</p>
                                                    <p className="font-bold text-red-600">
                                                        ₱{vendor.total_penalties?.toLocaleString() || 0}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full ${vendor.compliance_score >= 80 ? 'bg-green-600' :
                                                                vendor.compliance_score >= 60 ? 'bg-orange-600' :
                                                                    'bg-red-600'
                                                            }`}
                                                        style={{ width: `${vendor.compliance_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (featureId === 'strategic_recs') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Strategic Recommendations</CardTitle>
                    <CardDescription>
                        AI-powered strategic insights and recommendations
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.recommendations?.map((rec: any, index: number) => (
                            <Card key={index}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={p - 3 rounded-full ${                       rec.priority === 'high' ? 'bg-red-100' : rec.priority === 'medium' ? 'bg-orange-100' : 'bg-blue-100'}}>
                                        <BarChart3 className={h - 6 w-6 ${                         rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-orange-600' : 'text-blue-600'}} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-semibold">{rec.title}</h4>
                                            <Badge variant={
                                                rec.priority === 'high' ? 'destructive' :
                                                    rec.priority === 'medium' ? 'default' :
                                                        'secondary'
                                            }>
                                                {rec.category}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                                        <div className="bg-green-50 p-3 rounded mb-3">
                                            <p className="text-sm font-medium text-green-800">
                                                📈 {rec.potential_impact}
                                            </p>
                                        </div>
                                        {rec.action_items && (
                                            <div className="bg-gray-50 p-3 rounded">
                                                <p className="text-xs font-medium text-gray-700 mb-2">Recommended Actions:</p>
                                                <ul className="text-xs space-y-1">
                                                    {rec.action_items.map((item: string, i: number) => (
                                                        <li key={i} className="flex items-start">
                                                            <CheckCircle className="h-3 w-3 mr-2 mt-0.5 text-green-600" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
</Card>
))}
                </div>
            </CardContent>
</Card >
);
}
return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// SYSTEM ADMINISTRATOR VIEW COMPONENTS
// ============================================
const SystemAdministratorView: React.FC<{ data: any; featureId: string }> = ({ data, featureId }) => {
    if (featureId === 'system_health') {
        return (
            <div className="space-y-6">
                {/* System Status */}
                <Alert variant={data.system_status === 'healthy' ? 'default' : 'destructive'}>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                        System Status: {data.system_status?.toUpperCase() || 'UNKNOWN'} |
                        Recent Errors (24h): {data.recent_errors_24h || 0}
                    </AlertDescription>
                </Alert>
                {/* User Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-3xl font-bold">{data.users?.total || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Users</p>
                                <p className="text-3xl font-bold text-green-600">{data.users?.active || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Active Sessions</p>
                                <p className="text-3xl font-bold text-blue-600">{data.users?.active_sessions || 0}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Recent Logins (24h)</p>
                                <p className="text-3xl font-bold">{data.users?.recent_logins_24h || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Database Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Database Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-4">
                            {Object.entries(data.database || {}).map(([key, value]: [string, any]) => (
                                <div key={key}>
                                    <p className="text-sm text-gray-600 capitalize">{key}</p>
                                    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>System Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Uptime:</span>
                                <span className="font-medium">{data.uptime || 'Available'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Backup:</span>
                                <span className="font-medium">{data.last_backup || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'user_management') {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>User Overview</CardTitle>
                        <CardDescription>
                            {data.total_users || 0} total users | {data.inactive_users || 0} inactive
                        </CardDescription>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Users by Role</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.by_role?.map((role: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded">
                                    <div>
                                        <p className="font-medium">{role.role__role_name || 'No Role'}</p>
                                        <p className="text-sm text-gray-600">{role.active} active / {role.count} total</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{role.count}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Top 10 most active users (last 7 days)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.recent_activity?.map((activity: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <div>
                                        <p className="font-medium text-sm">{activity.user__username}</p>
                                        <p className="text-xs text-gray-600">{activity.user__role__role_name}</p>
                                    </div>
                                    <Badge>{activity.login_count} logins</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    if (featureId === 'audit_logs') {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>System Audit Logs</CardTitle>
                    <CardDescription>Recent system activities and changes</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {data.logs?.map((log: any) => (
                            <div key={log.id} className="p-3 border rounded text-sm">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center space-x-2">
                                        <Badge variant={log.status === 'Success' ? 'default' : 'destructive'}>
                                            {log.status}
                                        </Badge>
                                        <span className="font-medium">{log.action_type}</span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {new Date(log.created_at).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-gray-600">{log.action_description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    By: {log.user?.username || 'System'}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    if (featureId === 'security_report') {
        return (
            <div className="space-y-4">
                <Alert variant={
                    data.security_status === 'green' ? 'default' :
                        data.security_status === 'yellow' ? 'default' :
                            'destructive'
                }>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Security Status: {data.security_status?.toUpperCase()} |
                        Period: Last {data.period_days || 7} days
                    </AlertDescription>
                </Alert>
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-red-600">{data.failed_logins || 0}</div>
                            <p className="text-sm text-gray-600">Failed Login Attempts</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="text-3xl font-bold text-orange-600">{data.unauthorized_attempts || 0}</div>
                            <p className="text-sm text-gray-600">Unauthorized Access Attempts</p>
                        </CardContent>
                    </Card>
                </div>

                {data.suspicious_activities && data.suspicious_activities.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Suspicious Activities</CardTitle>
                            <CardDescription>Users with 5+ failed attempts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {data.suspicious_activities.map((activity: any, index: number) => (
                                    <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium">{activity.user__username}</p>
                                                <p className="text-sm text-gray-600">{activity.action_type}</p>
                                            </div>
                                            <Badge variant="destructive">{activity.count} attempts</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Active Sessions by User</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {data.active_sessions_by_user?.map((session: any, index: number) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                        <p className="font-medium text-sm">{session.user__username}</p>
                                        <p className="text-xs text-gray-600">{session.user__role__role_name}</p>
                                    </div>
                                    <Badge>{session.session_count} sessions</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }
    return <pre>{JSON.stringify(data, null, 2)}</pre>;
};
// ============================================
// FORM COMPONENTS (Placeholders - implement as needed)
// ============================================
const UploadDocumentForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Upload Document Form - To be implemented</div>;
};
const SubmitDisputeForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Submit Dispute Form - To be implemented</div>;
};
const SendReminderForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Send Reminder Form - To be implemented</div>;
};
const CompleteInspectionForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Complete Inspection Form - To be implemented</div>;
};
const ApproveDocumentForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Approve Document Form - To be implemented</div>;
};
const ChatbotForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">AI Chatbot Form - To be implemented</div>;
};
const EscalationForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Escalation Form - To be implemented</div>;
};
const ApprovePenaltyForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Approve Penalty Form - To be implemented</div>;
};
const CreateUserForm: React.FC<{ api: APIService }> = ({ api }) => {
    return <div className="p-4">Create User Form - To be implemented</div>;
};
export default Dashboard;