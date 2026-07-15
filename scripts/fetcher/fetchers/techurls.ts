import { BaseFetcher } from './base.js';

export class TechUrlsFetcher extends BaseFetcher {
  siteId = 'techurls';
  siteName = 'TechURLs';

  async fetch(now: Date): Promise<{ siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[]> {
    const $ = await this.fetchHtml('https://techurls.xyz/');
    const items: { siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[] = [];

    $('article, .item, .link-item').each((_, el) => {
      const title = $(el).find('h2, h3, .title').text().trim();
      const link = $(el).find('a').attr('href');
      const source = $(el).find('.source, .domain').text().trim() || 'TechURLs';

      if (title && link) {
        items.push(this.createItem({
          source,
          title,
          url: link,
          publishedAt: now,
        }));
      }
    });

    return items;
  }
}
