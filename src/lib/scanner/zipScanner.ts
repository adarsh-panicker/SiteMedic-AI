import { ExtractedFile } from "@/lib/security/zipValidator";
import { ScanIssue, ScanResult, ScanMode } from "@/lib/types";
import { auditPage, buildScanResult } from "./htmlScanner";
import { generateId } from "@/lib/utils";

/**
 * Scan extracted ZIP files for issues.
 */
export async function scanZipFiles(
  files: ExtractedFile[],
  filename: string
): Promise<ScanResult> {
  const startedAt = new Date();
  const allIssues: ScanIssue[] = [];

  const htmlFiles = files.filter((f) => f.type === "html");
  const cssFiles = files.filter((f) => f.type === "css");
  const jsFiles = files.filter((f) => f.type === "js" || f.type === "ts");

  // Audit each HTML file
  for (const htmlFile of htmlFiles) {
    const fileUrl = `file://${htmlFile.path}`;
    const issues = auditPage(htmlFile.content, fileUrl);

    // Attach file path info to issues
    for (const issue of issues) {
      issue.affectedFile = htmlFile.path;
      issue.affectedUrl = undefined;
    }

    allIssues.push(...issues);
  }

  // Check for CSS issues
  for (const cssFile of cssFiles) {
    const issues = auditCss(cssFile.content, cssFile.path);
    allIssues.push(...issues);
  }

  // Check internal links between HTML files
  const htmlPaths = new Set(
    htmlFiles.map((f) => f.path.replace(/^\//, "").replace(/\\/g, "/"))
  );

  for (const htmlFile of htmlFiles) {
    const internalLinkIssues = checkInternalLinks(
      htmlFile.content,
      htmlFile.path,
      htmlPaths,
      files
    );
    allIssues.push(...internalLinkIssues);
  }

  return buildScanResult(
    allIssues,
    undefined,
    filename,
    "upload",
    startedAt,
    htmlFiles.length,
    {
      maxPages: htmlFiles.length,
      mode: "upload",
      includedCategories: [
        "accessibility",
        "seo",
        "broken-links",
        "html-structure",
        "css-layout",
        "javascript",
        "images",
        "assets",
      ],
      timestamp: startedAt.toISOString(),
    }
  );
}

function checkInternalLinks(
  html: string,
  filePath: string,
  htmlPaths: Set<string>,
  files: ExtractedFile[]
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const hrefRegex = /href=["']([^"']+)["']/gi;
  const srcRegex = /src=["']([^"']+)["']/gi;

  let match;
  while ((match = hrefRegex.exec(html)) !== null) {
    const href = match[1];
    if (
      href.startsWith("http") ||
      href.startsWith("//") ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      continue;
    }

    // Normalize the path relative to the file
    const normalized = href.split("?")[0].split("#")[0];
    const resolved = resolvePath(filePath, normalized);

    if (!htmlPaths.has(resolved) && !files.find((f) => f.path === resolved)) {
      issues.push({
        id: generateId(),
        ruleId: "LINK-001",
        title: "Broken internal link",
        category: "broken-links",
        severity: "high",
        affectedFile: filePath,
        evidence: `Link href="${href}" resolves to "${resolved}" which was not found in the archive.`,
        impact:
          "Users following this link will encounter a 404 error or broken navigation.",
        suggestedRepair: `Verify that the file "${normalized}" exists and correct the href path, or remove the link.`,
        verificationStatus: "confirmed",
        element: `<a href="${href}">`,
      });
    }
  }

  return issues;
}

function resolvePath(fromFile: string, href: string): string {
  if (href.startsWith("/")) {
    return href.replace(/^\//, "");
  }

  const dir = fromFile.includes("/")
    ? fromFile.slice(0, fromFile.lastIndexOf("/") + 1)
    : "";

  return (dir + href)
    .split("/")
    .reduce((acc: string[], seg) => {
      if (seg === "..") acc.pop();
      else if (seg !== ".") acc.push(seg);
      return acc;
    }, [])
    .join("/");
}

function auditCss(css: string, filePath: string): ScanIssue[] {
  const issues: ScanIssue[] = [];

  // Check for common contrast issues — look for very light text on white or very dark on black
  // This is a heuristic; full contrast calculation needs color parsing
  if (css.includes("color: #fff") && css.includes("background: #fff")) {
    issues.push({
      id: generateId(),
      ruleId: "CSS-001",
      title: "Potential colour contrast issue",
      category: "css-layout",
      severity: "medium",
      affectedFile: filePath,
      evidence: 'Both color: #fff and background: #fff detected — white text on white background.',
      impact: "If white text is rendered on a white background, the content will be invisible.",
      suggestedRepair: "Review the CSS selectors to ensure text and background colours have sufficient contrast ratio (≥4.5:1).",
      verificationStatus: "potential",
      element: "CSS rule",
    });
  }

  // Check for missing media queries (responsive design)
  if (!css.includes("@media") && css.length > 500) {
    issues.push({
      id: generateId(),
      ruleId: "CSS-010",
      title: "No responsive media queries detected",
      category: "css-layout",
      severity: "medium",
      affectedFile: filePath,
      evidence: "The stylesheet contains no @media queries.",
      impact: "The page layout may not adapt to different screen sizes.",
      suggestedRepair: "Add responsive @media queries for mobile, tablet, and desktop breakpoints.",
      verificationStatus: "potential",
    });
  }

  return issues;
}
