import axios from 'axios';
import { SupportedLanguage } from '~/common/i18n/language';
import koBrawlerLocale from '~/assets/database/locales/ko/brawler.json';
import enBrawlerLocale from '~/assets/database/locales/en/brawler.json';

const getCdnLocale = (language: SupportedLanguage, name: string, time: number) => axios.get(`/cdn/database/locales/${language}/${name}.json?time=${time}`).then((result) => result.data);

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

export class CdnService {
  static getApplicationCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'application', time);

  static getBattleCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'battle', time);

  static getBrawlerCdn = async (language: SupportedLanguage, time: number) => {
    const fallbackLocale = getLocalBrawlerLocale(language);

    try {
      const cdnLocale = await getCdnLocale(language, 'brawler', time);
      return mergeLocale(fallbackLocale, cdnLocale);
    } catch (error) {
      return fallbackLocale;
    }
  };

  static getMainCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'main', time);

  static getMapCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'map', time);

  static getNewsCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'news', time);

  static getUserCdn = (language: SupportedLanguage, time: number) => getCdnLocale(language, 'user', time);
}
