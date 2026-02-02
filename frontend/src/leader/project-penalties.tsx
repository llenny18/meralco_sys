import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function TeamLeaderPenaltyApproval() {
  const [penalties, setPenalties] = useState([]);
  const [approvedPenalties, setApprovedPenalties] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [approvalData, setApprovalData] = useState({
    decision: 'approve',
    notes: ''
  });
  const [supervisorStats, setSupervisorStats] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // all, approved, returned

  const THRESHOLD_AMOUNT = 50000; // Amount requiring Team Leader approval
  const currentUser =
  typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('user') || '{}')
    : {};

    console.log('Current User:', currentUser);


  useEffect(() => {
    fetchPendingApprovals();
    fetchApprovedPenalties();
    fetchSupervisors();
  }, []);

  useEffect(() => {
    if (supervisors.length > 0 && approvedPenalties.length > 0) {
      calculateSupervisorStats();
    }
  }, [supervisors, approvedPenalties]);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch penalties that need TL approval (high value, approved by supervisor, not yet TL approved)
      const response = await fetch(
        `${API_BASE_URL}/penalties/?penalty_status=Issued&ordering=-created_at`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch pending approvals: ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.results || data || [];
      
      // Filter for high-value penalties that need TL approval
      const highValuePenalties = results.filter(p => {
        const amount = parseFloat(p.penalty_amount || 0);
        const hasApproval = p.approved_by && p.approval_date;
        const needsTLApproval = !p.tl_approved && !p.approval_date;
        return amount >= THRESHOLD_AMOUNT && hasApproval && needsTLApproval;
      });
      
      // Enrich with related data
      const enrichedPenalties = await Promise.all(
        highValuePenalties.map(async (penalty) => {
          return await enrichPenaltyData(penalty);
        })
      );
      
      setPenalties(enrichedPenalties);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching pending approvals:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedPenalties = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/penalties`
      );
      
      if (!response.ok) return;
      
      const data = await response.json();
      const results = data.results || data || [];
      
      // Filter for TL processed penalties (both approved and returned)
      const tlProcessed = results.filter(p => p.approval_date);
      
      // Enrich with related data
      const enrichedPenalties = await Promise.all(
        tlProcessed.map(async (penalty) => {
          return await enrichPenaltyData(penalty);
        })
      );
      console.log('Enriched Approved Penalties:', data.results);
      
      setApprovedPenalties(enrichedPenalties);
    } catch (err) {
      console.error('Error fetching approved penalties:', err);
    }
  };

  const enrichPenaltyData = async (penalty) => {
    try {
      // Fetch project details
      if (penalty.project) {
        const projectRes = await fetch(`${API_BASE_URL}/projects/${penalty.project}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (projectRes.ok) {
          const project = await projectRes.json();
          penalty.project_code = project.project_code;
          penalty.project_name = project.project_name;
          penalty.contract_value = project.contract_value;
        }
      }
      
      // Fetch vendor details
      if (penalty.vendor) {
        const vendorRes = await fetch(`${API_BASE_URL}/vendors/${penalty.vendor}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (vendorRes.ok) {
          const vendor = await vendorRes.json();
          penalty.vendor_name = vendor.vendor_name;
          penalty.vendor_code = vendor.vendor_code;
          penalty.vendor_company = vendor.company_name;
        }
      }
      
      // Fetch supervisor approver details
      if (penalty.approved_by) {
        const userRes = await fetch(`${API_BASE_URL}/users/${penalty.approved_by}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (userRes.ok) {
          const user = await userRes.json();
          penalty.approved_by_name = `${user.first_name} ${user.last_name}`;
        }
      }
      
      // Fetch TL approver details
      if (penalty.tl_approved_by) {
        const tlUserRes = await fetch(`${API_BASE_URL}/users/${penalty.tl_approved_by}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (tlUserRes.ok) {
          const tlUser = await tlUserRes.json();
          penalty.tl_approved_by_name = `${tlUser.first_name} ${tlUser.last_name}`;
        }
      }
      
      // Fetch penalty rule details
      if (penalty.penalty_rule) {
        const ruleRes = await fetch(`${API_BASE_URL}/penalty-rules/${penalty.penalty_rule}/`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (ruleRes.ok) {
          const rule = await ruleRes.json();
          penalty.rule_name = rule.rule_name;
          penalty.violation_type = rule.violation_type;
        }
      }
      
      return penalty;
    } catch (err) {
      console.error('Error enriching penalty:', err);
      return penalty;
    }
  };

  const fetchSupervisors = async () => {
    try {
      // Fetch users with Supervisor role
      const rolesRes = await fetch(`${API_BASE_URL}/user-roles/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (!rolesRes.ok) return;
      
      const roles = await rolesRes.json();
      const supervisorRole = (roles.results || roles || []).find(
        r => r.role_name === 'Supervisor' || r.role_name === 'WO Supervisor'
      );
      
      if (!supervisorRole) return;
      
      const usersRes = await fetch(
        `${API_BASE_URL}/users/?role=${supervisorRole.role_id}`,
        {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (!usersRes.ok) return;
      
      const users = await usersRes.json();
      setSupervisors(users.results || users || []);
    } catch (err) {
      console.error('Error fetching supervisors:', err);
    }
  };

  const calculateSupervisorStats = () => {
    const stats = {};
    
    supervisors.forEach(supervisor => {
      const supervisorPenalties = approvedPenalties.filter(
        p => p.approved_by === supervisor.user_id
      );
      
      stats[supervisor.user_id] = {
        name: `${supervisor.first_name} ${supervisor.last_name}`,
        count: supervisorPenalties.length,
        totalAmount: supervisorPenalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0),
        avgAmount: supervisorPenalties.length > 0 
          ? supervisorPenalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0) / supervisorPenalties.length 
          : 0
      };
    });
    
    setSupervisorStats(stats);
  };

  const handleSecondaryApproval = async () => {
    if (!selectedPenalty) return;

    setError(null);
    try {
      const payload = {
        tl_approved: approvalData.decision === 'approve',
        approval_date: new Date().toISOString(),
        tl_notes: approvalData.notes,
        tl_approved_by: currentUser.user_id
      };

      // If returning for review, also update status
      if (approvalData.decision === 'return') {
        payload.penalty_status = 'Under Review';
      }

      const response = await fetch(
        `${API_BASE_URL}/penalties/${selectedPenalty.id}/`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process approval');
      }

      setSuccessMessage(
        `Penalty ${approvalData.decision === 'approve' ? 'approved and forwarded to Finance' : 'returned to Supervisor for review'}!`
      );
      
      setShowApprovalModal(false);
      setSelectedPenalty(null);
      setApprovalData({ decision: 'approve', notes: '' });
      
      // Refresh data
      await fetchPendingApprovals();
      await fetchApprovedPenalties();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setError('Error processing approval: ' + err.message);
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount || 0);
  };

  const getPenaltyConsistency = (penaltyList) => {
    if (penaltyList.length < 2) return 100;
    const amounts = penaltyList.map(p => parseFloat(p.penalty_amount || 0)).filter(a => a > 0);
    if (amounts.length < 2) return 100;
    
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / avg) * 100;
    return Math.max(0, Math.min(100, 100 - cv));
  };

  const calculateAvgProcessingTime = () => {
    const processedPenalties = approvedPenalties.filter(
      p => p.approval_date && p.approval_date
    );
    
    if (processedPenalties.length === 0) return 0;
    
    const totalDays = processedPenalties.reduce((sum, p) => {
      const approvalDate = new Date(p.approval_date);
      const tlApprovalDate = new Date(p.approval_date);
      const diffTime = Math.abs(tlApprovalDate - approvalDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    
    return (totalDays / processedPenalties.length).toFixed(1);
  };

  const getFilteredApprovedPenalties = () => {
    if (filterStatus === 'all') return approvedPenalties;
    if (filterStatus === 'approved') return approvedPenalties.filter(p => p.tl_approved === true);
    if (filterStatus === 'returned') return approvedPenalties.filter(p => p.tl_approved === false);
    return approvedPenalties;
  };

  const totalPendingValue = penalties.reduce(
    (sum, p) => sum + parseFloat(p.penalty_amount || 0), 
    0
  );

  const avgPenaltyAmount = approvedPenalties.length > 0
    ? approvedPenalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0) / approvedPenalties.length
    : 0;

  const approvedCount = approvedPenalties.filter(p => p.tl_approved === true).length;
  const returnedCount = approvedPenalties.filter(p => p.tl_approved === false).length;

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>
              🏢 Team Leader - Secondary Approval
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Review high-value penalties (≥ ₱{THRESHOLD_AMOUNT.toLocaleString()}) and ensure department-wide consistency
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('pending')}
              style={{
                background: activeTab === 'pending' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: activeTab === 'pending' ? 'white' : '#666',
                border: activeTab === 'pending' ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ⏳ Pending ({penalties.length})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              style={{
                background: activeTab === 'approved' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: activeTab === 'approved' ? 'white' : '#666',
                border: activeTab === 'approved' ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              ✅ Processed ({approvedPenalties.length})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              style={{
                background: activeTab === 'analytics' ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: activeTab === 'analytics' ? 'white' : '#666',
                border: activeTab === 'analytics' ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => {
                fetchPendingApprovals();
                fetchApprovedPenalties();
              }}
              style={{
                background: '#fff',
                color: '#667eea',
                border: '1px solid #667eea',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Pending TL Approval</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
            {penalties.length}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            High-value penalties awaiting review
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Processed</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
            {approvedPenalties.length}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {approvedCount} approved, {returnedCount} returned
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Penalty Consistency</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3' }}>
            {getPenaltyConsistency(approvedPenalties).toFixed(0)}%
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            Department-wide uniformity
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Avg Processing Time</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9c27b0' }}>
            {calculateAvgProcessingTime()}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            Days from supervisor to TL approval
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeTab === 'pending' ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            💼 High-Value Penalties Requiring TL Approval
          </h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <div style={{ fontSize: '18px', color: '#666' }}>Loading pending approvals...</div>
            </div>
          ) : error ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              background: '#fff3e0',
              borderRadius: '12px',
              border: '2px solid #ff9800'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
              <div style={{ fontSize: '18px', color: '#e65100', marginBottom: '8px' }}>Error Loading Data</div>
              <div style={{ fontSize: '14px', color: '#666' }}>{error}</div>
              <button
                onClick={fetchPendingApprovals}
                style={{
                  marginTop: '16px',
                  background: '#ff9800',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Try Again
              </button>
            </div>
          ) : penalties.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                All Caught Up!
              </div>
              <div style={{ fontSize: '14px' }}>
                No high-value penalties pending Team Leader approval
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {penalties.map((penalty) => (
                <div
                  key={penalty.id}
                  style={{
                    border: '2px solid #9c27b0',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#f3e5f5',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(156,39,176,0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}>
                          Penalty #{penalty.id}
                        </h3>
                        <span style={{
                          background: '#9c27b0',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          HIGH VALUE
                        </span>
                        <span style={{
                          background: '#ff9800',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          AWAITING TL APPROVAL
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Project:</strong> {penalty.project_code || penalty.project_name || `ID: ${penalty.project}`}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Vendor:</strong> {penalty.vendor_name || penalty.vendor_code || `ID: ${penalty.vendor}`}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9c27b0', marginBottom: '4px' }}>
                        {formatCurrency(penalty.penalty_amount)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {penalty.delay_days || 0} days delay
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Approved By (Supervisor)</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.approved_by_name || 'Supervisor'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Supervisor Approval Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.approval_date ? new Date(penalty.approval_date).toLocaleDateString('en-PH') : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Contract Value</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {formatCurrency(penalty.contract_value)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Violation Type</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.violation_type || 'Delay Penalty'}
                        </div>
                      </div>
                    </div>
                    
                    {penalty.supervisor_notes && (
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Supervisor Notes:</div>
                        <div style={{ fontSize: '13px', color: '#444', fontStyle: 'italic' }}>
                          "{penalty.supervisor_notes}"
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedPenalty(penalty);
                        setApprovalData({ decision: 'approve', notes: '' });
                        setShowApprovalModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      🔍 Review & Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'approved' ? (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>
              ✅ Processed Penalties by Team Leader
            </h2>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilterStatus('all')}
                style={{
                  background: filterStatus === 'all' ? '#667eea' : '#fff',
                  color: filterStatus === 'all' ? 'white' : '#666',
                  border: `1px solid ${filterStatus === 'all' ? '#667eea' : '#ddd'}`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                All ({approvedPenalties.length})
              </button>
              <button
                onClick={() => setFilterStatus('approved')}
                style={{
                  background: filterStatus === 'approved' ? '#4caf50' : '#fff',
                  color: filterStatus === 'approved' ? 'white' : '#666',
                  border: `1px solid ${filterStatus === 'approved' ? '#4caf50' : '#ddd'}`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                ✓ Approved ({approvedCount})
              </button>
              <button
                onClick={() => setFilterStatus('returned')}
                style={{
                  background: filterStatus === 'returned' ? '#ff9800' : '#fff',
                  color: filterStatus === 'returned' ? 'white' : '#666',
                  border: `1px solid ${filterStatus === 'returned' ? '#ff9800' : '#ddd'}`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                ↩ Returned ({returnedCount})
              </button>
            </div>
          </div>

          {getFilteredApprovedPenalties().length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
              <div style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>
                No Processed Penalties
              </div>
              <div style={{ fontSize: '14px' }}>
                {filterStatus === 'all' ? 'No penalties have been processed by Team Leader yet' :
                 filterStatus === 'approved' ? 'No penalties have been approved yet' :
                 'No penalties have been returned for review yet'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {getFilteredApprovedPenalties().map((penalty) => (
                <div
                  key={penalty.id}
                  style={{
                    border: `2px solid ${penalty.tl_approved ? '#4caf50' : '#ff9800'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    background: penalty.tl_approved ? '#e8f5e9' : '#fff3e0',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = `0 4px 12px ${penalty.tl_approved ? 'rgba(76,175,80,0.3)' : 'rgba(255,152,0,0.3)'}`;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '20px', color: '#1a1a2e' }}>
                          Penalty #{penalty.id}
                        </h3>
                        {penalty.tl_approved ? (
                          <span style={{
                            background: '#4caf50',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ✓ TL APPROVED
                          </span>
                        ) : (
                          <span style={{
                            background: '#ff9800',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}>
                            ↩ RETURNED FOR REVIEW
                          </span>
                        )}
                        <span style={{
                          background: '#2196f3',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          {penalty.penalty_status || 'Issued'}
                        </span>
                      </div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: '#666' }}>
                        <strong>Project:</strong> {penalty.project_code || penalty.project_name || `ID: ${penalty.project}`}
                      </p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        <strong>Vendor:</strong> {penalty.vendor_name || penalty.vendor_code || `ID: ${penalty.vendor}`}
                      </p>
                    </div>
                    
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '32px', fontWeight: 'bold', color: penalty.tl_approved ? '#4caf50' : '#ff9800', marginBottom: '4px' }}>
                        {formatCurrency(penalty.penalty_amount)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {penalty.delay_days || 0} days delay
                      </div>
                    </div>
                  </div>

                  {/* Approval Timeline */}
                  <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#667eea', marginBottom: '12px' }}>
                      📋 Approval Timeline
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Supervisor Approval</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.approved_by_name || 'Unknown'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          {penalty.approval_date ? new Date(penalty.approval_date).toLocaleDateString('en-PH') : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>TL Decision</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.tl_approved_by_name || currentUser.first_name + ' ' + currentUser.last_name}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          {penalty.approval_date ? new Date(penalty.approval_date).toLocaleDateString('en-PH') : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Processing Time</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.approval_date && penalty.approval_date ? 
                            Math.ceil((new Date(penalty.approval_date) - new Date(penalty.approval_date)) / (1000 * 60 * 60 * 24)) + ' days'
                            : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Violation Type</div>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.violation_type || 'Delay Penalty'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TL Notes */}
                  {penalty.tl_notes && (
                    <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>
                        Team Leader Notes:
                      </div>
                      <div style={{ fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6' }}>
                        {penalty.tl_notes}
                      </div>
                    </div>
                  )}

                  {/* Additional Details */}
                  <div style={{ background: 'white', padding: '16px', borderRadius: '8px', marginBottom: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Contract Value</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {formatCurrency(penalty.contract_value)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Violation Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.violation_date ? new Date(penalty.violation_date).toLocaleDateString('en-PH') : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Issue Date</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.issue_date ? new Date(penalty.issue_date).toLocaleDateString('en-PH') : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>Penalty Rule</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a2e' }}>
                          {penalty.rule_name || 'Standard Delay Rule'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => {
                        setSelectedPenalty(penalty);
                        setShowDetailsModal(true);
                      }}
                      style={{
                        background: 'linear-gradient(45deg, #667eea, #764ba2)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      📄 View Full Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            📊 Department Penalty Analytics
          </h2>
          
          {/* Supervisor Comparison */}
          <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#667eea' }}>
              Supervisor Performance Comparison
            </h3>
            {supervisors.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Loading supervisor data...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {supervisors.slice(0, 6).map((supervisor) => {
                  const stats = supervisorStats[supervisor.user_id] || { count: 0, totalAmount: 0, avgAmount: 0 };
                  const maxCount = Math.max(...Object.values(supervisorStats).map(s => s.count), 1);
                  
                  return (
                    <div key={supervisor.user_id} style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                        {supervisor.first_name} {supervisor.last_name}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '4px' }}>
                        {stats.count}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                        Penalties Issued
                      </div>
                      <div style={{ fontSize: '12px', color: '#9c27b0', marginBottom: '8px' }}>
                        Avg: {formatCurrency(stats.avgAmount)}
                      </div>
                      <div style={{ 
                        marginTop: '8px',
                        height: '4px',
                        background: '#e0e0e0',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${(stats.count / maxCount) * 100}%`,
                          background: 'linear-gradient(90deg, #667eea, #764ba2)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Consistency Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#2e7d32', marginBottom: '12px', fontWeight: 'bold' }}>
                ✅ Penalty Consistency Score
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
                {getPenaltyConsistency(approvedPenalties).toFixed(0)}%
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {approvedPenalties.length} penalties analyzed
              </div>
            </div>

            <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#e65100', marginBottom: '12px', fontWeight: 'bold' }}>
                ⚖️ Avg Penalty Amount
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
                {formatCurrency(avgPenaltyAmount)}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Per penalty issued
              </div>
            </div>

            <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#0d47a1', marginBottom: '12px', fontWeight: 'bold' }}>
                ⏱️ TL Approval Speed
              </div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196f3', marginBottom: '8px' }}>
                {calculateAvgProcessingTime()}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                Days average processing time
              </div>
            </div>
          </div>

          {/* Approval Statistics */}
          <div style={{ marginTop: '20px', background: '#f5f5f5', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#667eea' }}>
              TL Decision Statistics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4caf50', marginBottom: '8px' }}>
                  {approvedCount}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Approved</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {approvedPenalties.length > 0 ? ((approvedCount / approvedPenalties.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
                  {returnedCount}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Returned</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  {approvedPenalties.length > 0 ? ((returnedCount / approvedPenalties.length) * 100).toFixed(1) : 0}%
                </div>
              </div>
              <div style={{ background: 'white', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#2196f3', marginBottom: '8px' }}>
                  {approvedPenalties.length}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Processed</div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                  All time
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedPenalty && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
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
            padding: '24px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
              🏢 Team Leader Secondary Approval
            </h2>

            {/* Penalty Summary */}
            <div style={{ background: '#f3e5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '2px solid #9c27b0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#9c27b0' }}>
                High-Value Penalty Review
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Project</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedPenalty.project_code || selectedPenalty.project_name || `ID: ${selectedPenalty.project}`}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Vendor</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedPenalty.vendor_name || selectedPenalty.vendor_code || `ID: ${selectedPenalty.vendor}`}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Penalty Amount</div>
                  <div style={{ fontWeight: '600', color: '#9c27b0', fontSize: '18px' }}>
                    {formatCurrency(selectedPenalty.penalty_amount)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Delay Days</div>
                  <div style={{ fontWeight: '600', color: '#f44336' }}>{selectedPenalty.delay_days || 0} days</div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Violation Date</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedPenalty.violation_date ? new Date(selectedPenalty.violation_date).toLocaleDateString('en-PH') : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Issue Date</div>
                  <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                    {selectedPenalty.issue_date ? new Date(selectedPenalty.issue_date).toLocaleDateString('en-PH') : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Supervisor's Approval Info */}
            <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#667eea' }}>
                Supervisor Review Details
              </h3>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Approved By:</strong> {selectedPenalty.approved_by_name || 'Supervisor'}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Approval Date:</strong> {selectedPenalty.approval_date 
                    ? new Date(selectedPenalty.approval_date).toLocaleDateString('en-PH') 
                    : 'N/A'}
                </div>
                {selectedPenalty.supervisor_notes && (
                  <div>
                    <strong>Supervisor Notes:</strong>
                    <div style={{ 
                      background: 'white', 
                      padding: '12px', 
                      borderRadius: '6px', 
                      marginTop: '8px',
                      color: '#1a1a2e'
                    }}>
                      {selectedPenalty.supervisor_notes}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* TL Decision */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Team Leader Decision
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setApprovalData({...approvalData, decision: 'approve'})}
                  style={{
                    flex: 1,
                    background: approvalData.decision === 'approve' ? '#4caf50' : '#fff',
                    color: approvalData.decision === 'approve' ? 'white' : '#666',
                    border: `2px solid ${approvalData.decision === 'approve' ? '#4caf50' : '#ddd'}`,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  ✅ Approve & Route to Finance
                </button>
                <button
                  onClick={() => setApprovalData({...approvalData, decision: 'return'})}
                  style={{
                    flex: 1,
                    background: approvalData.decision === 'return' ? '#ff9800' : '#fff',
                    color: approvalData.decision === 'return' ? 'white' : '#666',
                    border: `2px solid ${approvalData.decision === 'return' ? '#ff9800' : '#ddd'}`,
                    padding: '12px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                >
                  ↩️ Return for Review
                </button>
              </div>
            </div>

            {/* TL Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                Team Leader Notes {approvalData.decision === 'return' && <span style={{ color: '#f44336' }}>*</span>}
              </label>
              <textarea
                value={approvalData.notes}
                onChange={(e) => setApprovalData({...approvalData, notes: e.target.value})}
                placeholder={approvalData.decision === 'approve' 
                  ? "Add your review notes and any observations about consistency..." 
                  : "Please explain why this penalty needs to be reviewed again..."}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  minHeight: '120px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              {approvalData.decision === 'return' && !approvalData.notes && (
                <div style={{ fontSize: '12px', color: '#f44336', marginTop: '4px' }}>
                  Notes are required when returning for review
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedPenalty(null);
                  setApprovalData({ decision: 'approve', notes: '' });
                }}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
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
                onClick={handleSecondaryApproval}
                disabled={approvalData.decision === 'return' && !approvalData.notes}
                style={{
                  background: approvalData.decision === 'approve'
                    ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
                    : 'linear-gradient(45deg, #ff9800, #ffb74d)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: (approvalData.decision === 'return' && !approvalData.notes) ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  opacity: (approvalData.decision === 'return' && !approvalData.notes) ? 0.5 : 1
                }}
              >
                {approvalData.decision === 'approve' ? '✅ Approve & Forward to Finance' : '↩️ Return to Supervisor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedPenalty && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
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
            padding: '24px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#1a1a2e' }}>
                📄 Penalty Details #{selectedPenalty.id}
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPenalty(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ✕
              </button>
            </div>

            {/* Status Badge */}
            <div style={{ marginBottom: '20px' }}>
              {selectedPenalty.tl_approved ? (
                <span style={{
                  background: '#4caf50',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ✓ TL APPROVED
                </span>
              ) : (
                <span style={{
                  background: '#ff9800',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  ↩ RETURNED FOR REVIEW
                </span>
              )}
            </div>

            {/* Complete Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Project & Vendor Info */}
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#667eea' }}>Project & Vendor Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Project Code</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.project_code || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Project Name</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.project_name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Vendor Name</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.vendor_name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Vendor Code</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.vendor_code || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div style={{ background: '#f3e5f5', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#9c27b0' }}>Financial Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Penalty Amount</div>
                    <div style={{ fontWeight: '700', color: '#9c27b0', fontSize: '20px' }}>
                      {formatCurrency(selectedPenalty.penalty_amount)}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Contract Value</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {formatCurrency(selectedPenalty.contract_value)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Violation Details */}
              <div style={{ background: '#fff3e0', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#e65100' }}>Violation Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Violation Type</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.violation_type || 'Delay Penalty'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Delay Days</div>
                    <div style={{ fontWeight: '600', color: '#f44336' }}>
                      {selectedPenalty.delay_days || 0} days
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Violation Date</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.violation_date ? new Date(selectedPenalty.violation_date).toLocaleDateString('en-PH') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Issue Date</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.issue_date ? new Date(selectedPenalty.issue_date).toLocaleDateString('en-PH') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Approval Timeline */}
              <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#0d47a1' }}>Approval Timeline</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>Supervisor Approval</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.approved_by_name || 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {selectedPenalty.approval_date ? new Date(selectedPenalty.approval_date).toLocaleDateString('en-PH') : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: '#666', marginBottom: '4px' }}>TL Decision</div>
                    <div style={{ fontWeight: '600', color: '#1a1a2e' }}>
                      {selectedPenalty.tl_approved_by_name || 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>
                      {selectedPenalty.approval_date ? new Date(selectedPenalty.approval_date).toLocaleDateString('en-PH') : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedPenalty.tl_notes && (
                <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#667eea' }}>Team Leader Notes</h3>
                  <div style={{ fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6' }}>
                    {selectedPenalty.tl_notes}
                  </div>
                </div>
              )}

              {selectedPenalty.supervisor_notes && (
                <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#667eea' }}>Supervisor Notes</h3>
                  <div style={{ fontSize: '14px', color: '#1a1a2e', lineHeight: '1.6' }}>
                    {selectedPenalty.supervisor_notes}
                  </div>
                </div>
              )}
            </div>

            {/* Close Button */}
            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedPenalty(null);
                }}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      {successMessage && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#4caf50',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 2000,
          fontSize: '14px',
          animation: 'slideIn 0.3s ease'
        }}>
          ✅ {successMessage}
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
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          zIndex: 2000,
          fontSize: '14px',
          animation: 'slideIn 0.3s ease'
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}