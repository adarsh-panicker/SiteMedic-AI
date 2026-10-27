// ============================================================
// Core domain types for SiteMedic AI
// ============================================================

export type ScanMode = "url" | "upload" | "demo";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type IssueCategory =
  | "accessibility"
  | "seo"
  | "broken-links"
  | "html-structure"
  | "css-layout"
  | "javascript"
  | "performance"
  | "security"
  | "images"
  | "assets";

export type VerificationStatus =
  | "confirmed"
  | "potential"
  | "could-not-verify"
  | "passed";

export type RepairStatus =
  | "detected"
  | "fix-proposed"
  | "validation-passed"
  | "validation-failed"
  | "needs-review"
  | "approved"
  | "exported";

export interface ScanIssue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: Severity;
  affectedUrl?: string;
  affectedFile?: string;
  lineNumber?: number;
  columnNumber?: number;
  evidence: string;
  impact: string;
  suggestedRepair: string;
  verificationStatus: VerificationStatus;
  element?: string;          // The problematic HTML element/snippet
  context?: string;          // Surrounding code context
  ruleId: string;
  repairStatus?: RepairStatus;
  proposedPatch?: AIPatch;
  checkedAt?: Date;
}

export interface ScanResult {
  id: string;
  url?: string;
  filename?: string;
  mode: ScanMode;
  startedAt: Date;
  completedAt: Date;
  durationMs: number;
  pagesScanned: number;
  issues: ScanIssue[];
  healthScore: number;
  summary: ScanSummary;
  config: ScanConfig;
}

export interface ScanSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  passed: number;
  accessibility: number;
  seo: number;
  brokenLinks: number;
  javascript: number;
  performance: number;
  security: number;
}

export interface ScanConfig {
  maxPages: number;
  mode: ScanMode;
  includedCategories: IssueCategory[];
  timestamp: string;
}

// ============================================================
// AI Repair types
// ============================================================

export interface AIPatch {
  issueSummary: string;
  rootCause: string;
  proposedPatch: string;         // The minimal code change
  explanation: string;
  changedFiles: ChangedFile[];
  verificationPlan: string[];
  possibleRisks: string[];
  confidence: "high" | "medium" | "low";
  originalCode?: string;
  patchedCode?: string;
}

export interface ChangedFile {
  path: string;
  originalContent: string;
  patchedContent: string;
  diff: DiffLine[];
}

export interface DiffLine {
  type: "added" | "removed" | "unchanged";
  lineNumber: number;
  content: string;
}

// ============================================================
// Repair workflow types
// ============================================================

export type WorkflowStage =
  | "inspect"
  | "diagnose"
  | "plan"
  | "patch"
  | "validate"
  | "revise"
  | "report";

export type WorkflowStatus = "pending" | "running" | "passed" | "failed" | "skipped";

export interface WorkflowStep {
  stage: WorkflowStage;
  status: WorkflowStatus;
  label: string;
  detail?: string;
  startedAt?: Date;
  completedAt?: Date;
  output?: string;
  error?: string;
}

export interface RepairReport {
  issueId: string;
  workflowSteps: WorkflowStep[];
  patch?: AIPatch;
  validationResults: ValidationResult[];
  finalStatus: RepairStatus;
  totalDurationMs: number;
  iterationsUsed: number;
  maxIterations: number;
}

export interface ValidationResult {
  checkName: string;
  status: "passed" | "failed" | "skipped" | "not-applicable";
  output?: string;
  error?: string;
}

// ============================================================
// API request/response types
// ============================================================

export interface ScanUrlRequest {
  url: string;
  maxPages?: number;
}

export interface ScanUrlResponse {
  success: boolean;
  result?: ScanResult;
  error?: string;
}

export interface RepairRequest {
  issueId: string;
  scanId: string;
  issue: ScanIssue;
  sourceCode?: string;
  additionalContext?: string;
}

export interface RepairResponse {
  success: boolean;
  report?: RepairReport;
  error?: string;
}

export interface DemoScanResponse {
  success: boolean;
  result?: ScanResult;
  demoFiles?: DemoFile[];
  error?: string;
}

export interface DemoFile {
  path: string;
  content: string;
  type: "html" | "css" | "js";
}
