import { describe, it, expect } from "vitest";
import { computeDiff } from "@/lib/ai/nebius";
import { validateHtml } from "@/lib/validation/htmlValidator";

describe("Diff Computation & HTML Validation", () => {
  it("computes added, removed, and unchanged lines correctly", () => {
    const original = `<html>\n<body>\n<img src="/img.jpg">\n</body>\n</html>`;
    const patched = `<html>\n<body>\n<img src="/img.jpg" alt="Team photo">\n</body>\n</html>`;

    const diff = computeDiff(original, patched);
    expect(diff.some((d) => d.type === "removed" && d.content.includes('<img src="/img.jpg">'))).toBe(true);
    expect(diff.some((d) => d.type === "added" && d.content.includes('alt="Team photo"'))).toBe(true);
    expect(diff.some((d) => d.type === "unchanged" && d.content === "<html>")).toBe(true);
  });

  it("validates HTML structure and identifies issues", async () => {
    const invalidHtml = `<html><body><div id="duplicate">1</div><div id="duplicate">2</div><img alt="no src"></body></html>`;
    const res = await validateHtml(invalidHtml);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("Duplicate id"))).toBe(true);
    expect(res.errors.some((e) => e.includes("missing src"))).toBe(true);
  });

  it("passes valid complete HTML", async () => {
    const validHtml = `<!DOCTYPE html><html lang="en"><head><title>Test</title></head><body><h1>Heading</h1></body></html>`;
    const res = await validateHtml(validHtml);
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });
});
