import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { NewsService } from '~/services/news.service';
import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/components/news/news-item.module.scss';

export const NewsItemBox = () => {
  const { title } = useParams();
  const locales = useContext(CdnContext);
  const [newsItem, setNewsItem] = useState({
    title: '',
    details: []
  });

  useEffect(() => {
    NewsService.getNewsListItem(locales.language, title).then((data) => {
      setNewsItem(data);
    });
  }, [locales.language]);

  return (
    <div className={styles.newsItemBox}>
      <h1>{newsItem.title}</h1>
      {newsItem.details &&
        newsItem.details.map((item) => {
          switch (item.type) {
            case 'textBlock':
              return (
                <React.Fragment>
                  <h2>{item.title}</h2>
                  <div
                    className={styles.newsTextBox}
                    dangerouslySetInnerHTML={{
                      __html: item.body.replace(/\n/g, '<br />')
                    }}
                  />
                </React.Fragment>
              );
            case 'featureBlock':
              return (
                <div className={styles.newsFeatureBox}>
                  <img src={`/inbox${item.image.medium.path}`} alt={item.image.medium.path} />
                  <div>
                    <h3>{item.title}</h3>
                    <div dangerouslySetInnerHTML={{ __html: item.body }} />
                  </div>
                </div>
              );
            case 'imageBlock':
              return <img className={styles.newsImageBlock} src={`/inbox${item.image.largeRetina.path}`} alt={item.image.largeRetina.path} />;
          }

          return null;
        })}
    </div>
  );
};
