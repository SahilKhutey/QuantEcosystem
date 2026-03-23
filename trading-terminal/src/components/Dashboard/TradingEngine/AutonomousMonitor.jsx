import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiActivity, FiTarget, FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

const MonitorContainer = styled.div`
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid ${props => props.color || 'var(--accent-blue)'};
  
  .label {
    font-size: 12px;
    color: var(--text-secondary);
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  
  .value {
    font-size: 24px;
    font-weight: 600;
  }
`;

const AutonomousMonitor = () => {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // In production, this targets the Integrated Flask API
                const response = await fetch('http://localhost:5000/api/autonomous/status');
                const result = await response.json();
                if (result.status === 'success') {
                    setStatus(result.data);
                }
            } catch (error) {
                console.error("Failed to fetch autonomous status", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStatus();
        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div>Loading Autonomous Monitor...</div>;

    return (
        <MonitorContainer>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FiActivity size={24} color={status?.system?.active ? 'var(--accent-green)' : 'var(--accent-red)'} />
                    <h3 style={{ margin: 0 }}>Autonomous Execution Monitor</h3>
                </div>
                <div className={`badge ${status?.system?.active ? 'badge-green' : 'badge-red'}`}>
                    {status?.system?.active ? 'ENGINE LIVE' : 'ENGINE OFFLINE'}
                </div>
            </div>

            <MetricGrid>
                <MetricCard color="var(--accent-blue)">
                    <div className="label">Total Trades (24h)</div>
                    <div className="value">{status?.performance?.total_trades || 0}</div>
                </MetricCard>
                <MetricCard color="var(--accent-green)">
                    <div className="label">Profit & Loss</div>
                    <div className="value" style={{ color: 'var(--accent-green)' }}>
                        +${status?.performance?.total_profit?.toFixed(2) || '0.00'}
                    </div>
                </MetricCard>
                <MetricCard color="var(--accent-amber)">
                    <div className="label">Win Rate</div>
                    <div className="value">{(status?.performance?.win_rate * 100).toFixed(1)}%</div>
                </MetricCard>
                <MetricCard color="var(--accent-purple)">
                    <div className="label">Profit Factor</div>
                    <div className="value">{status?.performance?.profit_factor || '1.0'}</div>
                </MetricCard>
            </MetricGrid>

            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                {Object.entries(status?.engines || {}).map(([name, engine]) => (
                    <div key={name} style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '6px', fontSize: '13px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{name}</span>
                            <span style={{ color: 'var(--accent-green)' }}>{engine.status}</span>
                        </div>
                    </div>
                ))}
            </div>
        </MonitorContainer>
    );
};

export default AutonomousMonitor;
