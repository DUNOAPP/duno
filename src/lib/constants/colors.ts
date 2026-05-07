// Fallback colors - used when API data hasn't loaded yet
export const DANCE_STYLE_COLORS_FALLBACK: Record<string, string> = {
  Salsa: "#FF6B6B",
  Bachata: "#2AB7CA",
  Kizomba: "#FF8C42",
};

// Calendar and UI colors
export const UI_COLORS = {
  currentDay: "#E4E2DD", // Today circle color
  allStyles: "#4B5563",  // Gray for "All Styles"
} as const;
