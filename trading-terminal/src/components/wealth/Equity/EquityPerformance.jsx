import React from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTrendingDown, FiDollarSign } from 'react-icons/fi';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const IndexCard = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    border-color: var(--accent-blue);
  }
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  
  h3 {
    margin: 0;
    font-size: 16px;
    color: var(--text-primary);
  }
  
  span {
    font-size: 12px;
    color: var(--text-tertiary);
    background: var(--tertiary-dark);
    padding: 2px 8px;
    border-radius: 12px;
  }
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  
  .label {
    color: var(--text-secondary);
  }
  
  .value {
    color: var(--text-primary);
    font-weight: 500;
  }
`;

const ReturnBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: ${props => props.$positive ? 'var(--accent-green)' : 'var(--accent-red)'};
  background: ${props => props.$positive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  margin-top: 8px;
`;

const EquityPerformance = ({ indices }) => {
  if (!indices) return null;

  return (
    <Grid>
      {indices.map(idx => (
        <IndexCard key={idx.id}>
          <HeaderRow>
            <div>
              <h3>{idx.name}</h3>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                Last: {idx.history[idx.history.length - 1].value.toLocaleString()}
              </div>
            </div>
            <span>{idx.region}</span>
          </HeaderRow>
          
          <MetricRow>
            <span className="label">Market Cap</span>
            <span className="value">{idx.marketCap}</span>
          </MetricRow>
          <MetricRow>
            <span className="label">P/E Ratio</span>
            <span className="value">{idx.peRatio}</span>
          </MetricRow>
          <MetricRow>
            <span className="label">Dividend Yield</span>
            <span className="value">{idx.dividendYield}%</span>
          </MetricRow>
          
          <ReturnBadge $positive={idx.ytdReturn >= 0}>
            {idx.ytdReturn >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
            {idx.ytdReturn >= 0 ? '+' : ''}{idx.ytdReturn}% YTD
          </ReturnBadge>
        </IndexCard>
      ))}
    </Grid>
  );
};

export default EquityPerformance;
