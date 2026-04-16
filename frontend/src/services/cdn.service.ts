import axios from 'axios';
import { SupportedLanguage } from '~/common/i18n/language';
import koBrawlerLocale from '~/assets/database/locales/ko/brawler.json';
import enBrawlerLocale from '~/assets/database/locales/en/brawler.json';
import { getDefaultCdnLocale } from '~/common/i18n/default-cdn-bundle';
import type { CdnBundle, CdnLocale } from '~/context/cdn.context';

type CdnNamespace = keyof CdnBundle;

const shouldFetchRemoteLocales = import.meta.env.VITE_CDN_REMOTE_LOCALES === 'true';

const fetchCdnLocale = (language: SupportedLanguage, name: CdnNamespace, time: number) => axios.get(`/cdn/database/locales/${language}/${name}.json?time=${time}`).then((result) => result.data);

const isObject = (value: unknown): value is Record<string, any> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

const mergeLocale = (fallbackValue: unknown, primaryValue: unknown): unknown => {
  if (!isObject(fallbackValue) || !isObject(primaryValue)) {
    return primaryValue ?? fallbackValue;
  }

  const merged: Record<string, unknown> = { ...fallbackValue };

  Object.keys(primaryValue).forEach((key) => {
    merged[key] = mergeLocale((fallbackValue as Record<string, unknown>)[key], (primaryValue as Record<string, unknown>)[key]);
  });

  return merged;
};

const getLocalBrawlerLocale = (language: SupportedLanguage) => {
  return language === 'en' ? enBrawlerLocale : koBrawlerLocale;
};

const getLocalCdnLocale = (language: SupportedLanguage, name: CdnNamespace): CdnLocale => {
  const fallbackLocale = getDefaultCdnLocale(language, name);

  if (name === 'brawler') {
    return mergeLocale(fallbackLocale, getLocalBrawlerLocale(language)) as CdnLocale;
  }

  return fallbackLocale;
};

const getCdnLocale = async (language: SupportedLanguage, name: CdnNamespace, time: number) => {
  const fallbackLocale = getLocalCdnLocale(language, name);

  if (!shouldFetchRemoteLocales) {
    return fallbackLocale;
  }

  try {
    const cdnLocale = await fetchCdnLocale(language, name, time);
    return mergeLocale(fallbackLocale, cdnLocale);
  } catch (error) {
    return fallbackLocale;
  }
};

export class CdnService {
  static getApplicationCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'application', time);

  static getBattleCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'battle', time);

  static getBrawlerCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'brawler', time);

  static getMainCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'main', time);

  static getMapCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'map', time);

  static getNewsCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'news', time);

  static getUserCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'user', time);
}
