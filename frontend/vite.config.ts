import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import prerender from '@prerenderer/rollup-plugin';
import { resolve } from 'path';

const siteUrl = 'https://brawltree.me';
const siteName = {
  ko: '브롤트리',
  en: 'BrawlTree'
} as const;
const breadcrumbSiteName = {
  ko: '브롤트리',
  en: 'Brawl Tree'
} as const;
type SupportedLanguage = keyof typeof siteName;

const prerenderSeoByRoute = {
  '/': {
    title: {
      ko: '브롤스타즈 전적 검색·닉네임 검색·통계 | 브롤트리',
      en: 'Brawl Stars Stats and Player Search | BrawlTree'
    },
    label: {
      ko: '브롤스타즈 전적 검색·닉네임 검색·통계',
      en: 'Brawl Stars Stats and Player Search'
    },
    description: {
      ko: '브롤트리에서 플레이어 태그와 닉네임으로 브롤스타즈 전적, 최근 배틀 로그, 트로피 변화, 브롤러 통계를 확인하세요.',
      en: 'Search Brawl Stars players by tag or nickname and check trophies, battle logs, brawler stats, and map recommendations.'
    }
  },
  '/events/curr': {
    title: {
      ko: '현재 이벤트 로테이션 | 브롤트리',
      en: 'Current Event Rotation | BrawlTree'
    },
    label: {
      ko: '현재 이벤트 로테이션',
      en: 'Current Event Rotation'
    },
    description: {
      ko: '현재 브롤스타즈 이벤트 로테이션과 맵 풀을 확인하세요.',
      en: 'Check the current Brawl Stars event rotation and map pool.'
    }
  },
  '/events/next': {
    title: {
      ko: '예정 이벤트 로테이션 | 브롤트리',
      en: 'Upcoming Event Rotation | BrawlTree'
    },
    label: {
      ko: '예정 이벤트 로테이션',
      en: 'Upcoming Event Rotation'
    },
    description: {
      ko: '예정 브롤스타즈 이벤트 로테이션과 맵 풀을 확인하세요.',
      en: 'Check upcoming Brawl Stars event rotations and map pools.'
    }
  },
  '/events/ranked': {
    title: {
      ko: '랭크 이벤트 로테이션 | 브롤트리',
      en: 'Ranked Event Rotation | BrawlTree'
    },
    label: {
      ko: '랭크 이벤트 로테이션',
      en: 'Ranked Event Rotation'
    },
    description: {
      ko: '랭크 브롤스타즈 이벤트 로테이션과 맵 풀을 확인하세요.',
      en: 'Check ranked Brawl Stars event rotations and map pools.'
    }
  },
  '/maps': {
    title: {
      ko: '맵 로테이션과 필터 | 브롤트리',
      en: 'Map Rotation and Filters | BrawlTree'
    },
    label: {
      ko: '맵 로테이션과 필터',
      en: 'Map Rotation and Filters'
    },
    description: {
      ko: '모드별 맵을 검색하고 맵별 브롤러 성능을 분석하세요.',
      en: 'Search maps by mode and analyze brawler performance by map.'
    }
  },
  '/crew': {
    title: {
      ko: '크루 멤버 현황 | 브롤트리',
      en: 'Crew Member Overview | BrawlTree'
    },
    label: {
      ko: '크루 멤버 현황',
      en: 'Crew Member Overview'
    },
    description: {
      ko: '크루 멤버 프로필과 성장 현황을 한 번에 확인하세요.',
      en: 'Browse crew member profiles and compare player progression.'
    }
  },
  '/news': {
    title: {
      ko: '브롤스타즈 뉴스 | 브롤트리',
      en: 'Brawl Stars News | BrawlTree'
    },
    label: {
      ko: '브롤스타즈 뉴스',
      en: 'Brawl Stars News'
    },
    description: {
      ko: '최신 브롤스타즈 업데이트, 패치 노트, 공식 공지를 확인하세요.',
      en: 'Read the latest Brawl Stars updates, patch notes, and official announcements.'
    }
  },
  '/brawler/shelly': {
    title: {
      ko: '쉘리 브롤러 통계와 빌드 | 브롤트리',
      en: 'Shelly Brawler Stats and Build | BrawlTree'
    },
    label: {
      ko: '쉘리 브롤러 통계와 빌드',
      en: 'Shelly Brawler Stats and Build'
    },
    description: {
      ko: '쉘리 성능, 추천 맵, 가젯과 스타파워 조합을 확인하세요.',
      en: 'Check Shelly performance, recommended maps, gadgets, and Star Power builds.'
    }
  }
} as const;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const stripLanguagePrefix = (path: string) => {
  if (path === '/en') {
    return '/';
  }

  if (path.startsWith('/en/')) {
    return path.slice('/en'.length) || '/';
  }

  return path;
};

