import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { Users } from '~/users/entities/users.entity';

type SupportedLanguage = 'ko' | 'en';

type BrawlianSeoProfile = {
  userID: string;
  userName: string;
};

type BrawlianSeo = {
  htmlLang: SupportedLanguage;
  title: string;
  description: string;
  robots: string;
  canonicalUrl: string;
  alternateUrlKo: string;
  alternateUrlEn: string;
  ogLocale: string;
  ogAlternateLocale: string;
  siteName: string;
  jsonLd: Record<string, unknown>[];
};

type SitemapProfileRow = {
  userID: string;
  lastmod: Date | string;
};

const SITE_URL = 'https://brawltree.me';
const SITE_NAME: Record<SupportedLanguage, string> = {
  ko: '브롤트리',
  en: 'BrawlTree'
};
const BREADCRUMB_SITE_NAME: Record<SupportedLanguage, string> = {
  ko: '브롤트리',
  en: 'Brawl Tree'
};
const SITEMAP_PROFILE_PAGE_SIZE = 25000;
const SITEMAP_PROFILE_WINDOW_DAYS = 90;
const VALID_PLAYER_TAG_PATTERN = /^[0289PYLQGRJCUV]{3,12}$/;
const STATIC_PATHS = [
  '/',
  '/events/curr',
  '/events/next',
  '/events/ranked',
  '/maps',
  '/crew',
  '/news',
  '/brawler/shelly'
] as const;

