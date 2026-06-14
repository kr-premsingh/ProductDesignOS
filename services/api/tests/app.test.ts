import { describe, expect, it } from "vitest";
import { buildApp } from "../src/app";

describe("api", () => {
  it("returns inspire tiles", async () => {
    const app = buildApp();
    const response = await app.inject("/api/inspire?page=1");
    expect(response.statusCode).toBe(200);
    expect(response.json().items).toHaveLength(12);
  });

  it("creates a stub logo job", async () => {
    const app = buildApp();
    const created = await app.inject({
      method: "POST",
      url: "/api/ai/logo",
      payload: {
        name: "Signal Studio",
        personality: "premium vivid calm",
        colorMood: "neon",
        style: "minimal",
        formats: ["svg"]
      }
    });
    expect(created.statusCode).toBe(200);
    const job = await app.inject(`/api/ai/job/${created.json().jobId}`);
    expect(job.json().outputs).toHaveLength(3);
  });
});
