# SiteMedic AI — Reproducible Demo Sample Website

This directory contains two versions of the sample website "Acme Corp":

1. `sample-site/`: Intentionally contains documented defects across Accessibility, SEO, HTML structure, and Broken Links for reproducible audit and repair demonstrations.
2. `clean-reference/`: The fully repaired, clean baseline version for side-by-side comparison.

---

## Documented Issues in `sample-site/`

### 1. Missing Image Alternative Text (`A11Y-001`, Severity: Critical)
- **Location:** `sample-site/index.html`
- **Evidence:** `<img src="/images/hero.jpg">` and `<img src="/images/team.jpg">` lack `alt` attributes.
- **Impact:** Screen readers cannot convey the image's purpose (WCAG 2.1 SC 1.1.1).
- **Repaired in:** `clean-reference/index.html` with meaningful alt text.

### 2. Missing Meta Description (`SEO-010`, Severity: High)
- **Location:** `sample-site/index.html`
- **Evidence:** No `<meta name="description">` inside `<head>`.
- **Impact:** Search engine result snippets are randomly populated or empty.
- **Repaired in:** `clean-reference/index.html` with an optimized 120-160 character description.

### 3. Missing DOCTYPE and `lang` Attribute (`HTML-010`, `A11Y-010`, Severity: High)
- **Location:** `sample-site/about.html` and `sample-site/index.html`
- **Evidence:** Missing `<!DOCTYPE html>` or `lang="en"`.
- **Impact:** Browsers run in quirks mode; screen readers fail to select the correct speech synthesizer.

### 4. Broken Internal Link (`LINK-001`, Severity: High)
- **Location:** `sample-site/about.html`
- **Evidence:** `<a href="mission-statement.html">` points to a non-existent document.
- **Impact:** Users hit a 404 dead end.
- **Repaired in:** `clean-reference/about.html` with updated destination.

### 5. Color Contrast Issue (`CSS-001`, Severity: Medium)
- **Location:** `sample-site/styles.css`
- **Evidence:** `.hero { color: #fff; background-color: #fff; }` (white text on white background).
- **Impact:** Content is invisible to users.
- **Repaired in:** `clean-reference/styles.css` with dark navy background `#0a1628`.
