import React, { useState } from 'react';
import { FiTrendingUp, FiCalendar, FiClock, FiActivity } from 'react-icons/fi';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart, Area } from 'recharts';

const ProphetDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [horizon, setHorizon] = useState(90);

  const runSimulation = async () => {
    setLoading(true);
    setResults(null);
    try {
      const resp = await api.post('/prophet/run', { horizon });
      
      // Post-process the data for easier Recharts Area rendering
      const formattedForecast = resp.data.forecast.map(item => ({
          ...item,
          // Recharts AreaChart requires continuous interval arrays [min, max]
          confidenceBounds: [item.yhat_lower, item.yhat_upper]
      }));
      
      setResults({ ...resp.data, forecast: formattedForecast });
    } catch (err) {
      console.error(err);
      setResults({ error: "Failed to connect to Prophet AI API." });
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ marginTop: '16px', borderLeft: '4px solid #1877F2', borderColor: '#1877F2' }}>
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar color="#1877F2" size={20} />
          <h2 className="card-title" style={{ margin: 0 }}>Meta Prophet (GAM Time-Series)</h2>
        </div>
        <span className="badge" style={{ background: 'rgba(24, 119, 242, 0.1)', color: '#1877F2' }}>Additive Inference</span>
      </div>
      
      <div className="card-body">
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          <strong>Prophet</strong> completely abandons technical trading factors. Developed by Meta (Facebook), it utilizes an absolute Generalized Additive Model (GAM) extracting independent time-series signals directly from raw pricing inputs. It mathematically isolates the <code>Base Trend</code>, <code>Yearly Seasonality (Fourier)</code>, and <code>Weekly Seasonality</code> to project continuous future horizons bracketed by statistical confidence funnels.
        </p>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Future Prediction Horizon</label>
                <select 
                    className="input-field" 
                    value={horizon}
                    onChange={(e) => setHorizon(Number(e.target.value))}
                    disabled={loading}
                    style={{ width: '180px' }}
                >
                    <option value={30}>30 Days Out</option>
                    <option value={90}>90 Days Out</option>
                    <option value={180}>180 Days Out</option>
                    <option value={365}>1 Year Out</option>
                </select>
            </div>
            
            <button 
              className="btn" 
              onClick={runSimulation}
              disabled={loading}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '8px', marginTop: '18px',
                background: '#1877F2', color: 'white', border: 'none'
              }}
            >
              <FiTrendingUp />
              {loading ? 'Decomposing Time-Series...' : 'Run GAM Decomposition & Forecast'}
            </button>
        </div>

        {results && !results.error && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '16px', borderRadius: '8px', animation: 'fadeIn 0.5s ease' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                  {results.config.History} History Forecasted {horizon} Days Intosh the Future
                </h3>
            </div>

            {/* 1. The Main Forecast Cone */}
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                The <span style={{color: 'var(--accent-teal)'}}>Green Line</span> is the simulated historical actuals. The <span style={{color: '#1877F2'}}>Solid Blue Line</span> is the <code>yhat</code> GAM Prediction. The translucent band displays the calculated 95% Confidence Interval expanding further out in time as uncertainty compounds.
            </p>
            <div style={{ height: '320px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', marginBottom: '32px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results.forecast} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" tick={{fontSize: 12}} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#aaa' }}
                    formatter={(value, name) => [
                        typeof value === 'number' ? value.toFixed(2) : value, 
                        name === 'y' ? 'Historical Actual' : name === 'yhat' ? 'Prophet Forecast (yhat)' : 'Confidence Band'
                    ]}
                  />
                  <Legend />
                  {/* The actual points */}
                  <Line type="monotone" dataKey="y" name="Historical Actual" stroke="var(--accent-teal)" dot={false} strokeWidth={2} />
                  {/* The Confidence Interval Area */}
                  <Area type="monotone" dataKey="confidenceBounds" name="95% Confidence" fill="#1877F2" stroke="none" fillOpacity={0.2} />
                  {/* The Prediction Line */}
                  <Line type="monotone" dataKey="yhat" name="Prophet Forecast (yhat)" stroke="#1877F2" dot={false} strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-primary)', borderBottom: '1px dotted var(--border)', paddingBottom: '8px' }}>
                Extracted Generalized Additive Components
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>
                
                {/* Weekly Seasonality */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <FiClock color="var(--accent-amber)" />
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Weekly Seasonality</h4>
                    </div>
                    <div style={{ height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.components.weekly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="day" stroke="#888" tick={{fontSize: 10}} />
                              <YAxis stroke="#888" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                              <Line type="monotone" dataKey="effect" stroke="var(--accent-amber)" strokeWidth={2} dot={true} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Yearly Seasonality */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <FiActivity color="var(--accent-fuchsia)" />
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Yearly Seasonality (Fourier Extract)</h4>
                    </div>
                    <div style={{ height: '180px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.components.yearly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="day_of_year" stroke="#888" tick={{fontSize: 10}} type="number" domain={[1, 365]} tickCount={6} />
                              <YAxis stroke="#888" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} labelFormatter={(v) => "Day " + v} />
                              <Line type="monotone" dataKey="yearly" stroke="var(--accent-fuchsia)" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Base Trend */}
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border)', gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <FiTrendingUp color="#1877F2" />
                        <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Base Extracted Linear Trend</h4>
                    </div>
                    <div style={{ height: '150px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={results.components.trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                              <XAxis dataKey="date" stroke="#888" tick={{fontSize: 10}} minTickGap={30} />
                              <YAxis domain={['auto', 'auto']} stroke="#888" tick={{fontSize: 10}} />
                              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
                              <Line type="monotone" dataKey="trend" stroke="#1877F2" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

          </div>
        )}
        
        {results && results.error && (
          <div style={{ color: 'var(--accent-rose)', padding: '10px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '6px' }}>
            {results.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProphetDashboard;
