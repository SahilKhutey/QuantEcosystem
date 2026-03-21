import React from 'react';
import styled from 'styled-components';
import { FiSettings, FiUser, FiBell, FiLock, FiMonitor, FiCode } from 'react-icons/fi';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 800px;
  margin: 0 auto;
  
  .card {
    background: var(--secondary-dark);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 25px;
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  
  &:last-child { border-bottom: none; }
  
  .info {
    .label { font-size: 14px; font-weight: 600; color: var(--text-primary); }
    .desc { font-size: 12px; color: var(--text-tertiary); margin-top: 4px; }
  }
  
  .control {
    input[type="checkbox"] {
      width: 40px;
      height: 20px;
      appearance: none;
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      position: relative;
      cursor: pointer;
      outline: none;
      
      &:checked { background: var(--accent-blue); }
      &:before {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: 0.2s;
      }
      &:checked:before { left: 22px; }
    }
    
    select {
      background: var(--tertiary-dark);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 8px 12px;
      color: white;
      outline: none;
    }
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 25px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text-primary);
  
  svg { color: var(--accent-blue); }
`;

const SettingsPage = () => {
  return (
    <div className="page-container">
      <SettingsContainer>
        <div className="card">
          <SectionTitle><FiMonitor /> Appearance & interface</SectionTitle>
          <SettingItem>
            <div className="info">
              <div className="label">Terminal Theme</div>
              <div className="desc">Switch between professional dark and high-contrast modes.</div>
            </div>
            <div className="control">
              <select defaultValue="dark">
                <option value="dark">Pro Dark (Opal)</option>
                <option value="glass">Glassmorphism</option>
                <option value="amoled">Pure Black</option>
              </select>
            </div>
          </SettingItem>
          <SettingItem>
            <div className="info">
              <div className="label">Compact Mode</div>
              <div className="desc">Maximize workspace by reducing component padding.</div>
            </div>
            <div className="control">
              <input type="checkbox" />
            </div>
          </SettingItem>
        </div>
        
        <div className="card">
          <SectionTitle><FiBell /> Notifications</SectionTitle>
          <SettingItem>
            <div className="info">
              <div className="label">Trade Execution Alerts</div>
              <div className="desc">Desktop notification on every order fill.</div>
            </div>
            <div className="control">
              <input type="checkbox" defaultChecked />
            </div>
          </SettingItem>
          <SettingItem>
            <div className="info">
              <div className="label">AI Signal Alerts</div>
              <div className="desc">Notification when a strategy conviction exceeds 90%.</div>
            </div>
            <div className="control">
              <input type="checkbox" defaultChecked />
            </div>
          </SettingItem>
        </div>
        
        <div className="card">
          <SectionTitle><FiCode /> API & Terminal Engine</SectionTitle>
          <SettingItem>
            <div className="info">
              <div className="label">Quant Engine Endpoint</div>
              <div className="desc">Current: http://localhost:8001</div>
            </div>
            <div className="control">
              <button style={{ padding: '8px 15px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'white', fontSize: '12px', cursor: 'pointer' }}>Edit</button>
            </div>
          </SettingItem>
          <SettingItem>
            <div className="info">
              <div className="label">Mock Data Fallback</div>
              <div className="desc">Automatically use mock data when backends are offline.</div>
            </div>
            <div className="control">
              <input type="checkbox" defaultChecked disabled />
            </div>
          </SettingItem>
        </div>
      </SettingsContainer>
    </div>
  );
};

export default SettingsPage;
