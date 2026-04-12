import React, { useContext, useEffect, useRef, useState } from 'react';
import YouTube from 'react-youtube';

import { NewsItemsContent } from '~/components/news/news-items';
import { MainService } from '~/services/main.service';
import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/main/news-summary.module.scss';

export const NewsSummaryContainer = () => {
  const locales = useContext(CdnContext);

  const [brawlTalk, setBrawlTalk] = useState('');
  const [communityEvent, setCommunityEvent] = useState('');
  const [newsColumnHeight, setNewsColumnHeight] = useState<number | null>(null);
  const youtubeStackRef = useRef<HTMLDivElement | null>(null);
  const opts = {
    height: '100%',
    width: '100%'
  };

  useEffect(() => {
    MainService.getYoutubePlayListItem('PLTBLax1DE1612clulHb7Ci4JQEVMKoC7x').then((data) => {
      setBrawlTalk(data.items[0].snippet.resourceId.videoId);
    });

    MainService.getYoutubePlayListItem('PLTBLax1DE16277M59DSqvch_-eVxL8R1S').then((data) => {
      setCommunityEvent(data.items[0].snippet.resourceId.videoId);
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const shouldSyncNewsHeight = (width: number) => {
      return width <= 900 || width >= 1024;
    };

    const syncNewsHeight = () => {
      if (!youtubeStackRef.current || !shouldSyncNewsHeight(window.innerWidth)) {
        setNewsColumnHeight(null);
        return;
      }

      const nextHeight = Math.ceil(youtubeStackRef.current.getBoundingClientRect().height);
      setNewsColumnHeight((prevHeight) => (prevHeight === nextHeight ? prevHeight : nextHeight));
    };

    const handleResize = () => {
      window.requestAnimationFrame(syncNewsHeight);
    };

    syncNewsHeight();
    window.addEventListener('resize', handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if ('ResizeObserver' in window && youtubeStackRef.current) {
      resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(syncNewsHeight);
      });
      resizeObserver.observe(youtubeStackRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return (
    <React.Fragment>
      <div className={styles.brawlNewsContainer}>
        <h2 className={styles.brawlNewsTitle}>{locales.main['news'] || 'news'}</h2>
        <div className={styles.brawlNewsBox}>
          <div className={styles.youtubeColumn}>
            <div className={styles.youtubeStack} ref={youtubeStackRef}>
              <div className={styles.youtubeCard}>
                <YouTube videoId={brawlTalk} opts={opts} />
              </div>
              <div className={styles.youtubeCard}>
                <YouTube videoId={communityEvent} opts={opts} />
              </div>
            </div>
          </div>
          <div className={styles.newsColumn} style={newsColumnHeight ? { height: `${newsColumnHeight}px` } : undefined}>
            <NewsItemsContent />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
