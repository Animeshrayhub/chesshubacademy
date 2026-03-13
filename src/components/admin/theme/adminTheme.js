import { theme } from 'antd';

const commonTokens = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  borderRadius: 8,
  wireframe: false,
};

export const lightTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    ...commonTokens,
    colorPrimary: '#4f46e5',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#3b82f6',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',
    colorBgElevated: '#ffffff',
    colorBorder: '#e5e7eb',
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
  },
  components: {
    Layout: {
      headerBg: '#ffffff',
      siderBg: '#ffffff',
      bodyBg: '#f0f2f5',
      headerHeight: 56,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#eef2ff',
      itemSelectedColor: '#4f46e5',
      itemHoverBg: '#f5f5f5',
      iconSize: 18,
    },
    Table: {
      headerBg: '#fafafa',
      rowHoverBg: '#f5f5ff',
      borderColor: '#f0f0f0',
    },
    Card: {
      paddingLG: 20,
    },
    Button: {
      controlHeight: 36,
    },
  },
};

export const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    ...commonTokens,
    colorPrimary: '#818cf8',
    colorSuccess: '#34d399',
    colorWarning: '#fbbf24',
    colorError: '#f87171',
    colorInfo: '#60a5fa',
    colorBgContainer: '#1f1f1f',
    colorBgLayout: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBorder: '#303030',
    colorText: '#e5e7eb',
    colorTextSecondary: '#9ca3af',
  },
  components: {
    Layout: {
      headerBg: '#1f1f1f',
      siderBg: '#1f1f1f',
      bodyBg: '#141414',
      headerHeight: 56,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: '#312e81',
      itemSelectedColor: '#818cf8',
      itemHoverBg: '#262626',
      iconSize: 18,
    },
    Table: {
      headerBg: '#262626',
      rowHoverBg: '#262626',
      borderColor: '#303030',
    },
    Card: {
      paddingLG: 20,
    },
    Button: {
      controlHeight: 36,
    },
  },
};
