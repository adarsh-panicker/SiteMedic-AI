import { ScanIssue, Severity, IssueCategory, VerificationStatus } from "@/lib/types";
import { generateId } from "@/lib/utils";
import * as cheerio from "cheerio";

export type CheerioDoc = ReturnType<typeof cheerio.load>;

// ============================================================
// Issue factory helpers
// ============================================================

function issue(
  ruleId: string,
  title: string,
  category: IssueCategory,
  severity: Severity,
  evidence: string,
  impact: string,
  suggestedRepair: string,
  verificationStatus: VerificationStatus,
  options: Partial<ScanIssue> = {}
): ScanIssue {
  return {
    id: generateId(),
    ruleId,
    title,
    category,
    severity,
    evidence,
    impact,
    suggestedRepair,
    verificationStatus,
    ...options,
  };
}

// ============================================================
// HTML / SEO rules
// ============================================================

export function checkPageTitle(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const title = $("title").text().trim();

  if (!title) {
    issues.push(
      issue(
        "SEO-001",
        "Missing page title",
        "seo",
        "high",
        `No <title> element found in <head>.`,
        "Page titles appear in browser tabs, bookmarks, and search engine results. Without a title, search engines may generate one automatically, often poorly.",
        "Add a descriptive <title> element inside <head>: <title>Your Page Name | Site Name</title>",
        "confirmed",
        { affectedUrl: url, element: "<head> (no <title> present)" }
      )
    );
  } else if (title.length < 10) {
    issues.push(
      issue(
        "SEO-002",
        "Page title is too short",
        "seo",
        "medium",
        `Title is "${title}" (${title.length} characters). Recommended: 50–60 characters.`,
        "Very short titles miss keyword opportunities and appear truncated in search results.",
        `Expand the title to 50–60 characters: <title>${title} | Your Site Description</title>`,
        "confirmed",
        { affectedUrl: url, element: `<title>${title}</title>` }
      )
    );
  } else if (title.length > 60) {
    issues.push(
      issue(
        "SEO-003",
        "Page title is too long",
        "seo",
        "low",
        `Title is "${title.slice(0, 60)}..." (${title.length} characters). Recommended: 50–60 characters.`,
        "Long titles are truncated in search engine results, reducing click-through rate.",
        "Shorten the title to under 60 characters while keeping important keywords.",
        "confirmed",
        { affectedUrl: url, element: `<title>${title}</title>` }
      )
    );
  }

  return issues;
}

export function checkMetaDescription(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const desc = $('meta[name="description"]').attr("content")?.trim() ?? "";

  if (!desc) {
    issues.push(
      issue(
        "SEO-010",
        "Missing meta description",
        "seo",
        "high",
        `No <meta name="description"> element found.`,
        "Meta descriptions appear in search engine result pages. Without one, search engines may extract text from the page — often unsuitable for users.",
        'Add a <meta name="description" content="..."> element inside <head> with 120–160 characters summarizing the page.',
        "confirmed",
        { affectedUrl: url }
      )
    );
  } else if (desc.length < 70) {
    issues.push(
      issue(
        "SEO-011",
        "Meta description is too short",
        "seo",
        "medium",
        `Meta description: "${desc}" (${desc.length} characters). Recommended: 120–160 characters.`,
        "Short descriptions may be replaced by search engines and fail to engage potential visitors.",
        "Expand the meta description to 120–160 characters.",
        "confirmed",
        { affectedUrl: url, element: `<meta name="description" content="${desc}">` }
      )
    );
  } else if (desc.length > 160) {
    issues.push(
      issue(
        "SEO-012",
        "Meta description is too long",
        "seo",
        "low",
        `Meta description is ${desc.length} characters. Recommended: 120–160 characters.`,
        "Long meta descriptions are truncated in search results.",
        "Shorten the meta description to 160 characters or fewer.",
        "confirmed",
        { affectedUrl: url, element: `<meta name="description" content="${desc.slice(0, 80)}...">` }
      )
    );
  }

  return issues;
}

