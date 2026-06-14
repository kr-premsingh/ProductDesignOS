export const tokens = {
  color: {
    charcoal: "#0B0F14",
    obsidian: "#111827",
    glass: "#F7F8FA",
    cyan: "#00E5FF",
    magenta: "#FF4DA6",
    lime: "#B6F36A",
    gray: "#9AA3B2",
    line: "rgba(247,248,250,0.14)"
  },
  radius: {
    card: "8px",
    panel: "12px",
    full: "999px"
  },
  spacing: {
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    6: "1.5rem",
    8: "2rem",
    12: "3rem"
  }
} as const;

export type ProductDesignTokens = typeof tokens;
