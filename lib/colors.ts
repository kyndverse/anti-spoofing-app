// ─── Full Design Token System ─────────────────────────────────────────────────
// Digunakan di tailwind.config.js dan langsung di StyleSheet (untuk nilai dinamis)

export const palette = {
  // Brand
  primary: "#1687A7",
  primaryDark: "#0F5F7A",
  primaryLight: "#5CB8D4",
  primaryGlow: "rgba(22,135,167,0.25)",

  // Status
  success: "#22C55E",
  successGlow: "rgba(34,197,94,0.25)",
  error: "#EF4444",
  errorGlow: "rgba(239,68,68,0.25)",
  warning: "#F59E0B",
  processing: "#3B82F6",

  // Overlay
  overlayLight: "rgba(255,255,255,0.08)",
  overlayDark: "rgba(0,0,0,0.55)",
};

export const darkColors = {
  bg: "#070D18",
  bgCard: "#0F1A2E",
  bgElevated: "#162035",
  border: "#1E2D45",
  borderFocus: palette.primary,
  textPrimary: "#F1F5F9",
  textSecondary: "#94A3B8",
  textMuted: "#475569",
  tabBar: "#0A1220",
  ...palette,
};

export const lightColors = {
  bg: "#F0F4F8",
  bgCard: "#FFFFFF",
  bgElevated: "#E8EDF4",
  border: "#CBD5E1",
  borderFocus: palette.primary,
  textPrimary: "#0F172A",
  textSecondary: "#475569",
  textMuted: "#94A3B8",
  tabBar: "#FFFFFF",
  ...palette,
};

// Legacy export agar kode lama (tabs/_layout) tidak rusak
export const colors = {
  active: palette.primary,
  inactive: "#276678",
  backgound: "#F6F5F5",
};
