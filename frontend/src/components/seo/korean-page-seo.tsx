import React from 'react';

import { ResolveSeoOptions } from '~/common/seo/seo.config';
import { PageSeo } from '~/components/seo/page-seo';

type KoreanPageSeoProps = Omit<ResolveSeoOptions, 'language' | 'seoLanguage'>;

export const KoreanPageSeo = (props: KoreanPageSeoProps) => {
  return <PageSeo {...props} language="ko" seoLanguage="ko" />;
};