export function checkHeadings(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const h1s = $("h1");

  if (h1s.length === 0) {
    issues.push(
      issue(
        "SEO-020",
        "Missing H1 heading",
        "seo",
        "high",
        "No <h1> element found on the page.",
        "The H1 element defines the page's main topic. Search engines and screen readers rely on it for context.",
        "Add exactly one <h1> element describing the page's primary content.",
        "confirmed",
        { affectedUrl: url }
      )
    );
  } else if (h1s.length > 1) {
    issues.push(
      issue(
        "SEO-021",
        "Multiple H1 headings",
        "seo",
        "medium",
        `Found ${h1s.length} <h1> elements. Best practice is one per page.`,
        "Multiple H1 elements can confuse search engines about the page's primary topic.",
        "Reduce to one H1 and use H2–H6 for subheadings.",
        "potential",
        { affectedUrl: url }
      )
    );
  }

  return issues;
}

export function checkImageAlt(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];

  $("img").each((_, el) => {
    const src = $(el).attr("src") ?? "";
    const alt = $(el).attr("alt");
    const role = $(el).attr("role");
    const ariaHidden = $(el).attr("aria-hidden");

    // Decorative images with role="presentation" or aria-hidden are fine
    if (role === "presentation" || ariaHidden === "true") return;

    if (alt === undefined) {
      const snippet = `<img src="${src.slice(0, 60)}">`;
      issues.push(
        issue(
          "A11Y-001",
          "Image missing alt attribute",
          "accessibility",
          "critical",
          `<img> element has no alt attribute. Source: ${src || "(no src)"}`,
          "Screen readers cannot convey the image's meaning to users with visual impairments. This also violates WCAG 2.1 Success Criterion 1.1.1 (Non-text Content).",
          'Add an alt attribute describing the image content, or use alt="" for purely decorative images.',
          "confirmed",
          { affectedUrl: url, element: snippet }
        )
      );
    } else if (alt.trim() === "" && role !== "presentation") {
      // Empty alt is acceptable for decorative images, mark as potential
    } else if (["image", "photo", "picture", "img", "icon"].includes(alt.toLowerCase().trim())) {
      issues.push(
        issue(
          "A11Y-002",
          "Image alt text is non-descriptive",
          "accessibility",
          "medium",
          `alt="${alt}" is not a meaningful description.`,
          "Generic alt text like 'image' or 'photo' does not convey the image's meaning to screen reader users.",
          "Replace the alt text with a specific description of what the image shows.",
          "confirmed",
          { affectedUrl: url, element: `<img src="${src.slice(0, 50)}" alt="${alt}">` }
        )
      );
    }
  });

  return issues;
}

export function checkCanonical(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const canonical = $('link[rel="canonical"]').attr("href");

  if (!canonical) {
    issues.push(
      issue(
        "SEO-030",
        "Missing canonical URL",
        "seo",
        "low",
        "No <link rel=\"canonical\"> element found.",
        "Without a canonical URL, search engines may index duplicate versions of the page.",
        'Add <link rel="canonical" href="https://yourdomain.com/page-url"> inside <head>.',
        "potential",
        { affectedUrl: url }
      )
    );
  }

  return issues;
}

export function checkViewport(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const viewport = $('meta[name="viewport"]').attr("content");

  if (!viewport) {
    issues.push(
      issue(
        "HTML-001",
        "Missing viewport meta tag",
        "html-structure",
        "high",
        "No <meta name=\"viewport\"> element found.",
        "Without a viewport meta tag, the page will not be rendered correctly on mobile devices.",
        'Add <meta name="viewport" content="width=device-width, initial-scale=1"> inside <head>.',
        "confirmed",
        { affectedUrl: url }
      )
    );
  }

  return issues;
}

export function checkLang(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const lang = $("html").attr("lang");

  if (!lang) {
    issues.push(
      issue(
        "A11Y-010",
        "Missing lang attribute on <html>",
        "accessibility",
        "high",
        "The <html> element has no lang attribute.",
        "Screen readers rely on the lang attribute to determine the correct pronunciation engine. This violates WCAG 2.1 Success Criterion 3.1.1.",
        'Add a lang attribute to <html>: <html lang="en">',
        "confirmed",
        { affectedUrl: url, element: "<html>" }
      )
    );
  }

  return issues;
}

