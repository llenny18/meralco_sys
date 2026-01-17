import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

export default function SectorManagerBillingMetrics() {
  const [sectorMetrics, setSectorMetrics] = useState({
    total_pipeline: 0,
    pending_billing: 0,
    paid_mtd: 0,
    pending_payment: 0,
    avg_payment_cycle: 0,
    vendor_count: 0
  });
  const [vendorPerformance, setVendorPerformance] = useState([]);
  const [billingTrends, setBillingTrends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  useEffect(() => {
    fetchSectorMetrics();
    fetchVendorPerformance();
    fetchBillingTrends();
  }, [selectedPeriod]);

  const fetchSectorMetrics = async () => {
    setLoading(true);
    try {
      const [projectsRes, invoicesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/projects/`),
        fetch(`${API_BASE_URL}/invoices/`)
      ]);

      const projectsData = await projectsRes.json();
      const invoicesData = await invoicesRes.json();
      
      const projects = projectsData.results || projectsData || [];
      const invoices = invoicesData.results || invoicesData || [];

      const totalPipeline = projects.reduce((sum, p) => sum + parseFloat(p.contract_value || 0), 0);
      const pendingBilling = projects.filter(p => p.status === 'Ready for Billing').length;
      const paidThisMonth = invoices.filter(i => {
        if (!i.payment_date) return false;
        const paymentDate = new Date(i.payment_date);
        const now = new Date();
        return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
      });
      const paidMTD = paidThisMonth.reduce((sum, i) => sum + parseFloat(i.net_amount || 0), 0);
      const pendingPayment = invoices.filter(i => i.payment_status === 'Unpaid').reduce((sum, i) => sum + parseFloat(i.net_amount || 0), 0);

      // Get unique vendors
      const uniqueVendors = new Set(projects.map(p => p.vendor).filter(Boolean));

      setSectorMetrics({
        total_pipeline: totalPipeline,
        pending_billing: pendingBilling,
        paid_mtd: paidMTD,
        pending_payment: pendingPayment,
        avg_payment_cycle: 28, // Would calculate from actual data
        vendor_count: uniqueVendors.size
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorPerformance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-performance/`);
      const data = await response.json();
      setVendorPerformance(data.results || data || []);
    } catch (err) {
      console.error('Error fetching vendor performance:', err);
    }
  };

  const fetchBillingTrends = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/invoices/`);
      const data = await response.json();
      const invoices = data.results || data || [];
      
      // Group by month
      const monthlyData = {};
      invoices.forEach(invoice => {
        const date = new Date(invoice.invoice_date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { count: 0, total: 0 };
        }
        monthlyData[monthKey].count++;
        monthlyData[monthKey].total += parseFloat(invoice.net_amount || 0);
      });

      const trends = Object.entries(monthlyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([month, data]) => ({
          month,
          count: data.count,
          total: data.total
        }));

      setBillingTrends(trends);
    } catch (err) {
      console.error('Error fetching billing trends:', err);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 3.5) return '#2196f3';
    if (rating >= 2.5) return '#ff9800';
    return '#f44336';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'transparent', padding: '20px' }}>
      {/* Header */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#1a1a2e' }}>🏢 Sector Billing & Portfolio</h1>
            <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Phase 6: Strategic billing oversight and vendor management</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="current">Current Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Total Pipeline</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#667eea' }}>
            ₱{(sectorMetrics.total_pipeline / 1000000).toFixed(1)}M
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>across all projects</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Pending Billing</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#ff9800' }}>
            {sectorMetrics.pending_billing}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>projects ready</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Paid MTD</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#4caf50' }}>
            ₱{(sectorMetrics.paid_mtd / 1000000).toFixed(1)}M
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>this month</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Pending Payment</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#f44336' }}>
            ₱{(sectorMetrics.pending_payment / 1000000).toFixed(1)}M
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>awaiting finance</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Avg Payment Cycle</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#2196f3' }}>
            {sectorMetrics.avg_payment_cycle}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>days (target: 30)</p>
        </div>

        <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Active Vendors</p>
          <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: '#9c27b0' }}>
            {sectorMetrics.vendor_count}
          </p>
          <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#666' }}>vendor partnerships</p>
        </div>
      </div>

      {/* Billing Trends Chart */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>📈 Billing Trends (Last 6 Months)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {billingTrends.map((trend, idx) => {
            const maxTotal = Math.max(...billingTrends.map(t => t.total));
            const barWidth = (trend.total / maxTotal) * 100;
            return (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>{trend.month}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#1a1a2e' }}>
                    ₱{(trend.total / 1000000).toFixed(2)}M ({trend.count} invoices)
                  </span>
                </div>
                <div style={{ background: '#e0e0e0', borderRadius: '8px', height: '24px', overflow: 'hidden' }}>
                  <div style={{
                    background: 'linear-gradient(45deg, #667eea, #764ba2)',
                    width: `${barWidth}%`,
                    height: '100%',
                    transition: 'width 0.3s'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Vendor Performance Rankings */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: '0 0 20px 0', fontSize: '24px', color: '#1a1a2e' }}>🏆 Vendor Performance Rankings</h2>
        
        {vendorPerformance.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>No vendor performance data available</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#1a1a2e' }}>Rank</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#1a1a2e' }}>Vendor</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>On-Time Rate</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>Quality Score</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>Compliance</th>
                  <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#1a1a2e' }}>Overall Rating</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', color: '#1a1a2e' }}>Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {vendorPerformance
                  .sort((a, b) => (b.overall_rating || 0) - (a.overall_rating || 0))
                  .slice(0, 10)
                  .map((vendor, idx) => (
                    <tr key={vendor.vendor_id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                      <td style={{ padding: '12px', fontSize: '16px', fontWeight: 'bold', color: '#1a1a2e' }}>
                        {idx === 0 && '🥇'}
                        {idx === 1 && '🥈'}
                        {idx === 2 && '🥉'}
                        {idx > 2 && idx + 1}
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#1a1a2e' }}>{vendor.vendor_name || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        {vendor.on_time_rate || 0}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        {vendor.quality_score || 0}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
                        {vendor.compliance_score || 0}%
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          background: getRatingColor(vendor.overall_rating || 0),
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}>
                          {(vendor.overall_rating || 0).toFixed(1)}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                        {vendor.overall_rating >= 4.5 ? '✅ Renew' : 
                         vendor.overall_rating >= 3.5 ? '⚠️ Monitor' : 
                         '❌ Review'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Error Notification */}
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