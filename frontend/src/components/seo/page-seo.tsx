import React, { useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { resolveSeo, ResolveSeoOptions } from '~/common/seo/seo.config';

type PageSeoProps = ResolveSeoOptions;

const PRERENDER_READY_EVENT = 'brawltree-prerender-ready';

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
    [
      options.page,
      options.title,
      options.description,
      options.keywords,
      options.image,
      options.noIndex,
      options.type,
      options.breadcrumbItems,
      options.structuredData,
      language,
      seoLanguage,
      path,
      location.pathname
    ]
  );

  const jsonLdContent = useMemo(() => seo.jsonLd.map((structuredData) => JSON.stringify(structuredData)), [seo.jsonLd]);

  useEffect(() => {
    document.querySelectorAll('[data-brawltree-prerender-seo="true"]').forEach((element) => {
      element.remove();
    });

    document.querySelectorAll('script[data-brawltree-jsonld="true"]').forEach((script) => {
      script.remove();
    });

    const jsonLdScripts = jsonLdContent.map((content) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.dataset.brawltreeJsonld = 'true';
      script.text = content;
      document.head.appendChild(script);

      return script;
    });

    const timeoutID = window.setTimeout(() => {
      document.dispatchEvent(new Event(PRERENDER_READY_EVENT));
    }, 100);

    return () => {
      window.clearTimeout(timeoutID);
      jsonLdScripts.forEach((script) => {
        script.remove();
      });
    };
  }, [jsonLdContent, seo.canonicalUrl, seo.description, seo.title]);

  const robotsContent = seo.noIndex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet htmlAttributes={{ lang: seo.htmlLang }}>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
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
