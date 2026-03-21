import React from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const MapWrapper = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
  position: relative;
  overflow: hidden;
  height: 400px;
  
  // Create a stylized, tech-focused dark map background grid
  background-image: 
    linear-gradient(var(--border-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
  background-size: 30px 30px;
  background-position: center center;
`;

const ContentOverlay = styled.div`
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at center, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.9) 100%);
  display: flex;
  flex-direction: column;
  padding: 24px;
  z-index: 1;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  
  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: '';
      display: inline-block;
      width: 8px;
      height: 8px;
      background: var(--accent-blue);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--accent-blue);
    }
  }
`;

const Node = styled.div`
  position: absolute;
  top: ${props => props.$top};
  left: ${props => props.$left};
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
  transition: transform 0.3s;
  
  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    z-index: 20;
  }
`;

const PulsePoint = styled.div`
  width: 14px;
  height: 14px;
  background: ${props => props.$color || 'var(--accent-blue)'};
  border-radius: 50%;
  box-shadow: 0 0 15px ${props => props.$color || 'var(--accent-blue)'};
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 1px solid ${props => props.$color || 'var(--accent-blue)'};
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
`;

const NodeCard = styled.div`
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 8px 12px;
  margin-top: 10px;
  white-space: nowrap;
  
  .title {
    font-size: 11px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 14px;
    color: var(--text-primary);
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 6px;
    
    svg {
      color: ${props => props.$isPos ? 'var(--accent-green)' : 'var(--accent-red)'};
    }
  }
`;

const WEALTH_NODES = [
  { id: 'na', label: 'North America', top: '35%', left: '25%', val: '$147 Trillion', change: 2.1, color: 'var(--accent-blue)' },
  { id: 'eu', label: 'Europe', top: '30%', left: '50%', val: '$104 Trillion', change: 0.8, color: 'var(--accent-purple)' },
  { id: 'asia', label: 'Asia-Pacific', top: '45%', left: '75%', val: '$118 Trillion', change: 3.4, color: 'var(--accent-green)' },
  { id: 'meta', label: 'Crypto & Alt', top: '65%', left: '40%', val: '$8.2 Trillion', change: 12.5, color: '#f59e0b' },
];

const GlobalWealthMap = () => {
  return (
    <MapWrapper>
      <ContentOverlay>
        <Header>
          <h3>Global Macro Wealth Distribution</h3>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Live Node Telemetry</div>
        </Header>
        
        {WEALTH_NODES.map(node => (
          <Node key={node.id} $top={node.top} $left={node.left}>
            <PulsePoint $color={node.color} />
            <NodeCard $isPos={node.change >= 0}>
              <div className="title">{node.label}</div>
              <div className="value">
                {node.val}
                {node.change >= 0 ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
              </div>
            </NodeCard>
          </Node>
        ))}
      </ContentOverlay>
    </MapWrapper>
  );
};

export default GlobalWealthMap;
