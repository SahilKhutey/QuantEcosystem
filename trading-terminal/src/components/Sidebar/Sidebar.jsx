import React, { useState } from 'react';
import {
  FiHome, FiActivity, FiTrendingUp, FiPieChart, FiShield,
  FiMessageSquare, FiBarChart2, FiSettings, FiChevronRight,
  FiChevronDown, FiGlobe, FiCpu, FiBriefcase, FiSearch,
  FiDollarSign, FiLayers, FiMap, FiTarget
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.div`
  width: 240px;
  background: linear-gradient(180deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
  border-right: 1px solid var(--border-color);
  height: calc(100vh - 60px);
  overflow-y: auto;
  transition: all 0.3s ease;
  padding-bottom: 20px;
`;

const SectionTitle = styled.div`
  padding: 14px 20px 6px;
  font-size: 10px;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  margin: 2px 8px;
  border-radius: 8px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $active }) => $active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  background: ${({ $active, $accent }) => $active ? `${$accent || 'rgba(59,130,246,0.12)'}` : 'transparent'};
  border: 1px solid ${({ $active, $accent }) => $active ? `${$accent ? $accent.replace('0.12', '0.3') : 'rgba(59,130,246,0.3)'}` : 'transparent'};
  transition: all 0.18s ease;
  gap: 0;

  &:hover {
    background: rgba(255,255,255,0.05);
    color: var(--text-primary);
  }

  svg {
    margin-right: 10px;
    min-width: 18px;
    flex-shrink: 0;
  }

  span { flex: 1; }
`;

const Divider = styled.div`
  height: 1px;
  background: var(--border-color);
  margin: 8px 16px;
`;

const CollapsibleSection = styled.div`
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 16px 10px 20px;
    cursor: pointer;
    user-select: none;
    &:hover { background: rgba(255,255,255,0.03); }
  }

  .collapsible-content {
    max-height: ${({ $isOpen }) => $isOpen ? '500px' : '0'};
    overflow: hidden;
    transition: max-height 0.3s ease;
  }
`;

const moduleNavItems = [
  {
    to: '/quant-engine',
    icon: FiCpu,
    label: 'Quant Engine',
    dotClass: 'live',
    accent: 'rgba(139,92,246,0.12)',
  },
  {
    to: '/ai-agent',
    icon: FiBriefcase,
    label: 'AI Agent',
    dotClass: 'live',
    accent: 'rgba(59,130,246,0.12)',
  },
  {
    to: '/stock-analysis',
    icon: FiSearch,
    label: 'Stock Analyzer',
    dotClass: 'live',
    accent: 'rgba(16,185,129,0.12)',
  },
  {
    to: '/trading-engine',
    icon: FiShield,
    label: 'Trading Engine',
    dotClass: 'live',
    accent: 'rgba(245,158,11,0.12)',
  },
  {
    to: '/global-market',
    icon: FiGlobe,
    label: 'Global Market',
    dotClass: 'live',
    accent: 'rgba(6,182,212,0.12)',
  },
];

const wealthNavItems = [
  { to: '/wealth', icon: FiMap, label: 'Wealth Map', accent: 'rgba(234,179,8,0.12)' },
  { to: '/wealth/sip', icon: FiTrendingUp, label: 'SIP Analyzer', accent: 'rgba(59,130,246,0.12)' },
  { to: '/wealth/swp', icon: FiTarget, label: 'SWP Planner', accent: 'rgba(239,68,68,0.12)' },
  { to: '/wealth/equity', icon: FiLayers, label: 'Global Equity', accent: 'rgba(16,185,129,0.12)' },
];

const coreNavItems = [
  { to: '/',          icon: FiHome,          label: 'Dashboard'   },
  { to: '/trading',   icon: FiActivity,      label: 'Trading'     },
  { to: '/signals',   icon: FiTrendingUp,    label: 'Signals'     },
  { to: '/portfolio', icon: FiPieChart,      label: 'Portfolio'   },
  { to: '/risk',      icon: FiShield,        label: 'Risk'        },
  { to: '/news',      icon: FiMessageSquare, label: 'News'        },
];

const Sidebar = () => {
  const location = useLocation();
  const [openSections, setOpenSections] = useState({ core: true, wealth: true, settings: false });

  const toggle = (section) =>
    setOpenSections(p => ({ ...p, [section]: !p[section] }));

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <SidebarContainer>
      {/* Quant Ecosystem modules */}
      <SectionTitle>Quant Ecosystem</SectionTitle>
      {moduleNavItems.map(({ to, icon: Icon, label, accent }) => (
        <NavItem key={to} to={to} $active={isActive(to)} $accent={accent}>
          <Icon size={16} />
          <span>{label}</span>
          {isActive(to) && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 6px var(--accent-green)' }} />
          )}
        </NavItem>
      ))}

      <Divider />

      {/* Core navigation */}
      <CollapsibleSection $isOpen={openSections.core}>
        <div className="section-header" onClick={() => toggle('core')}>
          <SectionTitle style={{ padding: 0 }}>Core Terminal</SectionTitle>
          {openSections.core ? <FiChevronDown size={13} color="var(--text-tertiary)" /> : <FiChevronRight size={13} color="var(--text-tertiary)" />}
        </div>
        <div className="collapsible-content">
          {coreNavItems.map(({ to, icon: Icon, label }) => (
            <NavItem key={to} to={to} $active={isActive(to)}>
              <Icon size={16} />
              <span>{label}</span>
            </NavItem>
          ))}
        </div>
      </CollapsibleSection>

      <Divider />

      {/* Wealth Management */}
      <CollapsibleSection $isOpen={openSections.wealth}>
        <div className="section-header" onClick={() => toggle('wealth')}>
          <SectionTitle style={{ padding: 0 }}>Wealth Management</SectionTitle>
          {openSections.wealth ? <FiChevronDown size={13} color="var(--text-tertiary)" /> : <FiChevronRight size={13} color="var(--text-tertiary)" />}
        </div>
        <div className="collapsible-content">
          {wealthNavItems.map(({ to, icon: Icon, label, accent }) => (
             <NavItem key={to} to={to} $active={isActive(to)} $accent={accent}>
               <Icon size={16} />
               <span>{label}</span>
             </NavItem>
          ))}
        </div>
      </CollapsibleSection>

      <Divider />

      {/* Settings */}
      <CollapsibleSection $isOpen={openSections.settings}>
        <div className="section-header" onClick={() => toggle('settings')}>
          <SectionTitle style={{ padding: 0 }}>Settings</SectionTitle>
          {openSections.settings ? <FiChevronDown size={13} color="var(--text-tertiary)" /> : <FiChevronRight size={13} color="var(--text-tertiary)" />}
        </div>
        <div className="collapsible-content">
          <NavItem to="/settings" $active={isActive('/settings')}>
            <FiSettings size={16} />
            <span>Preferences</span>
          </NavItem>
          <NavItem to="/analytics" $active={isActive('/analytics')}>
            <FiBarChart2 size={16} />
            <span>Analytics</span>
          </NavItem>
        </div>
      </CollapsibleSection>

      {/* Footer status */}
      <div style={{ margin: '16px 16px 0', padding: '10px 12px', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: 'var(--accent-green)', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
          All Systems Operational
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>5 modules · 0 warnings</div>
      </div>
    </SidebarContainer>
  );
};

export default Sidebar;