export function checkOpenGraph(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];
  const ogTitle = $('meta[property="og:title"]').attr("content");
  const ogDesc = $('meta[property="og:description"]').attr("content");
  const ogImage = $('meta[property="og:image"]').attr("content");

  if (!ogTitle || !ogDesc || !ogImage) {
    const missing = [];
    if (!ogTitle) missing.push("og:title");
    if (!ogDesc) missing.push("og:description");
    if (!ogImage) missing.push("og:image");

    issues.push(
      issue(
        "SEO-040",
        "Missing Open Graph metadata",
        "seo",
        "low",
        `Missing Open Graph properties: ${missing.join(", ")}.`,
        "Open Graph metadata controls how the page appears when shared on social media platforms.",
        `Add the missing Open Graph meta tags: ${missing.map(m => `<meta property="${m}" content="...">`).join(", ")}`,
        "confirmed",
        { affectedUrl: url }
      )
    );
  }

  return issues;
}

export function checkEmptyLinks(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();
    const ariaLabel = $(el).attr("aria-label");
    const title = $(el).attr("title");

    if (!text && !ariaLabel && !title) {
      issues.push(
        issue(
          "A11Y-020",
          "Link with no accessible text",
          "accessibility",
          "critical",
          `<a href="${href ?? "#"}"> contains no text, aria-label, or title.`,
          "Screen reader users cannot determine the link's purpose. This violates WCAG 2.1 SC 2.4.4 (Link Purpose).",
          "Add descriptive text inside the link, or add an aria-label attribute.",
          "confirmed",
          { affectedUrl: url, element: `<a href="${href ?? "#"}">...</a>` }
        )
      );
    }
  });

  return issues;
}

export function checkHtmlDoctype(html: string, url: string): ScanIssue[] {
  const issues: ScanIssue[] = [];
  if (!html.trimStart().toLowerCase().startsWith("<!doctype")) {
    issues.push(
      issue(
        "HTML-010",
        "Missing DOCTYPE declaration",
        "html-structure",
        "medium",
        "The HTML document does not start with a <!DOCTYPE html> declaration.",
        "Without a DOCTYPE, browsers render pages in quirks mode, causing inconsistent layout behaviour.",
        "Add <!DOCTYPE html> as the very first line of the HTML document.",
        "confirmed",
        { affectedUrl: url }
      )
    );
  }
  return issues;
}

export function checkFormLabels(
  $: CheerioDoc,
  url: string
): ScanIssue[] {
  const issues: ScanIssue[] = [];

  $("input:not([type='hidden']):not([type='submit']):not([type='button']):not([type='reset'])").each((_, el) => {
    const id = $(el).attr("id");
    const ariaLabel = $(el).attr("aria-label");
    const ariaLabelledBy = $(el).attr("aria-labelledby");
    const type = $(el).attr("type") ?? "text";

    if (!ariaLabel && !ariaLabelledBy) {
      if (!id || $(`label[for="${id}"]`).length === 0) {
        issues.push(
          issue(
            "A11Y-030",
            "Form input missing accessible label",
            "accessibility",
            "critical",
            `<input type="${type}"${id ? ` id="${id}"` : ""}> has no associated <label>, aria-label, or aria-labelledby.`,
            "Screen reader users cannot identify what information to enter in this field. This violates WCAG 2.1 SC 1.3.1 and 3.3.2.",
            'Add a <label for="inputId"> element, or add an aria-label attribute to the input.',
            "confirmed",
            { affectedUrl: url, element: `<input type="${type}"${id ? ` id="${id}"` : ""}>` }
          )
        );
      }
    }
  });

  return issues;
}

// ============================================================
// Health score calculation
// ============================================================

/**
 * Health score formula:
 * Start at 100.
 * Deduct: critical × 15, high × 8, medium × 3, low × 1.
 * Clamp to [0, 100].
 * Bonus: +5 if no critical issues.
 */
export function calculateHealthScore(issues: ScanIssue[]): number {
  let score = 100;

  const critical = issues.filter((i) => i.severity === "critical").length;
  const high = issues.filter((i) => i.severity === "high").length;
  const medium = issues.filter((i) => i.severity === "medium").length;
  const low = issues.filter((i) => i.severity === "low").length;

  score -= critical * 15;
  score -= high * 8;
  score -= medium * 3;
  score -= low * 1;

  if (critical === 0) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}
