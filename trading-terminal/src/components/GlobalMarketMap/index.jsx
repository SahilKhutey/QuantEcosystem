import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem;
  border-radius: 8px;
`;

const GlobalMarketMap = () => {
  return (
    <Container>
      <h3>Global Market Intelligence Map</h3>
    </Container>
  );
};

export default GlobalMarketMap;