const withLanguagePath = (path: string, language: SupportedLanguage) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const basePath = stripLanguagePrefix(normalizedPath);

  return language === 'en' ? (basePath === '/' ? '/en' : `/en${basePath}`) : basePath;
};

const toAbsoluteUrl = (path: string, language: SupportedLanguage = 'ko') => {
  return `${siteUrl}${withLanguagePath(path, language)}`;
};

const getPrerenderRouteInfo = (route: string) => {
  const language: SupportedLanguage = route === '/en' || route.startsWith('/en/') ? 'en' : 'ko';
  const baseRoute = stripLanguagePrefix(route) as keyof typeof prerenderSeoByRoute;

  return {
    language,
    baseRoute
  };
};

const stripSeoHead = (html: string) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']language["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']robots["'][^>]*>/gi, '')
    .replace(/<meta\s+property=["']og:[^"']+["'][^>]*>/gi, '')
    .replace(/<meta\s+name=["']twitter:[^"']+["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, '')
    .replace(/<link\s+rel=["']alternate["'][^>]*>/gi, '')
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*(?:www-widgetapi-script|youtube\.com\/iframe_api|\/iframe_api)[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (styleTag) =>
      /(?:--fa-font-solid|\.svg-inline--fa|Font Awesome [567])/i.test(styleTag) ? '' : styleTag
    );

const injectPrerenderSeo = (html: string, route: string) => {
  const { language, baseRoute } = getPrerenderRouteInfo(route);
  const seo = prerenderSeoByRoute[baseRoute];
  const canonicalUrl = toAbsoluteUrl(baseRoute, language);
  const seoTitle = seo.title[language];
  const seoLabel = seo.label[language];
  const seoDescription = seo.description[language];
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteName[language],
      url: siteUrl,
      inLanguage: language
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: breadcrumbSiteName[language],
          item: toAbsoluteUrl('/', language)
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: seoLabel,
          item: canonicalUrl
        }
      ]
    }
  ];
  const tags = [
    `<title data-brawltree-prerender-seo="true" data-rh="true">${escapeHtml(seoTitle)}</title>`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" name="description" content="${escapeHtml(seoDescription)}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" name="language" content="${language === 'ko' ? 'Korean' : 'English'}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" name="robots" content="index, follow">',
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:site_name" content="${escapeHtml(siteName[language])}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:type" content="website">',
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:title" content="${escapeHtml(seoTitle)}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:description" content="${escapeHtml(seoDescription)}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:url" content="${canonicalUrl}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:image" content="https://brawltree.me/thumbnail.png">',
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:locale" content="${language === 'ko' ? 'ko_KR' : 'en_US'}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:locale:alternate" content="${language === 'ko' ? 'en_US' : 'ko_KR'}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:card" content="summary_large_image">',
    `<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:title" content="${escapeHtml(seoTitle)}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:description" content="${escapeHtml(seoDescription)}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:image" content="https://brawltree.me/thumbnail.png">',
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="canonical" href="${canonicalUrl}">`,
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="ko" href="${toAbsoluteUrl(baseRoute, 'ko')}">`,
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="en" href="${toAbsoluteUrl(baseRoute, 'en')}">`,
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="x-default" href="${toAbsoluteUrl(baseRoute, 'ko')}">`,
    ...jsonLd.map((structuredData) => `<script data-brawltree-prerender-seo="true" type="application/ld+json" data-brawltree-jsonld="true">${JSON.stringify(structuredData)}</script>`)
  ].join('');

  const htmlWithLang = /<html(?![^>]*\slang=)/i.test(html)
    ? html.replace(/<html([^>]*)>/i, (_htmlTag, attributes: string) => `<html lang="${language}"${attributes}>`)
    : html;

  return stripSeoHead(htmlWithLang).replace('</head>', `${tags}</head>`);
};

const copyPrerenderedHomeToRoot = () => ({
  name: 'brawltree-home-prerender-root',
  generateBundle: {
    order: 'post' as const,
    handler(_options, bundle) {
      const homeRoute = bundle['home/index.html'];

      if (!homeRoute || !('source' in homeRoute)) {
        return;
      }

      const rootRoute = bundle['index.html'];

      if (rootRoute && 'source' in rootRoute) {
        rootRoute.source = homeRoute.source;
      } else {
        this.emitFile({
          type: 'asset',
          fileName: 'index.html',
          source: homeRoute.source
        });
      }

      delete bundle['home/index.html'];
    }
  }
});

const prerenderBaseRoutes = Object.keys(prerenderSeoByRoute) as Array<keyof typeof prerenderSeoByRoute>;
const prerenderRoutes = prerenderBaseRoutes.flatMap((route) => [route, withLanguagePath(route, 'en')]);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number.parseInt(env.VITE_PORT ?? '5173', 10);

  return {
    resolve: {
      alias: [
        {
          find: '~/assets',
          replacement: resolve(__dirname, 'src/assets')
        },
        {
          find: '~/components',
          replacement: resolve(__dirname, 'src/components')
        },
        {
          find: '~/context',
          replacement: resolve(__dirname, 'src/context')
        },
        {
          find: '~/hooks',
          replacement: resolve(__dirname, 'src/hooks')
        },
        {
          find: '~/pages',
          replacement: resolve(__dirname, 'src/pages')
        },
        {
          find: '~/utils',
          replacement: resolve(__dirname, 'src/utils')
        }
      ]
    },
    plugins: [
      react(),
      svgrPlugin(),
      prerender({
        routes: prerenderRoutes,
        renderer: '@prerenderer/renderer-puppeteer',
        server: {
          host: 'localhost',
          listenHost: 'localhost'
        },
        rendererOptions: {
          maxConcurrentRoutes: 1,
          renderAfterDocumentEvent: 'brawltree-prerender-ready',
          renderAfterTime: 2000
        },
        postProcess(renderedRoute) {
          const route = renderedRoute.route || '/';
          const { baseRoute } = getPrerenderRouteInfo(route);

          if (baseRoute in prerenderSeoByRoute) {
            renderedRoute.html = injectPrerenderSeo(renderedRoute.html, route);
          }

          if (route === '/') {
            renderedRoute.outputPath = 'home/index.html';
          }

          return renderedRoute;
        }
      }),
      copyPrerenderedHomeToRoot()
    ],
    server: {
      allowedHosts: ['brawltree.me', 'www.brawltree.me'],
      host: '0.0.0.0',
      port,
      proxy: {
        '/cdn': {
          target: 'https://cdn.brawltree.me',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/cdn/, '')
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        },
        '/youtube': {
          target: 'https://www.googleapis.com/youtube/v3',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/youtube/, '')
        },
        '/inbox': {
          target: 'https://brawlstars.inbox.supercell.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/inbox/, '')
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      port
    }
  };
});
