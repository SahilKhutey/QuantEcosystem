import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import SIPCalculator from '../components/wealth/SIP/SIPCalculator';
import SIPAnalysis from '../components/wealth/SIP/SIPAnalysis';
import SIPVisualizer from '../components/wealth/SIP/SIPVisualizer';
import { calculateSIP } from '../services/data/sipData';

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

const SIPDashboard = () => {
  const [inputs, setInputs] = useState({
    monthlyAmount: 25000,
    rate: 12,
    years: 15,
    stepUp: 5
  });

  // Automatically recalculate when inputs change
  const results = useMemo(() => {
    return calculateSIP(inputs.monthlyAmount, inputs.rate, inputs.years, inputs.stepUp);
  }, [inputs]);

  return (
    <PageContainer>
      <PageHeader>
        <h1>SIP Analyzer</h1>
        <p>Project your wealth accumulation with advanced step-up analysis and compounding visualizations.</p>
      </PageHeader>

      <ContentGrid>
        <SIPCalculator inputs={inputs} onChange={setInputs} />
        
        <div>
          <SIPAnalysis results={results} />
          <SIPVisualizer results={results} />
        </div>
      </ContentGrid>
    </PageContainer>
  );
};

export default SIPDashboard;
