import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiStar, FiTrendingUp, FiCheckCircle, FiCpu, FiBarChart2 } from 'react-icons/fi';
import api from '@/services/api';

const StrategyMarketplace = () => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(null); // stores ID being deployed
  const [deployResult, setDeployResult] = useState(null);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const resp = await api.get('/marketplace/catalog');
      // The API returns 'results' as the array
      setCatalog(resp.data.results || []);
    } catch (err) {
      console.error("Failed to fetch Marketplace Catalog", err);
    }
    setLoading(false);
  };

  const handleSubscribe = async (strategy_id) => {
    setDeploying(strategy_id);
    setDeployResult(null);
    try {
      const resp = await api.post('/marketplace/deploy', { strategy_id });
      setDeployResult({ id: strategy_id, success: true, message: resp.data.message });
    } catch (err) {
      setDeployResult({ id: strategy_id, success: false, message: "Subscription failed." });
    }
    setDeploying(null);
    
    // Auto-clear success message
    setTimeout(() => setDeployResult(null), 4000);
  };

  const getCategoryIcon = (category) => {
      if(category.includes('Machine Learning') || category.includes('NLP')) return <FiCpu size={16} />;
      if(category.includes('HFT')) return <FiTrendingUp size={16} />;
      return <FiBarChart2 size={16} />;
  };

  return (
    <div className="card" style={{ marginBottom: '24px', borderLeft: '4px solid #10b981' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiShoppingBag color="#10b981" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Proprietary Strategy Marketplace</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>Algorithm App Store</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Browse, subscribe to, and deploy proprietary high-performance quantitative models directly into the pipeline orchestration queue.
        </p>

        {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>Loading Proprietary Catalog...</div>
        ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {catalog.map(strat => (
                    <div key={strat.id} style={{
                        background: 'var(--bg-surface)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        cursor: 'default'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                        {/* Card Header */}
                        <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>{strat.name}</h3>
                                <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center' }}>
                                    <FiStar fill="#fbbf24" size={14} />
                                    <span style={{ fontSize: '12px', marginLeft: '4px', fontWeight: 'bold' }}>{(strat.metrics.win_rate * 100).toFixed(0)}% WR</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <span className="badge" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {getCategoryIcon(strat.category)} {strat.category}
                                </span>
                                <span className="badge" style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    Sharpe {strat.metrics.sharpe_ratio}
                                </span>
                            </div>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, flex: 1 }}>
                                {strat.description}
                            </p>

                            <div style={{ background: '#111', padding: '10px', borderRadius: '4px', marginBottom: '16px', fontSize: '11px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div>
                                    <span style={{ color: '#666' }}>Author:</span><br/>
                                    <span style={{ color: '#ccc' }}>{strat.author}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#666' }}>Regime:</span><br/>
                                    <span style={{ color: '#ccc' }}>{strat.market_regime}</span>
                                </div>
                                <div>
                                    <span style={{ color: '#666' }}>Max DD:</span><br/>
                                    <span style={{ color: '#f43f5e' }}>-{(strat.metrics.max_drawdown * 100).toFixed(1)}%</span>
                                </div>
                                <div>
                                    <span style={{ color: '#666' }}>Volume:</span><br/>
                                    <span style={{ color: '#ccc' }}>~{strat.metrics.trades_per_month}/mo</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {deployResult?.id === strat.id && deployResult?.success ? (
                                <button className="btn" disabled style={{ width: '100%', background: '#10b981', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                    <FiCheckCircle /> License Procured
                                </button>
                            ) : (
                                <button 
                                    className="btn" 
                                    onClick={() => handleSubscribe(strat.id)}
                                    disabled={deploying === strat.id}
                                    style={{ 
                                        width: '100%', 
                                        background: deploying === strat.id ? '#555' : 'var(--accent-blue)', 
                                        color: 'white', border: 'none',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px'
                                    }}
                                >
                                    {deploying === strat.id ? 'Deploying...' : 'Subscribe & Deploy'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}

            </div>
        )}
      </div>
    </div>
  );
};

export default StrategyMarketplace;
