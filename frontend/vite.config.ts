import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import prerender from '@prerenderer/rollup-plugin';
import { resolve } from 'path';

const siteUrl = 'https://brawltree.me';

const prerenderSeoByRoute = {
  '/': {
    title: '브롤스타즈 전적 검색과 맵 분석 | 브롤 트리',
    label: '브롤스타즈 전적 검색과 맵 분석',
    description: '브롤스타즈 프로필, 브롤러 성능, 맵 승률, 이벤트 로테이션을 한 곳에서 확인하세요.'
  },
  '/events/curr': {
    title: '현재 이벤트 로테이션 | 브롤 트리',
    label: '현재 이벤트 로테이션',
    description: '현재 브롤스타즈 이벤트 로테이션과 맵 풀을 확인하세요.'
  },
  '/events/next': {
    title: '예정 이벤트 로테이션 | 브롤 트리',
    label: '예정 이벤트 로테이션',
    description: '예정 브롤스타즈 이벤트 로테이션과 맵 풀을 확인하세요.'
  },
  '/events/ranked': {
    title: '랭크 이벤트 로테이션 | 브롤 트리',
    label: '랭크 이벤트 로테이션',
    description: '랭크 브롤스타즈 이벤트 로테이션과 맵 풀을 확인하세요.'
  },
  '/maps': {
    title: '맵 로테이션과 필터 | 브롤 트리',
    label: '맵 로테이션과 필터',
    description: '모드별 맵을 검색하고 맵별 브롤러 성능을 분석하세요.'
  },
  '/crew': {
    title: '크루 멤버 현황 | 브롤 트리',
    label: '크루 멤버 현황',
    description: '크루 멤버 프로필과 성장 현황을 한 번에 확인하세요.'
  },
  '/news': {
    title: '브롤스타즈 뉴스 | 브롤 트리',
    label: '브롤스타즈 뉴스',
    description: '최신 브롤스타즈 업데이트, 패치 노트, 공식 공지를 확인하세요.'
  },
  '/brawler/shelly': {
    title: '쉘리 브롤러 통계와 빌드 | 브롤 트리',
    label: '쉘리 브롤러 통계와 빌드',
    description: '쉘리 성능, 추천 맵, 가젯과 스타파워 조합을 확인하세요.'
  }
} as const;

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const withLanguageQuery = (path: string, language: 'ko' | 'en') => {
  if (language === 'ko') {
    return path;
  }

  return `${path}${path.includes('?') ? '&' : '?'}lang=${language}`;
};

const toAbsoluteUrl = (path: string, language: 'ko' | 'en' = 'ko') => {
  return `${siteUrl}${withLanguageQuery(path, language)}`;
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
    .replace(/<script\s+type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi, '');

const injectPrerenderSeo = (html: string, route: keyof typeof prerenderSeoByRoute) => {
  const seo = prerenderSeoByRoute[route];
  const canonicalUrl = toAbsoluteUrl(route);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: '브롤 트리',
      url: siteUrl,
      inLanguage: 'ko'
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: '브롤 트리',
          item: `${siteUrl}/`
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: seo.label,
          item: canonicalUrl
        }
      ]
    }
  ];
  const tags = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" name="description" content="${escapeHtml(seo.description)}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" name="language" content="Korean">',
    '<meta data-brawltree-prerender-seo="true" data-rh="true" name="robots" content="index, follow">',
    '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:site_name" content="브롤 트리">',
    '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:type" content="website">',
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:title" content="${escapeHtml(seo.title)}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:description" content="${escapeHtml(seo.description)}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:url" content="${canonicalUrl}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:image" content="https://brawltree.me/thumbnail.png">',
    '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:locale" content="ko_KR">',
    '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:locale:alternate" content="en_US">',
    '<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:card" content="summary_large_image">',
    `<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:title" content="${escapeHtml(seo.title)}">`,
    `<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:description" content="${escapeHtml(seo.description)}">`,
    '<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:image" content="https://brawltree.me/thumbnail.png">',
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="canonical" href="${canonicalUrl}">`,
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="ko" href="${toAbsoluteUrl(route, 'ko')}">`,
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="en" href="${toAbsoluteUrl(route, 'en')}">`,
    `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="x-default" href="${toAbsoluteUrl(route, 'ko')}">`,
    ...jsonLd.map((structuredData) => `<script data-brawltree-prerender-seo="true" type="application/ld+json" data-brawltree-jsonld="true">${JSON.stringify(structuredData)}</script>`)
  ].join('');

  const htmlWithLang = /<html(?![^>]*\slang=)/i.test(html)
    ? html.replace(/<html([^>]*)>/i, (_htmlTag, attributes: string) => `<html lang="ko"${attributes}>`)
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
        routes: ['/', '/events/curr', '/events/next', '/events/ranked', '/maps', '/crew', '/news', '/brawler/shelly'],
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
          const route = (renderedRoute.route || '/') as keyof typeof prerenderSeoByRoute;

          if (route in prerenderSeoByRoute) {
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
