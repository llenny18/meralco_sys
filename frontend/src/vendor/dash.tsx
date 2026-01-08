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
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Loader2,
    CheckCircle,
    AlertCircle,
    DollarSign,
    FileText
} from 'lucide-react';

// Types
interface User {
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role_name: string;
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

const features = [
    { id: 'my_projects', label: 'My Projects', endpoint: '/api/v1/vendor-portal/my_projects/' },
    { id: 'pending_docs', label: 'Pending Documents', endpoint: '/api/v1/vendor-portal/pending_documents/' },
    { id: 'payment_summary', label: 'Payment Summary', endpoint: '/api/v1/vendor-portal/payment_summary/' },
    { id: 'upload_document', label: 'Upload Document', endpoint: '/api/v1/vendor-portal/upload_document/', type: 'form' },
    { id: 'submit_dispute', label: 'Submit Dispute', endpoint: '/api/v1/vendor-portal/submit_dispute/', type: 'form' },
];

const VendorRepresentativeDashboard: React.FC = () => {
    const [state, setState] = useState<DashboardState>({
        user: null,
        token: null,
        loading: true,
        error: null,
        data: null,
    });

    const [selectedFeature, setSelectedFeature] = useState<string>('');

    useEffect(() => {
        // Simulate loading user from storage
        const mockUser: User = {
            user_id: 1,
            username: 'vendor_rep',
            email: 'vendor@example.com',
            first_name: 'John',
            last_name: 'Doe',
            role_name: 'Vendor Representative'
        };
        const mockToken = 'mock_token_123';
        
        setState(prev => ({ 
            ...prev, 
            user: mockUser, 
            token: mockToken,
            loading: false 
        }));
    }, []);

    const api = state.token ? new APIService('http://localhost:8000', state.token) : null;

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
        const feature = features.find(f => f.id === featureId);

        if (feature && feature.type !== 'form') {
            loadFeatureData(feature);
        }
    };

    const renderMyProjects = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>My Projects</CardTitle>
                    <CardDescription>All projects assigned to your vendor</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {state.data && state.data.length > 0 ? (
                            state.data.map((project: any) => (
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
    };

    const renderPaymentSummary = () => {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ₱{state.data?.total_invoiced?.toLocaleString() || '0'}
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
                            ₱{state.data?.total_paid?.toLocaleString() || '0'}
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
                            ₱{state.data?.outstanding?.toLocaleString() || '0'}
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
                            ₱{state.data?.penalties?.toLocaleString() || '0'}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderPendingDocs = () => {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pending Documents</CardTitle>
                    <CardDescription>Documents pending submission</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {state.data && state.data.length > 0 ? (
                            state.data.map((doc: any, index: number) => (
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
    };

    const renderContent = () => {
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

        const feature = features.find(f => f.id === selectedFeature);

        if (feature?.type === 'form') {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>{feature.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Form implementation pending</p>
                    </CardContent>
                </Card>
            );
        }

        switch (selectedFeature) {
            case 'my_projects':
                return renderMyProjects();
            case 'payment_summary':
                return renderPaymentSummary();
            case 'pending_docs':
                return renderPendingDocs();
            default:
                return <pre>{JSON.stringify(state.data, null, 2)}</pre>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Vendor Representative Dashboard</h1>
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

            <Card>
                <CardHeader>
                    <CardTitle>Select Feature</CardTitle>
                    <CardDescription>Choose a feature to explore</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedFeature} onValueChange={handleFeatureSelect}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a feature" />
                        </SelectTrigger>
                        <SelectContent>
                            {features.map(feature => (
                                <SelectItem key={feature.id} value={feature.id}>
                                    {feature.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            <div className="min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};

export default VendorRepresentativeDashboard;