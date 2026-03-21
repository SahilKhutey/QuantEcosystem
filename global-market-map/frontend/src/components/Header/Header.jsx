import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  height: 60px;
  background: var(--primary-dark);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  
  h2 { font-size: 18px; margin: 0; }
`;

const Header = () => (
  <HeaderContainer>
    <h2>Trading Terminal</h2>
    <div style={{ color: 'var(--text-secondary)' }}>Live Status: Online</div>
  </HeaderContainer>
);

export default Header;
