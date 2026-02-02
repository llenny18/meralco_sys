import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function ClerkDocumentValidation() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectData, setSelectedProjectData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [validationModal, setValidationModal] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState('');
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [penaltyCalc, setPenaltyCalc] = useState(null);
  const [penaltyNotes, setPenaltyNotes] = useState('');
  const [slaTracking, setSlaTracking] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [c1Remarks, setC1Remarks] = useState({});
  const [penaltyRules, setPenaltyRules] = useState([]);
  const [selectedPenaltyRule, setSelectedPenaltyRule] = useState('');
  const [existingPenalties, setExistingPenalties] = useState({});

  useEffect(() => {
    const storedUserId = JSON.parse(localStorage?.getItem('user') || '{}')?.user_id || '1';
    setUserId(storedUserId);
    fetchPendingProjects();
    fetchValidationStats();
    fetchSLATracking();
    fetchPenaltyRules();
    fetchExistingPenalties();
  }, []);

  const fetchPendingProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?assigned_qi_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchValidationStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/clerk-validation/validation_stats/`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchExistingPenalties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/penalties/`);
      if (!response.ok) throw new Error('Failed to fetch penalties');
      const data = await response.json();
      const penaltiesData = data.results || data || [];
      
      // Create a map of project_id -> penalty info
      const penaltyMap = {};
      penaltiesData.forEach(penalty => {
        if (penalty.project) {
          if (!penaltyMap[penalty.project]) {
            penaltyMap[penalty.project] = [];
          }
          penaltyMap[penalty.project].push(penalty);
        }
      });
      
      setExistingPenalties(penaltyMap);
    } catch (err) {
      console.error('Error fetching existing penalties:', err);
    }
  };

  const checkIfPenaltyExists = (projectId) => {
    return existingPenalties[projectId] && existingPenalties[projectId].length > 0;
  };

  const getPenaltyInfo = (projectId) => {
    const penalties = existingPenalties[projectId];
    if (!penalties || penalties.length === 0) return null;
    
    // Get the most recent penalty
    const sortedPenalties = [...penalties].sort((a, b) => 
      new Date(b.created_at) - new Date(a.created_at)
    );
    
    return sortedPenalties[0];
  };

  const fetchProjectDocuments = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const workOrdersResponse = await fetch(`${API_BASE_URL}/work-orders/?project_id=${projectId}`);
      if (!workOrdersResponse.ok) throw new Error('Failed to fetch work orders');
      const workOrdersData = await workOrdersResponse.json();
      const workOrders = workOrdersData.results || [];
      
      setWorkOrders(workOrders);
      
      const remarksObj = {};
      workOrders.forEach(wo => {
        remarksObj[wo.id] = wo.c1_remarks || '';
      });
      setC1Remarks(remarksObj);
      
      if (workOrders.length === 0) {
        setDocuments([]);
        setLoading(false);
        return;
      }
      
      const workOrderIds = workOrders.map(wo => wo.id);
      
      const documentsPromises = workOrderIds.map(woId =>
        fetch(`${API_BASE_URL}/work-order-documents/?work_order=${woId}`)
          .then(res => res.json())
          .then(data => data.results || [])
      );
      
      const documentsArrays = await Promise.all(documentsPromises);
      const allDocuments = documentsArrays.flat();
      
      setDocuments(allDocuments);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  };

  const validateDocument = async (docId, isValid) => {
    try {
      const response = await fetch(`${API_BASE_URL}/work-order-documents/${docId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_approved: isValid,
          approved_by: userId,
          approval_date: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to validate document');
      
      setSuccessMessage(isValid ? '✅ Document approved!' : '❌ Document rejected');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchProjectDocuments(selectedProjectId);
      fetchValidationStats();
    } catch (err) {
      setError('Error: ' + err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const updateC1Remarks = async (workOrderId, remarks) => {
    try {
      const response = await fetch(`${API_BASE_URL}/work-orders/${workOrderId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          c1_remarks: remarks
        })
      });

      if (!response.ok) throw new Error('Failed to update C1 remarks');
      
      setSuccessMessage('✅ C1 Remarks updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      setC1Remarks(prev => ({
        ...prev,
        [workOrderId]: remarks
      }));
      
      return true;
    } catch (err) {
      setError('Error updating remarks: ' + err.message);
      setTimeout(() => setError(null), 3000);
      return false;
    }
  };

  const handleSaveAllRemarks = async () => {
    setLoading(true);
    try {
      const updatePromises = workOrders.map(wo => {
        if (c1Remarks[wo.id] !== undefined && c1Remarks[wo.id] !== wo.c1_remarks) {
          return updateC1Remarks(wo.id, c1Remarks[wo.id]);
        }
        return Promise.resolve(true);
      });

      await Promise.all(updatePromises);
      setSuccessMessage('✅ All C1 remarks saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error saving remarks: ' + err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const generateConfirmation = async (projectId) => {
    await handleSaveAllRemarks();
    
    try {
      const response = await fetch(`${API_BASE_URL}/clerk-validation/${projectId}/generate_confirmation/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate confirmation');
      }

      const data = await response.json();
      setConfirmationNumber(data.confirmation_number);

      setSuccessMessage(`✅ Confirmation sent to vendor!\n\nConfirmation Number: ${data.confirmation_number}\n\nVendor will receive notification.`);
      setTimeout(() => setSuccessMessage(''), 5000);
      
      setValidationModal(false);
      fetchPendingProjects();
      fetchValidationStats();
    } catch (err) {
      setError('Error: ' + err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const fetchSLATracking = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/sla-tracking/?is_breached=true`);
      if (!response.ok) throw new Error('Failed to fetch SLA tracking');
      const data = await response.json();
      setSlaTracking(data.results || data || []);
    } catch (err) {
      console.error('Error fetching SLA tracking:', err);
    }
  };

  const fetchPenaltyRules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/penalty-rules/`);
      if (!response.ok) throw new Error('Failed to fetch penalty rules');
      const data = await response.json();
      setPenaltyRules(data.results || data || []);
    } catch (err) {
      console.error('Error fetching penalty rules:', err);
    }
  };

  const calculatePenaltyFromFormula = (formula, delayDays, contractValue) => {
    try {
      let evalFormula = formula
        .replace(/contract_value/g, contractValue.toString())
        .replace(/delay_days/g, delayDays.toString());
      
      const result = new Function('return ' + evalFormula)();
      
      return parseFloat(result.toFixed(2));
    } catch (error) {
      console.error('Error calculating penalty from formula:', error);
      return 0;
    }
  };

  const calculatePenalty = (delayDays, contractValue, penaltyRuleId) => {
    const selectedRule = penaltyRules.find(r => r.penalty_rule_id === parseInt(penaltyRuleId));
    
    if (!selectedRule || !selectedRule.penalty_formula) {
      const penaltyRate = 0.001;
      const penaltyAmount = delayDays * penaltyRate * (contractValue || 0);
      return {
        delayDays,
        penaltyRate: '0.1% per day (default)',
        contractValue,
        penaltyAmount: penaltyAmount.toFixed(2),
        formula: 'contract_value * 0.001 * delay_days'
      };
    }
    
    const penaltyAmount = calculatePenaltyFromFormula(
      selectedRule.penalty_formula,
      delayDays,
      contractValue || 0
    );
    
    return {
      delayDays,
      penaltyRate: selectedRule.penalty_formula,
      contractValue,
      penaltyAmount: penaltyAmount.toFixed(2),
      formula: selectedRule.penalty_formula,
      ruleName: selectedRule.rule_name
    };
  };

  const handlePreparePenaltyDoc = (project) => {
    // Check if penalty already exists
    if (checkIfPenaltyExists(project.project_id)) {
      const existingPenalty = getPenaltyInfo(project.project_id);
      setError(`⚠️ Penalty documentation already exists for this project!\n\nPenalty ID: ${existingPenalty.id}\nStatus: ${existingPenalty.penalty_status}\nCreated: ${new Date(existingPenalty.created_at).toLocaleString()}\n\nYou cannot submit duplicate penalty documentation.`);
      setTimeout(() => setError(null), 8000);
      return;
    }

    const calc = calculatePenalty(project.delay_days || 0, parseFloat(project.contract_value || 0), null);
    setPenaltyCalc(calc);
    setSelectedProjectData(project);
    setShowPenaltyModal(true);
  };

  const handlePenaltyRuleChange = (ruleId) => {
    setSelectedPenaltyRule(ruleId);
    
    if (ruleId && selectedProjectData) {
      const calc = calculatePenalty(
        selectedProjectData.delay_days || 0,
        parseFloat(selectedProjectData.contract_value || 0),
        ruleId
      );
      setPenaltyCalc(calc);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const checkDocumentQuality = (doc) => {
    const issues = [];
    if (!doc.file && !doc.document_path) {
      issues.push('No file attached');
    }
    return issues;
  };

  const getDocumentTypeBadge = (docTypeName) => {
    const types = {
      'Certificate of Completion': { color: '#2196f3', icon: '📜' },
      'Site Photo': { color: '#4caf50', icon: '📷' },
      'Building Permit': { color: '#ff9800', icon: '📋' },
      'Material Receipt': { color: '#9c27b0', icon: '🧾' },
      'Safety Form': { color: '#f44336', icon: '🦺' },
      'As-Built Drawing': { color: '#00bcd4', icon: '📐' },
      'COC': { color: '#2196f3', icon: '📜' },
      'Photo': { color: '#4caf50', icon: '📷' },
      'Other': { color: '#999', icon: '📄' }
    };
    const type = types[docTypeName] || { color: '#999', icon: '📄' };
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '20px' }}>{type.icon}</span>
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#555' }}>{docTypeName || 'Document'}</span>
      </div>
    );
  };

  const defaultStats = {
    pending_validation: 0,
    validated_today: 0,
    issues_found: 0
  };

  const currentStats = stats || defaultStats;

  return (
    <div style={{ minHeight: '100vh', padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '28px', marginBottom: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e', fontWeight: '700' }}>
          Document Validation
        </h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Validate work order submissions → Add C1 remarks → Check formats & quality → Generate confirmation → Send to supervisor
        </p>
      </div>

      {/* Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Pending Validation', value: currentStats.pending_validation, color: '#ff9800', icon: '⏳' },
          { label: 'Validated Today', value: currentStats.validated_today, color: '#4caf50', icon: '✅' },
          { label: 'Issues Found', value: currentStats.issues_found, color: '#f44336', icon: '⚠️' },
          { label: 'SLA Breaches', value: slaTracking.length, color: '#e91e63', icon: '🚨' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            borderLeft: `4px solid ${stat.color}`
          }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>{stat.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Projects Queue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {projects.map((project) => {
          const hasPenalty = checkIfPenaltyExists(project.project_id);
          const penaltyInfo = getPenaltyInfo(project.project_id);

          return (
            <div key={project.project_id} style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 6px 24px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s',
              cursor: 'pointer',
              border: hasPenalty ? '2px solid #4caf50' : 'none'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#1a1a2e', fontWeight: '700' }}>
                  {project.project_code}
                </h3>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
                  {project.project_name}
                </p>
                <span style={{
                  background: '#ff9800',
                  color: 'white',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  📋 Awaiting Validation
                </span>
              </div>

              <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                  <p style={{ margin: 0 }}>
                    <strong>Completed:</strong> {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Location:</strong> {project.project_location || 'N/A'}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Status:</strong> {project.status || 'Active'}
                  </p>
                  {project.is_delayed && (
                    <p style={{ margin: 0, color: '#f44336', fontWeight: 'bold' }}>
                      ⚠️ Delayed: {project.delay_days} days
                    </p>
                  )}
                  {project.contract_value && project.is_delayed && (
                    <p style={{ margin: 0, color: '#9c27b0', fontWeight: 'bold' }}>
                      💰 Est. Penalty: {formatCurrency(calculatePenalty(project.delay_days || 0, parseFloat(project.contract_value), null).penaltyAmount)}
                    </p>
                  )}
                </div>
              </div>

              {hasPenalty && penaltyInfo && (
                <div style={{
                  background: '#e8f5e9',
                  border: '2px solid #4caf50',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#2e7d32', marginBottom: '8px' }}>
                    ✅ Penalty Already Forwarded
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div><strong>Penalty ID:</strong> {penaltyInfo.id}</div>
                    <div><strong>Status:</strong> {penaltyInfo.penalty_status}</div>
                    <div><strong>Amount:</strong> {formatCurrency(penaltyInfo.penalty_amount)}</div>
                    <div><strong>Created:</strong> {new Date(penaltyInfo.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => {
                    setSelectedProjectId(project.project_id);
                    setSelectedProjectData(project);
                    fetchProjectDocuments(project.project_id);
                    setValidationModal(true);
                  }}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  🔍 Validate Documents
                </button>
                
                {project.is_delayed && (
                  <button
                    onClick={() => handlePreparePenaltyDoc(project)}
                    disabled={hasPenalty}
                    style={{
                      width: '100%',
                      background: hasPenalty ? '#ccc' : '#f44336',
                      color: 'white',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '10px',
                      cursor: hasPenalty ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      opacity: hasPenalty ? 0.6 : 1
                    }}
                  >
                    {hasPenalty ? '✅ Penalty Forwarded' : '📋 Prepare Penalty Docs'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && projects.length === 0 && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '60px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#1a1a2e' }}>No Projects Pending Validation</h3>
          <p style={{ margin: 0, color: '#666' }}>All projects are up to date!</p>
        </div>
      )}

      {/* Validation Modal */}
      {validationModal && (
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
          padding: '20px',
          overflow: 'auto'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '28px', color: '#1a1a2e', fontWeight: '700' }}>
              🔍 Document Validation & C1 Remarks
            </h2>

            {workOrders.length > 0 && (
              <div style={{
                background: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#1565c0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  📝 C1 Remarks (Work Orders)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {workOrders.map((wo) => (
                    <div key={wo.id} style={{
                      background: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #bbdefb'
                    }}>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                            WO #{wo.wo_no || wo.id}
                          </span>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {wo.description || 'No description'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Location: {wo.location || 'N/A'}
                        </div>
                      </div>
                      <textarea
                        value={c1Remarks[wo.id] || ''}
                        onChange={(e) => setC1Remarks(prev => ({
                          ...prev,
                          [wo.id]: e.target.value
                        }))}
                        placeholder="Add C1 remarks for this work order..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '6px',
                          border: '1px solid #ddd',
                          fontSize: '13px',
                          minHeight: '80px',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveAllRemarks}
                  style={{
                    marginTop: '16px',
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  💾 Save All C1 Remarks
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#1a1a2e', fontWeight: '600' }}>
                📄 Documents
              </h3>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                  <p style={{ margin: 0 }}>Loading documents...</p>
                </div>
              ) : documents.length > 0 ? documents.map((doc) => {
                const issues = checkDocumentQuality(doc);
                const hasIssues = issues.length > 0;

                return (
                  <div key={doc.id} style={{
                    border: `2px solid ${hasIssues ? '#f44336' : '#e0e0e0'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    background: hasIssues ? '#ffebee' : '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      {getDocumentTypeBadge(doc.document_type)}
                      <span style={{
                        background: doc.is_approved === true ? '#4caf50' : doc.is_approved === false ? '#f44336' : '#ff9800',
                        color: 'white',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        {doc.is_approved === true ? 'Approved' : doc.is_approved === false ? 'Rejected' : 'Pending'}
                      </span>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                        {doc.document_name || 'Unnamed Document'}
                      </p>
                      {doc.file && (
                        <p style={{ margin: '4px 0', fontSize: '12px', color: '#2196f3', wordBreak: 'break-all' }}>
                          📎 {doc.file.split('/').pop()}
                        </p>
                      )}
                      {doc.upload_date && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
                          Uploaded: {new Date(doc.upload_date).toLocaleString()}
                        </p>
                      )}
                    </div>

                    {doc.file && (
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        marginBottom: '12px',
                        padding: '12px',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <a
                          href={`http://127.0.0.1:8000${doc.file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            display: 'inline-block'
                          }}
                        >
                          👁️ View
                        </a>
                        <a
                          href={`http://127.0.0.1:8000${doc.file}`}
                          download={doc.document_name || doc.file.split('/').pop()}
                          style={{
                            flex: 1,
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px',
                            textDecoration: 'none',
                            textAlign: 'center',
                            display: 'inline-block'
                          }}
                        >
                          ⬇️ Download
                        </a>
                      </div>
                    )}

                    {hasIssues && (
                      <div style={{
                        background: '#fff',
                        border: '1px solid #f44336',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '12px'
                      }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold', color: '#f44336' }}>
                          ⚠️ Quality Issues:
                        </p>
                        {issues.map((issue, idx) => (
                          <p key={idx} style={{ margin: '4px 0', fontSize: '12px', color: '#f44336' }}>
                            • {issue}
                          </p>
                        ))}
                      </div>
                    )}

                    {doc.is_approved === null && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => validateDocument(doc.id, false)}
                          style={{
                            flex: 1,
                            background: '#fff',
                            color: '#f44336',
                            border: '2px solid #f44336',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          ✗ Reject
                        </button>
                        <button
                          onClick={() => validateDocument(doc.id, true)}
                          style={{
                            flex: 1,
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '13px'
                          }}
                        >
                          ✓ Approve
                        </button>
                      </div>
                    )}
                  </div>
                );
              }) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#999'
                }}>
                  <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>📄</p>
                  <p style={{ margin: 0, fontSize: '16px' }}>No documents found for this project</p>
                </div>
              )}
            </div>

            {confirmationNumber && (
              <div style={{
                background: '#e3f2fd',
                border: '2px solid #2196f3',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'center'
              }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 'bold', color: '#2196f3' }}>
                  CONFIRMATION NUMBER
                </p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', letterSpacing: '2px' }}>
                  {confirmationNumber}
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setValidationModal(false);
                  setConfirmationNumber('');
                }}
                style={{
                  flex: 1,
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  padding: '14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '15px'
                }}
              >
                Close
              </button>
              {documents.length > 0 && documents.every(d => d.is_approved === true) && (
                <button
                  onClick={() => generateConfirmation(selectedProjectId)}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(45deg, #4caf50, #45a049)',
                    color: 'white',
                    border: 'none',
                    padding: '14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}
                >
                  ✅ Generate Confirmation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Penalty Documentation Modal */}
      {showPenaltyModal && selectedProjectData && penaltyCalc && (
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
          zIndex: 1001,
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
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
              📋 Penalty Documentation
            </h2>

            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#667eea' }}>Project Information</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Project Code</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedProjectData.project_code}</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Vendor</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>{selectedProjectData.vendor_name || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Start Date</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedProjectData.start_date ? new Date(selectedProjectData.start_date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Completion Date</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedProjectData.completion_date ? new Date(selectedProjectData.completion_date).toLocaleDateString() : 'Pending'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#e8eaf6', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #5c6bc0' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#3f51b5' }}>
                📋 Select Penalty Rule
              </h3>
              <select
                value={selectedPenaltyRule}
                onChange={(e) => handlePenaltyRuleChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #9fa8da',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Select a Penalty Rule --</option>
                {penaltyRules.map((rule) => (
                  <option key={rule.penalty_rule_id} value={rule.penalty_rule_id}>
                    {rule.rule_name} - {rule.violation_type}
                  </option>
                ))}
              </select>
              {selectedPenaltyRule && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'white', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Description:</strong> {penaltyRules.find(r => r.penalty_rule_id === parseInt(selectedPenaltyRule))?.rule_description || 'No description available'}
                  </div>
                  <div style={{ color: '#666' }}>
                    <strong>Formula:</strong> <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                      {penaltyRules.find(r => r.penalty_rule_id === parseInt(selectedPenaltyRule))?.penalty_formula || 'N/A'}
                    </code>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #ff9800' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#e65100' }}>
                ⚠️ Penalty Calculation {penaltyCalc.ruleName && `(${penaltyCalc.ruleName})`}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Delay Days:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#f44336' }}>
                    {penaltyCalc.delayDays} days
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Formula:</span>
                  <code style={{ fontSize: '12px', fontWeight: '600', color: '#1a1a2e', background: '#f5f5f5', padding: '4px 8px', borderRadius: '4px' }}>
                    {penaltyCalc.formula}
                  </code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '6px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>Contract Value:</span>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a2e' }}>
                    {formatCurrency(penaltyCalc.contractValue)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f44336', borderRadius: '6px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>Penalty Amount:</span>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                    {formatCurrency(penaltyCalc.penaltyAmount)}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ background: '#e8f5e9', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#2e7d32' }}>
                ✅ Required Documentation
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>SLA breach notification date</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Delay calculation worksheet</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Supporting project timeline</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Vendor communication records</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" />
                  <span style={{ color: '#1a1a2e' }}>Penalty memo draft</span>
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Additional Notes
              </label>
              <textarea
                value={penaltyNotes}
                onChange={(e) => setPenaltyNotes(e.target.value)}
                placeholder="Add any notes for the supervisor review..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '100px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowPenaltyModal(false);
                  setSelectedProjectData(null);
                  setPenaltyCalc(null);
                  setPenaltyNotes('');
                  setSelectedPenaltyRule('');
                }}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '2px solid #e0e0e0',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!selectedPenaltyRule) {
                      setError('Please select a penalty rule before submitting.');
                      setTimeout(() => setError(null), 3000);
                      return;
                    }

                    // Double-check if penalty already exists
                    if (checkIfPenaltyExists(selectedProjectData.project_id)) {
                      setError('⚠️ Penalty already exists for this project. Cannot submit duplicate.');
                      setTimeout(() => setError(null), 5000);
                      return;
                    }

                    setLoading(true);
                    setError(null);
                    
                    const penaltyData = {
                      project: selectedProjectData.project_id,
                      vendor: selectedProjectData.vendor,
                      penalty_rule: parseInt(selectedPenaltyRule),
                      violation_date: selectedProjectData.completion_date || new Date().toISOString().split('T')[0],
                      delay_days: penaltyCalc.delayDays,
                      penalty_amount: parseFloat(penaltyCalc.penaltyAmount),
                      penalty_status: 'Draft',
                      issue_date: new Date().toISOString().split('T')[0],
                      created_by: userId
                    };
                    
                    if (penaltyNotes.trim()) {
                      penaltyData.waiver_reason = penaltyNotes;
                    }
                    
                    console.log('Sending penalty data:', penaltyData);
                    
                    const response = await fetch(`${API_BASE_URL}/penalties/`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(penaltyData)
                    });
                    
                    const responseData = await response.json();
                    console.log('API Response:', responseData);
                    
                    if (!response.ok) {
                      let errorMessage = 'Failed to save penalty';
                      
                      if (typeof responseData === 'string') {
                        errorMessage = responseData;
                      } else if (responseData.detail) {
                        errorMessage = responseData.detail;
                      } else if (responseData.error) {
                        errorMessage = responseData.error;
                      } else if (responseData.message) {
                        errorMessage = responseData.message;
                      } else if (typeof responseData === 'object') {
                        const fieldErrors = [];
                        for (const [field, errors] of Object.entries(responseData)) {
                          if (Array.isArray(errors)) {
                            fieldErrors.push(`${field}: ${errors.join(', ')}`);
                          } else if (typeof errors === 'string') {
                            fieldErrors.push(`${field}: ${errors}`);
                          } else if (typeof errors === 'object' && errors !== null) {
                            fieldErrors.push(`${field}: ${JSON.stringify(errors)}`);
                          }
                        }
                        if (fieldErrors.length > 0) {
                          errorMessage = fieldErrors.join('\n');
                        }
                      }
                      
                      throw new Error(errorMessage);
                    }
                    
                    const savedPenalty = responseData;
                    
                    // Refresh penalties list to update UI
                    await fetchExistingPenalties();
                    await fetchPendingProjects();
                    
                    setSuccessMessage(`✅ Penalty documentation saved successfully! Penalty ID: ${savedPenalty.id}`);
                    setShowPenaltyModal(false);
                    setSelectedProjectData(null);
                    setPenaltyCalc(null);
                    setPenaltyNotes('');
                    setSelectedPenaltyRule('');
                    setTimeout(() => setSuccessMessage(''), 5000);
                  } catch (err) {
                    console.error('Penalty save error:', err);
                    setError('Failed to save penalty: ' + err.message);
                    setTimeout(() => setError(null), 5000);
                  } finally {
                    setLoading(false);
                  }
                }}
                style={{
                  background: 'linear-gradient(45deg, #f44336, #e91e63)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                📤 Forward to Supervisor
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '32px',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          zIndex: 2000
        }}>
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Loading...</p>
        </div>
      )}

      {successMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#4caf50',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.4)',
          zIndex: 2001,
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '400px',
          whiteSpace: 'pre-wrap'
        }}>
          {successMessage}
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
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(244, 67, 54, 0.4)',
          zIndex: 2001,
          fontSize: '14px',
          fontWeight: '600',
          maxWidth: '500px',
          minWidth: '300px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
            <div style={{ flex: 1, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>❌ Error</div>
              <div style={{ fontSize: '13px', lineHeight: '1.5' }}>{error}</div>
            </div>
            <button
              onClick={() => setError(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}