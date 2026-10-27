import { describe, it, expect } from "vitest";
import * as cheerio from "cheerio";
import {
  checkPageTitle,
  checkMetaDescription,
  checkHeadings,
  checkImageAlt,
  checkLang,
  checkEmptyLinks,
  checkFormLabels,
  checkHtmlDoctype,
} from "@/lib/scanner/rules";

describe("Deterministic Scanner Audit Rules", () => {
  it("detects missing page title", () => {
    const $ = cheerio.load("<html><head></head><body></body></html>");
    const issues = checkPageTitle($, "https://example.com");
    expect(issues.some((i) => i.ruleId === "SEO-001")).toBe(true);
  });

  it("detects title length issues", () => {
    const shortTitle = cheerio.load("<html><head><title>Hi</title></head></html>");
    expect(checkPageTitle(shortTitle, "https://example.com").some((i) => i.ruleId === "SEO-002")).toBe(true);

    const longTitle = cheerio.load(`<html><head><title>${"A".repeat(80)}</title></head></html>`);
    expect(checkPageTitle(longTitle, "https://example.com").some((i) => i.ruleId === "SEO-003")).toBe(true);
  });

  it("detects missing and non-descriptive alt attributes", () => {
    const missingAlt = cheerio.load('<body><img src="/logo.png"></body>');
    const issues = checkImageAlt(missingAlt, "https://example.com");
    expect(issues.some((i) => i.ruleId === "A11Y-001" && i.severity === "critical")).toBe(true);

    const nonDescriptive = cheerio.load('<body><img src="/logo.png" alt="image"></body>');
    expect(checkImageAlt(nonDescriptive, "https://example.com").some((i) => i.ruleId === "A11Y-002")).toBe(true);
  });

  it("detects missing meta description", () => {
    const $ = cheerio.load("<html><head></head></html>");
    const issues = checkMetaDescription($, "https://example.com");
    expect(issues.some((i) => i.ruleId === "SEO-010")).toBe(true);
  });

  it("detects heading structure issues (missing or multiple H1)", () => {
    const noH1 = cheerio.load("<body><h2>Sub</h2></body>");
    expect(checkHeadings(noH1, "https://example.com").some((i) => i.ruleId === "SEO-020")).toBe(true);

    const multiH1 = cheerio.load("<body><h1>First</h1><h1>Second</h1></body>");
    expect(checkHeadings(multiH1, "https://example.com").some((i) => i.ruleId === "SEO-021")).toBe(true);
  });

  it("detects missing html lang attribute", () => {
    const $ = cheerio.load("<html><body></body></html>");
    expect(checkLang($, "https://example.com").some((i) => i.ruleId === "A11Y-010")).toBe(true);

    const withLang = cheerio.load('<html lang="en"><body></body></html>');
    expect(checkLang(withLang, "https://example.com").length).toBe(0);
  });

  it("detects links with no accessible text", () => {
    const $ = cheerio.load('<body><a href="/target"></a></body>');
    const issues = checkEmptyLinks($, "https://example.com");
    expect(issues.some((i) => i.ruleId === "A11Y-020" && i.severity === "critical")).toBe(true);
  });

  it("detects form inputs without associated labels", () => {
    const $ = cheerio.load('<body><input type="email" placeholder="Email"></body>');
    const issues = checkFormLabels($, "https://example.com");
    expect(issues.some((i) => i.ruleId === "A11Y-030" && i.severity === "critical")).toBe(true);
  });

  it("detects missing doctype", () => {
    const noDoctype = "<html><body>Hello</body></html>";
    expect(checkHtmlDoctype(noDoctype, "https://example.com").some((i) => i.ruleId === "HTML-010")).toBe(true);

    const withDoctype = "<!DOCTYPE html><html><body>Hello</body></html>";
    expect(checkHtmlDoctype(withDoctype, "https://example.com").length).toBe(0);
  });
});
