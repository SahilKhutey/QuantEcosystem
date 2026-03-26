import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  InputNumber, 
  Select, 
  Table, 
  Spin, 
  Alert,
  Tabs,
  Tag,
  Space,
  Divider,
  Typography,
  Tooltip,
  Badge
} from 'antd';
import { 
  PlayCircleOutlined,
  StopOutlined,
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Column } from '@ant-design/plots';
import { tradingAPI } from '../services/api/trading'; // Corrected path
import './TradingPage.css';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

const TradingPage = () => {
  // State Management
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USD');
  const [marketData, setMarketData] = useState({});
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] });
  const [openOrders, setOpenOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [orderForm, setOrderForm] = useState({
    type: 'limit',
    side: 'buy',
    price: '',
    amount: '',
    total: ''
  });
  const [loading, setLoading] = useState({
    orderBook: true,
    openOrders: true,
    positions: true,
    marketData: true
  });
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const wsRef = useRef(null);
  const priceInputRef = useRef(null);
  const amountInputRef = useRef(null);

  // Available trading pairs
  const tradingPairs = [
    { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar' },
    { symbol: 'ETH/USD', name: 'Ethereum / US Dollar' },
    { symbol: 'SOL/USD', name: 'Solana / US Dollar' },
    { symbol: 'ADA/USD', name: 'Cardano / US Dollar' },
    { symbol: 'DOT/USD', name: 'Polkadot / US Dollar' },
    { symbol: 'XRP/USD', name: 'Ripple / US Dollar' }
  ];

  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'orderbook':
        setOrderBook(data.payload);
        break;
      case 'market_data':
        setMarketData(data.payload);
        break;
      case 'order_update':
        fetchOpenOrders();
        break;
      case 'position_update':
        fetchPositions();
        break;
      default:
        break;
    }
  }, []);

  const connectWebSocket = useCallback((symbol) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = tradingAPI.connectWebSocket(symbol, handleWebSocketMessage);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log(`Connected to WebSocket for ${symbol}`);
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      setError('WebSocket connection error');
      console.error('WebSocket error:', error);
    };
  }, [handleWebSocketMessage]);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    connectWebSocket(selectedSymbol);
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedSymbol, connectWebSocket]);

  const fetchMarketData = async () => {
    setLoading(prev => ({ ...prev, marketData: true }));
    try {
      const response = await tradingAPI.getMarketData(selectedSymbol);
      setMarketData(response.data);
    } catch (err) {
      console.error('Market data fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, marketData: false }));
    }
  };

  const fetchOrderBook = async () => {
    setLoading(prev => ({ ...prev, orderBook: true }));
    try {
      const response = await tradingAPI.getOrderBook(selectedSymbol);
      setOrderBook(response.data);
    } catch (err) {
      console.error('Order book fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, orderBook: false }));
    }
  };

  const fetchOpenOrders = async () => {
    setLoading(prev => ({ ...prev, openOrders: true }));
    try {
      const response = await tradingAPI.getOpenOrders(selectedSymbol);
      setOpenOrders(response.data);
    } catch (err) {
      console.error('Open orders fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, openOrders: false }));
    }
  };

  const fetchPositions = async () => {
    setLoading(prev => ({ ...prev, positions: true }));
    try {
      const response = await tradingAPI.getPositions(selectedSymbol);
      setPositions(response.data);
    } catch (err) {
      console.error('Positions fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, positions: false }));
    }
  };

  const fetchData = async () => {
    setLoading({
      orderBook: true,
      openOrders: true,
      positions: true,
      marketData: true
    });
    try {
      await Promise.all([
        fetchMarketData(),
        fetchOrderBook(),
        fetchOpenOrders(),
        fetchPositions()
      ]);
    } catch (err) {
      setError('Failed to fetch trading data');
      console.error('Fetch error:', err);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [selectedSymbol]);

  // Handle form changes
  const handleOrderFormChange = (field, value) => {
    setOrderForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total when price or amount changes
      if ((field === 'price' || field === 'amount') && updated.price && updated.amount) {
        updated.total = (parseFloat(updated.price) * parseFloat(updated.amount)).toFixed(2);
      }
      
      return updated;
    });
  };

  // Place order
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        symbol: selectedSymbol,
        type: orderForm.type,
        side: orderForm.side,
        price: parseFloat(orderForm.price),
        amount: parseFloat(orderForm.amount)
      };

      const response = await tradingAPI.placeOrder(orderData);
      
      if (response.status === 'success') {
        // Reset form
        setOrderForm({
          type: 'limit',
          side: 'buy',
          price: '',
          amount: '',
          total: ''
        });
        
        // Refresh data
        fetchOpenOrders();
        fetchPositions();
        
        // Show success notification (In production use antd message)
        console.log('Order placed successfully!');
      } else {
        throw new Error(response.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.message || 'Failed to place order');
      console.error('Order placement error:', err);
    }
  };

  // Cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      const response = await tradingAPI.cancelOrder(orderId);
      
      if (response.status === 'success') {
        fetchOpenOrders();
        console.log('Order cancelled successfully!');
      } else {
        throw new Error(response.message || 'Failed to cancel order');
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel order');
      console.error('Order cancellation error:', err);
    }
  };

  // Quick fill functions
  const quickFillPrice = (price) => {
    handleOrderFormChange('price', price.toString());
    if (priceInputRef.current) {
      priceInputRef.current.focus();
    }
  };

  const quickFillAmount = (amount) => {
    handleOrderFormChange('amount', amount.toString());
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  // Order Book Columns
  const orderBookColumns = [
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price, record) => (
        <Text 
          strong 
          type={record.type === 'bid' ? 'success' : 'danger'}
          style={{ cursor: 'pointer' }}
          onClick={() => quickFillPrice(price)}
        >
          {price.toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => amount.toFixed(6)
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      align: 'right',
      render: (total) => total.toFixed(2)
    }
  ];

  // Open Orders Columns
  const openOrdersColumns = [
    {
      title: 'Time',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp).toLocaleTimeString()
    },
    {
      title: 'Pair',
      dataIndex: 'symbol',
      key: 'symbol'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'limit' ? 'blue' : 'orange'}>
          {type.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Side',
      dataIndex: 'side',
      key: 'side',
      render: (side) => (
        <Tag color={side === 'buy' ? 'green' : 'red'}>
          {side.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price?.toFixed(2)}`
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => amount.toFixed(6)
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status = 'open') => {
        const statusColors = {
          'open': 'blue',
          'partially_filled': 'orange',
          'filled': 'green',
          'cancelled': 'red'
        };
        return <Tag color={statusColors[status]}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="link" 
          danger
          onClick={() => handleCancelOrder(record.id)}
        >
          Cancel
        </Button>
      )
    }
  ];

  // Position Columns
  const positionsColumns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol'
    },
    {
      title: 'Side',
      dataIndex: 'side',
      key: 'side',
      render: (side) => (
        <Tag color={side === 'long' ? 'green' : 'red'}>
          {side ? side.toUpperCase() : 'LONG'}
        </Tag>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => parseFloat(amount).toFixed(6)
    },
    {
      title: 'Entry Price',
      dataIndex: 'entryPrice',
      key: 'entryPrice',
      render: (price) => `$${parseFloat(price || 0).toFixed(2)}`
    },
    {
      title: 'Current Price',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      render: (price) => `$${parseFloat(price || 0).toFixed(2)}`
    },
    {
      title: 'P&L',
      dataIndex: 'pnl',
      key: 'pnl',
      render: (pnl) => (
        <Text type={parseFloat(pnl) >= 0 ? 'success' : 'danger'}>
          ${parseFloat(pnl || 0).toFixed(2)}
        </Text>
      )
    }
  ];

  const orderBookConfig = {
    data: [
        ...(orderBook.bids || []).map(b => ({ price: b[0], amount: b[1], type: 'bid' })),
        ...(orderBook.asks || []).map(a => ({ price: a[0], amount: a[1], type: 'ask' }))
    ],
    xField: 'amount',
    yField: 'price',
    seriesField: 'type',
    color: ['#52c41a', '#ff4d4f'],
  };

  return (
    <div className="trading-page">
      {/* Page Header */}
      <div className="trading-header">
        <Title level={2} style={{ margin: 0 }}>
          Trading Terminal
        </Title>
        <div className="header-controls">
          <Badge 
            status={isConnected ? "success" : "error"} 
            text={isConnected ? "Connected" : "Disconnected"}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchData}
            loading={Object.values(loading).some(l => l)}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Market Info Bar */}
      <Card className="market-info-bar" size="small">
        <Row gutter={16} align="middle">
          <Col>
            <Select
              value={selectedSymbol}
              style={{ width: 180 }}
              onChange={setSelectedSymbol}
              showSearch
            >
              {tradingPairs.map(pair => (
                <Option key={pair.symbol} value={pair.symbol}>
                  {pair.symbol}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Text strong>Price:</Text> 
            <Text type="success" style={{ fontSize: '1.2em', marginLeft: 8 }}>
              ${marketData.lastPrice?.toFixed(2)}
            </Text>
          </Col>
          <Col>
            <Text strong>24h Change:</Text>
            <Text 
              type={marketData.change24h >= 0 ? "success" : "danger"} 
              style={{ marginLeft: 8 }}
            >
              {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h?.toFixed(2)}%
            </Text>
          </Col>
          <Col>
            <Text strong>24h Volume:</Text>
            <Text style={{ marginLeft: 8 }}>
              ${((marketData.volume24h || 0) / 1000000).toFixed(2)}M
            </Text>
          </Col>
        </Row>
      </Card>

      {/* Main Trading Area */}
      <Row gutter={[16, 16]} className="trading-main">
        {/* Left Panel - Order Form and Market Depth */}
        <Col xs={24} lg={8}>
          {/* Order Entry Form */}
          <Card title="Order Entry" className="order-form-card">
            <div className="order-form-section">
              <div className="form-row">
                <Button.Group style={{ width: '100%' }}>
                  <Button 
                    type={orderForm.side === 'buy' ? 'primary' : 'default'}
                    onClick={() => handleOrderFormChange('side', 'buy')}
                    style={{ width: '50%', backgroundColor: orderForm.side === 'buy' ? '#52c41a' : undefined }}
                  >
                    Buy
                  </Button>
                  <Button 
                    type={orderForm.side === 'sell' ? 'primary' : 'default'}
                    onClick={() => handleOrderFormChange('side', 'sell')}
                    style={{ width: '50%', backgroundColor: orderForm.side === 'sell' ? '#ff4d4f' : undefined }}
                  >
                    Sell
                  </Button>
                </Button.Group>
              </div>

              <div className="form-row">
                <label>Order Type</label>
                <Select
                  value={orderForm.type}
                  onChange={(value) => handleOrderFormChange('type', value)}
                  style={{ width: '100%' }}
                >
                  <Option value="limit">Limit</Option>
                  <Option value="market">Market</Option>
                </Select>
              </div>

              <div className="form-row">
                <label>Price</label>
                <InputNumber
                  ref={priceInputRef}
                  value={orderForm.price}
                  onChange={(value) => handleOrderFormChange('price', value)}
                  placeholder="0.00"
                  style={{ width: '100%' }}
                  step={0.01}
                />
              </div>

              <div className="form-row">
                <label>Amount</label>
                <InputNumber
                  ref={amountInputRef}
                  value={orderForm.amount}
                  onChange={(value) => handleOrderFormChange('amount', value)}
                  placeholder="0.000000"
                  style={{ width: '100%' }}
                  step={0.000001}
                />
              </div>

              <div className="form-row">
                <label>Total</label>
                <InputNumber
                  value={orderForm.total}
                  readOnly
                  placeholder="0.00"
                  style={{ width: '100%' }}
                />
              </div>

              <Button 
                type="primary" 
                size="large" 
                block
                onClick={handlePlaceOrder}
                loading={loading.openOrders}
                style={{ 
                  marginTop: 16,
                  backgroundColor: orderForm.side === 'buy' ? '#52c41a' : '#ff4d4f',
                  borderColor: orderForm.side === 'buy' ? '#52c41a' : '#ff4d4f'
                }}
              >
                {orderForm.side.toUpperCase()}
              </Button>
            </div>
          </Card>

          {/* Market Depth Visualization */}
          <Card title="Market Depth" style={{ marginTop: 16 }}>
            {loading.orderBook ? <Spin /> : <Column {...orderBookConfig} height={200} />}
          </Card>
        </Col>

        {/* Center Panel - Order Book */}
        <Col xs={24} lg={8}>
          <Card 
            title="Order Book" 
            className="order-book-card"
          >
            {loading.orderBook ? (
              <div className="loading-container">
                <Spin />
              </div>
            ) : (
              <div className="order-book-container">
                {/* Asks (Sell Orders) */}
                <div className="order-book-section">
                  <Table
                    columns={orderBookColumns}
                    dataSource={(orderBook.asks || []).slice(0, 15).map(a => ({ price: a[0], amount: a[1], total: a[0] * a[1], type: 'ask' }))}
                    pagination={false}
                    showHeader={false}
                    size="small"
                    rowKey="price"
                    rowClassName="ask-row"
                  />
                </div>

                {/* Spread Indicator */}
                <div className="spread-indicator" style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0', margin: '8px 0' }}>
                  <Text strong>Spread: </Text>
                  <Text>{((orderBook.asks?.[0]?.[0] - orderBook.bids?.[0]?.[0]) || 0).toFixed(2)}</Text>
                  <Text type="secondary" style={{ marginLeft: 8 }}>
                    ({(((orderBook.asks?.[0]?.[0] - orderBook.bids?.[0]?.[0]) / orderBook.bids?.[0]?.[0]) * 100 || 0).toFixed(4)}%)
                  </Text>
                </div>

                {/* Bids (Buy Orders) */}
                <div className="order-book-section">
                  <Table
                    columns={orderBookColumns}
                    dataSource={(orderBook.bids || []).slice(0, 15).map(b => ({ price: b[0], amount: b[1], total: b[0] * b[1], type: 'bid' }))}
                    pagination={false}
                    showHeader={false}
                    size="small"
                    rowKey="price"
                    rowClassName="bid-row"
                  />
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* Right Panel - Positions and Orders */}
        <Col xs={24} lg={8}>
          <Tabs defaultActiveKey="1" className="trading-tabs">
            <TabPane tab="Positions" key="1">
              <Card size="small" className="positions-card">
                {loading.positions ? (
                  <div className="loading-container">
                    <Spin />
                  </div>
                ) : positions.length > 0 ? (
                  <Table
                    columns={positionsColumns}
                    dataSource={positions}
                    pagination={false}
                    size="small"
                    rowKey="symbol"
                  />
                ) : (
                  <div className="empty-state" style={{ textAlign: 'center', padding: '20px' }}>
                    <Text>No open positions</Text>
                  </div>
                )}
              </Card>
            </TabPane>
            
            <TabPane tab="Open Orders" key="2">
              <Card size="small" className="orders-card">
                {loading.openOrders ? (
                  <div className="loading-container">
                    <Spin />
                  </div>
                ) : openOrders.length > 0 ? (
                  <Table
                    columns={openOrdersColumns}
                    dataSource={openOrders}
                    pagination={false}
                    size="small"
                    rowKey="id"
                  />
                ) : (
                  <div className="empty-state" style={{ textAlign: 'center', padding: '20px' }}>
                    <Text>No open orders</Text>
                  </div>
                )}
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  );
};

export default TradingPage;
