import { ScanResult } from "@/lib/types";
import { auditPage, buildScanResult } from "./htmlScanner";
import { DEMO_FILES } from "../demo/demoSite";

/**
 * Run the real scanner on the demo website files.
 * This provides a working demo without any API keys.
 */
export async function runDemoScan(): Promise<ScanResult & { demoFiles: typeof DEMO_FILES }> {
  const startedAt = new Date();
  const allIssues = [];

  for (const file of DEMO_FILES) {
    if (file.type === "html") {
      const issues = auditPage(file.content, `demo://${file.path}`);
      for (const issue of issues) {
        issue.affectedFile = file.path;
      }
      allIssues.push(...issues);
    }
  }

  const result = buildScanResult(
    allIssues,
    undefined,
    "demo-website.zip",
    "demo",
    startedAt,
    DEMO_FILES.filter((f) => f.type === "html").length,
    {
      maxPages: DEMO_FILES.filter((f) => f.type === "html").length,
      mode: "demo",
      includedCategories: [
        "accessibility",
        "seo",
        "broken-links",
        "html-structure",
        "css-layout",
        "images",
      ],
      timestamp: startedAt.toISOString(),
    }
  );

  return { ...result, demoFiles: DEMO_FILES };
}
