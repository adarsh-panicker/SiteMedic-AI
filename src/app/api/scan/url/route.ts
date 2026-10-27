import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { validateAndResolveUrl } from "@/lib/security/urlValidator";
import { fetchPage, auditPage, extractInternalLinks, buildScanResult } from "@/lib/scanner/htmlScanner";
import { ScanIssue } from "@/lib/types";

const MAX_PAGES = parseInt(process.env.SCAN_MAX_PAGES ?? "10");

const RequestSchema = z.object({
  url: z.string().url(),
  maxPages: z.number().int().min(1).max(20).optional().default(5),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 }
    );
  }

  const { url, maxPages } = parsed.data;
  const effectiveMaxPages = Math.min(maxPages, MAX_PAGES);

  // Security: validate and resolve URL
  const validation = await validateAndResolveUrl(url);
  if (!validation.valid) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 422 }
    );
  }

  const startedAt = new Date();
  const allIssues: ScanIssue[] = [];
  const visitedUrls = new Set<string>();
  const urlQueue = [url];

  while (urlQueue.length > 0 && visitedUrls.size < effectiveMaxPages) {
    const currentUrl = urlQueue.shift()!;
    if (visitedUrls.has(currentUrl)) continue;
    visitedUrls.add(currentUrl);

    const page = await fetchPage(currentUrl);
    if (!page) continue;

    const issues = auditPage(page.html, page.finalUrl);
    allIssues.push(...issues);

    // Add internal links for crawling (only if we have pages left)
    if (visitedUrls.size < effectiveMaxPages) {
      const links = extractInternalLinks(page.html, page.finalUrl, 20);
      for (const link of links) {
        if (!visitedUrls.has(link)) {
          // Security: validate redirect destination
          const linkValidation = await validateAndResolveUrl(link).catch(() => ({ valid: false }));
          if (linkValidation.valid) {
            urlQueue.push(link);
          }
        }
      }
    }
  }

  const result = buildScanResult(
    allIssues,
    url,
    undefined,
    "url",
    startedAt,
    visitedUrls.size,
    {
      maxPages: effectiveMaxPages,
      mode: "url",
      includedCategories: ["accessibility", "seo", "broken-links", "html-structure", "images"],
      timestamp: startedAt.toISOString(),
    }
  );

  return NextResponse.json({ success: true, result });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
