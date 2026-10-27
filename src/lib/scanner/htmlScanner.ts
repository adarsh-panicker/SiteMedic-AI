import * as cheerio from "cheerio";
import {
  ScanIssue,
  ScanResult,
  ScanSummary,
  ScanConfig,
  ScanMode,
} from "@/lib/types";
import {
  checkPageTitle,
  checkMetaDescription,
  checkHeadings,
  checkImageAlt,
  checkCanonical,
  checkViewport,
  checkLang,
  checkOpenGraph,
  checkEmptyLinks,
  checkHtmlDoctype,
  checkFormLabels,
  calculateHealthScore,
} from "./rules";
import { generateId, formatDuration } from "@/lib/utils";

export interface ScanPageResult {
  url: string;
  html: string;
  issues: ScanIssue[];
}

/**
 * Run all deterministic HTML audit rules on a parsed page.
 */
export function auditPage(html: string, url: string): ScanIssue[] {
  const $ = cheerio.load(html);
  const issues: ScanIssue[] = [];

  issues.push(...checkHtmlDoctype(html, url));
  issues.push(...checkPageTitle($, url));
  issues.push(...checkMetaDescription($, url));
  issues.push(...checkHeadings($, url));
  issues.push(...checkImageAlt($, url));
  issues.push(...checkCanonical($, url));
  issues.push(...checkViewport($, url));
  issues.push(...checkLang($, url));
  issues.push(...checkOpenGraph($, url));
  issues.push(...checkEmptyLinks($, url));
  issues.push(...checkFormLabels($, url));

  return issues;
}

/**
 * Extract internal links from a page for crawling.
 */
export function extractInternalLinks(
  html: string,
  baseUrl: string,
  maxLinks = 50
): string[] {
  const $ = cheerio.load(html);
  const base = new URL(baseUrl);
  const links = new Set<string>();

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    try {
      const resolved = new URL(href, baseUrl);
      // Only same-origin links
      if (resolved.origin === base.origin) {
        // Remove hash fragments
        resolved.hash = "";
        // Only HTML pages (no file downloads)
        const path = resolved.pathname;
        if (
          path.endsWith("/") ||
          !path.includes(".") ||
          path.endsWith(".html") ||
          path.endsWith(".htm")
        ) {
          links.add(resolved.toString());
        }
      }
    } catch {
      // Ignore invalid URLs
    }

    if (links.size >= maxLinks) return false;
  });

  return Array.from(links);
}

/**
 * Build a ScanResult from collected issues.
 */
export function buildScanResult(
  issues: ScanIssue[],
  url: string | undefined,
  filename: string | undefined,
  mode: ScanMode,
  startedAt: Date,
  pagesScanned: number,
  config: ScanConfig
): ScanResult {
  const completedAt = new Date();
  const healthScore = calculateHealthScore(issues);

  const summary: ScanSummary = {
    total: issues.length,
    critical: issues.filter((i) => i.severity === "critical").length,
    high: issues.filter((i) => i.severity === "high").length,
    medium: issues.filter((i) => i.severity === "medium").length,
    low: issues.filter((i) => i.severity === "low").length,
    passed: 0,
    accessibility: issues.filter((i) => i.category === "accessibility").length,
    seo: issues.filter((i) => i.category === "seo").length,
    brokenLinks: issues.filter((i) => i.category === "broken-links").length,
    javascript: issues.filter((i) => i.category === "javascript").length,
    performance: issues.filter((i) => i.category === "performance").length,
    security: issues.filter((i) => i.category === "security").length,
  };

  return {
    id: generateId(),
    url,
    filename,
    mode,
    startedAt,
    completedAt,
    durationMs: completedAt.getTime() - startedAt.getTime(),
    pagesScanned,
    issues,
    healthScore,
    summary,
    config,
  };
}

/**
 * Fetch a URL safely with limits.
 */
export async function fetchPage(
  url: string,
  timeoutMs = 15000
): Promise<{ html: string; finalUrl: string; status: number } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "SiteMedic-AI/1.0 (Website Auditor; +https://github.com/sitemedic-ai/sitemedic)",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    clearTimeout(timer);

    // Size limit: 5MB
    const contentLength = res.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
      return null;
    }

    const html = await res.text();
    if (html.length > 5 * 1024 * 1024) return null;

    return {
      html,
      finalUrl: res.url,
      status: res.status,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Check if a link returns a 2xx response.
 */
export async function checkLinkStatus(
  url: string,
  timeoutMs = 10000
): Promise<{ ok: boolean; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "SiteMedic-AI/1.0",
      },
      redirect: "follow",
    });
    clearTimeout(timer);
    return { ok: res.ok, status: res.status };
  } catch {
    clearTimeout(timer);
    return { ok: false, status: 0 };
  }
}
