import { BaseFetcher } from './base.js';

export class AiBaseFetcher extends BaseFetcher {
  siteId = 'aibase';
  siteName = 'AIbase';

  async fetch(now: Date): Promise<{ siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[]> {
    const $ = await this.fetchHtml('https://www.aibase.com/zh/news');
    const items: { siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[] = [];

    $('.news-item, .article-item, .list-item').each((_, el) => {
      const title = $(el).find('h2, h3, .title').text().trim();
      const link = $(el).find('a').attr('href');

      if (title && link) {
        const url = link.startsWith('http') ? link : `https://www.aibase.com${link}`;
        items.push(this.createItem({
          source: 'AIbase',
          title,
          url,
          publishedAt: now,
        }));
      }
    });

    return items;
  }
}
