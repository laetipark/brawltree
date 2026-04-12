import { normalizeLanguage, SupportedLanguage, toOgLocale } from '~/common/i18n/language';

export type SeoPageKey = 'home' | 'user' | 'brawler' | 'events' | 'maps' | 'mapDetail' | 'crew' | 'news' | 'newsDetail';
export type OpenGraphType = 'website' | 'article';

type LocalizedText = Record<SupportedLanguage, string>;
type LocalizedKeywords = Record<SupportedLanguage, string[]>;

export interface SeoPageConfig {
  title: LocalizedText;
  description: LocalizedText;
  keywords: LocalizedKeywords;
  type?: OpenGraphType;
}

export interface ResolveSeoOptions {
  page: SeoPageKey;
  language?: string;
  seoLanguage?: SupportedLanguage;
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  path?: string;
  noIndex?: boolean;
  type?: OpenGraphType;
}

const SITE_NAME: LocalizedText = {
  ko: '브롤 트리',
  en: 'Brawl Tree'
};
const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://brawltree.me').replace(/\/+$/, '');
const DEFAULT_IMAGE = '/thumbnail.png';
const DEFAULT_TYPE: OpenGraphType = 'website';

const DEFAULT_KEYWORDS: LocalizedKeywords = {
  ko: ['브롤스타즈', '브롤 트리', '브롤스타즈 전적', '브롤러 통계', '맵 통계', '배틀 로그'],
  en: ['brawl stars', 'brawl tree', 'brawl stars stats', 'brawler stats', 'map stats', 'battle log']
};

export const PAGE_SEO_CONFIG: Record<SeoPageKey, SeoPageConfig> = {
  home: {
    title: {
      ko: '브롤스타즈 전적 검색과 맵 분석',
      en: 'Brawl Stars Stats and Map Insights'
    },
    description: {
      ko: '브롤스타즈 프로필, 브롤러 성능, 맵 승률, 이벤트 로테이션을 한 곳에서 확인하세요.',
      en: 'Track Brawl Stars profiles, brawler performance, map win rates, and event rotation in one place.'
    },
    keywords: {
      ko: ['브롤스타즈 프로필', '브롤스타즈 맵', '브롤스타즈 이벤트', '브롤러 통계'],
      en: ['brawl stars profile', 'brawl stars map', 'brawl stars event', 'brawler stats']
    }
  },
  user: {
    title: {
      ko: '플레이어 전적과 배틀 로그',
      en: 'Player Profile and Battle Logs'
    },
    description: {
      ko: '플레이어 트로피, 랭크, 최근 전투, 브롤러 사용률과 성장 추이를 확인하세요.',
      en: 'Review player trophies, ranked tiers, recent battles, brawler usage, and progression trends.'
    },
    keywords: {
      ko: ['플레이어 전적', '배틀 로그', '랭크 통계', '트로피 변화'],
      en: ['player profile', 'battle log', 'ranked stats', 'trophy history']
    }
  },
  brawler: {
    title: {
      ko: '브롤러 성능과 빌드 가이드',
      en: 'Brawler Stats and Build Guide'
    },
    description: {
      ko: '브롤러 성능, 픽률, 상성, 추천 맵을 비교해보세요.',
      en: 'Compare brawler performance, pick rates, matchup data, and map recommendations.'
    },
    keywords: {
      ko: ['브롤러 통계', '브롤러 빌드', '가젯', '스타파워'],
      en: ['brawler stats', 'brawler build', 'star power', 'gadget']
    }
  },
  events: {
    title: {
      ko: '이벤트 로테이션',
      en: 'Current and Upcoming Events'
    },
    description: {
      ko: '현재/다음 브롤스타즈 이벤트와 랭크 맵 로테이션을 확인하세요.',
      en: 'Check current and upcoming Brawl Stars event rotations and ranked maps.'
    },
    keywords: {
      ko: ['이벤트 로테이션', '랭크 이벤트', '오늘 이벤트'],
      en: ['event rotation', 'ranked event', 'current events']
    }
  },
  maps: {
    title: {
      ko: '맵 로테이션과 필터',
      en: 'Map Rotation and Filters'
    },
    description: {
      ko: '모드별 맵을 검색하고 맵별 브롤러 성능을 분석하세요.',
      en: 'Search maps by mode and analyze map-specific brawler trends.'
    },
    keywords: {
      ko: ['맵 로테이션', '맵 필터', '맵별 추천 브롤러'],
      en: ['map rotation', 'map filter', 'best brawler by map']
    }
  },
  mapDetail: {
    title: {
      ko: '맵 상세와 추천 브롤러',
      en: 'Map Detail and Recommended Brawlers'
    },
    description: {
      ko: '맵 상세 정보와 브롤러 순위, 성능 지표를 확인하세요.',
      en: 'Explore a map in detail with brawler rankings and performance metrics.'
    },
    keywords: {
      ko: ['맵 상세', '추천 브롤러', '맵 승률'],
      en: ['map detail', 'recommended brawler', 'map win rate']
    }
  },
  crew: {
    title: {
      ko: '크루 멤버 현황',
      en: 'Crew Member Overview'
    },
    description: {
      ko: '크루 멤버 프로필과 성장 현황을 한 번에 확인하세요.',
      en: 'Browse crew member profiles and compare player progression.'
    },
    keywords: {
      ko: ['크루 멤버', '클럽 멤버', '팀 전적'],
      en: ['crew members', 'club players', 'team stats']
    }
  },
  news: {
    title: {
      ko: '브롤스타즈 뉴스',
      en: 'Brawl Stars News'
    },
    description: {
      ko: '최신 브롤스타즈 업데이트, 패치 노트, 공식 공지를 확인하세요.',
      en: 'Read the latest Brawl Stars updates, patch changes, and official announcements.'
    },
    keywords: {
      ko: ['브롤스타즈 뉴스', '패치 노트', '업데이트'],
      en: ['brawl stars news', 'patch notes', 'game updates']
    },
    type: 'article'
  },
  newsDetail: {
    title: {
      ko: '뉴스 상세',
      en: 'News Detail'
    },
    description: {
      ko: '브롤스타즈 뉴스 본문과 핵심 업데이트 내용을 확인하세요.',
      en: 'Read the full Brawl Stars news article and key update details.'
    },
    keywords: {
      ko: ['뉴스 상세', '업데이트 내용'],
      en: ['news article', 'update details']
    },
    type: 'article'
  }
};

