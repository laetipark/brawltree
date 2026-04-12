import { useTranslation } from 'react-i18next';
import type { CdnBundle } from '~/context/cdn.context';

export type CdnNamespace = keyof CdnBundle;

export const useCdnTranslation = (namespace: CdnNamespace) => {
  return useTranslation(namespace, { useSuspense: false });
};

