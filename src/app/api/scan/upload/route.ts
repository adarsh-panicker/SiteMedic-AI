import { NextRequest, NextResponse } from "next/server";
import { validateAndExtractZip } from "@/lib/security/zipValidator";
import { scanZipFiles } from "@/lib/scanner/zipScanner";

const MAX_UPLOAD_BYTES = parseInt(process.env.UPLOAD_MAX_BYTES ?? "52428800"); // 50MB

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { success: false, error: "Expected multipart/form-data upload" },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { success: false, error: "Could not parse form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, error: "No file uploaded. Send a ZIP file in the 'file' field." },
      { status: 400 }
    );
  }

  if (!file.name.endsWith(".zip")) {
    return NextResponse.json(
      { success: false, error: "Only ZIP archives are supported." },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    const limitMB = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);
    return NextResponse.json(
      { success: false, error: `File is too large. Maximum upload size is ${limitMB}MB.` },
      { status: 413 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const zipResult = await validateAndExtractZip(buffer);
  if (!zipResult.valid || !zipResult.files) {
    return NextResponse.json(
      { success: false, error: zipResult.error },
      { status: 422 }
    );
  }

  const result = await scanZipFiles(zipResult.files, file.name);

  return NextResponse.json({ success: true, result });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
