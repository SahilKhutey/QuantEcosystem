import React, { useState, useEffect } from 'react';
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

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: var(--accent-blue);
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(59,130,246,0.3);
    border-radius: 50%;
    border-top-color: var(--accent-blue);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 16px;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

const EquityAnalysisPage = () => {
  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      const data = await getEquityData();
      if (mounted) {
        setIndices(data);
        setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <h1>Global Equity Analysis</h1>
        <p>Monitor leading global market indices, relative valuation metrics, and cross-border performance comparisons via live Yahoo Finance telemetry.</p>
      </PageHeader>

      <EquityMap />
      
      {loading ? (
        <LoaderContainer>
          <div className="spinner"></div>
          <div>Syncing real-world market telemetry...</div>
        </LoaderContainer>
      ) : indices ? (
        <>
          <EquityPerformance indices={indices} />
          <EquityComparison indices={indices} />
        </>
      ) : (
        <div style={{ color: 'var(--accent-red)', padding: '20px', background: 'var(--secondary-dark)', borderRadius: '8px' }}>
          Network Error: Unable to tunnel into the Python Data Backend. Please ensure the Flask server is running on port 5000.
        </div>
      )}
        
    </PageContainer>
  );
};

export default EquityAnalysisPage;
