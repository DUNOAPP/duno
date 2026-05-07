export const darkTheme = {
  background: "#000000",
  surface: "#1C1C1E",
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#6B7280",
  filterPillBg: "#FFFFFF",
  filterPillText: "#000000",
  dropdownBg: "#2C2C2E",
  dropdownBorder: "#3A3A3C",
  dropdownSelectedBg: "#3A3A3C",
  dropdownText: "#FFFFFF",
  dropdownTextDim: "#D1D1D6",
  separator: "#38383A",
  todayCircle: "#E4E2DD",
  todayText: "#000000",
  dayText: "#FFFFFF",
  monthText: "#FFFFFF",
  weekdayText: "#8E8E93",
  chevronColor: "#8E8E93",
  backText: "#FFFFFF",
  backIcon: "#FFFFFF",
  shareIcon: "#FFFFFF",
  datePillBg: "#F2F2F2",
  datePillText: "#1C1C1E",
  cityPillBg: "transparent",
  cityPillBorder: "#FFFFFF",
  cityPillText: "#FFFFFF",
  statusBar: "light" as const,
} as const;

export const lightTheme = {
  background: "#FFFFFF",
  surface: "#F2F2F7",
  text: "#000000",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  filterPillBg: "#000000",
  filterPillText: "#FFFFFF",
  dropdownBg: "#FFFFFF",
  dropdownBorder: "#E5E7EB",
  dropdownSelectedBg: "#F2F2F7",
  dropdownText: "#000000",
  dropdownTextDim: "#6B7280",
  separator: "#E5E7EB",
  todayCircle: "#000000",
  todayText: "#FFFFFF",
  dayText: "#000000",
  monthText: "#000000",
  weekdayText: "#8E8E93",
  chevronColor: "#8E8E93",
  backText: "#000000",
  backIcon: "#000000",
  shareIcon: "#000000",
  datePillBg: "#F2F2F2",
  datePillText: "#1C1C1E",
  cityPillBg: "transparent",
  cityPillBorder: "#000000",
  cityPillText: "#000000",
  statusBar: "dark" as const,
} as const;

export interface AppTheme {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  filterPillBg: string;
  filterPillText: string;
  dropdownBg: string;
  dropdownBorder: string;
  dropdownSelectedBg: string;
  dropdownText: string;
  dropdownTextDim: string;
  separator: string;
  todayCircle: string;
  todayText: string;
  dayText: string;
  monthText: string;
  weekdayText: string;
  chevronColor: string;
  backText: string;
  backIcon: string;
  shareIcon: string;
  datePillBg: string;
  datePillText: string;
  cityPillBg: string;
  cityPillBorder: string;
  cityPillText: string;
  statusBar: "light" | "dark";
}

export function getTheme(isDarkMode: boolean): AppTheme {
  return isDarkMode ? darkTheme : lightTheme;
}
