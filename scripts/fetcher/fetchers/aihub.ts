import { BaseFetcher } from './base.js';

export class AiHubFetcher extends BaseFetcher {
  siteId = 'aihub';
  siteName = 'AIHub';

  async fetch(now: Date): Promise<{ siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[]> {
    const $ = await this.fetchHtml('https://www.aihub.cn/news/');
    const items: { siteId: string; siteName: string; source: string; title: string; url: string; publishedAt: Date | null; meta: Record<string, unknown>; }[] = [];

    $('.news-item, .article-item').each((_, el) => {
      const title = $(el).find('h2, h3, .title').text().trim();
      const link = $(el).find('a').attr('href');
      const dateStr = $(el).find('.time, .date').text().trim();

      if (title && link) {
        const url = link.startsWith('http') ? link : `https://www.aihub.cn${link}`;
        items.push(this.createItem({
          source: 'AIHub',
          title,
          url,
          publishedAt: this.parseDate(dateStr) || now,
        }));
      }
    });

    return items;
  }
}
