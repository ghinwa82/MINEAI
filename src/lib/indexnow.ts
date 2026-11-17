import { LOCALISABLE_ROUTES, localizedPath } from '@/lib/routes';
import { LANGUAGE_CODES } from '@/lib/languages';
import { absoluteUrl, siteUrl } from '@/lib/schema';

/**
 * IndexNow.
 *
 * One POST fans a URL list out to Bing, Yandex, Seznam and Naver through their
 * shared endpoint, and we also hit each engine directly so a single vendor
 * outage cannot swallow the submission. The verification key is public by
 * design — it proves domain ownership, it does not authorise submission — so
 * the key file ships in `public/` and the key itself is a constant here with an
 * env override for rotations.
 */

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY?.trim() || 'c223579af5c09eb33e1988350b6ff4d2';

const ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
  'https://search.seznam.cz/indexnow',
  'https://searchadvisor.naver.com/indexnow',
];

export interface IndexNowResult {
  endpoint: string;
  status: number | 'error';
  ok: boolean;
}

function keyLocation(): string {
  return absoluteUrl(`/${INDEXNOW_KEY}.txt`);
}

export function defaultUrlSet(): string[] {
  const urls: string[] = [];
  for (const path of LOCALISABLE_ROUTES) {
    for (const code of LANGUAGE_CODES) {
      urls.push(absoluteUrl(localizedPath(code, path)));
    }
  }
  return urls;
}

export function newsUrlSet(): string[] {
  return LANGUAGE_CODES.map((code) => absoluteUrl(localizedPath(code, '/news')));
}

export async function pingIndexNow(urls: string[]): Promise<IndexNowResult[]> {
  const list = Array.from(new Set(urls.filter((url) => /^https?:\/\//i.test(url)))).slice(0, 10_000);
  if (list.length === 0) return [];

  const host = new URL(siteUrl()).host;
  const body = JSON.stringify({
    host,
    key: INDEXNOW_KEY,
    keyLocation: keyLocation(),
    urlList: list,
  });

  const settled = await Promise.allSettled(
    ENDPOINTS.map(async (endpoint): Promise<IndexNowResult> => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          Accept: 'application/json',
          'User-Agent': 'MineAI-Node/1.0 (+https://mineai-node.vercel.app)',
        },
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      return { endpoint, status: response.status, ok: response.ok };
    }),
  );

  return settled.map((result, index) =>
    result.status === 'fulfilled'
      ? result.value
      : { endpoint: ENDPOINTS[index], status: 'error', ok: false },
  );
}

let lastNewsPing = 0;
const NEWS_PING_INTERVAL = 10 * 60_000;

/**
 * Fire-and-forget news submission.
 *
 * Called from the news route after a genuine refresh. The throttle keeps a
 * busy instance from re-submitting the same six URLs every request while the
 * cache is warm.
 */
export function pingNewsPages(): void {
  if (Date.now() - lastNewsPing < NEWS_PING_INTERVAL) return;
  lastNewsPing = Date.now();
  void pingIndexNow(newsUrlSet()).catch(() => undefined);
}
