export const tokens = {
  color: {
    charcoal: "#0B0F14",
    obsidian: "#111827",
    glass: "#F7F8FA",
    cyan: "#00E5FF",
    magenta: "#FF4DA6",
    lime: "#B6F36A",
    gray: "#9AA3B2",
    line: "rgba(247,248,250,0.14)",
    // editorial landing-page layer (docs/11-brand-and-visual-identity.md)
    paper: "#F5F1EA",
    ink: "#14110D",
    // per-category accent palette, one entry per Category row
    accent: {
      branding: "#00E5FF",
      apparel: "#FF4DA6",
      invitations: "#E8B23A",
      decor: "#7FA37A",
      tattoo: "#B6F36A"
    }
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
