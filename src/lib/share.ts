/**
 * Share-to-earn link builders.
 *
 * One canonical referral URL is produced here and every network receives the
 * same URL plus the same caption, so a shared card can never point at a
 * different page than the one the sharer was reading. The builders are pure
 * and take the origin as an argument, which keeps them usable from a server
 * component, a client component and a test.
 */

export type ShareNetwork = 'x' | 'telegram' | 'whatsapp' | 'facebook';

export interface ShareInput {
  origin: string;
  /** Path to share, already locale-prefixed by the caller. */
  path: string;
  text: string;
  /** Referral code, appended as `?ref=` when present. */
  code?: string | null;
}

export function shareUrl({ origin, path, code }: Pick<ShareInput, 'origin' | 'path' | 'code'>): string {
  const base = origin.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${base}${cleanPath}`;
  if (!code) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}ref=${encodeURIComponent(code)}`;
}

export function shareTarget(network: ShareNetwork, input: ShareInput): string {
  const url = shareUrl(input);
  const text = input.text.trim();

  switch (network) {
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    default:
      return url;
  }
}

export const SHARE_NETWORKS: ShareNetwork[] = ['x', 'telegram', 'whatsapp', 'facebook'];

export const SHARE_LABELS: Record<ShareNetwork, string> = {
  x: 'X',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  facebook: 'Facebook',
};
