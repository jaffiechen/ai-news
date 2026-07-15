import type { RawItem } from '../types.js';
import { fetchHtml, fetchText, fetchJson } from '../utils/http.js';
import { parseDate, utcNow } from '../utils/date.js';
import { normalizeUrl } from '../utils/url.js';
import * as cheerio from 'cheerio';

interface WaytoagiItem {
  title: string;
  url: string;
  source: string;
  publishedAt: Date | null;
}

export interface Waytoagi7dPayload {
  generated_at: string;
  count_7d: number;
  items: WaytoagiItem[];
}

async function scrapeWaytoagiPage(url: string): Promise<WaytoagiItem[]> {
  const items: WaytoagiItem[] = [];
  const seenUrls = new Set<string>();

  try {
    const html = await fetchText(url);
    const $ = cheerio.load(html);

    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const dayBefore = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000);

    const dateFormats = [
      `${today.getMonth() + 1}月${today.getDate()}日`,
      `${yesterday.getMonth() + 1}月${yesterday.getDate()}日`,
      `${dayBefore.getMonth() + 1}月${dayBefore.getDate()}日`,
    ];

    $('a').each((_, a) => {
      const $a = $(a);
      const href = ($a.attr('href') || '').trim();
      const text = $a.text().trim();

      if (!href.startsWith('http') || !text || text.length < 5) return;

      const normUrl = normalizeUrl(href);
      if (seenUrls.has(normUrl)) return;
      seenUrls.add(normUrl);

      const parentText = $a.parent().text().trim().toLowerCase();
      let source = 'WaytoAGI';
      let publishedAt: Date | null = null;

      for (const fmt of dateFormats) {
        if (parentText.includes(fmt)) {
          const match = parentText.match(/(\d+)月(\d+)日/);
          if (match) {
            publishedAt = new Date(today.getFullYear(), parseInt(match[1]) - 1, parseInt(match[2]));
          }
          break;
        }
      }

      if (text.includes('(') && text.includes(')')) {
        const bracketMatch = text.match(/\(([^)]+)\)/);
        if (bracketMatch) {
          source = bracketMatch[1];
        }
      }

      items.push({
        title: text,
        url: href,
        source,
        publishedAt,
      });
    });
  } catch {
    // ignore
  }

  return items;
}

export async function fetchWaytoagiRecent7d(now: Date): Promise<Waytoagi7dPayload> {
  const items: WaytoagiItem[] = [];

  const urls = [
    'https://waytoagi.feishu.cn/wiki/QPe5w5g7UisbEkkow8XcDmOpn8e',
    'https://waytoagi.feishu.cn/wiki/FjiOwWp2giA7hRk6jjfcPioCnAc',
  ];

  for (const url of urls) {
    const pageItems = await scrapeWaytoagiPage(url);
    items.push(...pageItems);
  }

  const seenUrls = new Set<string>();
  const uniqueItems = items.filter((item) => {
    const key = normalizeUrl(item.url);
    if (seenUrls.has(key)) return false;
    seenUrls.add(key);
    return item.title.length >= 5;
  });

  return {
    generated_at: new Date().toISOString(),
    count_7d: uniqueItems.length,
    items: uniqueItems,
  };
}