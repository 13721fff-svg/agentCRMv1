export interface ThemeColors {
  background: string;
  backgroundSecondary: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  borderLight: string;
  primary: string;
  primaryLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
}

export const lightTheme: ThemeColors = {
  background: '#f9fafb',
  backgroundSecondary: '#ffffff',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  primary: '#0284c7',
  primaryLight: '#e0f2fe',
  success: '#16a34a',
  successLight: '#dcfce7',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#8b5cf6',
  infoLight: '#f3e8ff',
};

export const darkTheme: ThemeColors = {
  background: '#111827',
  backgroundSecondary: '#1f2937',
  card: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  borderLight: '#4b5563',
  primary: '#38bdf8',
  primaryLight: '#1e3a5f',
  success: '#4ade80',
  successLight: '#1e3a2a',
  warning: '#fbbf24',
  warningLight: '#3a2e1e',
  error: '#f87171',
  errorLight: '#3a1e1e',
  info: '#a78bfa',
  infoLight: '#2e1e3a',
};

export const getThemeColors = (theme: 'light' | 'dark'): ThemeColors => {
  return theme === 'dark' ? darkTheme : lightTheme;
};

export const getStatusColors = (
  status: string,
  theme: 'light' | 'dark'
): { bg: string; text: string; border: string } => {
  const isLight = theme === 'light';

  const statusMap: Record<string, { bg: string; text: string; border: string }> = {
    pending: {
      bg: isLight ? '#fef3c7' : '#3a2e1e',
      text: isLight ? '#92400e' : '#fbbf24',
      border: isLight ? '#fde047' : '#854d0e',
    },
    in_progress: {
      bg: isLight ? '#dbeafe' : '#1e3a5f',
      text: isLight ? '#1e3a8a' : '#60a5fa',
      border: isLight ? '#93c5fd' : '#1e40af',
    },
    completed: {
      bg: isLight ? '#dcfce7' : '#1e3a2a',
      text: isLight ? '#166534' : '#4ade80',
      border: isLight ? '#86efac' : '#166534',
    },
    cancelled: {
      bg: isLight ? '#fee2e2' : '#3a1e1e',
      text: isLight ? '#991b1b' : '#f87171',
      border: isLight ? '#fca5a5' : '#991b1b',
    },
    confirmed: {
      bg: isLight ? '#dbeafe' : '#1e3a5f',
      text: isLight ? '#1e3a8a' : '#60a5fa',
      border: isLight ? '#93c5fd' : '#1e40af',
    },
    scheduled: {
      bg: isLight ? '#f3e8ff' : '#2e1e3a',
      text: isLight ? '#6b21a8' : '#c084fc',
      border: isLight ? '#d8b4fe' : '#6b21a8',
    },
    active: {
      bg: isLight ? '#dcfce7' : '#1e3a2a',
      text: isLight ? '#166534' : '#4ade80',
      border: isLight ? '#86efac' : '#166534',
    },
    draft: {
      bg: isLight ? '#f3f4f6' : '#374151',
      text: isLight ? '#4b5563' : '#9ca3af',
      border: isLight ? '#d1d5db' : '#6b7280',
    },
  };

  return statusMap[status] || statusMap.draft;
};
