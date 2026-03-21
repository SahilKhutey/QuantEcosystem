import React from 'react';
import styled from 'styled-components';

const MapContainer = styled.div`
  background: var(--secondary-dark);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-image: radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 70%);
  position: relative;
  overflow: hidden;
`;

const Dot = styled.div`
  position: absolute;
  width: ${props => props.$size || '12px'};
  height: ${props => props.$size || '12px'};
  background: ${props => props.$color || 'var(--accent-blue)'};
  border-radius: 50%;
  box-shadow: 0 0 16px ${props => props.$color || 'var(--accent-blue)'};
  top: ${props => props.$top};
  left: ${props => props.$left};
  
  &::after {
    content: '${props => props.$label}';
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
  }
`;

const EquityMapStyle = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 800px;
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.1);
`;

const EquityMap = () => {
  return (
    <MapContainer>
      <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', color: 'var(--text-primary)', alignSelf: 'flex-start', position: 'relative', zIndex: 10 }}>Global Equity Zones</h3>
      <EquityMapStyle>
        <Dot $top="40%" $left="20%" $label="North America" $size="18px" $color="var(--accent-blue)" />
        <Dot $top="35%" $left="50%" $label="Europe" $size="14px" $color="var(--accent-purple)" />
        <Dot $top="50%" $left="75%" $label="Asia / India" $size="16px" $color="var(--accent-green)" />
        <Dot $top="40%" $left="85%" $label="Japan" $size="12px" $color="#f59e0b" />
      </EquityMapStyle>
    </MapContainer>
  );
};

export default EquityMap;