@Injectable()
export class SeoService {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>
  ) {}

  async renderBrawlianHtml(tag: string, language: SupportedLanguage) {
    const [html, seo] = await Promise.all([
      this.readIndexHtml(),
      this.buildBrawlianSeo(tag, language)
    ]);

    return this.injectSeoIntoHtml(html, seo);
  }

  async buildBrawlianSeo(tag: string, language: SupportedLanguage): Promise<BrawlianSeo> {
    const cleanTag = this.normalizePlayerTag(tag);
    const isValidTag = VALID_PLAYER_TAG_PATTERN.test(cleanTag);
    const profile = isValidTag ? await this.selectBrawlianSeoProfile(cleanTag) : null;
    const basePath = `/brawlian/${encodeURIComponent(cleanTag || tag)}`;
    const canonicalUrl = this.toAbsoluteUrl(basePath, language);
    const alternateUrlKo = this.toAbsoluteUrl(basePath, 'ko');
    const alternateUrlEn = this.toAbsoluteUrl(basePath, 'en');
    const siteName = SITE_NAME[language];

    const title = this.buildBrawlianTitle({
      cleanTag,
      language,
      profile,
      isValidTag
    });
    const description = this.buildBrawlianDescription({
      cleanTag,
      language,
      profile,
      isValidTag
    });

    return {
      htmlLang: language,
      title,
      description,
      robots: isValidTag ? 'index, follow' : 'noindex, follow',
      canonicalUrl,
      alternateUrlKo,
      alternateUrlEn,
      ogLocale: language === 'ko' ? 'ko_KR' : 'en_US',
      ogAlternateLocale: language === 'ko' ? 'en_US' : 'ko_KR',
      siteName,
      jsonLd: this.createBrawlianStructuredData({
        title,
        description,
        canonicalUrl,
        language
      })
    };
  }

  injectSeoIntoHtml(html: string, seo: BrawlianSeo) {
    const tags = [
      `<title data-brawltree-prerender-seo="true" data-rh="true">${this.escapeHtml(seo.title)}</title>`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" name="description" content="${this.escapeHtml(seo.description)}">`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" name="language" content="${seo.htmlLang === 'ko' ? 'Korean' : 'English'}">`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" name="robots" content="${seo.robots}">`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:site_name" content="${this.escapeHtml(seo.siteName)}">`,
      '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:type" content="website">',
      `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:title" content="${this.escapeHtml(seo.title)}">`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:description" content="${this.escapeHtml(seo.description)}">`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:url" content="${seo.canonicalUrl}">`,
      '<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:image" content="https://brawltree.me/thumbnail.png">',
      `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:locale" content="${seo.ogLocale}">`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" property="og:locale:alternate" content="${seo.ogAlternateLocale}">`,
      '<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:card" content="summary_large_image">',
      `<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:title" content="${this.escapeHtml(seo.title)}">`,
      `<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:description" content="${this.escapeHtml(seo.description)}">`,
      '<meta data-brawltree-prerender-seo="true" data-rh="true" name="twitter:image" content="https://brawltree.me/thumbnail.png">',
      `<link data-brawltree-prerender-seo="true" data-rh="true" rel="canonical" href="${seo.canonicalUrl}">`,
      `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="ko" href="${seo.alternateUrlKo}">`,
      `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="en" href="${seo.alternateUrlEn}">`,
      `<link data-brawltree-prerender-seo="true" data-rh="true" rel="alternate" hreflang="x-default" href="${seo.alternateUrlKo}">`,
      ...seo.jsonLd.map((structuredData) => `<script data-brawltree-prerender-seo="true" type="application/ld+json" data-brawltree-jsonld="true">${JSON.stringify(structuredData)}</script>`)
    ].join('');

    const htmlWithLang = html.replace(/<html([^>]*)>/i, (_htmlTag, attributes: string) => {
      const nextAttributes = /\slang=/i.test(attributes)
        ? attributes.replace(/\slang=["'][^"']*["']/i, ` lang="${seo.htmlLang}"`)
        : ` lang="${seo.htmlLang}"${attributes}`;

      return `<html${nextAttributes}>`;
    });

    return this.stripSeoHead(htmlWithLang).replace('</head>', `${tags}</head>`);
  }

  async renderSitemapIndex() {
    const profileCount = await this.countSitemapProfiles();
    const profilePageCount = Math.ceil(profileCount / SITEMAP_PROFILE_PAGE_SIZE);
    const sitemapUrls = [
      `${SITE_URL}/sitemaps/static.xml`,
      ...Array.from({ length: profilePageCount }, (_item, index) => `${SITE_URL}/sitemaps/brawlians-${index + 1}.xml`)
    ];

    return this.toSitemapIndexXml(sitemapUrls);
  }

  async renderStaticSitemap() {
    const urls = STATIC_PATHS.flatMap((path) => [
      {
        loc: this.toAbsoluteUrl(path, 'ko')
      },
      {
        loc: this.toAbsoluteUrl(path, 'en')
      }
    ]);

    return this.toUrlSetXml(urls);
  }

  async renderBrawliansSitemap(page: number) {
    const rows = await this.selectSitemapProfiles(page);
    const urls = rows.flatMap((row) => {
      const path = `/brawlian/${this.normalizePlayerTag(row.userID)}`;
      const lastmod = this.formatDate(row.lastmod);

      return [
        {
          loc: this.toAbsoluteUrl(path, 'ko'),
          lastmod
        },
        {
          loc: this.toAbsoluteUrl(path, 'en'),
          lastmod
        }
      ];
    });

    return this.toUrlSetXml(urls);
  }

  private async selectBrawlianSeoProfile(cleanTag: string): Promise<BrawlianSeoProfile | null> {
    const profile = await this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('uProfile.name', 'userName')
      .innerJoin('user.userProfile', 'uProfile')
      .where('user.id = :id', {
        id: `#${cleanTag}`
      })
      .limit(1)
      .getRawOne<BrawlianSeoProfile>();

    return profile || null;
  }

  private async countSitemapProfiles() {
    const threshold = this.getSitemapProfileThreshold();

    return this.users
      .createQueryBuilder('user')
      .innerJoin('user.userProfile', 'uProfile')
      .where('(user.updatedAt >= :threshold OR uProfile.updatedAt >= :threshold)', {
        threshold
      })
      .getCount();
  }

  private async selectSitemapProfiles(page: number) {
    const threshold = this.getSitemapProfileThreshold();

    return this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('GREATEST(user.updatedAt, uProfile.updatedAt)', 'lastmod')
      .innerJoin('user.userProfile', 'uProfile')
      .where('(user.updatedAt >= :threshold OR uProfile.updatedAt >= :threshold)', {
        threshold
      })
      .orderBy('lastmod', 'DESC')
      .offset((page - 1) * SITEMAP_PROFILE_PAGE_SIZE)
      .limit(SITEMAP_PROFILE_PAGE_SIZE)
      .getRawMany<SitemapProfileRow>();
  }

  private buildBrawlianTitle({
    cleanTag,
    language,
    profile,
    isValidTag
  }: {
    cleanTag: string;
    language: SupportedLanguage;
    profile: BrawlianSeoProfile | null;
    isValidTag: boolean;
  }) {
    const siteName = SITE_NAME[language];

    if (!isValidTag) {
      return language === 'ko'
        ? `브롤스타즈 플레이어 전적 | ${siteName}`
        : `Brawl Stars Player Stats | ${siteName}`;
    }

    if (!profile) {
      return language === 'ko'
        ? `#${cleanTag} 브롤스타즈 플레이어 전적 | ${siteName}`
        : `#${cleanTag} Brawl Stars Player Stats | ${siteName}`;
    }

    return language === 'ko'
      ? `${profile.userName} (#${cleanTag}) 브롤스타즈 전적·배틀로그 | ${siteName}`
      : `${profile.userName} (#${cleanTag}) Brawl Stars Stats and Battle Log | ${siteName}`;
  }

  private buildBrawlianDescription({
    cleanTag,
    language,
    profile,
    isValidTag
  }: {
    cleanTag: string;
    language: SupportedLanguage;
    profile: BrawlianSeoProfile | null;
    isValidTag: boolean;
  }) {
    const tagLabel = cleanTag ? `#${cleanTag}` : 'player';

    if (!isValidTag) {
      return language === 'ko'
        ? '브롤트리에서 브롤스타즈 플레이어 전적, 트로피, 랭크, 브롤러 통계와 최근 배틀 로그를 확인하세요.'
        : 'Check Brawl Stars player stats, trophies, ranked stats, brawler performance, and recent battle logs on BrawlTree.';
    }

    if (!profile) {
      return language === 'ko'
        ? `브롤트리에서 ${tagLabel} 브롤스타즈 플레이어의 전적, 트로피, 랭크, 브롤러 통계와 최근 배틀 로그를 확인하세요.`
        : `Check Brawl Stars stats, trophies, ranked stats, brawler performance, and recent battle logs for ${tagLabel} on BrawlTree.`;
    }

    return language === 'ko'
      ? `${profile.userName}의 트로피, 랭크, 승리 기록, 브롤러별 통계와 최근 배틀 로그를 브롤트리에서 확인하세요.`
      : `Check ${profile.userName}'s trophies, ranked stats, brawler performance, and recent battle logs on BrawlTree.`;
  }

  private createBrawlianStructuredData({
    title,
    description,
    canonicalUrl,
    language
  }: {
    title: string;
    description: string;
    canonicalUrl: string;
    language: SupportedLanguage;
  }): Record<string, unknown>[] {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME[language],
        url: SITE_URL,
        inLanguage: language
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: canonicalUrl,
        inLanguage: language
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: BREADCRUMB_SITE_NAME[language],
            item: language === 'ko' ? `${SITE_URL}/` : `${SITE_URL}/en`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: title.replace(new RegExp(`\\s*\\|\\s*${SITE_NAME[language]}$`), ''),
            item: canonicalUrl
          }
        ]
      }
    ];
  }

  private normalizePlayerTag(tag: string) {
    const decodedTag = this.safeDecodeURIComponent(tag || '');

    return decodedTag
      .replace(/^#/, '')
      .trim()
      .toUpperCase();
  }

  private safeDecodeURIComponent(value: string) {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return value;
    }
  }

  private toAbsoluteUrl(path: string, language: SupportedLanguage) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    if (language === 'en') {
      return `${SITE_URL}${normalizedPath === '/' ? '/en' : `/en${normalizedPath}`}`;
    }

    return `${SITE_URL}${normalizedPath}`;
  }

  private toSitemapIndexXml(urls: string[]) {
    const items = urls
      .map((loc) => `  <sitemap><loc>${this.escapeXml(loc)}</loc></sitemap>`)
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
  }

  private toUrlSetXml(urls: Array<{ loc: string; lastmod?: string }>) {
    const items = urls
      .map(({ loc, lastmod }) => {
        const lastmodTag = lastmod ? `<lastmod>${this.escapeXml(lastmod)}</lastmod>` : '';

        return `  <url><loc>${this.escapeXml(loc)}</loc>${lastmodTag}</url>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
  }

  private stripSeoHead(html: string) {
    return html
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
  }

  private escapeHtml(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private escapeXml(value: string) {
    return this.escapeHtml(value).replace(/'/g, '&apos;');
  }

  private formatDate(value: Date | string) {
    return new Date(value).toISOString().slice(0, 10);
  }

  private getSitemapProfileThreshold() {
    return new Date(Date.now() - SITEMAP_PROFILE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  }

  private readIndexHtml() {
    return readFile(join(process.cwd(), 'frontend', 'dist', 'index.html'), 'utf8');
  }
}
