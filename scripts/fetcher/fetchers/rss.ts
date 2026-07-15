import RSSParser from 'rss-parser';
import { BaseFetcher } from './base.js';
import { RSS_SOURCES, CONFIG } from '../config.js';

const parser = new RSSParser({
  customFields: {
    item: ['content:encoded', 'dc:date'],
  },
});

export class RssFetcher extends BaseFetcher {
  siteId = 'opmlrss';
  siteName = 'OPML RSS';

  async fetch(now: Date): Promise<{ siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[]> {
    const items: { siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[] = [];

    for (const source of RSS_SOURCES) {
      try {
        let feedUrl = source.rssUrl;
        if (CONFIG.rss.replacements[feedUrl]) {
          feedUrl = CONFIG.rss.replacements[feedUrl];
        }

        if (CONFIG.rss.skipExact.has(feedUrl)) {
          continue;
        }

        const shouldSkip = CONFIG.rss.skipPrefixes.some(prefix => feedUrl.startsWith(prefix));
        if (shouldSkip) {
          continue;
        }

        const feed = await parser.parseURL(feedUrl);
        
        for (const item of feed.items) {
          const title = item.title?.trim() || '';
          const link = item.link?.trim() || '';
          
          if (!title || !link) continue;

          let pubDate: Date | null = null;
          if (item.pubDate) {
            pubDate = this.parseDate(item.pubDate);
          }

          items.push(this.createItem({
            source: source.name,
            title,
            url: link,
            publishedAt: pubDate || now,
          }));
        }
      } catch (e) {
        console.warn(`  ⚠️ [${source.name}] Failed: ${(e as Error).message}`);
      }
    }

    return items;
  }
}
