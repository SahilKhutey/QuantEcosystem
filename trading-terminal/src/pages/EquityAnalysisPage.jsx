import React from 'react';
import styled from 'styled-components';
import EquityPerformance from '../components/wealth/Equity/EquityPerformance';
import EquityComparison from '../components/wealth/Equity/EquityComparison';
import EquityMap from '../components/wealth/Equity/EquityMap';
import { getEquityData } from '../services/data/equityData';

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

const EquityAnalysisPage = () => {
  const indices = getEquityData();

  return (
    <PageContainer>
      <PageHeader>
        <h1>Global Equity Analysis</h1>
        <p>Monitor leading global market indices, relative valuation metrics, and cross-border performance comparisons.</p>
      </PageHeader>

      <EquityMap />
      
      <EquityPerformance indices={indices} />
      
      <EquityComparison indices={indices} />
        
    </PageContainer>
  );
};

export default EquityAnalysisPage;
