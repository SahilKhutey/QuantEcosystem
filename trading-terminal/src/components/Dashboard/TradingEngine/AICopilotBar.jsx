import React, { useState, useRef, useEffect } from 'react';
import { FiCommand, FiSend, FiTerminal, FiCpu, FiMessageSquare, FiActivity, FiXCircle } from 'react-icons/fi';

const AICopilotBar = () => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add User Query
    const userMsg = { id: Date.now(), role: 'user', content: query };
    setHistory(prev => [...prev, userMsg]);
    setQuery('');
    setExpanded(true);
    setIsTyping(true);

    // Simulate AI parsing context over 19 frameworks
    setTimeout(() => {
      generateMockResponse(userMsg.content);
    }, 1200);
  };

  const generateMockResponse = (inputText) => {
    setIsTyping(false);
    const lowInput = inputText.toLowerCase();
    let responseText = "I successfully parsed your intent. The Master Orchestrator has acknowledged the configuration.";

    // Simple RegEx parsing for demo wow-factor
    if (lowInput.includes('qlib')) {
      responseText = "Acknowledged. Injecting `Microsoft Qlib` Alpha 158 Tensors natively into the Backtesting Engine. The ML Factors are tracking momentum.";
    } else if (lowInput.includes('deploy') || lowInput.includes('subscribe')) {
      responseText = "Deploying the requested Proprietary Engine. Systemic Risk Matrices are engaged. Capital scaling is restricted to Value-at-Risk limits.";
    } else if (lowInput.includes('volatility') || lowInput.includes('intraday')) {
      responseText = "Initializing `Freqtrade / Intraday Scalper`. 5-minute Opening Range Breakout logic is active. I will notify the Hummingbot Executor to bridge order fills via WebSockets.";
    } else if (lowInput.includes('help') || lowInput.includes('status')) {
      responseText = "I am the Antigravity Terminal Copilot. I currently oversee 19 active quantitative repositories spanning Data Acquisition (`OpenBB`, `CCXT`), ML Generation (`Qlib`, `FinRL`), and Execution (`Hummingbot`).";
    } else if (lowInput.includes('clear')) {
        setHistory([]);
        setExpanded(false);
        return;
    }

    const aiMsg = { id: Date.now() + 1, role: 'ai', content: responseText };
    setHistory(prev => [...prev, aiMsg]);
  };

  return (
    <>
      {/* Spacer so the fixed bar doesn't cover actual content at the very bottom of the page */}
      {expanded && <div style={{ height: '350px' }} />}
      {!expanded && <div style={{ height: '80px' }} />}

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 20px 20px 20px',
        pointerEvents: 'none' // Allow clicking through the container edges
      }}>
        
        {/* The Expandable Chat Window */}
        {expanded && (
          <div style={{
            width: '100%',
            maxWidth: '900px',
            height: '300px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            backdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            transform: 'translateY(1px)' // Blend bottom border
          }}>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)' }}>
                <FiCpu size={18} />
                <span style={{ fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>System Copilot</span>
              </div>
              <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>
                <FiXCircle size={16} />
              </button>
            </div>

            {/* Chat History Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {history.length === 0 && (
                  <div style={{ margin: 'auto', textAlign: 'center', color: '#555', fontSize: '13px' }}>
                      <FiTerminal size={32} style={{ marginBottom: '8px', opacity: 0.5 }} /><br/>
                      Enter a system command or query...
                  </div>
              )}

              {history.map((msg) => (
                <div key={msg.id} style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  alignItems: 'flex-start',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%'
                }}>
                  {msg.role === 'ai' && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiActivity color="#38bdf8" size={14} />
                    </div>
                  )}
                  
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: msg.role === 'user' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.03)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-secondary)',
                    border: msg.role === 'ai' ? '1px solid var(--border)' : 'none',
                    fontSize: '13px',
                    lineHeight: 1.5
                  }}>
                    {msg.content}
                  </div>

                  {msg.role === 'user' && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <FiMessageSquare color="#fff" size={14} />
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#666', fontSize: '12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiActivity className="spin-slow" color="#38bdf8" size={14} />
                  </div>
                  Scanning Orchestration Logic...
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>
          </div>
        )}

        {/* The Sticky Input Bar */}
        <div style={{
          width: '100%',
          maxWidth: '900px',
          pointerEvents: 'auto',
          background: expanded ? 'var(--bg-card)' : 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid var(--border)',
          borderRadius: expanded ? '0 0 12px 12px' : '32px',
          padding: '8px 8px 8px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          transition: 'border-radius 0.2s, background 0.2s',
          borderTop: expanded ? '1px solid rgba(255,255,255,0.05)' : '1px solid var(--border)'
        }}>
          <FiCommand color="#64748b" size={18} />
          
          <form style={{ flex: 1, display: 'flex', alignItems: 'center' }} onSubmit={handleSubmit}>
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command to deploy algorithms, query logic, or configure repositories..."
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                width: '100%',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
            <button 
              type="submit"
              disabled={!query.trim()}
              style={{
                background: query.trim() ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                color: query.trim() ? '#fff' : '#666',
                border: 'none',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: query.trim() ? 'pointer' : 'default',
                transition: 'background 0.2s',
                marginLeft: '8px'
              }}
            >
              <FiSend size={16} style={{ transform: 'translateX(-1px) translateY(1px)' }} />
            </button>
          </form>
        </div>
        
      </div>

      <style jsx>{`
        .spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default AICopilotBar;
