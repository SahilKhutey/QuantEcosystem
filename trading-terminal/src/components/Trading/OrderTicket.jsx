// src/components/Trading/OrderTicket.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Space, InputNumber, Button, Select, Radio, Divider } from 'antd';

const OrderTicket = ({ 
  symbol,
  orderTicket,
  onOrderTypeChange,
  onOrderSideChange,
  onQuantityChange,
  onPriceChange,
  onTimeInForceChange,
  onPlaceOrder,
  loading = false,
  error = null,
  title = "Order Ticket",
  className = '',
  style = {},
  cardStyle = {}
}) => {
  const [order, setOrder] = useState({
    type: 'limit',
    side: 'buy',
    quantity: 1,
    price: 0,
    timeInForce: 'GTC'
  });
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [preview, setPreview] = useState({ total: 0, fee: 0, net: 0, risk: 'low' });

  useEffect(() => {
    if (orderTicket) {
      setOrder(orderTicket);
      calculatePreview(orderTicket);
    }
  }, [orderTicket]);

  const calculatePreview = (ord) => {
    const p = ord.price || 0;
    const q = ord.quantity || 0;
    const tot = p * q;
    const f = tot * 0.005;
    const n = ord.side === 'buy' ? tot + f : tot - f;
    let r = q > 100 ? 'high' : q > 20 ? 'medium' : 'low';
    setPreview({ total: tot, fee: f, net: n, risk: r });
  };

  const handleChange = (key, value) => {
    const newOrder = { ...order, [key]: value };
    setOrder(newOrder);
    calculatePreview(newOrder);
    if (key === 'type' && onOrderTypeChange) onOrderTypeChange(value);
    if (key === 'side' && onOrderSideChange) onOrderSideChange(value);
    if (key === 'quantity' && onQuantityChange) onQuantityChange(value);
    if (key === 'price' && onPriceChange) onPriceChange(value);
    if (key === 'timeInForce' && onTimeInForceChange) onTimeInForceChange(value);
  };

  return (
    <Card 
      className={`order-ticket ${className}`} 
      style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', ...cardStyle }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600 }}>{title} - {symbol}</div>
        <Button type="link" onClick={() => setIsAdvanced(!isAdvanced)} style={{ padding: 0 }}>
          {isAdvanced ? 'Standard' : 'Advanced'}
        </Button>
      </div>
      
      <div className="order-form">
        <Radio.Group 
          value={order.side} 
          onChange={(e) => handleChange('side', e.target.value)}
          buttonStyle="solid"
          style={{ width: '100%', marginBottom: '20px' }}
        >
          <Radio.Button value="buy" style={{ width: '50%', textAlign: 'center', borderColor: '#52c41a', background: order.side === 'buy' ? '#52c41a' : '' }}>BUY</Radio.Button>
          <Radio.Button value="sell" style={{ width: '50%', textAlign: 'center', borderColor: '#ff4d4f', background: order.side === 'sell' ? '#ff4d4f' : '' }}>SELL</Radio.Button>
        </Radio.Group>

        <Row gutter={16} style={{ marginBottom: '16px' }}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Order Type</div>
            <Select 
              value={order.type} 
              onChange={(v) => handleChange('type', v)}
              style={{ width: '100%' }}
              options={[
                { value: 'market', label: 'Market' },
                { value: 'limit', label: 'Limit' },
                { value: 'stop', label: 'Stop' }
              ]}
            />
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Time in Force</div>
            <Select 
              value={order.timeInForce} 
              onChange={(v) => handleChange('timeInForce', v)}
              style={{ width: '100%' }}
              options={[{ value: 'GTC', label: 'GTC' }, { value: 'IOC', label: 'IOC' }]}
            />
          </Col>
        </Row>

        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Quantity</div>
            <InputNumber value={order.quantity} onChange={(v) => handleChange('quantity', v)} style={{ width: '100%' }} min={1} />
          </Col>
          <Col span={12}>
            <div style={{ fontSize: '12px', color: '#8c8c8c', marginBottom: '4px' }}>Price</div>
            <InputNumber 
              value={order.price} 
              onChange={(v) => handleChange('price', v)} 
              style={{ width: '100%' }} 
              min={0} 
              precision={2} 
              disabled={order.type === 'market'} 
            />
          </Col>
        </Row>

        <div className="order-preview" style={{ background: '#fafafa', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#8c8c8c' }}>Estimated Total</span>
            <span style={{ fontWeight: 600 }}>${preview.total.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#8c8c8c' }}>Commission</span>
            <span style={{ fontWeight: 600 }}>${preview.fee.toFixed(2)}</span>
          </div>
          <Divider style={{ margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600 }}>Net Cost</span>
            <span style={{ fontWeight: 700, fontSize: '16px', color: order.side === 'buy' ? '#ff4d4f' : '#52c41a' }}>
              ${preview.net.toFixed(2)}
            </span>
          </div>
        </div>

        <Button 
          type="primary" 
          danger={order.side === 'sell'}
          style={{ width: '100%', height: '40px', fontWeight: 600, background: order.side === 'buy' ? '#52c41a' : '#ff4d4f' }}
          onClick={handlePlaceOrder}
          loading={loading}
        >
          PLACE {order.side.toUpperCase()} ORDER
        </Button>
      </div>
    </Card>
  );
};

export default OrderTicket;
