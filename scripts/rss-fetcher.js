import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import * as cheerio from 'cheerio'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SOURCES_FILE = path.join(__dirname, '../public/data/sources.json')
const NEWS_FILE = path.join(__dirname, '../public/data/news.json')
const MAX_RETRIES = 3
const RETRY_DELAY = 2000

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  const headers = {
    'User-Agent': 'AI-News-Fetcher/1.0 (https://github.com/jaffiechen/ai-news)',
    'Accept': 'text/html, application/xhtml+xml, application/xml, application/rss+xml'
  }
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers })
      if (response.ok) {
        return await response.text()
      }
      console.warn(`Attempt ${i + 1} failed: HTTP ${response.status} for ${url}`)
    } catch (e) {
      console.warn(`Attempt ${i + 1} failed: ${e.message} for ${url}`)
    }
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (i + 1)))
    }
  }
  return null
}

async function fetchRSS(url) {
  const xml = await fetchWithRetry(url)
  if (!xml) {
    return []
  }
  return parseRSS(xml)
}

async function fetchHTML(source) {
  const html = await fetchWithRetry(source.url)
  if (!html) {
    return []
  }
  return parseHTML(html, source)
}

function parseRSS(xml) {
  const items = []
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1]
    const title = extractTag(itemContent, 'title')
    const link = extractTag(itemContent, 'link')
    const pubDate = extractTag(itemContent, 'pubDate') || extractTag(itemContent, 'dc:date') || extractTag(itemContent, 'updated')
    const description = extractTag(itemContent, 'description') || extractTag(itemContent, 'content:encoded') || extractTag(itemContent, 'summary')
    
    if (title && link) {
      items.push({
        id: cleanText(link),
        title: cleanText(title),
        link: cleanText(link),
        pubDate: parseDate(pubDate),
        summary: cleanText(description)
      })
    }
  }
  
  return items
}

function parseHTML(html, source) {
  const items = []
  const $ = cheerio.load(html)
  const selectors = source.selectors || {}
  
  const listSelector = selectors.list || '.article-item, .news-item, .post-item'
  const titleSelector = selectors.title || 'h2, h3, .title, .article-title'
  const linkSelector = selectors.link || 'a'
  const summarySelector = selectors.summary || '.summary, .desc, .excerpt'
  const dateSelector = selectors.date || '.time, .date, .article-time'
  
  $(listSelector).each((index, element) => {
    const $element = $(element)
    
    const $title = $element.find(titleSelector).first()
    const $link = $element.find(linkSelector).first()
    const $summary = $element.find(summarySelector).first()
    const $date = $element.find(dateSelector).first()
    
    const title = $title.text().trim()
    const link = $link.attr('href')
    const summary = $summary.text().trim()
    const date = $date.text().trim()
    
    if (title && link) {
      const absoluteLink = toAbsoluteUrl(source.url, link)
      
      items.push({
        id: absoluteLink,
        title: cleanText(title),
        link: absoluteLink,
        pubDate: parseDate(date),
        summary: cleanText(summary)
      })
    }
  })
  
  return items
}

function toAbsoluteUrl(baseUrl, relativeUrl) {
  if (!relativeUrl) return baseUrl
  if (relativeUrl.startsWith('http://') || relativeUrl.startsWith('https://')) {
    return relativeUrl
  }
  
  const base = new URL(baseUrl)
  
  if (relativeUrl.startsWith('/')) {
    return `${base.protocol}//${base.host}${relativeUrl}`
  }
  
  if (relativeUrl.startsWith('./')) {
    relativeUrl = relativeUrl.substring(2)
  }
  
  const pathParts = base.pathname.split('/').filter(p => p)
  if (!base.pathname.endsWith('/')) {
    pathParts.pop()
  }
  
  const relativeParts = relativeUrl.split('/').filter(p => p && p !== '.')
  for (const part of relativeParts) {
    if (part === '..') {
      pathParts.pop()
    } else {
      pathParts.push(part)
    }
  }
  
  return `${base.protocol}//${base.host}/${pathParts.join('/')}`
}

function extractTag(content, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
  const match = content.match(regex)
  return match ? match[1] : ''
}

function cleanText(text) {
  if (!text) return ''
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString()
  
  const now = new Date()
  const today = now.toLocaleDateString('zh-CN')
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN')
  
  let normalizedDateStr = dateStr.trim()
  
  if (normalizedDateStr.includes('刚刚') || normalizedDateStr.includes('现在')) {
    return now.toISOString()
  }
  
  if (normalizedDateStr.includes('分钟前')) {
    const minutes = parseInt(normalizedDateStr.match(/(\d+)/)?.[0] || '0')
    return new Date(now.getTime() - minutes * 60 * 1000).toISOString()
  }
  
  if (normalizedDateStr.includes('小时前')) {
    const hours = parseInt(normalizedDateStr.match(/(\d+)/)?.[0] || '0')
    return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString()
  }
  
  if (normalizedDateStr.includes('昨天')) {
    return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
  }
  
  if (normalizedDateStr.includes('前天')) {
    return new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  if (normalizedDateStr.includes('今天')) {
    normalizedDateStr = normalizedDateStr.replace('今天', today)
  }
  
  normalizedDateStr = normalizedDateStr
    .replace(/年/g, '-')
    .replace(/月/g, '-')
    .replace(/日/g, '')
    .replace(/\//g, '-')
  
  const date = new Date(normalizedDateStr)
  if (!isNaN(date.getTime())) {
    return date.toISOString()
  }
  
  const dateMatch = normalizedDateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (dateMatch) {
    return new Date(dateMatch[1], dateMatch[2] - 1, dateMatch[3]).toISOString()
  }
  
  const timeMatch = normalizedDateStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (timeMatch) {
    const dateCopy = new Date(now)
    dateCopy.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), parseInt(timeMatch[3] || '0'), 0)
    return dateCopy.toISOString()
  }
  
  return now.toISOString()
}

async function main() {
  console.log('Starting RSS/HTML fetcher...')
  
  const sources = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'))
  const enabledSources = sources.filter(s => s.enabled !== false)
  const allNews = []
  
  console.log(`Found ${enabledSources.length} sources`)
  
  for (const source of enabledSources) {
    console.log(`Fetching ${source.name} (${source.category})...`)
    
    let items = []
    if (source.type === 'html') {
      items = await fetchHTML(source)
    } else {
      items = await fetchRSS(source.rssUrl || source.url)
    }
    
    if (items.length > 0) {
      console.log(`  ✅ Found ${items.length} items`)
      for (const item of items) {
        allNews.push({
          ...item,
          source: source.id,
          isBreaking: false
        })
      }
    } else {
      console.log(`  ❌ No items found`)
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  const uniqueNews = allNews.reduce((acc, news) => {
    if (!acc.find(n => n.id === news.id)) {
      acc.push(news)
    }
    return acc
  }, [])
  
  uniqueNews.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  )
  
  const limitedNews = uniqueNews.slice(0, 500)
  
  fs.writeFileSync(NEWS_FILE, JSON.stringify(limitedNews, null, 2))
  console.log(`\nUpdated ${limitedNews.length} news items`)
}

main().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})
