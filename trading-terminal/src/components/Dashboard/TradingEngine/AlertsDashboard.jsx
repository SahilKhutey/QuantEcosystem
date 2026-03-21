import React, { useState, useEffect } from 'react';
import { FiBell, FiAlertTriangle, FiTrash2, FiActivity } from 'react-icons/fi';
import api from '@/services/api';

const AlertsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [rules, setRules] = useState(0);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/alerts/active');
      setAlerts(resp.data.triggered_alerts || []);
      setRules(resp.data.configured_rules || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const clearAlerts = async () => {
    try {
      await api.post('/alerts/clear');
      setAlerts([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Simulate real-time polling
    const interval = setInterval(fetchAlerts, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #ef4444', borderColor: '#ef4444' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBell color="#ef4444" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>System Anomalies & Performance Alerts</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            {alerts.length} Critical Flags
          </span>
          <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#fff' }}>
            {rules} Active Constraints Set
          </span>
        </div>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Post-trade execution monitoring powered by Prometheus bindings. Automatically tracks Latency Spikes (&gt;100ms), 
          High-Risk Portfolio Drawdowns, and Technical Analysis limit crossover events triggered by <code>alert_service.py</code>.
        </p>

        {loading && alerts.length === 0 ? (
           <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <FiActivity className="spin" size={24} style={{ marginBottom: '10px' }} />
              <div>Polling Execution Matrices...</div>
           </div>
        ) : alerts.length === 0 ? (
           <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid #064e3b', textAlign: 'center', color: 'var(--accent-teal)' }}>
              <FiBell size={24} style={{ marginBottom: '10px' }} />
              <h3>All Systems Nominal</h3>
              <p style={{ fontSize: '12px', margin: 0 }}>No critical execution failures or drawdown thresholds breached.</p>
           </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button className="btn btn-danger" onClick={clearAlerts} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <FiTrash2 /> Dismiss All Constraints
                </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map((alert, i) => (
                    <div key={i} style={{ 
                        padding: '16px', 
                        background: alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.05)', 
                        border: `1px solid ${alert.severity === 'CRITICAL' ? '#991b1b' : '#92400e'}`,
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        animation: 'fadeIn 0.3s ease'
                    }}>
                        <FiAlertTriangle size={24} color={alert.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'} style={{ marginTop: '2px' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                <strong style={{ color: 'white', fontSize: '15px' }}>
                                    [{alert.type}] {alert.symbol && `${alert.symbol}`}
                                </strong>
                                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                {alert.reason}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsDashboard;
