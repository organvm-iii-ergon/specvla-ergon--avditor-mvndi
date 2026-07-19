/**
 * Validates a URL is safe for server-side requests (anti-SSRF).
 * Blocks private IPs, loopback, and non-HTTP schemes.
 */
export function validateExternalUrl(input: string): string {
  const trimmedInput = input.trim();
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmedInput) && !/^https?:\/\//i.test(trimmedInput)) {
    throw new Error('Only HTTP(S) URLs are allowed');
  }

  const url = /^https?:\/\//i.test(trimmedInput) ? trimmedInput : `https://${trimmedInput}`;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP(S) URLs are allowed');
  }

  const hostname = parsed.hostname.toLowerCase();
  const bareHostname = hostname.replace(/^\[|\]$/g, '');

  // Block loopback
  if (
    bareHostname === 'localhost' ||
    bareHostname === '127.0.0.1' ||
    bareHostname === '::1' ||
    bareHostname === '0:0:0:0:0:0:0:1' ||
    bareHostname === '0.0.0.0'
  ) {
    throw new Error('Loopback addresses are not allowed');
  }

  // Block private IPv4 ranges
  const ipv4Match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const [, a, b] = ipv4Match.map(Number);
    if (a === 10) throw new Error('Private IP addresses are not allowed');
    if (a === 172 && b >= 16 && b <= 31) throw new Error('Private IP addresses are not allowed');
    if (a === 192 && b === 168) throw new Error('Private IP addresses are not allowed');
    if (a === 169 && b === 254) throw new Error('Link-local addresses are not allowed');
  }

  return parsed.toString();
}
