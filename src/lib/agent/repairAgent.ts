import { ScanIssue, RepairReport, WorkflowStep, WorkflowStage, WorkflowStatus, ValidationResult, RepairStatus, AIPatch } from "@/lib/types";
import { generateRepair, RepairContext, computeDiff, isAIConfigured } from "@/lib/ai/nebius";
import { generateDeterministicRepair } from "./deterministicRepair";
import { validateHtml } from "@/lib/validation/htmlValidator";

const MAX_ITERATIONS = 2;

// ============================================================
// Agentic repair workflow: Inspect → Diagnose → Plan → Patch → Validate → Revise → Report
// ============================================================

export async function runRepairWorkflow(
  issue: ScanIssue,
  sourceCode: string,
  filename: string
): Promise<RepairReport> {
  const startTime = Date.now();
  const steps: WorkflowStep[] = [];
  let patch: AIPatch | undefined;
  let validationResults: ValidationResult[] = [];
  let finalStatus: RepairStatus = "detected";
  let iterations = 0;

  // ── Stage 1: Inspect ────────────────────────────────────────
  const inspectStep = await runStep("inspect", "Inspect", async () => {
    return `Collected evidence for issue ${issue.ruleId}:\n${issue.evidence}\nSource file: ${filename} (${sourceCode.length} chars)`;
  });
  steps.push(inspectStep);

  // ── Stage 2: Diagnose ───────────────────────────────────────
  const diagnoseStep = await runStep("diagnose", "Diagnose Root Cause", async () => {
    return `Category: ${issue.category} | Severity: ${issue.severity}\nElement: ${issue.element ?? "N/A"}\nImpact: ${issue.impact}`;
  });
  steps.push(diagnoseStep);

  // ── Stage 3: Plan ───────────────────────────────────────────
  const planStep = await runStep("plan", "Generate Repair Plan", async () => {
    return `Plan: Apply minimal patch to ${filename}\nApproach: ${issue.suggestedRepair}\nValidation: HTML validation + rule recheck`;
  });
  steps.push(planStep);

  // ── Stage 4: Patch (with revision loop) ─────────────────────
  let currentSource = sourceCode;
  let lastError = "";

  while (iterations < MAX_ITERATIONS) {
    iterations++;

    const patchStep = await runStep("patch", `Generate Patch (attempt ${iterations})`, async () => {
      if (!isAIConfigured()) {
        patch = generateDeterministicRepair(issue, currentSource, filename);
        return `Deterministic patch generated (fallback mode, confidence: ${patch.confidence})\nChanged files: ${patch.changedFiles.map((f) => f.path).join(", ")}`;
      }

      const context: RepairContext = {
        issue,
        sourceCode: currentSource,
        filename,
        additionalContext: lastError ? `Previous attempt failed validation: ${lastError}` : undefined,
      };

      const result = await generateRepair(context);

      if ("error" in result) {
        throw new Error(result.error);
      }

      patch = result.patch;
      return `NVIDIA Nemotron patch generated (confidence: ${patch.confidence})\nChanged files: ${patch.changedFiles.map((f) => f.path).join(", ")}`;
    });
    steps.push(patchStep);

    if (patchStep.status === "failed") {
      finalStatus = "needs-review";
      break;
    }

    finalStatus = "fix-proposed";

    // ── Stage 5: Validate ────────────────────────────────────────
    const validateStep = await runStep("validate", "Validate Proposed Fix", async () => {
      if (!patch) throw new Error("No patch to validate");

      validationResults = [];

      // HTML validation for each changed file
      for (const changedFile of patch.changedFiles) {
        if (changedFile.path.endsWith(".html") || changedFile.path.endsWith(".htm")) {
          const htmlCheck = await validateHtml(changedFile.patchedContent);
          validationResults.push({
            checkName: `HTML validation (${changedFile.path})`,
            status: htmlCheck.valid ? "passed" : "failed",
            output: htmlCheck.valid
              ? `Valid HTML (${changedFile.patchedContent.split("\n").length} lines)`
              : htmlCheck.errors.join("\n"),
            error: htmlCheck.valid ? undefined : htmlCheck.errors.join("; "),
          });
        }
      }

      // Re-audit the patched file for the targeted rule/element
      if (patch.changedFiles.length > 0) {
        const patchedFile = patch.changedFiles[0];
        const { auditPage } = await import("@/lib/scanner/htmlScanner");
        const remainingIssues = auditPage(patchedFile.patchedContent, `file://${patchedFile.path}`);
        const targetedIssueStillPresent = issue.element
          ? remainingIssues.some((i) => i.ruleId === issue.ruleId && i.element === issue.element)
          : remainingIssues.some((i) => i.ruleId === issue.ruleId);
        const originalRuleFixed = !targetedIssueStillPresent;

        validationResults.push({
          checkName: `Rule check: ${issue.ruleId} (${issue.title})`,
          status: originalRuleFixed ? "passed" : "failed",
          output: originalRuleFixed
            ? "Targeted defect is verified resolved in the patched code"
            : "Targeted issue still present after patch",
        });
      }

      const allPassed = validationResults.every((r) => r.status !== "failed");
      if (!allPassed) {
        lastError = validationResults
          .filter((r) => r.status === "failed")
          .map((r) => r.error ?? r.output ?? r.checkName)
          .join("; ");
        throw new Error(`Validation failed: ${lastError}`);
      }

      return validationResults.map((r) => `${r.checkName}: ${r.status}`).join("\n");
    });
    steps.push(validateStep);

    if (validateStep.status === "passed") {
      finalStatus = "validation-passed";
      break;
    }

    if (iterations >= MAX_ITERATIONS) {
      finalStatus = "validation-failed";
      // Add revise step
      steps.push({
        stage: "revise",
        status: "skipped",
        label: "Revise (max iterations reached)",
        detail: `After ${MAX_ITERATIONS} attempts, validation still fails. Manual review required.`,
      });
      break;
    }

    // Stage 6: Revise
    const reviseStep = await runStep("revise", `Revise Fix (iteration ${iterations})`, async () => {
      return `Retrying with validation error context: ${lastError}`;
    });
    steps.push(reviseStep);

    // Update source for next iteration
    if (patch?.changedFiles?.[0]) {
      currentSource = patch.changedFiles[0].patchedContent;
    }
  }

  // ── Stage 7: Report ──────────────────────────────────────────
  const reportStep = await runStep("report", "Generate Report", async () => {
    const passed = validationResults.filter((r) => r.status === "passed").length;
    const failed = validationResults.filter((r) => r.status === "failed").length;
    return `Report complete. Status: ${finalStatus}\nValidation: ${passed} passed, ${failed} failed\nIterations used: ${iterations}`;
  });
  steps.push(reportStep);

  return {
    issueId: issue.id,
    workflowSteps: steps,
    patch,
    validationResults,
    finalStatus,
    totalDurationMs: Date.now() - startTime,
    iterationsUsed: iterations,
    maxIterations: MAX_ITERATIONS,
  };
}

// ============================================================
// Step runner helper
// ============================================================

async function runStep(
  stage: WorkflowStage,
  label: string,
  fn: () => Promise<string>
): Promise<WorkflowStep> {
  const step: WorkflowStep = {
    stage,
    status: "running",
    label,
    startedAt: new Date(),
  };

  try {
    const output = await fn();
    step.status = "passed";
    step.output = output;
    step.completedAt = new Date();
  } catch (err) {
    step.status = "failed";
    step.error = err instanceof Error ? err.message : String(err);
    step.completedAt = new Date();
  }

  return step;
}
