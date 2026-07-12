import fs from 'fs'
import path from 'path'

const SOURCES_FILE = path.join(process.cwd(), 'public/data/sources.json')
const NEWS_FILE = path.join(process.cwd(), 'public/data/news.json')

async function fetchRSS(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: HTTP ${response.status}`)
      return []
    }
    const text = await response.text()
    return parseRSS(text)
  } catch (e) {
    console.warn(`Error fetching ${url}: ${e.message}`)
    return []
  }
}

function parseRSS(xml) {
  const items = []
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1]
    const title = extractTag(itemContent, 'title')
    const link = extractTag(itemContent, 'link')
    const pubDate = extractTag(itemContent, 'pubDate')
    const description = extractTag(itemContent, 'description')
    
    if (title && link) {
      items.push({
        id: link,
        title: cleanText(title),
        link: cleanText(link),
        pubDate: parseDate(pubDate),
        summary: cleanText(description)
      })
    }
  }
  
  return items
}

function extractTag(content, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\s\S]*?)<\/${tag}>`, 'i')
  const match = content.match(regex)
  return match ? match[1] : ''
}

function cleanText(text) {
  return text.replace(/<[^>]*>/g, '').trim()
}

function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString()
  
  const date = new Date(dateStr)
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

async function main() {
  console.log('Starting RSS fetcher...')
  
  const sources = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'))
  const allNews = []
  
  for (const source of sources) {
    console.log(`Fetching ${source.name}...`)
    const items = await fetchRSS(source.rssUrl)
    
    for (const item of items) {
      allNews.push({
        ...item,
        source: source.id,
        isBreaking: false
      })
    }
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
  console.log(`Updated ${limitedNews.length} news items`)
}

main().catch(e => {
  console.error('Error:', e)
  process.exit(1)
})