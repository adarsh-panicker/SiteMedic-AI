import { describe, it, expect } from "vitest";
import { calculateHealthScore } from "@/lib/scanner/rules";
import { ScanIssue } from "@/lib/types";

describe("Health Scoring Formula", () => {
  function makeIssue(severity: ScanIssue["severity"]): ScanIssue {
    return {
      id: "test",
      ruleId: "TEST",
      title: "Test Issue",
      category: "accessibility",
      severity,
      evidence: "test",
      impact: "test",
      suggestedRepair: "test",
      verificationStatus: "confirmed",
    };
  }

  it("gives 100 max score (with bonus) for a clean site", () => {
    const score = calculateHealthScore([]);
    expect(score).toBe(100);
  });

  it("penalizes critical issues by 15 points each and eliminates the 0-critical bonus", () => {
    const oneCritical = calculateHealthScore([makeIssue("critical")]);
    // 100 - 15 = 85 (no bonus)
    expect(oneCritical).toBe(85);

    const twoCritical = calculateHealthScore([makeIssue("critical"), makeIssue("critical")]);
    // 100 - 30 = 70
    expect(twoCritical).toBe(70);
  });

  it("penalizes high (8), medium (3), and low (1) severity with 5-point bonus when no critical", () => {
    const oneHigh = calculateHealthScore([makeIssue("high")]);
    // 100 - 8 + 5 = 97
    expect(oneHigh).toBe(97);

    const mixed = calculateHealthScore([
      makeIssue("high"),
      makeIssue("medium"),
      makeIssue("low"),
    ]);
    // 100 - 8 - 3 - 1 + 5 = 93
    expect(mixed).toBe(93);
  });

  it("clamps score between 0 and 100", () => {
    const manyCritical = Array(15).fill(null).map(() => makeIssue("critical"));
    expect(calculateHealthScore(manyCritical)).toBe(0);
  });
});
