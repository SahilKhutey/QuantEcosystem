import React from 'react';
import styled from 'styled-components';
import { FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';

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

const DepletionAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: ${props => props.$isDepleted ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)'};
  border: 1px solid ${props => props.$isDepleted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'};
  color: ${props => props.$isDepleted ? 'var(--accent-red)' : 'var(--accent-green)'};
  margin-bottom: 24px;
  font-size: 14px;
  font-weight: 500;
`;

const SWPAnalysis = ({ results }) => {
  if (!results) return null;

  return (
    <>
      <DepletionAlert $isDepleted={results.isDepleted}>
        {results.isDepleted ? <FiAlertTriangle size={20} /> : <FiCheckCircle size={20} />}
        {results.isDepleted 
          ? `Warning: Corpus will deplete completely in roughly ${(results.monthsLasted / 12).toFixed(1)} years.`
          : `Sustainable: Corpus will survive the entire period with a final balance.`}
      </DepletionAlert>
      
      <AnalysisWrapper>
        <StatCard color="var(--accent-blue)">
          <Label>Total Withdrawn</Label>
          <Value>₹{results.totalWithdrawn.toLocaleString('en-IN')}</Value>
        </StatCard>
        
        <StatCard color={results.isDepleted ? "var(--accent-red)" : "var(--accent-purple)"}>
          <Label>Final Balance</Label>
          <Value>₹{results.finalBalance.toLocaleString('en-IN')}</Value>
        </StatCard>
        
        <StatCard color="var(--accent-green)">
          <Label>Corpus Lifespan</Label>
          <Value>{results.monthsLasted >= 12 ? `${(results.monthsLasted / 12).toFixed(1)} Yrs` : `${results.monthsLasted} Mos`}</Value>
        </StatCard>
      </AnalysisWrapper>
    </>
  );
};

export default SWPAnalysis;
