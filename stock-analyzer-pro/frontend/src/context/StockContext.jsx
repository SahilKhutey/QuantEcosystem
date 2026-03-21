import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const StockContext = createContext();

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

export const StockProvider = ({ children }) => {
  const [watchlist, setWatchlist] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);
  const [realTimeData, setRealTimeData] = useState({});
  const [news, setNews] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    // Subscribe to watchlist symbols
    watchlist.forEach(symbol => {
      newSocket.emit('subscribe', symbol);
    });

    newSocket.on('price_update', (data) => {
      setRealTimeData(prev => ({
        ...prev,
        [data.symbol]: data
      }));
    });

    newSocket.on('news_update', (newsData) => {
      setNews(prev => [newsData, ...prev.slice(0, 49)]);
    });

    return () => newSocket.close();
  }, [watchlist]);

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist(prev => [...prev, symbol]);
      socket?.emit('subscribe', symbol);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
    socket?.emit('unsubscribe', symbol);
  };

  const value = {
    watchlist,
    realTimeData,
    news,
    addToWatchlist,
    removeFromWatchlist,
    socket
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};
