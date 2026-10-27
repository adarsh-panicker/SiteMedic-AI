import { z } from "zod";
import dns from "dns/promises";

// Private/reserved IP ranges that should never be accessed
const BLOCKED_RANGES = [
  /^127\./,                           // Loopback
  /^10\./,                            // RFC 1918
  /^172\.(1[6-9]|2\d|3[01])\./,      // RFC 1918
  /^192\.168\./,                      // RFC 1918
  /^169\.254\./,                      // Link-local
  /^0\./,                             // Current network
  /^255\./,                           // Broadcast
  /^::1$/,                            // IPv6 loopback
  /^fc00:/,                           // IPv6 unique local
  /^fd[0-9a-f]{2}:/,                 // IPv6 unique local
  /^fe80:/,                           // IPv6 link-local
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // RFC 6598 shared
  /^192\.0\.[02]\./,                  // IETF protocol
  /^198\.(1[89])\./,                  // RFC 2544
  /^198\.51\.100\./,                  // Documentation
  /^203\.0\.113\./,                   // Documentation
  /^240\./,                           // Reserved
];

const BLOCKED_HOSTNAMES = [
  "localhost",
  "metadata.google.internal",
  "169.254.169.254",  // AWS/GCP metadata
  "instance-data",
  "metadata",
];

export const urlSchema = z.string().url().refine(
  (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  },
  { message: "Only HTTP and HTTPS URLs are allowed" }
);

export async function validateAndResolveUrl(rawUrl: string): Promise<{
  valid: boolean;
  url?: URL;
  error?: string;
}> {
  // Parse and validate URL structure
  const parsed = urlSchema.safeParse(rawUrl);
  if (!parsed.success) {
    return { valid: false, error: "Invalid URL format. Only HTTP/HTTPS URLs are accepted." };
  }

  let url: URL;
  try {
    url = new URL(parsed.data);
  } catch {
    return { valid: false, error: "Could not parse URL." };
  }

  // Reject localhost and known blocked hostnames
  const hostname = url.hostname.toLowerCase();
  if (BLOCKED_HOSTNAMES.includes(hostname)) {
    return { valid: false, error: "Access to this hostname is not permitted." };
  }

  // Reject numeric IP addresses directly
  if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
    if (isBlockedIp(hostname)) {
      return { valid: false, error: "Access to private or reserved IP addresses is not permitted." };
    }
  }

  // Resolve hostname and check all resolved IPs
  try {
    const addresses = await dns.resolve4(hostname).catch(() => [] as string[]);
    const addresses6 = await dns.resolve6(hostname).catch(() => [] as string[]);
    const allAddresses = [...addresses, ...addresses6];

    for (const addr of allAddresses) {
      if (isBlockedIp(addr)) {
        return {
          valid: false,
          error: `The hostname "${hostname}" resolves to a private or reserved address.`,
        };
      }
    }
  } catch {
    // DNS resolution failed — still allow the request, the fetch will fail naturally
  }

  // Reject non-standard ports that could indicate internal services
  const port = url.port ? parseInt(url.port) : (url.protocol === "https:" ? 443 : 80);
  const blockedPorts = [22, 23, 25, 53, 110, 143, 389, 636, 3306, 5432, 6379, 27017];
  if (blockedPorts.includes(port)) {
    return { valid: false, error: `Port ${port} is not permitted for website scanning.` };
  }

  return { valid: true, url };
}

function isBlockedIp(ip: string): boolean {
  return BLOCKED_RANGES.some((pattern) => pattern.test(ip));
}

export function isRedirectSafe(originalUrl: string, redirectUrl: string): boolean {
  try {
    const original = new URL(originalUrl);
    const redirect = new URL(redirectUrl);

    // Only allow http/https
    if (!["http:", "https:"].includes(redirect.protocol)) return false;

    // Block redirects to private ranges
    const host = redirect.hostname;
    if (BLOCKED_HOSTNAMES.includes(host.toLowerCase())) return false;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isBlockedIp(host)) return false;

    return true;
  } catch {
    return false;
  }
}
