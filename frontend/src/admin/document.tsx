import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Upload, 
  AlertCircle, 
  FileText, 
  Image, 
  File,
  X,
  MapPin,
  Calendar,
  Send,
  AlertTriangle,
  Trash2,
  CheckSquare
} from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

interface WorkOrder {
  id?: number;
  wo_no: string;
  description: string;
  location: string;
  municipality: string;
  vip: boolean;
  status: string;
  actual_date_completed_on_site?: string;
  date_comp?: string;
  assigned: string;
}

interface DocumentType {
  id: string;
  name: string;
  type: string;
  formats: string[];
  required: boolean;
  multiple: boolean;
  icon: any;
}

function VendorDocumentSubmission() {
  const [activeProjects, setActiveProjects] = useState<WorkOrder[]>([]);
  const [selectedProject, setSelectedProject] = useState<WorkOrder | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [documents, setDocuments] = useState<Record<string, File[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const requiredDocuments: DocumentType[] = [
    {
      id: 'coc',
      name: 'Certificate of Completion (COC)',
      type: 'COC',
      formats: ['PDF'],
      required: true,
      multiple: false,
      icon: FileText
    },
    {
      id: 'site_photos',
      name: 'Site Photos (Before/During/After)',
      type: 'INSPECTION',
      formats: ['JPG', 'PNG', 'PDF'],
      required: true,
      multiple: true,
      icon: Image
    },
    {
      id: 'permits',
      name: 'Building Permits',
      type: 'PERMIT',
      formats: ['PDF'],
      required: false,
      multiple: false,
      icon: FileText
    },
    {
      id: 'receipts',
      name: 'Material Receipts',
      type: 'INVOICE',
      formats: ['PDF', 'JPG', 'PNG'],
      required: true,
      multiple: true,
      icon: File
    },
    {
      id: 'safety',
      name: 'Safety Compliance Forms',
      type: 'OTHER',
      formats: ['PDF'],
      required: true,
      multiple: false,
      icon: FileText
    },
    {
      id: 'drawings',
      name: 'As-Built Drawings',
      type: 'OTHER',
      formats: ['PDF', 'DWG'],
      required: false,
      multiple: false,
      icon: FileText
    }
  ];

  useEffect(() => {
    fetchActiveProjects();
  }, []);

  const fetchActiveProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/work-orders/?status=COMP`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch projects');

      const data = await response.json();
      setActiveProjects(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSubmission = (project: WorkOrder) => {
    setSelectedProject(project);
    setShowSubmissionModal(true);

    const initialDocs: Record<string, File[]> = {};
    requiredDocuments.forEach(doc => {
      initialDocs[doc.id] = [];
    });
    setDocuments(initialDocs);
  };

  const handleFileSelect = (docId: string, files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const doc = requiredDocuments.find(d => d.id === docId);
    if (!doc) return;

    const validFiles = fileArray.filter(file => {
      const ext = file.name.split('.').pop()?.toUpperCase() || '';
      const validFormat = doc.formats.includes(ext);
      const validSize = file.size <= 10 * 1024 * 1024;

      if (!validFormat) {
        setError(`Invalid format for ${file.name}. Allowed: ${doc.formats.join(', ')}`);
        return false;
      }

      if (!validSize) {
        setError(`File ${file.name} exceeds 10MB limit`);
        return false;
      }

      return true;
    });

    setDocuments(prev => ({
      ...prev,
      [docId]: doc.multiple ? [...prev[docId], ...validFiles] : [validFiles[0]]
    }));
  };

  const removeFile = (docId: string, fileIndex: number) => {
    setDocuments(prev => ({
      ...prev,
      [docId]: prev[docId].filter((_, idx) => idx !== fileIndex)
    }));
  };

  const getCompletionPercentage = () => {
    const required = requiredDocuments.filter(d => d.required);
    const completed = required.filter(doc => documents[doc.id]?.length > 0);
    return Math.round((completed.length / required.length) * 100);
  };

  const getDaysUntilDeadline = (completedDate?: string) => {
    if (!completedDate) return 7;
    const completed = new Date(completedDate);
    const deadline = new Date(completed);
    deadline.setDate(deadline.getDate() + 7);
    const today = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  const validateSubmission = () => {
    const missingDocs = requiredDocuments
      .filter(doc => doc.required)
      .filter(doc => documents[doc.id]?.length === 0);

    if (missingDocs.length > 0) {
      setError(`Missing required documents: ${missingDocs.map(d => d.name).join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateSubmission() || !selectedProject) return;

    setLoading(true);
    setError(null);

    try {
      const woResponse = await fetch(`${API_BASE_URL}/work-orders/${selectedProject.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
        },
        body: JSON.stringify({
          status: 'AWAITING DOCS',
          date_comp: new Date().toISOString().split('T')[0]
        })
      });

      if (!woResponse.ok) throw new Error('Failed to update work order status');

      const uploadPromises = [];

      for (const [docId, files] of Object.entries(documents)) {
        const doc = requiredDocuments.find(d => d.id === docId);
        if (!doc || files.length === 0) continue;

        for (const file of files) {
          const formData = new FormData();
          formData.append('work_order', selectedProject.id!.toString());
          formData.append('document_type', doc.type);
          formData.append('document_name', file.name);
          formData.append('document_file', file);
          formData.append('notes', `Submitted on ${new Date().toLocaleDateString()}`);

          uploadPromises.push(
            fetch(`${API_BASE_URL}/work-order-documents/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
              },
              body: formData
            })
          );
        }
      }

      const results = await Promise.all(uploadPromises);
      const allSuccess = results.every(r => r.ok);

      if (allSuccess) {
        const confirmationNumber = `DOC-${selectedProject.wo_no}-${Date.now()}`;
        setSuccessMessage(`Documents submitted successfully! Confirmation #: ${confirmationNumber}`);

        setTimeout(() => {
          setShowSubmissionModal(false);
          setSelectedProject(null);
          setDocuments({});
          fetchActiveProjects();
        }, 3000);
      } else {
        throw new Error('Some documents failed to upload');
      }
    } catch (err: any) {
      setError(`Submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📋 Document Submission Portal
              </h1>
              <p className="text-gray-600">
                Submit completion documents for your projects
              </p>
            </div>
            <div className="bg-blue-50 px-6 py-4 rounded-lg text-center">
              <div className="text-sm text-gray-600 mb-1">Active Projects</div>
              <div className="text-4xl font-bold text-blue-600">{activeProjects.length}</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && !showSubmissionModal && (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading projects...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && activeProjects.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              All Caught Up!
            </h3>
            <p className="text-gray-600">
              No projects awaiting document submission
            </p>
          </div>
        )}

        {/* Projects Grid */}
        {!loading && activeProjects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map((project) => {
              const daysLeft = getDaysUntilDeadline(project.actual_date_completed_on_site);
              const isUrgent = daysLeft <= 3;

              return (
                <div
                  key={project.id}
                  className={`bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-xl border-2 ${
                    isUrgent ? 'border-red-400' : 'border-transparent'
                  }`}
                >
                  <div className="p-6">
                    {isUrgent && (
                      <div className="flex items-center gap-2 text-red-600 text-sm font-semibold mb-3 bg-red-50 px-3 py-2 rounded">
                        <AlertTriangle className="w-4 h-4" />
                        URGENT - {daysLeft} days left
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">
                          {project.wo_no}
                        </h3>
                        {project.vip && (
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded mb-2">
                            VIP
                          </span>
                        )}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{project.location || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Completed: {project.actual_date_completed_on_site
                            ? new Date(project.actual_date_completed_on_site).toLocaleDateString()
                            : 'Not set'}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Submission Deadline</span>
                        <span className={`font-semibold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
                          {daysLeft} days left
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isUrgent ? 'bg-red-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.max(10, (daysLeft / 7) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartSubmission(project)}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Upload className="w-5 h-5" />
                      Submit Documents
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Submission Modal */}
        {showSubmissionModal && selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Submit Documents</h2>
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                  <div className="text-sm opacity-90 mb-1">Work Order</div>
                  <div className="font-bold text-lg">{selectedProject.wo_no}</div>
                  <div className="text-sm mt-2">{selectedProject.description}</div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Progress</span>
                    <span className="font-bold">{getCompletionPercentage()}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-30 rounded-full h-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  Required Documents
                </h3>

                <div className="space-y-4">
                  {requiredDocuments.map(doc => {
                    const Icon = doc.icon;
                    const uploaded = documents[doc.id] || [];
                    const isComplete = uploaded.length > 0;

                    return (
                      <div
                        key={doc.id}
                        className={`border-2 rounded-lg p-4 ${
                          isComplete ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${isComplete ? 'bg-green-100' : 'bg-gray-200'}`}>
                            {isComplete ? (
                              <CheckCircle className="w-6 h-6 text-green-600" />
                            ) : (
                              <Icon className="w-6 h-6 text-gray-600" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-800">{doc.name}</h4>
                              {doc.required && (
                                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-semibold rounded">
                                  Required
                                </span>
                              )}
                            </div>

                            <div className="text-sm text-gray-600 mb-3">
                              Accepted formats: {doc.formats.join(', ')} • Max 10MB
                              {doc.multiple && ' • Multiple files allowed'}
                            </div>

                            <label className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors text-sm font-medium">
                              <Upload className="w-4 h-4" />
                              {isComplete ? 'Add More Files' : 'Choose Files'}
                              <input
                                type="file"
                                multiple={doc.multiple}
                                accept={doc.formats.map(f => `.${f.toLowerCase()}`).join(',')}
                                onChange={(e) => handleFileSelect(doc.id, e.target.files)}
                                className="hidden"
                              />
                            </label>

                            {uploaded.length > 0 && (
                              <div className="mt-3 space-y-2">
                                {uploaded.map((file, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between bg-white p-2 rounded border border-gray-200"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                      <span className="text-sm text-gray-700 truncate">
                                        {file.name}
                                      </span>
                                      <span className="text-xs text-gray-500 flex-shrink-0">
                                        ({(file.size / 1024).toFixed(1)} KB)
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => removeFile(doc.id, idx)}
                                      className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0 ml-2"
                                    >
                                      <Trash2 className="w-4 h-4 text-red-600" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || getCompletionPercentage() < 100}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Documents
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VendorDocumentSubmission;