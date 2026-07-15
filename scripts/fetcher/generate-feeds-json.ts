import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { XMLParser } from 'fast-xml-parser'
import { WECHAT_FEEDS } from './fetchers/wechat-rss.js'

interface OpmlGroup {
  name: string
  feeds: {
    name: string
    url: string
  }[]
}

function generateOpmlJson() {
  const opmlPath = resolve('./feeds/follow.opml')
  
  if (!existsSync(opmlPath)) {
    console.log('No OPML file found, skipping...')
    return
  }

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  const opmlContent = readFileSync(opmlPath, 'utf-8')
  const result = parser.parse(opmlContent)
  
  const groups: OpmlGroup[] = []
  
  const body = result.opml?.body
  if (!body?.outline) return

  const outlines = Array.isArray(body.outline) ? body.outline : [body.outline]

  for (const group of outlines) {
    const groupName = group['@_text'] || group['@_title'] || 'Unknown'
    const feeds: OpmlGroup['feeds'] = []
    
    const feedOutlines = group.outline
    if (!feedOutlines) continue
    
    const feedList = Array.isArray(feedOutlines) ? feedOutlines : [feedOutlines]
    
    for (const feed of feedList) {
      const url = feed['@_xmlUrl']
      if (url) {
        feeds.push({
          name: feed['@_text'] || feed['@_title'] || 'Unknown',
          url: url
        })
      }
    }
    
    if (feeds.length > 0) {
      groups.push({ name: groupName, feeds })
    }
  }

  const outputPath = resolve('./public/data/opml-feeds.json')
  writeFileSync(outputPath, JSON.stringify(groups, null, 2))
  console.log(`Generated ${outputPath} with ${groups.length} groups`)
}

function generateWechatFeedsJson() {
  const groups: OpmlGroup[] = []
  const categoryMap: Record<string, OpmlGroup['feeds']> = {}

  for (const feed of WECHAT_FEEDS) {
    if (!categoryMap[feed.category]) {
      categoryMap[feed.category] = []
    }
    categoryMap[feed.category].push({
      name: feed.name,
      url: feed.url
    })
  }

  for (const [name, feeds] of Object.entries(categoryMap)) {
    groups.push({ name, feeds })
  }

  const outputPath = resolve('./public/data/wechat-feeds.json')
  writeFileSync(outputPath, JSON.stringify(groups, null, 2))
  console.log(`Generated ${outputPath} with ${groups.length} groups`)
}

generateOpmlJson()
generateWechatFeedsJson()
