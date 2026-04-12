import React, { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { ResolveSeoOptions, resolveSeo } from '~/common/seo/seo.config';
type PageSeoProps = ResolveSeoOptions;

export const PageSeo = ({ language = 'ko', seoLanguage, path, ...options }: PageSeoProps) => {
  const location = useLocation();
  const seo = useMemo(
    () =>
      resolveSeo({
        ...options,
        language,
        seoLanguage,
        path: path || location.pathname
      }),
    [options.page, options.title, options.description, options.keywords, options.image, options.noIndex, options.type, language, seoLanguage, path, location.pathname]
  );

  const robotsContent = seo.noIndex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet htmlAttributes={{ lang: seo.htmlLang }}>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="language" content={seo.language === 'ko' ? 'Korean' : 'English'} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={seo.canonicalUrl} />
      <link rel="alternate" hrefLang="ko" href={seo.alternateUrlKo} />
      <link rel="alternate" hrefLang="en" href={seo.alternateUrlEn} />
      <link rel="alternate" hrefLang="x-default" href={seo.alternateUrlKo} />

      <meta property="og:site_name" content={seo.siteName} />
      <meta property="og:type" content={seo.type} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.canonicalUrl} />
      <meta property="og:image" content={seo.imageUrl} />
      <meta property="og:locale" content={seo.ogLocale} />
      <meta property="og:locale:alternate" content={seo.ogAlternateLocale} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.imageUrl} />
    </Helmet>
  );
};
