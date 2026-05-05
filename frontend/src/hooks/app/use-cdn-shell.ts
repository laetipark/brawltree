import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CdnBundle, EMPTY_CDN_BUNDLE } from '~/context/cdn.context';
import { CdnService } from '~/services/cdn.service';
import { syncCdnBundleToI18n } from '~/common/i18n/cdn-resource-sync';
import { SupportedLanguage } from '~/common/i18n/language';
import { getInitialLanguage, persistLanguage } from '~/common/i18n/language-storage';
import { getLanguageFromPath, toLanguagePath } from '~/common/i18n/language-route';
import { i18n } from '~/common/i18n/i18n';

type UseCdnShellResult = {
  contextValue: CdnBundle & {
    language: SupportedLanguage;
    setLanguage: Dispatch<SetStateAction<SupportedLanguage>>;
  };
  isLoaded: boolean;
};

type RouterLocation = {
  pathname: string;
  search: string;
  hash: string;
};

const fetchCdnBundle = async (language: SupportedLanguage): Promise<CdnBundle> => {
  const cacheBuster = Date.now();
  const [application, battle, brawler, main, map, news, user] = await Promise.all([
    CdnService.getApplicationCdn(language, cacheBuster),
    CdnService.getBattleCdn(language, cacheBuster),
    CdnService.getBrawlerCdn(language, cacheBuster),
    CdnService.getMainCdn(language, cacheBuster),
    CdnService.getMapCdn(language, cacheBuster),
    CdnService.getNewsCdn(language, cacheBuster),
    CdnService.getUserCdn(language, cacheBuster)
  ]);

  return { application, battle, brawler, main, map, news, user };
};

export const useCdnShell = (location: RouterLocation): UseCdnShellResult => {
  const navigate = useNavigate();
  const { pathname, search, hash } = location;
  const [isLoaded, setIsLoaded] = useState(false);
  const [language, setLanguage] = useState<SupportedLanguage>(() => getLanguageFromPath(pathname) || getInitialLanguage());
  const [cdnBundle, setCdnBundle] = useState<CdnBundle>(EMPTY_CDN_BUNDLE);

  useEffect(() => {
    const pathLanguage = getLanguageFromPath(pathname);

    if (pathLanguage && pathLanguage !== language) {
      setLanguage(pathLanguage);
    }
  }, [language, pathname]);

  useEffect(() => {
    let isSubscribed = true;
    setIsLoaded(false);

    fetchCdnBundle(language)
      .then((nextBundle) => {
        if (!isSubscribed) {
          return;
        }

        setCdnBundle(nextBundle);
        syncCdnBundleToI18n(language, nextBundle).finally(() => {
          setIsLoaded(true);
        });
      })
      .catch((error) => {
        console.error('Error fetching CDN data:', error);
      });

    return () => {
      isSubscribed = false;
    };
  }, [language]);

  useEffect(() => {
    persistLanguage(language);

    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  useEffect(() => {
    const pathLanguage = getLanguageFromPath(pathname);

    if (pathLanguage && pathLanguage !== language) {
      return;
    }

    const nextPath = toLanguagePath({
      pathname,
      search,
      hash,
      language
    });
    const currentPath = `${pathname}${search}${hash}`;

    if (nextPath !== currentPath) {
      navigate(nextPath, { replace: true });
    }
  }, [hash, language, navigate, pathname, search]);

  const contextValue = useMemo(
    () => ({
      ...cdnBundle,
      language,
      setLanguage
    }),
    [cdnBundle, language]
  );

  return {
    contextValue,
    isLoaded
  };
};
