export type LogoPayload = {
  name: string;
  personality: string;
  colorMood: string;
  style: "minimal" | "geometric" | "hand-drawn";
  formats: Array<"svg" | "png">;
};

export type LogoVariant = {
  id: string;
  title: string;
  rationale: string;
  colors: string[];
  svg: string;
};

export type AIAdapter = {
  generateLogo(payload: LogoPayload): Promise<LogoVariant[]>;
  generateVariants(jobId: string): Promise<LogoVariant[]>;
};

const palettes: Record<string, string[]> = {
  neon: ["#00E5FF", "#FF4DA6", "#0B0F14"],
  calm: ["#A7F3D0", "#93C5FD", "#111827"],
  luxe: ["#F7C948", "#F7F8FA", "#0B0F14"],
  mono: ["#F7F8FA", "#9AA3B2", "#0B0F14"]
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PD";
}

function variantSvg(payload: LogoPayload, index: number, colors: string[]) {
  const label = initials(payload.name);
  const shape = payload.style === "geometric" ? "polygon" : payload.style === "hand-drawn" ? "path" : "circle";
  const accent = colors[index % colors.length];
  const secondary = colors[(index + 1) % colors.length];
  const organicPath = `M70 22 C98 18 126 42 122 72 C119 103 91 127 58 118 C27 109 18 79 31 50 C39 32 51 25 70 22`;
  const mark =
    shape === "polygon"
      ? `<polygon points="72,14 125,45 112,112 42,124 18,58" fill="${accent}" opacity="0.92"/>`
      : shape === "path"
        ? `<path d="${organicPath}" fill="${accent}" opacity="0.88"/>`
        : `<circle cx="72" cy="72" r="54" fill="${accent}" opacity="0.9"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 144 144" role="img" aria-label="${payload.name} logo variant ${index + 1}">
  <rect width="144" height="144" rx="24" fill="#0B0F14"/>
  ${mark}
  <circle cx="${34 + index * 12}" cy="${32 + index * 8}" r="14" fill="${secondary}" opacity="0.78"/>
  <text x="72" y="83" text-anchor="middle" fill="#F7F8FA" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="800">${label}</text>
</svg>`;
}

export function createStubAdapter(): AIAdapter {
  return {
    async generateLogo(payload) {
      const colors = palettes[payload.colorMood] ?? palettes.neon;
      return [0, 1, 2].map((index) => ({
        id: `stub-${Date.now()}-${index}`,
        title: ["Signal Mark", "Orbit Badge", "Signature Glyph"][index],
        rationale: `${payload.personality || "distinct"} energy translated into a ${payload.style} identity system.`,
        colors,
        svg: variantSvg(payload, index, colors)
      }));
    },
    async generateVariants(jobId) {
      return this.generateLogo({
        name: jobId.slice(0, 8),
        personality: "curious premium vivid",
        colorMood: "neon",
        style: "minimal",
        formats: ["svg"]
      });
    }
  };
}

export function createOpenAIAdapter(): AIAdapter {
  return createStubAdapter();
}

export function createClaudeAdapter(): AIAdapter {
  return createStubAdapter();
}

export function createAIAdapter(provider = "stub"): AIAdapter {
  if (provider === "openai") return createOpenAIAdapter();
  if (provider === "claude") return createClaudeAdapter();
  return createStubAdapter();
}
