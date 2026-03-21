import React from 'react';
import styled from 'styled-components';
import ProjectionChart from '../../visualizations/WealthCharts/ProjectionChart';
import AllocationChart from '../../visualizations/WealthCharts/AllocationChart';

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

const ProjectionContainer = styled.div`
  flex: 2;
  min-width: 0;
`;

const PieContainer = styled.div`
  flex: 1;
  min-width: 0;
`;

const SIPVisualizer = ({ results }) => {
  if (!results || !results.projection) return null;

  return (
    <VisualizerWrapper>
      <ChartRow>
        <ProjectionContainer>
          <ProjectionChart data={results.projection} height="400px" />
        </ProjectionContainer>
        <PieContainer>
          <AllocationChart data={results.allocation} title="Wealth Allocation" height="400px" />
        </PieContainer>
      </ChartRow>
    </VisualizerWrapper>
  );
};

export default SIPVisualizer;
