import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { io } from 'socket.io-client';

const StockChart = ({ symbol, interval = '1d' }) => {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    socketRef.current = io('http://localhost:8000');
    
    socketRef.current.emit('subscribe', symbol);
    
    socketRef.current.on('price_update', (data) => {
      if (data.symbol === symbol) {
        setCurrentPrice(data.price);
        setChartData(prev => [...prev.slice(-99), {
          timestamp: new Date().toLocaleTimeString(),
          price: data.price,
          volume: data.volume
        }]);
      }
    });

    // Fetch historical data
    fetchHistoricalData();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [symbol, interval]);

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/stocks/${symbol}/history?interval=${interval}`);
      const data = await response.json();
      setChartData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{symbol}</h2>
        {currentPrice && (
          <div className="text-2xl font-mono">
            ${currentPrice.toFixed(2)}
          </div>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="timestamp" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
