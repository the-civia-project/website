/**
 * Per-request registry for paper endnotes.
 *
 * ExternalLink and cross-paper InternalLink components register entries during
 * render; References.astro reads Astro.locals.printReferences after the article
 * body has finished rendering.
 */

/** A single endnote entry shown in the References section and linked from [n] markers. */
export type PrintReference = { href: string; label: string };

/**
 * Register a reference for the current page render.
 *
 * Deduplicates by href so repeated links share one number. Returns a 1-based
 * index used for inline [n] superscripts and #ref-n anchors.
 */
export function registerPrintReference(
  refs: PrintReference[] | undefined,
  href: string,
  label: string,
): number {
  const existing = refs?.findIndex((r) => r.href === href) ?? -1;
  if (existing >= 0) return existing + 1;
  refs?.push({ href, label });
  return refs!.length;
}

/** Build the References list label for a cross-paper InternalLink breadcrumb. */
export function formatInternalLinkLabel(
  paper?: string,
  section?: string,
  heading?: string,
): string {
  const parts: string[] = ['The Civia Project'];
  if (paper) parts.push(paper);
  if (section) {
    if (paper) parts.push(section);
    else parts.push(section);
  }
  if (heading) parts.push(heading);
  return parts.join(' » ');
}

/**
 * Resolve a reference href to an absolute URL for the References list.
 *
 * Hash-only anchors (#section) are resolved against the current page pathname
 * so same-document and cross-paper fragment links print correctly.
 */
export function resolveReferenceUrl(
  href: string,
  site: URL | string | undefined,
  pathname?: string,
): string {
  if (href.startsWith('http://') || href.startsWith('https://')) return href;
  if (href.startsWith('#')) {
    return new URL(`${pathname ?? ''}${href}`, site).href;
  }
  return new URL(href, site).href;
}
