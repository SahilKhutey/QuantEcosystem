// src/components/Trading/TradingDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Space, Button, Select } from 'antd';
import { OrderedListOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { tradingAPI } from '../../api/trading';
import OrderBook from './OrderBook';
import OrderTicket from './OrderTicket';
import TradeHistory from './TradeHistory';
import PositionSummary from './PositionSummary';
import MarketDepthChart from './MarketDepthChart';
import TradingControls from './TradingControls';
import './Trading.css';

const { TabPane } = Tabs;

const TradingDashboard = ({ 
  symbol = "AAPL",
  title = "Trading Desk",
  className = '',
  style = {},
  cardStyle = {},
  loading = false,
  error = null,
  onOrderPlaced,
  onPositionChange,
  onSymbolChange
}) => {
  const [activeTab, setActiveTab] = useState('orderbook');
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  const [orderBook, setOrderBook] = useState({
    bids: [],
    asks: [],
    lastPrice: 0,
    marketCap: 0,
    volume: 0
  });
  const [tradeHistory, setTradeHistory] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orderTicket, setOrderTicket] = useState({
    type: 'limit',
    side: 'buy',
    quantity: 1,
    price: 0,
    timeInForce: 'GTC'
  });
  const [loadingState, setLoadingState] = useState(loading);
  const [errorState, setErrorState] = useState(error);
  const [marketData, setMarketData] = useState({
    lastPrice: 0,
    change: 0,
    changePercent: 0,
    high: 0,
    low: 0,
    open: 0,
    volume: 0
  });

  // Available symbols
  const symbols = [
    { value: 'AAPL', label: 'Apple Inc.' },
    { value: 'MSFT', label: 'Microsoft Corporation' },
    { value: 'GOOGL', label: 'Alphabet Inc.' },
    { value: 'AMZN', label: 'Amazon.com Inc.' },
    { value: 'TSLA', label: 'Tesla Inc.' },
    { value: 'NVDA', label: 'NVIDIA Corporation' },
    { value: 'JPM', label: 'JPMorgan Chase & Co.' },
    { value: 'JNJ', label: 'Johnson & Johnson' },
    { value: 'V', label: 'Visa Inc.' },
    { value: 'MA', label: 'Mastercard Incorporated' }
  ];

  // Fetch market data on component mount and symbol changes
  useEffect(() => {
    fetchMarketData();
  }, [currentSymbol]);

  const fetchMarketData = async () => {
    setLoadingState(true);
    setErrorState(null);
    
    try {
      const [orderBookData, tradeHistoryData, positionsData, marketDataVal] = await Promise.all([
        tradingAPI.getOrderBook(currentSymbol),
        tradingAPI.getTradeHistory(currentSymbol),
        tradingAPI.getPositions(),
        tradingAPI.getMarketData(currentSymbol)
      ]);

      setOrderBook(orderBookData);
      setTradeHistory(tradeHistoryData);
      setPositions(positionsData);
      setMarketData(marketDataVal);
      
      setOrderTicket(prev => ({
        ...prev,
        price: orderBookData.lastPrice
      }));
      
      setLoadingState(false);
    } catch (err) {
      setErrorState('Failed to load trading data');
      console.error('Trading dashboard fetch error:', err);
      setLoadingState(false);
    }
  };

  const handleSymbolChange = (value) => {
    setCurrentSymbol(value);
    if (onSymbolChange) {
      onSymbolChange(value);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      const response = await tradingAPI.placeOrder(currentSymbol, orderTicket);
      if (response.success) {
        fetchMarketData();
        setOrderTicket({
          type: 'limit',
          side: 'buy',
          quantity: 1,
          price: orderBook.lastPrice,
          timeInForce: 'GTC'
        });
        if (onOrderPlaced) {
          onOrderPlaced(response.order);
        }
      }
    } catch (err) {
      setErrorState('Failed to place order');
    }
  };

  return (
    <div className={`trading-dashboard ${className}`} style={style}>
      <Card className="trading-header" style={cardStyle}>
        <div className="dashboard-header">
          <div className="dashboard-title">
            <OrderedListOutlined style={{ marginRight: 8 }} />
            {title}
          </div>
          
          <div className="dashboard-controls">
            <Space>
              <Select
                value={currentSymbol}
                onChange={handleSymbolChange}
                options={symbols}
                style={{ width: 150 }}
              />
              
              <Button type="primary" icon={<PlusCircleOutlined />} onClick={() => setActiveTab('order')}>
                Place Order
              </Button>
            </Space>
          </div>
        </div>
        
        <div className="dashboard-tabs">
          <Tabs activeKey={activeTab} onChange={setActiveTab}>
            <TabPane tab="Order Book" key="orderbook">
              <div className="trading-main">
                <Row gutter={[24, 24]}>
                  <Col xs={24} lg={16}>
                    <Row gutter={24}>
                      <Col span={12}>
                        <PositionSummary 
                          positions={positions} 
                          loading={loadingState} 
                          error={errorState}
                        />
                      </Col>
                      <Col span={12}>
                        <MarketDepthChart 
                          orderBook={orderBook} 
                          loading={loadingState} 
                          error={errorState}
                        />
                      </Col>
                    </Row>
                    
                    <div className="order-book-container">
                      <OrderBook 
                        orderBook={orderBook} 
                        loading={loadingState} 
                        error={errorState}
                      />
                    </div>
                  </Col>
                  
                  <Col xs={24} lg={8}>
                    <div className="trading-sidebar">
                      <TradingControls 
                        marketData={marketData} 
                        loading={loadingState} 
                        error={errorState}
                      />
                      
                      <OrderTicket 
                        symbol={currentSymbol}
                        orderTicket={orderTicket}
                        onOrderTypeChange={(v) => setOrderTicket(p => ({...p, type: v}))}
                        onOrderSideChange={(v) => setOrderTicket(p => ({...p, side: v}))}
                        onQuantityChange={(v) => setOrderTicket(p => ({...p, quantity: v}))}
                        onPriceChange={(v) => setOrderTicket(p => ({...p, price: v}))}
                        onTimeInForceChange={(v) => setOrderTicket(p => ({...p, timeInForce: v}))}
                        onPlaceOrder={handlePlaceOrder}
                        loading={loadingState}
                        error={errorState}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </TabPane>
            
            <TabPane tab="Trade History" key="history">
              <TradeHistory 
                tradeHistory={tradeHistory} 
                loading={loadingState} 
                error={errorState}
                symbol={currentSymbol}
              />
            </TabPane>
            
            <TabPane tab="Positions" key="positions">
              <PositionSummary 
                positions={positions} 
                loading={loadingState} 
                error={errorState}
              />
            </TabPane>
            
            <TabPane tab="Order Ticket" key="order">
              <div className="order-ticket-container">
                <OrderTicket 
                  symbol={currentSymbol}
                  orderTicket={orderTicket}
                  onPlaceOrder={handlePlaceOrder}
                  loading={loadingState}
                  error={errorState}
                />
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Card>
    </div>
  );
};

export default TradingDashboard;
