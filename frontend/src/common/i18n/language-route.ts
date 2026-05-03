import { SupportedLanguage } from '~/common/i18n/language';

const EN_PREFIX = '/en';

export const getLanguageFromPath = (pathname?: string): SupportedLanguage | null => {
  if (!pathname) {
    return null;
  }

  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`) ? 'en' : 'ko';
};

export const stripLanguagePrefix = (pathname: string) => {
  if (pathname === EN_PREFIX) {
    return '/';
  }

  if (pathname.startsWith(`${EN_PREFIX}/`)) {
    return pathname.slice(EN_PREFIX.length) || '/';
  }

  return pathname || '/';
};

export const withLanguagePath = (path: string, language: SupportedLanguage) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const basePath = stripLanguagePrefix(normalizedPath);

  if (language === 'en') {
    return basePath === '/' ? EN_PREFIX : `${EN_PREFIX}${basePath}`;
  }

  return basePath;
};

export const toLanguagePath = ({
  pathname,
  search = '',
  hash = '',
  language
}: {
  pathname: string;
  search?: string;
  hash?: string;
  language: SupportedLanguage;
}) => {
  const searchParams = new URLSearchParams(search);
  searchParams.delete('lang');
  const nextSearch = searchParams.toString();

  return `${withLanguagePath(pathname, language)}${nextSearch ? `?${nextSearch}` : ''}${hash}`;
};
