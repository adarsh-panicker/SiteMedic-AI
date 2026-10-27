import { describe, it, expect } from "vitest";
import { validateAndResolveUrl, isRedirectSafe } from "@/lib/security/urlValidator";

describe("URL Validator Security (SSRF Protection)", () => {
  it("rejects non-HTTP/HTTPS protocols", async () => {
    const ftp = await validateAndResolveUrl("ftp://example.com/file");
    expect(ftp.valid).toBe(false);

    const file = await validateAndResolveUrl("file:///etc/passwd");
    expect(file.valid).toBe(false);

    const js = await validateAndResolveUrl("javascript:alert(1)");
    expect(js.valid).toBe(false);
  });

  it("blocks localhost and loopback domains", async () => {
    const localhost = await validateAndResolveUrl("http://localhost:3000");
    expect(localhost.valid).toBe(false);

    const ip = await validateAndResolveUrl("http://127.0.0.1:8080");
    expect(ip.valid).toBe(false);
  });

  it("blocks cloud metadata service IP", async () => {
    const metadata = await validateAndResolveUrl("http://169.254.169.254/latest/meta-data");
    expect(metadata.valid).toBe(false);
  });

  it("blocks private RFC 1918 IP addresses", async () => {
    const priv10 = await validateAndResolveUrl("http://10.0.0.1");
    expect(priv10.valid).toBe(false);

    const priv192 = await validateAndResolveUrl("http://192.168.1.1");
    expect(priv192.valid).toBe(false);

    const priv172 = await validateAndResolveUrl("http://172.16.0.1");
    expect(priv172.valid).toBe(false);
  });

  it("blocks sensitive service ports", async () => {
    const sshPort = await validateAndResolveUrl("http://example.com:22");
    expect(sshPort.valid).toBe(false);

    const dbPort = await validateAndResolveUrl("http://example.com:3306");
    expect(dbPort.valid).toBe(false);
  });

  it("allows valid public URLs", async () => {
    const valid = await validateAndResolveUrl("https://example.com");
    expect(valid.valid).toBe(true);
  });

  it("validates redirects safely", () => {
    expect(isRedirectSafe("https://example.com", "https://example.com/about")).toBe(true);
    expect(isRedirectSafe("https://example.com", "http://127.0.0.1")).toBe(false);
    expect(isRedirectSafe("https://example.com", "http://localhost:8080")).toBe(false);
  });
});
