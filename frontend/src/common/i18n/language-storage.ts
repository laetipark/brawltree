import { DEFAULT_LANGUAGE, detectPreferredLanguage, normalizeLanguage, SupportedLanguage } from '~/common/i18n/language';

const LANGUAGE_STORAGE_KEY = 'language';
const LANGUAGE_COOKIE_KEY = 'brawltree_lang';

const getLanguageFromLocalStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    return null;
  }
};

const getLanguageFromCookie = () => {
  if (typeof document === 'undefined') {
    return null;
  }

  const languageCookie = document.cookie
    .split('; ')
    .find((cookieValue) => cookieValue.startsWith(`${LANGUAGE_COOKIE_KEY}=`));

  if (!languageCookie) {
    return null;
  }

  return decodeURIComponent(languageCookie.split('=').slice(1).join('='));
};

export const getStoredLanguage = (): SupportedLanguage | null => {
  const localStorageLanguage = getLanguageFromLocalStorage();
  if (localStorageLanguage) {
    return normalizeLanguage(localStorageLanguage);
  }

  const cookieLanguage = getLanguageFromCookie();
  if (cookieLanguage) {
    return normalizeLanguage(cookieLanguage);
  }

  return null;
};

export const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const storedLanguage = getStoredLanguage();
  if (storedLanguage) {
    return storedLanguage;
  }

  const urlLanguage = new URLSearchParams(window.location.search).get('lang');
  if (urlLanguage) {
    return normalizeLanguage(urlLanguage);
  }

  return detectPreferredLanguage();
};

export const persistLanguage = (language: SupportedLanguage) => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // Ignore localStorage write failures.
    }
  }

  if (typeof document !== 'undefined') {
    document.cookie = `${LANGUAGE_COOKIE_KEY}=${encodeURIComponent(language)}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = language;
  }
};
