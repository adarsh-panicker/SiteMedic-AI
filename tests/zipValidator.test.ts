import { describe, it, expect } from "vitest";
import JSZip from "jszip";
import { validateAndExtractZip } from "@/lib/security/zipValidator";

describe("ZIP Validator Security & Extraction", () => {
  it("rejects invalid or corrupted ZIP buffer", async () => {
    const invalidBuffer = Buffer.from("not a zip file at all");
    const result = await validateAndExtractZip(invalidBuffer);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Could not read the ZIP file");
  });

  it("extracts valid HTML, CSS, and JS files", async () => {
    const zip = new JSZip();
    zip.file("index.html", "<!DOCTYPE html><html><body><h1>Hello</h1></body></html>");
    zip.file("styles.css", "body { color: red; }");
    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    const result = await validateAndExtractZip(buffer);
    expect(result.valid).toBe(true);
    expect(result.files?.length).toBe(2);
    expect(result.files?.find((f) => f.path === "index.html")?.type).toBe("html");
    expect(result.files?.find((f) => f.path === "styles.css")?.type).toBe("css");
  });

  it("blocks archives containing path traversal attempts", async () => {
    const zip = new JSZip();
    zip.file("../etc/passwd", "malicious payload");
    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    const result = await validateAndExtractZip(buffer);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("suspicious path");
  });

  it("blocks dangerous file extensions like .exe or .sh", async () => {
    const zip = new JSZip();
    zip.file("malware.exe", "binary payload");
    const buffer = await zip.generateAsync({ type: "nodebuffer" });

    const result = await validateAndExtractZip(buffer);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("blocked extension");
  });
});
