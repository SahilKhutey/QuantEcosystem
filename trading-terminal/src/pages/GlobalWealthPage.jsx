import React from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTarget, FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import GlobalWealthMap from '../components/GlobalWealthMap/GlobalWealthMap';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const PageHeader = styled.div`
  h1 {
    font-size: 24px;
    margin: 0 0 8px 0;
    color: var(--text-primary);
  }
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }
`;

const ModuleGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

const FeatureCard = styled(Link)`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
  text-decoration: none;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  &:hover {
    transform: translateY(-4px);
    border-color: ${props => props.$accent || 'var(--accent-blue)'};
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  }
  
  .icon-wrapper {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => props.$accentBg || 'rgba(59,130,246,0.1)'};
    color: ${props => props.$accent || 'var(--accent-blue)'};
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  h3 {
    margin: 0;
    color: var(--text-primary);
    font-size: 18px;
  }
  
  p {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.5;
  }
`;

const GlobalWealthPage = () => {
  return (
    <PageContainer>
      <PageHeader>
        <h1>Wealth Management Command Center</h1>
        <p>Your comprehensive suite for long-term compounding, withdrawal simulations, and global macro asset analysis.</p>
      </PageHeader>

      <GlobalWealthMap />

      <h2 style={{ fontSize: 18, color: 'var(--text-primary)', margin: '8px 0 0 0' }}>Planning & Analysis Modules</h2>
      
      <ModuleGrid>
        <FeatureCard to="/wealth/sip" $accent="var(--accent-blue)" $accentBg="rgba(59,130,246,0.1)">
          <div className="icon-wrapper"><FiTrendingUp size={24} /></div>
          <h3>Systematic Investment Plan</h3>
          <p>Model future wealth accumulation using configurable step-up logic and realistic compounding curves. Visualize exact contributions against market returns.</p>
        </FeatureCard>
        
        <FeatureCard to="/wealth/swp" $accent="var(--accent-red)" $accentBg="rgba(239, 68, 68, 0.1)">
          <div className="icon-wrapper"><FiTarget size={24} /></div>
          <h3>Systematic Withdrawal Plan</h3>
          <p>Stress-test your retirement corpus. Graph corpus depletion over time using customizable withdrawal parameters and assumed interest rates.</p>
        </FeatureCard>
        
        <FeatureCard to="/wealth/equity" $accent="var(--accent-green)" $accentBg="rgba(16, 185, 129, 0.1)">
          <div className="icon-wrapper"><FiLayers size={24} /></div>
          <h3>Global Equity Deep-Dive</h3>
          <p>Analyze key market indices spanning from North America to Asia-Pacific. Compare P/E ratios, market caps, and performance trajectories.</p>
        </FeatureCard>
      </ModuleGrid>
      
    </PageContainer>
  );
};

export default GlobalWealthPage;
