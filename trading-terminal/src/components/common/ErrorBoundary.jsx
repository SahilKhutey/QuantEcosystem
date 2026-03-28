import React from 'react';
import { Card, Button, Result, Typography } from 'antd';
import { ReloadOutlined, WarningOutlined } from '@ant-design/icons';

const { Text } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Terminal Error caught by Boundary:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRestart = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '48px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)' }}>
          <Card 
            style={{ maxWidth: 600, width: '100%', border: '1px solid var(--border-color)', borderRadius: '12px' }}
            bodyStyle={{ textAlign: 'center' }}
          >
            <Result
              status="warning"
              icon={<WarningOutlined style={{ color: '#faad14', fontSize: '48px' }} />}
              title="Component Initialization Failure"
              subTitle="The Institutional Intelligence Engine encountered a runtime exception while mounting this module."
              extra={[
                <Button 
                  type="primary" 
                  key="console" 
                  icon={<ReloadOutlined />} 
                  onClick={this.handleRestart}
                >
                  Restart Terminal Session
                </Button>,
                <Button key="buy" onClick={() => this.setState({ hasError: false })}>
                  Dismiss Error
                </Button>
              ]}
            >
              <div style={{ textAlign: 'left', background: '#001529', color: '#ff4d4f', padding: '16px', borderRadius: '8px', marginTop: '24px', overflowX: 'auto' }}>
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {this.state.error?.toString()}
                </pre>
              </div>
              <Text type="secondary" style={{ marginTop: '16px', display: 'block' }}>
                Reference ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} | Source: Quantum_Boundary_V1
              </Text>
            </Result>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
