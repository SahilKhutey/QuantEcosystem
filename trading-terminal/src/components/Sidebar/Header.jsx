import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Layout, Button, Space, Typography, Tag, Divider, Avatar, Dropdown, Breadcrumb } from 'antd';
import { useLocation, Link } from 'react-router-dom';
import UserMenu from './UserMenu';
import SystemStatus from './SystemStatus';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';

const { Header: AntdHeader } = Layout;
const { Text } = Typography;

const Header = ({
  collapsed = false,
  onCollapse,
  title = "Dashboard",
  selectedSymbol = 'RELIANCE',
  onSymbolChange
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [searchToggle, setSearchToggle] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter((x) => x);

  useEffect(() => {
    setIsCollapsed(collapsed);
  }, [collapsed]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const quickSymbols = ['RELIANCE', 'TCS', 'AAPL', 'BTCUSD'];

  return (
    <AntdHeader className="app-header" style={{ padding: '0 24px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
      <Space size={16}>
        <Button
          type="text"
          icon={isCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => {
            const next = !isCollapsed;
            setIsCollapsed(next);
            if (onCollapse) onCollapse(next);
          }}
        />
        <Text strong style={{ fontSize: '18px' }}>{title}</Text>
        <Divider type="vertical" />
        <Breadcrumb style={{ fontSize: '12px' }}>
          <Breadcrumb.Item><Link to="/">Terminal</Link></Breadcrumb.Item>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            return (
              <Breadcrumb.Item key={name}>
                {isLast ? (
                  <span style={{ textTransform: 'capitalize' }}>{name.replace(/-/g, ' ')}</span>
                ) : (
                  <Link to={routeTo} style={{ textTransform: 'capitalize' }}>{name.replace(/-/g, ' ')}</Link>
                )}
              </Breadcrumb.Item>
            );
          })}
        </Breadcrumb>
      </Space>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '32px' }}>
        {searchToggle ? (
          <SearchBar
            compact
            style={{ width: 400 }}
            onSearch={(val) => {
              if (onSymbolChange) onSymbolChange(val);
              setSearchToggle(false);
            }}
          />
        ) : (
          <Space size={24}>
            <Space size={8}>
              {quickSymbols.map(sym => (
                <Tag
                  key={sym}
                  color={selectedSymbol === sym ? 'blue' : 'default'}
                  style={{ cursor: 'pointer', borderRadius: '4px', fontWeight: 600 }}
                  onClick={() => onSymbolChange && onSymbolChange(sym)}
                >
                  {sym}
                </Tag>
              ))}
              <Button type="text" icon={<SearchOutlined />} onClick={() => setSearchToggle(true)} size="small" />
            </Space>
            <Divider type="vertical" />
            <SystemStatus compact />
          </Space>
        )}
      </div>
      <Space size={16}>
        <NotificationBell />
        <Dropdown 
          overlay={
            <UserMenu 
              user={{ name: 'Institutional Trader', avatar: 'https://joeschmoe.io/api/v1/random' }} 
            />
          } 
          trigger={['click']}
        >
          <Button type="text" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}>
            <Avatar icon={<UserOutlined />} size="small" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>Trader #001</span>
          </Button>
        </Dropdown>
      </Space>
    </AntdHeader>
  );
};

export default Header;
