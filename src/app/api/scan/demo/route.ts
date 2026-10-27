import { NextResponse } from "next/server";
import { runDemoScan } from "@/lib/scanner/demoScanner";

export async function POST() {
  try {
    const result = await runDemoScan();
    return NextResponse.json({
      success: true,
      result,
      demoFiles: result.demoFiles,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Demo scan failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
