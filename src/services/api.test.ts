import { describe, it, expect } from "vitest";

describe("api module", () => {
  it("exports api client", async () => {
    const mod = await import("./api");
    expect(mod.api).toBeDefined();
  });
});
