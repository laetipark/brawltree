import React, { useContext } from 'react';
import { NewsItemsContent } from '~/components/news/news-items';
import { PageSeo } from '~/components/seo/page-seo';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/news.module.scss';

export const NewsWrapper = () => {
  const locales = useContext(CdnContext);
  const isKorean = locales.language === 'ko';
  const newsTitle = locales.main['news'] || (isKorean ? '\uB274\uC2A4' : 'News');
  const newsDescription =
    locales.news['newsDesc'] ||
    (isKorean
      ? '\uCD5C\uC2E0 \uACF5\uC9C0/\uC774\uBCA4\uD2B8/\uC5C5\uB370\uC774\uD2B8 \uC18C\uC2DD\uC744 \uBE60\uB974\uAC8C \uD655\uC778\uD574 \uBCF4\uC138\uC694.'
      : 'Read the latest announcements, events, and update notes in one feed.');

  return (
    <div className={styles.newsPage}>
      <PageSeo page="news" language={locales.language} />
      <section className={styles.newsHero}>
        <p className={styles.newsKicker}>BRAWL STARS</p>
        <h1>{newsTitle}</h1>
        <p>{newsDescription}</p>
      </section>
      <section className={styles.newsFeedCard}>
        <NewsItemsContent layout={'full'} />
      </section>
    </div>
  );
};
