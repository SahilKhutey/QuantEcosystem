// src/components/Sidebar/SearchBar.jsx
import React, { useState } from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

const SearchBar = ({ 
  onSearch,
  placeholder = "Search for assets, news, or indicators...",
  className = '',
  style = {},
  compact = false
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const handleSearch = (value) => {
    if (onSearch) onSearch(value);
  };
  
  const handleClear = () => {
    setSearchValue('');
    if (onSearch) onSearch('');
  };
  
  return (
    <div className={`search-bar ${className}`} style={style}>
      {compact ? (
        <Input 
          placeholder={placeholder}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onPressEnter={() => handleSearch(searchValue)}
          suffix={
            searchValue ? (
              <CloseOutlined 
                onClick={handleClear}
                style={{ cursor: 'pointer', fontSize: '12px', color: '#bfbfbf' }}
              />
            ) : (
              <SearchOutlined style={{ color: '#bfbfbf' }} />
            )
          }
          style={{ width: '100%', borderRadius: '6px' }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      ) : (
        <Input.Search
          placeholder={placeholder}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onSearch={handleSearch}
          style={{ width: '100%' }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          enterButton={
            <Button type="primary" icon={<SearchOutlined />} />
          }
        />
      )}
    </div>
  );
};

export default SearchBar;
