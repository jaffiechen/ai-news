const DEFAULT_CONFIG = {
  newsApiUrl: '/data',
  sourcesApiUrl: '/data/source-status.json',
  updateInterval: 3600000,
  breakingKeywords: ['GPT-5', '发布', '开源', '重磅', '突破性', '重大', '宣布'],
  localStoragePrefix: 'ai-news',
  themeAutoStartHour: 6,
  themeAutoEndHour: 18
}

export const config = {
  newsApiUrl: import.meta.env.VITE_NEWS_API_URL || DEFAULT_CONFIG.newsApiUrl,
  sourcesApiUrl: import.meta.env.VITE_SOURCES_API_URL || DEFAULT_CONFIG.sourcesApiUrl,
  updateInterval: Math.max(
    parseInt(import.meta.env.VITE_UPDATE_INTERVAL || String(DEFAULT_CONFIG.updateInterval)),
    60000
  ),
  breakingKeywords: DEFAULT_CONFIG.breakingKeywords,
  localStoragePrefix: import.meta.env.VITE_LOCAL_STORAGE_PREFIX || DEFAULT_CONFIG.localStoragePrefix,
  themeAutoStartHour: parseInt(import.meta.env.VITE_THEME_AUTO_START_HOUR || String(DEFAULT_CONFIG.themeAutoStartHour)),
  themeAutoEndHour: parseInt(import.meta.env.VITE_THEME_AUTO_END_HOUR || String(DEFAULT_CONFIG.themeAutoEndHour))
}