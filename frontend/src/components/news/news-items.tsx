import React, { useContext, useEffect, useState } from 'react';

import { NewsService } from '~/services/news.service';
import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/components/news/news-items.module.scss';

type NewsItemsContentProps = {
  layout?: 'compact' | 'full';
};

export const NewsItemsContent = ({ layout = 'compact' }: NewsItemsContentProps) => {
  const locales = useContext(CdnContext);
  const [news, setNews] = useState([]);

  useEffect(() => {
    NewsService.getNewsList(locales.language)
      .then((data) => {
        return data;
      })
      .then((data) => {
        setNews(data.slice(0, 10));
      });
  }, [locales.language]);

  const transformString = (input: string) => {
    // 특수문자를 제거하고 띄어쓰기를 '-'로 변환
    let transformed = input.replace(/[^\w\s가-힣a-zA-Z]/g, '').replace(/\s+/g, '-');

    // 마지막에 '-'가 있으면 제거
    if (transformed.endsWith('-')) {
      transformed = transformed.slice(0, -1);
    }
    return transformed.toLowerCase();
  };

  return (
    <div className={`${styles.newsItemsContent} ${layout === 'full' ? styles.newsItemsContentFull : ''}`}>
      {news.map((item) => {
        let url: string;

        if (item.type === 'newsEntry') {
          url = `news/${transformString(item.title)}`;
        } else if (item.type === 'externalNewsEntry') {
          url = item.url;
        } else if (item.type === 'imageNewsEntry') {
          url = null;
        }
        const isClickable = Boolean(url);

        return (
          <a
            key={item.id}
            href={url || '#'}
            target={isClickable ? '_blank' : undefined}
            rel={isClickable ? 'noreferrer' : undefined}
            aria-disabled={!isClickable}
            className={!isClickable ? styles.disabledNewsLink : undefined}
          >
            <img src={`/inbox${item.thumbnailPath}`} alt={item.thumbnailPath} />
            <div>
              <div>
                {item.category && <img src={`/images/news/${item.category}.webp`} alt={item.category} />}
                {new Date(item.postDate).toLocaleDateString()}
              </div>
              <div>
                <h4>{item.title}</h4>
                {url && <img src={`/images/news/connect-link.webp`} alt={'connect-link'} />}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};
