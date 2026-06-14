import { describe, expect, it } from "vitest";
import { createStubAdapter } from "../src";

describe("stub logo adapter", () => {
  it("returns three deterministic-style logo variants", async () => {
    const adapter = createStubAdapter();
    const variants = await adapter.generateLogo({
      name: "ProductDesignOS",
      personality: "premium curious human",
      colorMood: "neon",
      style: "minimal",
      formats: ["svg"]
    });

    expect(variants).toHaveLength(3);
    expect(variants[0].svg).toContain("<svg");
  });
});
