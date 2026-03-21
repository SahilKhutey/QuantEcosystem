import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  padding: 1rem;
  border-radius: 8px;
`;

const Signals = () => {
  return (
    <Container>
      <h3>Active Signals</h3>
    </Container>
  );
};

export default Signals;
