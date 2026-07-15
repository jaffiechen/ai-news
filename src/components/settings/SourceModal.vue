<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import type { SiteStat } from '@/types'
import { config } from '@/config'

const props = defineProps<{
  modelValue: boolean
  siteStats: SiteStat[]
  sourceCount: number
  windowHours: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const sourceStatus = ref<any>(null)
const opmlFeeds = ref<any[]>([])
const wechatFeeds = ref<any[]>([])

const SITE_INFO: Record<string, { description: string; url: string }> = {
  techurls: {
    description: '技术链接聚合，汇集 Hacker News、Reddit 等技术社区热门文章',
    url: 'https://techurls.com/',
  },
  buzzing: {
    description: '热门话题聚合，收集 Reddit、HN、Twitter 等平台讨论',
    url: 'https://www.buzzing.cc/',
  },
  tophub: {
    description: '今日热榜，聚合微博、知乎、B站等 50+ 平台热门内容',
    url: 'https://tophub.today/',
  },
  newsnow: {
    description: '新闻聚合平台，实时追踪全球科技新闻',
    url: 'https://newsnow.co/',
  },
  zeli: {
    description: 'Hacker News 24 小时热榜精选',
    url: 'https://zeli.app/',
  },
  aihubtoday: {
    description: 'AI 资讯日报，每日精选 AI 领域重要动态',
    url: 'https://aihubtoday.com/',
  },
  aibase: {
    description: 'AI 产品数据库，收录最新 AI 工具和应用',
    url: 'https://www.aibase.com/',
  },
  aihub: {
    description: 'AI Hub 聚合平台，汇集 AI 相关资讯和工具',
    url: 'https://aihub.cn/',
  },
  opmlrss: {
    description: '自定义 RSS 订阅源，包含 Twitter/X 博主、AI 公司官方账号等',
    url: '',
  },
  'wechat-rss': {
    description: '微信公众号 RSS 订阅，精选 AI 领域优质公众号',
    url: '',
  },
  xinzhiyuan: {
    description: '新智元 - 专注 AI 领域的资讯平台',
    url: 'https://www.xinzhiyuan.com/',
  },
  youtube: {
    description: 'YouTube 精选频道，AI 领域优质视频内容',
    url: 'https://www.youtube.com/',
  },
  iris: {
    description: 'Info Flow RSS 信息流，精选科技博客和资讯',
    url: 'https://info-flow.codelife.cc/',
  },
  rss: {
    description: 'RSS 订阅源聚合，汇集各类优质 RSS 内容',
    url: '',
  },
  waytoagi: {
    description: 'WaytoAGI - AI 知识图谱与资源导航',
    url: 'https://waytoagi.com/',
  },
}

watch(() => props.modelValue, (val) => {
  if (val) {
    loadSourceStatus()
    loadOpmlFeeds()
    loadWechatFeeds()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

function loadSourceStatus() {
  fetch(`${config.newsApiUrl}/source-status.json`)
    .then(res => res.json())
    .then(data => {
      sourceStatus.value = data
    })
    .catch(() => {})
}

function loadOpmlFeeds() {
  fetch(`${config.newsApiUrl}/opml-feeds.json`)
    .then(res => res.json())
    .then(data => {
      opmlFeeds.value = data
    })
    .catch(() => {})
}

function loadWechatFeeds() {
  fetch(`${config.newsApiUrl}/wechat-feeds.json`)
    .then(res => res.json())
    .then(data => {
      wechatFeeds.value = data
    })
    .catch(() => {})
}

function close() {
  emit('update:modelValue', false)
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

const totalRawItems = () => props.siteStats.reduce((sum, s) => sum + (s.raw_count || 0), 0)
const totalFilteredItems = () => props.siteStats.reduce((sum, s) => sum + s.count, 0)

const sortedSiteStats = () => {
  return [...props.siteStats].sort((a, b) => {
    if (a.site_id === 'opmlrss') return 1
    if (b.site_id === 'opmlrss') return -1
    return 0
  })
}

const allOpmlFeeds = () => {
  return opmlFeeds.value.flatMap((g: any) => g.feeds || [])
}

const allWechatFeeds = () => {
  return wechatFeeds.value.flatMap((g: any) => g.feeds || [])
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="close"
        />
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[85vh] overflow-hidden">
          <div class="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h2 class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>📡</span>
                数据源概览
              </h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                聚合 {{ props.siteStats.length }} 个平台 · {{ props.sourceCount }} 个订阅源
              </p>
            </div>
            <button
              @click="close"
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <span class="text-gray-500">✕</span>
            </button>
          </div>

          <div class="px-6 py-4 overflow-y-auto max-h-[calc(85vh-80px)]">
            <div class="grid grid-cols-3 gap-3 mb-6">
              <div class="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ props.siteStats.length }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">数据平台</p>
              </div>
              <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ props.sourceCount }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">订阅源</p>
              </div>
              <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 text-center">
                <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ totalRawItems().toLocaleString() }}</p>
                <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">原始资讯</p>
              </div>
            </div>

            <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 mb-6">
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>⏱️</span>
                <span>最近 <strong class="text-gray-900 dark:text-white">{{ props.windowHours }} 小时</strong> 内，从 <strong class="text-gray-900 dark:text-white">{{ totalRawItems().toLocaleString() }}</strong> 条原始资讯中智能筛选出 <strong class="text-gray-900 dark:text-white">{{ totalFilteredItems().toLocaleString() }}</strong> 条 AI 相关内容</span>
              </div>
            </div>

            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span>🌍</span>
              数据平台详情
            </h3>
            
            <div class="space-y-3">
              <div 
                v-for="stat in sortedSiteStats()" 
                :key="stat.site_id" 
                class="rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden"
              >
                <div class="flex items-center justify-between p-3 bg-white dark:bg-gray-700/50">
                  <div class="flex items-center gap-3">
                    <span v-if="sourceStatus?.sites?.find((s: any) => s.site_id === stat.site_id)?.ok !== false" class="text-emerald-500 flex-shrink-0">✓</span>
                    <span v-else class="text-red-500 flex-shrink-0">✕</span>
                    <div class="text-left">
                      <span class="font-medium text-gray-900 dark:text-white">{{ stat.site_name }}</span>
                      <span v-if="stat.site_id === 'opmlrss'" class="ml-2 text-xs text-gray-500">({{ allOpmlFeeds().length }} 个订阅)</span>
                      <span v-else-if="stat.site_id === 'wechat-rss'" class="ml-2 text-xs text-gray-500">({{ allWechatFeeds().length }} 个订阅)</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 text-sm">
                    <span class="text-gray-500 dark:text-gray-400">
                      原始: <span class="text-gray-700 dark:text-gray-300">{{ stat.raw_count || 0 }}</span>
                    </span>
                    <span class="text-blue-600 dark:text-blue-400 font-medium">
                      AI: {{ stat.count }}
                    </span>
                  </div>
                </div>
                
                <div class="px-4 pb-4 pt-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-600">
                  <div v-if="SITE_INFO[stat.site_id]" class="mb-3">
                    <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">{{ SITE_INFO[stat.site_id].description }}</p>
                    <a
                      v-if="SITE_INFO[stat.site_id].url"
                      :href="SITE_INFO[stat.site_id].url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600"
                    >
                      <span>🔗</span>
                      {{ SITE_INFO[stat.site_id].url }}
                    </a>
                  </div>
                  
                  <div 
                    v-if="stat.site_id === 'opmlrss' && opmlFeeds.length > 0" 
                    class="mt-2"
                  >
                    <div v-for="group in opmlFeeds" :key="group.name" class="mb-3 last:mb-0">
                      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ group.name }}（{{ group.feeds.length }}）</p>
                      <div class="grid grid-cols-3 gap-1.5">
                        <div
                          v-for="(feed, idx) in group.feeds"
                          :key="idx"
                          class="text-xs text-gray-600 dark:text-gray-400 truncate py-1 px-2 bg-white dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
                          :title="feed.name"
                        >
                          {{ feed.name }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div 
                    v-else-if="stat.site_id === 'wechat-rss' && wechatFeeds.length > 0" 
                    class="mt-2"
                  >
                    <div v-for="group in wechatFeeds" :key="group.name" class="mb-3 last:mb-0">
                      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{{ group.name }}（{{ group.feeds.length }}）</p>
                      <div class="grid grid-cols-3 gap-1.5">
                        <div
                          v-for="(feed, idx) in group.feeds"
                          :key="idx"
                          class="text-xs text-gray-600 dark:text-gray-400 truncate py-1 px-2 bg-white dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600"
                          :title="feed.name"
                        >
                          {{ feed.name }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
