import type { CdnBundle } from '~/context/cdn.context';
import { normalizeLanguage, SupportedLanguage } from '~/common/i18n/language';
import { i18n } from '~/common/i18n/i18n';

type CdnNamespace = keyof CdnBundle;

const CDN_NAMESPACES: CdnNamespace[] = ['application', 'battle', 'brawler', 'main', 'map', 'news', 'user'];

const addOrReplaceResourceBundle = (language: SupportedLanguage, namespace: CdnNamespace, resources: Record<string, any>) => {
  if (!resources || Object.keys(resources).length === 0) {
    return;
  }

  if (i18n.hasResourceBundle(language, namespace)) {
    i18n.removeResourceBundle(language, namespace);
  }

  i18n.addResourceBundle(language, namespace, resources, true, true);
};

export const syncCdnBundleToI18n = async (language: SupportedLanguage, bundle: CdnBundle) => {
  const normalizedLanguage = normalizeLanguage(language);

  CDN_NAMESPACES.forEach((namespace) => {
    const resources = bundle[namespace] || {};
    addOrReplaceResourceBundle(normalizedLanguage, namespace, resources);
  });

  if (i18n.language !== normalizedLanguage) {
    await i18n.changeLanguage(normalizedLanguage);
  }
};
