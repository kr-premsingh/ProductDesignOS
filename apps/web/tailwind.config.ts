import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        charcoal: "#0B0F14",
        glass: "#F7F8FA",
        cyan: "#00E5FF",
        magenta: "#FF4DA6",
        lime: "#B6F36A",
        muted: "#9AA3B2"
      },
      borderRadius: {
        card: "8px",
        panel: "12px"
      },
      boxShadow: {
        glow: "0 0 48px rgba(0, 229, 255, 0.18)"
      }
    }
  },
  plugins: []
};

export default config;
