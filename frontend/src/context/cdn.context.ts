import { Dispatch, SetStateAction, createContext } from 'react';
import { SupportedLanguage } from '~/common/i18n/language';

export type CdnLocale = Record<string, any>;

export type CdnBundle = {
  application: CdnLocale;
  battle: CdnLocale;
  brawler: CdnLocale;
  main: CdnLocale;
  news: CdnLocale;
  map: CdnLocale;
  user: CdnLocale;
};

export type CdnContextType = CdnBundle & {
  language: SupportedLanguage;
  setLanguage: Dispatch<SetStateAction<SupportedLanguage>>;
};

export const EMPTY_CDN_BUNDLE: CdnBundle = {
  application: {},
  battle: {},
  brawler: {},
  main: {},
  news: {},
  map: {},
  user: {}
};

export const CdnContext = createContext<CdnContextType>({
  ...EMPTY_CDN_BUNDLE,
  language: 'ko',
  setLanguage: () => undefined
});
