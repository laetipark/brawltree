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

  return decoded
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const NewsListItem = () => {
  const { title } = useParams();
  const locales = useContext(CdnContext);
  const articleTitle = toReadableTitle(title);

  return (
    <React.Fragment>
      <PageSeo
        page="newsDetail"
        language={locales.language}
        title={`${articleTitle} News`}
        description={`Read the full details for ${articleTitle} and related Brawl Stars updates.`}
      />
      <div className={defStyles.app}>
        <NewsItemBox />
      </div>
    </React.Fragment>
  );
};
