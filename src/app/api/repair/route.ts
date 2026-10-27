import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runRepairWorkflow } from "@/lib/agent/repairAgent";
import { isAIConfigured } from "@/lib/ai/nebius";
import { ScanIssue } from "@/lib/types";

const RequestSchema = z.object({
  issueId: z.string(),
  scanId: z.string(),
  issue: z.object({
    id: z.string(),
    ruleId: z.string(),
    title: z.string(),
    category: z.string(),
    severity: z.string(),
    evidence: z.string(),
    impact: z.string(),
    suggestedRepair: z.string(),
    verificationStatus: z.string(),
    affectedFile: z.string().optional(),
    affectedUrl: z.string().optional(),
    lineNumber: z.number().optional(),
    element: z.string().optional(),
  }),
  sourceCode: z.string().optional().default(""),
  additionalContext: z.string().optional(),
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

  const { issue, sourceCode } = parsed.data;
  const filename =
    issue.affectedFile ?? issue.affectedUrl ?? "unknown-file";

  try {
    const report = await runRepairWorkflow(
      issue as ScanIssue,
      sourceCode,
      filename
    );

    return NextResponse.json({
      success: true,
      report,
      aiProvider: isAIConfigured() ? "nvidia-nemotron" : "deterministic-fallback",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Repair workflow failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
