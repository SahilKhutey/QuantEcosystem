import React, { useState, useEffect } from 'react';
import { FiBell, FiSettings, FiUser, FiSearch, FiMenu } from 'react-icons/fi';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: var(--secondary-dark);
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  font-size: 20px;
  color: var(--accent-blue);
`;

const SearchBar = styled.div`
  flex: 0 1 400px;
  position: relative;
  
  input {
    width: 100%;
    padding: 8px 12px 8px 36px;
    border-radius: 4px;
    border: 1px solid var(--border-color);
    background-color: var(--tertiary-dark);
    color: var(--text-primary);
    
    &:focus {
      outline: none;
      border-color: var(--accent-blue);
    }
  }
  
  svg {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-tertiary);
  }
`;

const UserActions = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const IconBadge = styled.div`
  position: relative;
  cursor: pointer;
  
  .badge-dot {
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background-color: var(--accent-red);
    border-radius: 50%;
  }
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  
  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--accent-blue);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
  }
`;

import useAppStore from '../../services/store/appStore';

const Header = () => {
  const [notifications, setNotifications] = useState(3);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { selectedSymbol, setSelectedSymbol } = useAppStore();
  const [searchInput, setSearchInput] = useState(selectedSymbol);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setSelectedSymbol(searchInput.toUpperCase());
    }
  };

  return (
    <HeaderContainer>
      <Logo>
        <FiMenu size={24} />
        <span>TRADE PRO</span>
      </Logo>
      
      <SearchBar>
        <FiSearch />
        <input 
          type="text" 
          placeholder="Search symbols (e.g. AAPL, RELIANCE)..." 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearch}
        />
        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '10px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>
          PRESS ENTER
        </div>
      </SearchBar>
      
      <UserActions>
        <div style={{ display: 'flex', gap: '10px', marginRight: '20px' }}>
          {['RELIANCE', 'TCS', 'AAPL', 'BTCUSD'].map(s => (
            <button 
              key={s}
              onClick={() => { setSelectedSymbol(s); setSearchInput(s); }}
              style={{ 
                background: selectedSymbol === s ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '10px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <IconBadge>
          <FiBell size={20} />
          {notifications > 0 && <div className="badge-dot"></div>}
        </IconBadge>
        
        <IconBadge title="Active Symbol">
          <div style={{ padding: '4px 8px', background: 'var(--tertiary-dark)', border: '1px solid var(--accent-blue)', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {selectedSymbol}
          </div>
        </IconBadge>
        
        <UserProfile>
          <div className="avatar">JD</div>
          <span style={{ display: 'none' }}>John Doe</span>
        </UserProfile>
        
        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', minWidth: '80px' }}>
          {currentTime.toLocaleTimeString()}
        </div>
      </UserActions>
    </HeaderContainer>
  );
};

export default Header;
