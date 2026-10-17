/**
 * Fixed hex values for chart marks. Recharts renders to SVG presentation
 * attributes, so we use concrete hex (rather than CSS custom properties)
 * for consistent cross-browser rendering. Chosen to sit near the app's
 * primary/success/destructive tokens while keeping sufficient contrast on
 * both light and dark card surfaces.
 */
export const chartColors = {
  primary: "#ca8a04",
  primaryMuted: "#fcd34d",
  success: "#16a34a",
  destructive: "#dc2626",
  grid: "var(--border)",
  axis: "var(--muted-foreground)",
};
