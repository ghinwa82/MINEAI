import { getFeedItems } from '@/lib/growth-swarm';
import { siteUrl } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** RSS 2.0 feed for aggregators, news bots and reader apps. */
export async function GET() {
  const items = await getFeedItems('en', 20).catch(() => []);
  const base = siteUrl();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MineAI Market Insights</title>
    <link>${escapeXml(`${base}/insights`)}</link>
    <description>Daily plain-language market briefs on bitcoin, gold, US stocks and cloud mining.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${base}/feed.xml`)}" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${escapeXml(item.pubDate)}</pubDate>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=900',
    },
  });
}
