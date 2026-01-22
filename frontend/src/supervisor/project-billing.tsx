import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function SupervisorBillingApproval() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingData, setBillingData] = useState({
    contract_amount: 0,
    total_penalties: 0,
    total_deductions: 0,
    net_amount: 0,
    invoice_number: ''
  });
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchReadyForBilling();
  }, []);

  const fetchReadyForBilling = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/projects/?status=7`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data.results || data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPenalties = async (projectId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/penalties/?project=${projectId}`);
      if (!response.ok) throw new Error('Failed to fetch penalties');
      const data = await response.json();
      const penaltyList = data.results || data || [];
      setPenalties(penaltyList);
      
      const totalPenalties = penaltyList.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
      return totalPenalties;
    } catch (err) {
      console.error('Error fetching penalties:', err);
      return 0;
    }
  };

  const handleReviewBilling = async (project) => {
    setSelectedProject(project);
    setShowBillingModal(true);
    
    const totalPenalties = await fetchPenalties(project.project_id);
    const contractAmount = parseFloat(project.contract_value || 0);
    const totalDeductions = 0; // Can be extended for other deductions
    const netAmount = contractAmount - totalPenalties - totalDeductions;
    
    setBillingData({
      contract_amount: contractAmount,
      total_penalties: totalPenalties,
      total_deductions: totalDeductions,
      net_amount: netAmount,
      invoice_number: `INV-${project.project_code}-${new Date().getFullYear()}`
    });
  };

  const handleApproveBilling = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').user_id || 0;
      
      // Create invoice
      const invoicePayload = {
        project: selectedProject.project_id,
        vendor: selectedProject.vendor,
        invoice_number: billingData.invoice_number,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0], // Net 30
        invoice_amount: billingData.contract_amount,
        penalty_amount: billingData.total_penalties,
        net_amount: billingData.net_amount,
        payment_status: 'Unpaid',
        created_by: userId,
        approved_by: userId,
        approval_date: new Date().toISOString()
      };

      const invoiceResponse = await fetch(`${API_BASE_URL}/invoices/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });

      if (!invoiceResponse.ok) {
        const errorData = await invoiceResponse.json();
        throw new Error(JSON.stringify(errorData));
      }

      // Update project status
      await fetch(`${API_BASE_URL}/projects/${selectedProject.project_id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'Awaiting Payment',
          actual_billing_date: new Date().toISOString().split('T')[0]
        })
      });

      setSuccessMessage(`Invoice ${billingData.invoice_number} created successfully`);
      setShowBillingModal(false);
      fetchReadyForBilling();
    } catch (err) {
      setError('Error approving billing: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>💰 Billing Approval</h1>
        <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
          Review and approve project billing
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(102,126,234,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Pending Approval</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>{projects.length}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '16px', padding: '24px', color: 'white', boxShadow: '0 4px 20px rgba(245,87,108,0.3)' }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>Total Value</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>
            ₱{projects.reduce((sum, p) => sum + parseFloat(p.contract_value || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📋 Projects Ready for Billing</h2>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading...</div>
        ) : projects.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Project Code</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Contract Value</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold', color: '#1a1a2e' }}>Completion</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#1a1a2e' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.project_id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{project.project_code}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{project.vendor_name || 'N/A'}</td>
                    <td style={{ padding: '12px', color: '#1a1a2e', fontWeight: 'bold' }}>
                      ₱{parseFloat(project.contract_value || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', color: '#1a1a2e' }}>{project.completion_date || 'N/A'}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleReviewBilling(project)}
                        style={{
                          background: '#4caf50',
                          color: 'white',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Review & Approve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No projects ready for billing approval
          </div>
        )}
      </div>

      {/* Billing Modal */}
      {showBillingModal && selectedProject && (
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
            <h2 style={{ margin: '0 0 20px 0', color: '#1a1a2e' }}>💰 Billing Calculation</h2>
            <h3 style={{ margin: '0 0 20px 0', color: '#667eea' }}>{selectedProject.project_code}</h3>

            {/* Calculation Breakdown */}
            <div style={{ background: '#f5f5f5', borderRadius: '12px', padding: '20px', marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 16px 0', color: '#1a1a2e' }}>Billing Breakdown</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                  <span style={{ color: '#1a1a2e' }}>Contract Amount:</span>
                  <span style={{ fontWeight: 'bold', color: '#1a1a2e' }}>₱{billingData.contract_amount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                  <span style={{ color: '#f44336' }}>Less: Penalties</span>
                  <span style={{ fontWeight: 'bold', color: '#f44336' }}>-₱{billingData.total_penalties.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e0e0e0' }}>
                  <span style={{ color: '#f44336' }}>Less: Other Deductions</span>
                  <span style={{ fontWeight: 'bold', color: '#f44336' }}>-₱{billingData.total_deductions.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', background: '#667eea', margin: '8px -20px -20px -20px', padding: '16px 20px', borderRadius: '0 0 12px 12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>Net Amount:</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'white' }}>₱{billingData.net_amount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Penalties Detail */}
            {penalties.length > 0 && (
              <div style={{ background: '#fff3e0', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid #ffb74d' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#1a1a2e' }}>⚠️ Penalty Details ({penalties.length})</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {penalties.map((penalty, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#1a1a2e' }}>
                      <span>{penalty.penalty_rule_name || 'Penalty'} ({penalty.delay_days} days)</span>
                      <span style={{ fontWeight: 'bold' }}>₱{parseFloat(penalty.penalty_amount || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Number */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#1a1a2e' }}>Invoice Number</label>
              <input
                type="text"
                value={billingData.invoice_number}
                onChange={(e) => setBillingData({...billingData, invoice_number: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowBillingModal(false)}
                style={{
                  background: '#fff',
                  color: '#666',
                  border: '1px solid #ddd',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleApproveBilling}
                style={{
                  background: 'linear-gradient(45deg, #667eea, #764ba2)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Approve & Generate Invoice
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
          zIndex: 2000
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
          zIndex: 2000
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}