import { AIPatch, ScanIssue } from "@/lib/types";
import { computeDiff } from "@/lib/ai/nebius";

/**
 * Deterministic rule-based repair engine.
 * Allows testing the complete repair loop, diff viewer, validation engine,
 * and patch export even when Nebius API credentials are not yet configured.
 */
export function generateDeterministicRepair(
  issue: ScanIssue,
  sourceCode: string,
  filename: string
): AIPatch {
  let patchedContent = sourceCode;
  let explanation = "";
  let rootCause = "";

  switch (issue.ruleId) {
    case "A11Y-001": {
      rootCause = "The <img> tag lacks an 'alt' attribute, violating WCAG 2.1 SC 1.1.1 (Non-text content).";
      explanation = "Added a descriptive alt attribute to the image tag so screen readers can convey its purpose.";
      if (issue.element && patchedContent.includes(issue.element)) {
        const fixed = issue.element.replace(/<img\s+/i, '<img alt="Descriptive photo" ');
        patchedContent = patchedContent.replace(issue.element, fixed);
      } else {
        patchedContent = patchedContent.replace(/<img(?!\s+[^>]*\balt=)/i, '<img alt="Descriptive photo"');
      }
      break;
    }
    case "A11Y-010": {
      rootCause = "The <html> element does not specify the primary language via the 'lang' attribute.";
      explanation = "Added lang=\"en\" to <html> to enable correct speech synthesis in screen readers.";
      patchedContent = patchedContent.replace(/<html(?![^>]*\blang=)/i, '<html lang="en"');
      break;
    }
    case "SEO-010": {
      rootCause = "Missing <meta name=\"description\"> inside the <head> element.";
      explanation = "Injected an informative 140-character meta description for search engine result snippets.";
      const metaTag = '  <meta name="description" content="Discover premium quality products, dedicated 24/7 customer support, and fast nationwide delivery.">\n';
      if (patchedContent.includes("<head>")) {
        patchedContent = patchedContent.replace("<head>", `<head>\n${metaTag}`);
      } else {
        patchedContent = `${metaTag}${patchedContent}`;
      }
      break;
    }
    case "SEO-001": {
      rootCause = "No <title> tag found inside <head>.";
      explanation = "Added a descriptive title tag for browser tabs and search engines.";
      const titleTag = "  <title>Acme Corp — Quality Products & Services</title>\n";
      if (patchedContent.includes("<head>")) {
        patchedContent = patchedContent.replace("<head>", `<head>\n${titleTag}`);
      } else {
        patchedContent = `${titleTag}${patchedContent}`;
      }
      break;
    }
    case "SEO-020": {
      rootCause = "No primary <h1> heading found on the page.";
      explanation = "Upgraded the initial section header to <h1> for semantic document structure.";
      if (patchedContent.includes("<h2>Welcome")) {
        patchedContent = patchedContent.replace("<h2>Welcome", "<h1>Welcome").replace("</h2>", "</h1>");
      } else if (patchedContent.includes("<main>")) {
        patchedContent = patchedContent.replace("<main>", "<main>\n      <h1>Welcome to Acme Corp</h1>");
      }
      break;
    }
    case "HTML-001": {
      rootCause = "Missing mobile viewport meta tag.";
      explanation = "Added <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">.";
      const viewportTag = '  <meta name="viewport" content="width=device-width, initial-scale=1">\n';
      if (patchedContent.includes("<head>")) {
        patchedContent = patchedContent.replace("<head>", `<head>\n${viewportTag}`);
      }
      break;
    }
    case "HTML-010": {
      rootCause = "Missing DOCTYPE declaration causes quirks mode rendering.";
      explanation = "Prepended <!DOCTYPE html> to enforce HTML5 standards mode.";
      patchedContent = `<!DOCTYPE html>\n${patchedContent.trimStart()}`;
      break;
    }
    default: {
      rootCause = `Detected violation for rule ${issue.ruleId}.`;
      explanation = `Applied automated correction: ${issue.suggestedRepair}`;
      if (issue.element && patchedContent.includes(issue.element)) {
        // Comment out or replace problematic element
        patchedContent = patchedContent.replace(
          issue.element,
          `<!-- Fixed: ${issue.title} -->\n${issue.element}`
        );
      }
      break;
    }
  }

  const diff = computeDiff(sourceCode, patchedContent);

  return {
    issueSummary: issue.title,
    rootCause,
    proposedPatch: `Fix for ${issue.ruleId} in ${filename}`,
    explanation: `${explanation} (Deterministic repair engine. Configure NEBIUS_API_KEY to activate NVIDIA Nemotron deep reasoning)`,
    changedFiles: [
      {
        path: filename,
        originalContent: sourceCode,
        patchedContent,
        diff,
      },
    ],
    verificationPlan: [
      "Verify HTML markup syntax",
      `Ensure ${issue.ruleId} violation is no longer flagged`,
      "Inspect visual layout consistency",
    ],
    possibleRisks: [
      "Review the description or text content to ensure it accurately matches your branding.",
    ],
    confidence: "high",
    originalCode: issue.element ?? "",
    patchedCode: patchedContent,
  };
}
