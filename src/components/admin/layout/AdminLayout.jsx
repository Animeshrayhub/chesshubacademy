import { useState, useEffect } from 'react';
import { Layout, Menu, Tabs, Input, Avatar, Dropdown, Switch, Badge, AutoComplete, theme } from 'antd';
import {
  DashboardOutlined, CalendarOutlined, BookOutlined, TeamOutlined,
  FileTextOutlined, ShoppingCartOutlined, TrophyOutlined, EditOutlined,
  SearchOutlined, ShareAltOutlined, GlobalOutlined, VideoCameraOutlined,
  UserOutlined, SolutionOutlined, ScheduleOutlined, FormOutlined,
  BarChartOutlined, FunnelPlotOutlined, GiftOutlined, SettingOutlined,
  BellOutlined, LogoutOutlined, SunOutlined, MoonOutlined,
  ReadOutlined, FileSearchOutlined, CustomerServiceOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth';
import { useAdminTheme } from '../theme/useAdminTheme';
import './AdminLayout.css';

const { Header, Sider, Content } = Layout;

const NAV_GROUPS = {
  academic: {
    label: 'Academic',
    icon: <BookOutlined />,
    items: [
      { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: '/admin/students', icon: <UserOutlined />, label: 'Students' },
      { key: '/admin/coaches', icon: <CustomerServiceOutlined />, label: 'Coaches' },
      { key: '/admin/sessions', icon: <ScheduleOutlined />, label: 'Sessions' },
      { key: '/admin/homework', icon: <FormOutlined />, label: 'Homework' },
      { key: '/admin/reports', icon: <BarChartOutlined />, label: 'Reports' },
    ],
  },
  content: {
    label: 'Content',
    icon: <FileTextOutlined />,
    items: [
      { key: '/admin/courses', icon: <ReadOutlined />, label: 'Courses' },
      { key: '/admin/ebooks', icon: <BookOutlined />, label: 'Ebooks' },
      { key: '/admin/ebook-orders', icon: <ShoppingCartOutlined />, label: 'Ebook Orders' },
      { key: '/admin/videos', icon: <VideoCameraOutlined />, label: 'Videos' },
      { key: '/admin/blog', icon: <EditOutlined />, label: 'Blog' },
      { key: '/admin/seo-content', icon: <FileSearchOutlined />, label: 'SEO Content' },
    ],
  },
  marketing: {
    label: 'Marketing',
    icon: <FunnelPlotOutlined />,
    items: [
      { key: '/admin/bookings', icon: <CalendarOutlined />, label: 'Bookings' },
      { key: '/admin/leads', icon: <FunnelPlotOutlined />, label: 'Leads' },
      { key: '/admin/demo-students', icon: <SolutionOutlined />, label: 'Demo Students' },
      { key: '/admin/referrals', icon: <ShareAltOutlined />, label: 'Referrals' },
      { key: '/admin/referral-codes', icon: <GiftOutlined />, label: 'Referral Codes' },
    ],
  },
  platform: {
    label: 'Platform',
    icon: <SettingOutlined />,
    items: [
      { key: '/admin/analytics', icon: <BarChartOutlined />, label: 'Analytics' },
      { key: '/admin/tournaments', icon: <TrophyOutlined />, label: 'Tournaments' },
      { key: '/admin/content', icon: <FileTextOutlined />, label: 'Site Content' },
      { key: '/admin/site-content', icon: <GlobalOutlined />, label: 'Content Manager' },
      { key: '/admin/settings', icon: <SettingOutlined />, label: 'Settings' },
    ],
  },
};

const TAB_KEYS = Object.keys(NAV_GROUPS);

function getActiveTabFromPath(pathname) {
  for (const [tabKey, group] of Object.entries(NAV_GROUPS)) {
    if (group.items.some(item => pathname.startsWith(item.key))) {
      return tabKey;
    }
  }
  return 'academic';
}

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { token } = theme.useToken();
  const [collapsed, setCollapsed] = useState(false);
  const activeTab = getActiveTabFromPath(location.pathname);
  const { isDark, setIsDark } = useAdminTheme();
  const [searchOptions, setSearchOptions] = useState([]);

  useEffect(() => {
    localStorage.setItem('admin-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleTabChange = (key) => {
    // activeTab is derived from location.pathname — just navigate to the first item
    const firstItem = NAV_GROUPS[key].items[0];
    if (firstItem) navigate(firstItem.key);
  };

  const handleMenuClick = ({ key }) => {
    navigate(key);
  };

  const handleSearch = (value) => {
    if (!value) { setSearchOptions([]); return; }
    const results = [];
    Object.values(NAV_GROUPS).forEach(group => {
      group.items.forEach(item => {
        if (item.label.toLowerCase().includes(value.toLowerCase())) {
          results.push({ value: item.key, label: item.label });
        }
      });
    });
    setSearchOptions(results);
  };

  const handleSearchSelect = (value) => {
    navigate(value);
    setSearchOptions([]);
  };

  const userMenuItems = [
    { key: 'email', label: user?.email || 'Admin', disabled: true },
    { type: 'divider' },
    { key: 'settings', label: 'Settings', icon: <SettingOutlined />, onClick: () => navigate('/admin/settings') },
    { key: 'logout', label: 'Logout', icon: <LogoutOutlined />, danger: true, onClick: logout },
  ];

  const currentSideItems = NAV_GROUPS[activeTab]?.items || [];

  const tabItems = TAB_KEYS.map(key => ({
    key,
    label: (
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {NAV_GROUPS[key].icon}
        <span className="tab-label-text">{NAV_GROUPS[key].label}</span>
      </span>
    ),
  }));

  return (
    <Layout className="admin-root-layout">
      <Header className="admin-top-header">
        <div className="admin-header-left">
          <div className="admin-logo" onClick={() => navigate('/admin/dashboard')}>
            <span className="logo-icon">♔</span>
            <span className="logo-text">ChessHub</span>
          </div>
          <Tabs
            activeKey={activeTab}
            onChange={handleTabChange}
            items={tabItems}
            className="admin-top-tabs"
            size="middle"
          />
        </div>
        <div className="admin-header-right">
          <AutoComplete
            options={searchOptions}
            onSearch={handleSearch}
            onSelect={handleSearchSelect}
            className="admin-global-search"
          >
            <Input
              prefix={<SearchOutlined />}
              placeholder="Search pages..."
              allowClear
              size="middle"
            />
          </AutoComplete>
          <Badge count={0} size="small">
            <BellOutlined className="header-icon-btn" />
          </Badge>
          <Switch
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            checked={isDark}
            onChange={setIsDark}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <Avatar
              icon={<UserOutlined />}
              style={{ cursor: 'pointer', backgroundColor: token.colorPrimary }}
            />
          </Dropdown>
        </div>
      </Header>
      <Layout className="admin-body-layout">
        <Sider
          width={220}
          collapsedWidth={60}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          className="admin-sider"
          breakpoint="lg"
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            items={currentSideItems}
            className="admin-side-menu"
          />
        </Sider>
        <Content className="admin-page-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export { NAV_GROUPS };
// useAdminTheme is in ../theme/useAdminTheme.js
