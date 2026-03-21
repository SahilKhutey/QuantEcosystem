import React from 'react';
import styled from 'styled-components';

const AnalysisWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: var(--tertiary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: ${props => props.color || 'var(--accent-blue)'};
  }
`;

const Label = styled.div`
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const Value = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
`;

const SIPAnalysis = ({ results }) => {
  if (!results) return null;

  return (
    <AnalysisWrapper>
      <StatCard color="var(--accent-blue)">
        <Label>Total Invested</Label>
        <Value>₹{results.totalInvested.toLocaleString('en-IN')}</Value>
      </StatCard>
      
      <StatCard color="var(--accent-green)">
        <Label>Estimated Returns</Label>
        <Value>₹{results.totalGained.toLocaleString('en-IN')}</Value>
      </StatCard>
      
      <StatCard color="var(--accent-purple)">
        <Label>Total Value</Label>
        <Value>₹{results.finalValue.toLocaleString('en-IN')}</Value>
      </StatCard>
    </AnalysisWrapper>
  );
};

export default SIPAnalysis;
