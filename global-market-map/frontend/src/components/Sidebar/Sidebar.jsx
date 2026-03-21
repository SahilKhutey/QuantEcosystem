import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { FiHome, FiTrendingUp, FiZap, FiPieChart, FiAlertTriangle, FiFileText, FiBarChart2, FiSettings, FiGlobe } from 'react-icons/fi';

const SidebarContainer = styled.nav`
  width: 240px;
  background: var(--primary-dark);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  
  .nav-item {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: var(--text-secondary);
    text-decoration: none;
    gap: 12px;
    font-size: 14px;
    transition: all 0.2s;
    
    &:hover { background: var(--secondary-dark); color: #fff; }
    &.active { background: var(--tertiary-dark); color: var(--accent-blue); border-left: 3px solid var(--accent-blue); }
  }
`;

const Sidebar = () => (
  <SidebarContainer>
    <NavLink to="/" className="nav-item" end><FiHome /> Dashboard</NavLink>
    <NavLink to="/trading" className="nav-item"><FiTrendingUp /> Trading</NavLink>
    <NavLink to="/signals" className="nav-item"><FiZap /> Signals</NavLink>
    <NavLink to="/portfolio" className="nav-item"><FiPieChart /> Portfolio</NavLink>
    <NavLink to="/risk" className="nav-item"><FiAlertTriangle /> Risk</NavLink>
    <NavLink to="/news" className="nav-item"><FiFileText /> News</NavLink>
    <NavLink to="/analytics" className="nav-item"><FiBarChart2 /> Analytics</NavLink>
    <NavLink to="/global-market" className="nav-item"><FiGlobe /> Global Market</NavLink>
    <div style={{ marginTop: 'auto' }}>
      <NavLink to="/settings" className="nav-item"><FiSettings /> Settings</NavLink>
    </div>
  </SidebarContainer>
);

export default Sidebar;
