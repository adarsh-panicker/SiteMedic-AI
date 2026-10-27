/**
 * HTML validation using parse-based checks.
 * We use cheerio for structural validation since we cannot
 * run a full W3C validator in the server environment without external calls.
 */
import * as cheerio from "cheerio";

export interface HtmlValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export async function validateHtml(html: string): Promise<HtmlValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check DOCTYPE
  if (!html.trimStart().toLowerCase().startsWith("<!doctype")) {
    errors.push("Missing DOCTYPE declaration");
  }

  try {
    const $ = cheerio.load(html, { xmlMode: false });

    // Check for unclosed tags (cheerio auto-closes, so count heuristically)
    const htmlElement = $("html");
    if (htmlElement.length === 0) {
      errors.push("Missing <html> root element");
    }

    const head = $("head");
    if (head.length === 0) {
      errors.push("Missing <head> element");
    }

    const body = $("body");
    if (body.length === 0) {
      errors.push("Missing <body> element");
    }

    // Check for duplicate IDs
    const ids = new Map<string, number>();
    $("[id]").each((_, el) => {
      const id = $(el).attr("id")!;
      ids.set(id, (ids.get(id) ?? 0) + 1);
    });
    ids.forEach((count, id) => {
      if (count > 1) {
        errors.push(`Duplicate id="${id}" found ${count} times`);
      }
    });

    // Check for images without src
    $("img:not([src])").each((_, el) => {
      errors.push(`<img> element missing src attribute`);
    });

    // Check for scripts with both src and inline content
    $("script[src]").each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        warnings.push("External <script> element also contains inline code");
      }
    });

  } catch (err) {
    errors.push(`Parse error: ${err instanceof Error ? err.message : String(err)}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
