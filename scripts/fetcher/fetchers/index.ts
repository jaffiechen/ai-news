export { BaseFetcher, runFetcher } from './base.js';
export { AiHubFetcher } from './aihub.js';
export { AiBaseFetcher } from './aibase.js';
export { TechUrlsFetcher } from './techurls.js';
export { RssFetcher } from './rss.js';
export { BuzzingFetcher } from './buzzing.js';
export { IrisFetcher } from './iris.js';
export { TophubFetcher } from './tophub.js';
export { ZeliFetcher } from './zeli.js';
export { AiHubTodayFetcher } from './aihubtoday.js';
export { NewsNowFetcher } from './newsnow.js';
export { XinzhiyuanFetcher } from './xinzhiyuan.js';
export { WechatRssFetcher } from './wechat-rss.js';
export { YouTubeFetcher } from './youtube.js';
export { fetchOpmlRss } from './opml-rss.js';
export { fetchWaytoagiRecent7d } from './waytoagi.js';

import type { Fetcher } from '../types.js';
import { AiHubFetcher } from './aihub.js';
import { AiBaseFetcher } from './aibase.js';
import { TechUrlsFetcher } from './techurls.js';
import { RssFetcher } from './rss.js';
import { BuzzingFetcher } from './buzzing.js';
import { IrisFetcher } from './iris.js';
import { TophubFetcher } from './tophub.js';
import { ZeliFetcher } from './zeli.js';
import { AiHubTodayFetcher } from './aihubtoday.js';
import { NewsNowFetcher } from './newsnow.js';
import { XinzhiyuanFetcher } from './xinzhiyuan.js';
import { WechatRssFetcher } from './wechat-rss.js';
import { YouTubeFetcher } from './youtube.js';

export function createAllFetchers(): Fetcher[] {
  return [
    new TechUrlsFetcher(),
    new BuzzingFetcher(),
    new IrisFetcher(),
    new TophubFetcher(),
    new ZeliFetcher(),
    new AiHubTodayFetcher(),
    new AiBaseFetcher(),
    new AiHubFetcher(),
    new NewsNowFetcher(),
    new XinzhiyuanFetcher(),
    new WechatRssFetcher(),
    new YouTubeFetcher(),
    new RssFetcher(),
  ];
}