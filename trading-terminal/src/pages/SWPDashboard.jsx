import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import SWPCalculator from '../components/wealth/SWP/SWPCalculator';
import SWPAnalysis from '../components/wealth/SWP/SWPAnalysis';
import SWPVisualizer from '../components/wealth/SWP/SWPVisualizer';
import { calculateSWP } from '../services/data/swpData';

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

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const SWPDashboard = () => {
  const [inputs, setInputs] = useState({
    corpus: 10000000,
    withdrawal: 50000,
    rate: 8,
    years: 20
  });

  const results = useMemo(() => {
    return calculateSWP(inputs.corpus, inputs.withdrawal, inputs.rate, inputs.years);
  }, [inputs]);

  return (
    <PageContainer>
      <PageHeader>
        <h1>SWP Planner</h1>
        <p>Stress-test systematic withdrawal plans against market depletion curves.</p>
      </PageHeader>

      <ContentGrid>
        <SWPCalculator inputs={inputs} onChange={setInputs} />
        
        <div>
          <SWPAnalysis results={results} />
          <SWPVisualizer results={results} />
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default SWPDashboard;
