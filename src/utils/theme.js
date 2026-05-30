import { Platform } from 'react-native';

export const COLORS = {
  primary: '#EA580C',
  primaryDark: '#C2410C',
  primaryLight: '#FB923C',
  accent: '#F97316',
  accentMuted: '#FFEDD5',
  secondary: '#FFF7ED',
  white: '#FFFFFF',
  black: '#0F172A',
  background: '#F1F5F9',
  backgroundWarm: '#FFFBF7',
  backgroundLight: '#FFF7ED',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textOnPrimary: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  error: '#DC2626',
  errorBg: '#FEF2F2',
  success: '#16A34A',
  successBg: '#F0FDF4',
  warning: '#D97706',
  warningBg: '#FFFBEB',
  info: '#2563EB',
  infoBg: '#EFF6FF',
  overlay: 'rgba(15, 23, 42, 0.45)',
  heroGlow: 'rgba(255, 255, 255, 0.12)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const TYPOGRAPHY = {
  hero: { fontSize: 32, fontWeight: '800', lineHeight: 38, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '700', lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', lineHeight: 26 },
  h3: { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '600', lineHeight: 14, letterSpacing: 0.6 },
  label: { fontSize: 12, fontWeight: '600', lineHeight: 16, letterSpacing: 0.4 },
};

const shadowColor = COLORS.black;

export const SHADOWS = {
  sm: Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: { elevation: 2 },
    default: {},
  }),
  md: Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 4 },
    default: {},
  }),
  lg: Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
    },
    android: { elevation: 8 },
    default: {},
  }),
};

export const STATUS_COLORS = {
  PENDING: { bg: COLORS.warningBg, text: COLORS.warning, border: '#FDE68A' },
  APPROVED: { bg: COLORS.successBg, text: COLORS.success, border: '#BBF7D0' },
  REJECTED: { bg: COLORS.errorBg, text: COLORS.error, border: '#FECACA' },
  PAID: { bg: COLORS.successBg, text: COLORS.success, border: '#BBF7D0' },
  COMPLETED: { bg: COLORS.successBg, text: COLORS.success, border: '#BBF7D0' },
  CANCELLED: { bg: COLORS.errorBg, text: COLORS.error, border: '#FECACA' },
  CONFIRMED: { bg: COLORS.infoBg, text: COLORS.info, border: '#BFDBFE' },
  SCHEDULED: { bg: COLORS.infoBg, text: COLORS.info, border: '#BFDBFE' },
  default: { bg: COLORS.background, text: COLORS.textSecondary, border: COLORS.border },
};

export const getStatusColors = status => {
  const key = String(status || '').toUpperCase();
  return STATUS_COLORS[key] || STATUS_COLORS.default;
};