const normalizePath = (path: string) => {
  if (!path) {
    return '/';
  }

  return path.startsWith('/') ? path : `/${path}`;
};

const withLanguageQuery = (path: string, language: SupportedLanguage) => {
  const separator = path.includes('?') ? '&' : '?';

  if (language === 'ko') {
    return path;
  }

  return `${path}${separator}lang=${language}`;
};

const toAbsoluteUrl = (value: string) => {
  if (!value) {
    return `${SITE_URL}${DEFAULT_IMAGE}`;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const withSiteName = (title: string, language: SupportedLanguage) => {
  const siteName = SITE_NAME[language];

  return title.includes(siteName) ? title : `${title} | ${siteName}`;
};

export const resolveSeo = (options: ResolveSeoOptions) => {
  const language = options.seoLanguage || normalizeLanguage(options.language);
  const base = PAGE_SEO_CONFIG[options.page];

  const title = withSiteName(options.title || base.title[language], language);
  const description = options.description || base.description[language];
  const keywords = (options.keywords && options.keywords.length > 0 ? options.keywords : base.keywords[language].concat(DEFAULT_KEYWORDS[language])).join(', ');

  const normalizedPath = normalizePath(options.path || '/');
  const canonicalPath = withLanguageQuery(normalizedPath, language);
  const canonicalUrl = `${SITE_URL}${canonicalPath}`;
  const alternateUrlKo = `${SITE_URL}${withLanguageQuery(normalizedPath, 'ko')}`;
  const alternateUrlEn = `${SITE_URL}${withLanguageQuery(normalizedPath, 'en')}`;
  const imageUrl = toAbsoluteUrl(options.image || DEFAULT_IMAGE);
  const type = options.type || base.type || DEFAULT_TYPE;
  const noIndex = Boolean(options.noIndex);

  return {
    language,
    htmlLang: language,
    ogLocale: toOgLocale(language),
    ogAlternateLocale: toOgLocale(language === 'ko' ? 'en' : 'ko'),
    siteName: SITE_NAME[language],
    title,
    description,
    keywords,
    canonicalUrl,
    alternateUrlKo,
    alternateUrlEn,
    imageUrl,
    type,
    noIndex
  };
};
