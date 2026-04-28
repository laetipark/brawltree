import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { NewsItemBox } from '~/components/news/news-item';
import { PageSeo } from '~/components/seo/page-seo';
import { CdnContext } from '~/context/cdn.context';

import defStyles from '~/common/styles/app.module.scss';

const toReadableTitle = (value?: string) => {
  if (!value) {
    return 'News';
  }

  const decoded = (() => {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return value;
    }
  })();

  return decoded.replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
};

export const NewsListItem = () => {
  const { title } = useParams();
  const locales = useContext(CdnContext);
  const articleTitle = toReadableTitle(title);
  const isKorean = locales.language === 'ko';
  const seoTitle = isKorean ? `${articleTitle} \uB274\uC2A4` : `${articleTitle} News`;
  const seoDescription = isKorean
    ? `${articleTitle} \uB274\uC2A4 \uBCF8\uBB38\uACFC \uBE0C\uB864\uC2A4\uD0C0\uC988 \uC5C5\uB370\uC774\uD2B8 \uB0B4\uC6A9\uC744 \uD655\uC778\uD558\uC138\uC694.`
    : `Read the full details for ${articleTitle} and related Brawl Stars updates.`;

  return (
    <React.Fragment>
      <PageSeo page="newsDetail" language={locales.language} title={seoTitle} description={seoDescription} noIndex={!title} />
      <div className={defStyles.app}>
        <NewsItemBox />
      </div>
    </React.Fragment>
  );
};
