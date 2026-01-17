import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function SectorManagerCompliance() {
  const [penalties, setPenalties] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [complianceData, setComplianceData] = useState({
    totalProjects: 0,
    delayedProjects: 0,
    totalPenalties: 0,
    complianceRate: 0
  });

  useEffect(() => {
    fetchSectorData();
  }, [selectedPeriod]);

  const fetchSectorData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchPenalties(),
        fetchVendors(),
        fetchProjects()
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPenalties = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/penalties/`);
      if (!response.ok) throw new Error('Failed to fetch penalties');
      const data = await response.json();
      setPenalties(data.results || data || []);
    } catch (err) {
      console.error('Error fetching penalties:', err);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendors/`);
      if (!response.ok) throw new Error('Failed to fetch vendors');
      const data = await response.json();
      setVendors(data.results || data || []);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/`);
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      const projectsData = data.results || data || [];
      setProjects(projectsData);
      
      // Calculate compliance data
      const delayed = projectsData.filter(p => p.is_delayed).length;
      const total = projectsData.length;
      setComplianceData({
        totalProjects: total,
        delayedProjects: delayed,
        totalPenalties: penalties.length,
        complianceRate: total > 0 ? ((total - delayed) / total * 100).toFixed(1) : 0
      });
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getVendorCompliance = (vendorId) => {
    const vendorProjects = projects.filter(p => p.vendor === vendorId);
    const delayedCount = vendorProjects.filter(p => p.is_delayed).length;
    return vendorProjects.length > 0 
      ? ((vendorProjects.length - delayedCount) / vendorProjects.length * 100).toFixed(0)
      : 100;
  };

  const getComplianceColor = (rate) => {
    if (rate >= 95) return '#4caf50';
    if (rate >= 88) return '#ff9800';
    return '#f44336';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>
              🏛️ Sector-Wide Compliance Dashboard
            </h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>
              Monitor SLA compliance, penalties, and vendor performance across all departments
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                cursor: 'pointer',
                background: 'white'
              }}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>SLA Compliance Rate</div>
              <div style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                color: getComplianceColor(complianceData.complianceRate) 
              }}>
                {complianceData.complianceRate}%
              </div>
            </div>
            <div style={{ fontSize: '48px' }}>📊</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Target: 95% | {complianceData.totalProjects - complianceData.delayedProjects} of {complianceData.totalProjects} on time
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Projects</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a1a2e' }}>
                {complianceData.totalProjects}
              </div>
            </div>
            <div style={{ fontSize: '48px' }}>📦</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {complianceData.delayedProjects} delayed projects
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Penalties Collected</div>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#f44336' }}>
                {formatCurrency(penalties.reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0))}
              </div>
            </div>
            <div style={{ fontSize: '48px' }}>💰</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {penalties.length} penalties issued
          </div>
        </div>
        
        <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Active Vendors</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#2196f3' }}>
                {vendors.filter(v => v.is_active).length}
              </div>
            </div>
            <div style={{ fontSize: '48px' }}>👥</div>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {vendors.filter(v => !v.is_active).length} inactive
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '16px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['overview', 'vendors', 'trends', 'reports'].map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              style={{
                background: activeView === view ? 'linear-gradient(45deg, #667eea, #764ba2)' : '#fff',
                color: activeView === view ? 'white' : '#666',
                border: activeView === view ? 'none' : '1px solid #ddd',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'capitalize'
              }}
            >
              {view === 'overview' && '📊 '}
              {view === 'vendors' && '👥 '}
              {view === 'trends' && '📈 '}
              {view === 'reports' && '📄 '}
              {view}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {activeView === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px' }}>
          {/* Compliance Breakdown */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1a1a2e' }}>
              🎯 Compliance Breakdown
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>On-Time Projects</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#4caf50' }}>
                  {complianceData.totalProjects - complianceData.delayedProjects}
                </span>
              </div>
              <div style={{ 
                height: '8px', 
                background: '#e0e0e0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${complianceData.complianceRate}%`,
                  background: 'linear-gradient(90deg, #4caf50, #66bb6a)',
                  transition: 'width 0.3s'
                }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Delayed Projects</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#f44336' }}>
                  {complianceData.delayedProjects}
                </span>
              </div>
              <div style={{ 
                height: '8px', 
                background: '#e0e0e0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${100 - complianceData.complianceRate}%`,
                  background: 'linear-gradient(90deg, #f44336, #e57373)',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          </div>

          {/* Penalty Distribution */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#1a1a2e' }}>
              💸 Penalty Distribution
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Issued', 'Paid', 'Disputed', 'Waived'].map((status) => {
                const count = penalties.filter(p => p.penalty_status === status).length;
                const amount = penalties
                  .filter(p => p.penalty_status === status)
                  .reduce((sum, p) => sum + parseFloat(p.penalty_amount || 0), 0);
                
                return (
                  <div key={status} style={{ 
                    background: '#f5f5f5', 
                    padding: '12px', 
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>{status}</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e' }}>
                        {formatCurrency(amount)}
                      </div>
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold',
                      color: '#667eea',
                      background: 'white',
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {count}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeView === 'vendors' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            👥 Vendor Compliance Performance
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {vendors.slice(0, 12).map((vendor) => {
              const complianceRate = getVendorCompliance(vendor.vendor_id);
              const vendorPenalties = penalties.filter(p => p.vendor === vendor.vendor_id);
              
              return (
                <div
                  key={vendor.vendor_id}
                  style={{
                    border: `2px solid ${getComplianceColor(complianceRate)}`,
                    borderRadius: '12px',
                    padding: '16px',
                    background: `${getComplianceColor(complianceRate)}08`,
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1a1a2e' }}>
                        {vendor.vendor_code}
                      </h3>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        {vendor.vendor_name}
                      </p>
                    </div>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: getComplianceColor(complianceRate)
                    }}>
                      {complianceRate}%
                    </div>
                  </div>
                  
                  <div style={{ 
                    height: '6px', 
                    background: '#e0e0e0', 
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '12px'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${complianceRate}%`,
                      background: getComplianceColor(complianceRate)
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                    <span>Penalties: {vendorPenalties.length}</span>
                    <span>Projects: {projects.filter(p => p.vendor === vendor.vendor_id).length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeView === 'trends' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            📈 Compliance Trends
          </h2>
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📊</div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Trend Analysis</div>
            <div style={{ fontSize: '14px' }}>
              Historical compliance data and trend visualization would appear here
            </div>
          </div>
        </div>
      )}

      {activeView === 'reports' && (
        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>
            📄 Strategic Reports
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {[
              { title: 'Quarterly Compliance', icon: '📊', desc: 'Q4 2024 Summary' },
              { title: 'Vendor Performance', icon: '👥', desc: 'Top & Bottom Performers' },
              { title: 'Financial Impact', icon: '💰', desc: 'Penalty Collections' },
              { title: 'SLA Breach Analysis', icon: '⚠️', desc: 'Root Cause Analysis' },
              { title: 'Sector Benchmarks', icon: '📈', desc: 'Industry Comparison' },
              { title: 'ROI Analysis', icon: '💼', desc: 'Vendor Partnership Value' }
            ].map((report, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.background = '#f5f5ff';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.background = 'white';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{report.icon}</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#1a1a2e' }}>
                  {report.title}
                </h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{report.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
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
          fontSize: '14px'
        }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
}