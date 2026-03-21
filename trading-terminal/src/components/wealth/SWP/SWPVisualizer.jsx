import React from 'react';
import styled from 'styled-components';
import ProjectionChart from '../../visualizations/WealthCharts/ProjectionChart';
import WaterfallChart from '../../visualizations/WealthCharts/WaterfallChart';

const VisualizerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ChartRow = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 1024px) {
    flex-direction: column;
  }
`;

const Container = styled.div`
  flex: 1;
  min-width: 0;
`;

const SWPVisualizer = ({ results }) => {
  if (!results || !results.projection) return null;

  // Hacky mapping: map 'withdrawn' to 'invested' so the generic ProjectionChart renders the label as blue
  // The ProjectionChart assumes dataKeys: invested, gained, balance.
  const mappedProjection = results.projection.map(d => ({
    year: d.year,
    invested: d.withdrawn, // Renders as "Amount Invested" in blue tooltip normally, but here withdrawn
    balance: d.balance
  }));

  return (
    <VisualizerWrapper>
      <ChartRow>
        <Container style={{ flex: 1.5 }}>
          <ProjectionChart data={mappedProjection} height="400px" />
        </Container>
      </ChartRow>
      <ChartRow>
        <Container>
          <WaterfallChart data={results.cashflows} title="Corpus Cashflow Waterfall" height="350px" />
        </Container>
      </ChartRow>
    </VisualizerWrapper>
  );
};

export default SWPVisualizer;
