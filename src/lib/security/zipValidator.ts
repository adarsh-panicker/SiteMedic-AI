import JSZip from "jszip";
import path from "path";

const MAX_DECOMPRESSED_BYTES = parseInt(process.env.UPLOAD_MAX_EXTRACTED_BYTES || "209715200"); // 200MB
const MAX_FILES = parseInt(process.env.UPLOAD_MAX_FILES || "500");

const ALLOWED_EXTENSIONS = new Set([
  ".html", ".htm", ".css", ".js", ".ts", ".tsx", ".jsx",
  ".json", ".xml", ".svg", ".txt", ".md", ".ico",
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif",
  ".woff", ".woff2", ".ttf", ".eot",
]);

const BLOCKED_EXTENSIONS = new Set([
  ".exe", ".dll", ".sh", ".bat", ".cmd", ".ps1",
  ".php", ".py", ".rb", ".pl", ".cgi", ".asp", ".aspx",
  ".jar", ".war", ".ear",
]);

export interface ZipValidationResult {
  valid: boolean;
  error?: string;
  files?: ExtractedFile[];
}

export interface ExtractedFile {
  path: string;
  content: string;
  size: number;
  type: "html" | "css" | "js" | "ts" | "json" | "other";
}

export async function validateAndExtractZip(
  buffer: Buffer
): Promise<ZipValidationResult> {
  let zip: JSZip;

  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return { valid: false, error: "Could not read the ZIP file. Ensure it is a valid ZIP archive." };
  }

  const entries = Object.entries(zip.files);

  // File count check
  const fileEntries = entries.filter(([, f]) => !f.dir);
  if (fileEntries.length > MAX_FILES) {
    return {
      valid: false,
      error: `Archive contains ${fileEntries.length} files, exceeding the limit of ${MAX_FILES}.`,
    };
  }

  const extractedFiles: ExtractedFile[] = [];
  let totalDecompressedBytes = 0;

  for (const [name, file] of entries) {
    // Path traversal check on all entries (files and directories)
    const normalizedPath = path.normalize(name).replace(/\\/g, "/");
    if (
      name.includes("..") ||
      name.startsWith("/") ||
      name.startsWith("\\") ||
      name === "/" ||
      normalizedPath.includes("..") ||
      normalizedPath.startsWith("/") ||
      normalizedPath.includes("://")
    ) {
      return {
        valid: false,
        error: `Archive contains a suspicious path: "${name}". Path traversal is not permitted.`,
      };
    }

    if (file.dir) continue;

    const ext = path.extname(name).toLowerCase();

    // Block dangerous extensions
    if (BLOCKED_EXTENSIONS.has(ext)) {
      return {
        valid: false,
        error: `Archive contains a file with a blocked extension: "${name}".`,
      };
    }

    // Skip binary files we can't analyze as text
    if (!ALLOWED_EXTENSIONS.has(ext) && ext !== "") {
      continue;
    }

    // Decompress and size check
    let content: string;
    try {
      const raw = await file.async("nodebuffer");
      totalDecompressedBytes += raw.length;

      if (totalDecompressedBytes > MAX_DECOMPRESSED_BYTES) {
        return {
          valid: false,
          error: `Archive extracts to more than ${Math.round(MAX_DECOMPRESSED_BYTES / 1024 / 1024)}MB. Please provide a smaller archive.`,
        };
      }

      // Only extract text files for analysis
      if ([".html", ".htm", ".css", ".js", ".ts", ".tsx", ".jsx", ".json", ".xml", ".svg", ".txt", ".md"].includes(ext)) {
        content = raw.toString("utf-8");
      } else {
        continue;
      }
    } catch {
      continue; // Skip files we can't read
    }

    extractedFiles.push({
      path: normalizedPath,
      content,
      size: content.length,
      type: getFileType(ext),
    });
  }

  if (extractedFiles.length === 0) {
    return {
      valid: false,
      error: "The archive contains no supported files (HTML, CSS, JS, TS, JSON).",
    };
  }

  return { valid: true, files: extractedFiles };
}

function getFileType(ext: string): ExtractedFile["type"] {
  switch (ext) {
    case ".html":
    case ".htm": return "html";
    case ".css": return "css";
    case ".js":
    case ".jsx": return "js";
    case ".ts":
    case ".tsx": return "ts";
    case ".json": return "json";
    default: return "other";
  }
}
