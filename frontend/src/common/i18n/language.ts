export type SupportedLanguage = 'ko' | 'en';

export const DEFAULT_LANGUAGE: SupportedLanguage = 'ko';
const KOREA_TIMEZONE = 'Asia/Seoul';

export const normalizeLanguage = (language?: string): SupportedLanguage => {
  if (!language) {
    return DEFAULT_LANGUAGE;
  }

  return language.toLowerCase().startsWith('en') ? 'en' : 'ko';
};

export const toOgLocale = (language?: string) => {
  return normalizeLanguage(language) === 'ko' ? 'ko_KR' : 'en_US';
};

export const toHtmlLang = (language?: string) => {
  return normalizeLanguage(language);
};

const isKoreanLocale = (locale?: string) => {
  return locale?.toLowerCase().startsWith('ko') || false;
};

const getPrimaryBrowserLocale = () => {
  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return navigator.languages?.[0] || navigator.language;
};

export const detectPreferredLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (timezone && timezone !== KOREA_TIMEZONE) {
    return 'en';
  }

  const browserLocale = getPrimaryBrowserLocale();
  if (!browserLocale) {
    return DEFAULT_LANGUAGE;
  }

  return isKoreanLocale(browserLocale) ? 'ko' : 'en';
};
