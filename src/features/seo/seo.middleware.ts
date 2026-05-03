import { NextFunction, Request, Response } from 'express';
import { SeoService } from './seo.service';

type SupportedLanguage = 'ko' | 'en';

type RedirectInput = {
  host?: string;
  method?: string;
  originalUrl: string;
};

const PUBLIC_METHODS = new Set(['GET', 'HEAD']);
const SYSTEM_PATH_PREFIXES = ['/api', '/cdn', '/youtube', '/inbox'];

export const resolveCanonicalRedirectUrl = ({
  host,
  method = 'GET',
  originalUrl
}: RedirectInput) => {
  if (!PUBLIC_METHODS.has(method.toUpperCase())) {
    return null;
  }

  const normalizedHost = (host || '').split(':')[0].toLowerCase();
  const isWwwHost = normalizedHost === 'www.brawltree.me';
  const url = new URL(originalUrl, 'https://brawltree.me');
  const isSystemPath = SYSTEM_PATH_PREFIXES.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
  const rawLanguage = url.searchParams.get('lang')?.toLowerCase();
  const language = rawLanguage?.startsWith('en') ? 'en' : rawLanguage?.startsWith('ko') ? 'ko' : null;

  if (!isWwwHost && (!language || isSystemPath)) {
    return null;
  }

  let nextPath = url.pathname;

  if (language) {
    url.searchParams.delete('lang');
    nextPath = toLanguagePath(url.pathname, language);
  }

  const nextSearch = url.searchParams.toString();
  const nextUrl = `https://brawltree.me${nextPath}${nextSearch ? `?${nextSearch}` : ''}${url.hash}`;
  const currentUrl = `https://${isWwwHost ? 'www.brawltree.me' : 'brawltree.me'}${url.pathname}${url.search}${url.hash}`;

  return nextUrl === currentUrl ? null : nextUrl;
};

export const createCanonicalRedirectMiddleware = () => (req: Request, res: Response, next: NextFunction) => {
  const redirectUrl = resolveCanonicalRedirectUrl({
    host: req.headers.host,
    method: req.method,
    originalUrl: req.originalUrl
  });

  if (redirectUrl) {
    res.redirect(301, redirectUrl);
    return;
  }

  next();
};

export const createBrawlianSeoMiddleware = (seoService: SeoService) => async (req: Request, res: Response, next: NextFunction) => {
  if (!PUBLIC_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const match = req.path.match(/^\/(en\/)?brawlian\/([^/]+)\/?$/i);
  if (!match) {
    next();
    return;
  }

  try {
    const language: SupportedLanguage = match[1] ? 'en' : 'ko';
    const html = await seoService.renderBrawlianHtml(match[2], language);

    res.type('html').send(html);
  } catch (error) {
    next(error);
  }
};

export const createSitemapMiddleware = (seoService: SeoService) => async (req: Request, res: Response, next: NextFunction) => {
  if (!PUBLIC_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  try {
    if (req.path === '/sitemap.xml') {
      res.type('application/xml').send(await seoService.renderSitemapIndex());
      return;
    }

    if (req.path === '/sitemaps/static.xml') {
      res.type('application/xml').send(await seoService.renderStaticSitemap());
      return;
    }

    const brawliansMatch = req.path.match(/^\/sitemaps\/brawlians-(\d+)\.xml$/);
    if (brawliansMatch) {
      const page = Number(brawliansMatch[1]);
      if (page < 1) {
        next();
        return;
      }

      res.type('application/xml').send(await seoService.renderBrawliansSitemap(page));
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

const stripLanguagePrefix = (path: string) => {
  if (path === '/en') {
    return '/';
  }

  if (path.startsWith('/en/')) {
    return path.slice('/en'.length) || '/';
  }

  return path;
};

const toLanguagePath = (path: string, language: SupportedLanguage) => {
  const basePath = stripLanguagePrefix(path || '/');

  if (language === 'en') {
    return basePath === '/' ? '/en' : `/en${basePath}`;
  }

  return basePath;
};
