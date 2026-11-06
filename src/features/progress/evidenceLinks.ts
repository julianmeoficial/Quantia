export interface EvidenceLink {
  href: string;
  label: string;
}

/**
 * Turns the free-form links stored on a progress entry into safe, clickable ones.
 * Adds `https://` to bare domains («drive.google.com/…») and drops anything that is not http(s).
 */
export function normalizeEvidenceHref(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".") && url.hostname !== "localhost") return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function evidenceLinksOf(links: readonly string[]): EvidenceLink[] {
  const seen = new Set<string>();
  const result: EvidenceLink[] = [];
  for (const raw of links) {
    const href = normalizeEvidenceHref(raw);
    if (!href || seen.has(href)) continue;
    seen.add(href);
    result.push({ href, label: "" });
  }
  const many = result.length > 1;
  return result.map((link, index) => ({
    href: link.href,
    label: many ? `Ver evidencia ${index + 1}` : "Ver evidencia",
  }));
}
