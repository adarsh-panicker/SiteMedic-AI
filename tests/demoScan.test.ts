import { describe, it, expect } from "vitest";
import { runDemoScan } from "@/lib/scanner/demoScanner";

describe("Demo Scan Integration", () => {
  it("scans sample Acme Corp files and returns actual evidence-based findings", async () => {
    const scan = await runDemoScan();
    expect(scan.mode).toBe("demo");
    expect(scan.issues.length).toBeGreaterThan(0);

    // Verify key intentional defects are detected
    const missingAlt = scan.issues.find((i) => i.ruleId === "A11Y-001");
    expect(missingAlt).toBeDefined();
    expect(missingAlt?.category).toBe("accessibility");
    expect(missingAlt?.severity).toBe("critical");
    expect(missingAlt?.evidence).toContain("alt attribute");

    const missingMetaDesc = scan.issues.find((i) => i.ruleId === "SEO-010");
    expect(missingMetaDesc).toBeDefined();
    expect(missingMetaDesc?.category).toBe("seo");

    const missingLang = scan.issues.find((i) => i.ruleId === "A11Y-010");
    expect(missingLang).toBeDefined();

    expect(scan.healthScore).toBeLessThan(100);
    expect(scan.healthScore).toBeGreaterThanOrEqual(0);
    expect(scan.demoFiles.length).toBeGreaterThan(0);
  });
});
