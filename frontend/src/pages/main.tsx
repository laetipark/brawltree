import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SearchUserContainer } from '~/pages/main/search-user';
import { BrawlerSummaryContainer } from '~/pages/main/brawler-summary';
import { EventSummaryContainer } from '~/components/maps/event-summary';
import { NewsSummaryContainer } from '~/pages/main/news-summary';

import { SearchItemType } from '~/common/types/main.type';

import { EventService } from '~/services/event.service';
import { BrawlerService } from '~/services/brawler.service';
import { CdnContext } from '~/context/cdn.context';
import { SearchContext } from '~/context/search.context';
import { PageSeo } from '~/components/seo/page-seo';

import defStyles from '~/common/styles/app.module.scss';
import styles from '~/assets/styles/pages/main.module.scss';

export const MainWrapper = () => {
  const locales = useContext(CdnContext);

  const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem('searchHistory') || '[]'));
  const [trophyEvents, setTrophyEvents] = useState([]);
  const [rankedEvents, setRankedEvents] = useState([]);
  const [brawlersTrophy, setBrawlersTrophy] = useState([]);
  const [brawlersRanked, setBrawlersRanked] = useState([]);

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    EventService.getTLCurrentEvents().then((data) => setTrophyEvents(data));
    EventService.getPLEvents().then((data) => setRankedEvents(data));
  }, []);

  useEffect(() => {
    BrawlerService.getBrawlerSummary().then((data) => {
      setBrawlersTrophy(data.brawlersTrophy);
      setBrawlersRanked(data.brawlersRanked);
    });
  }, []);

  /** Function related to recent search */
  const handleAddSearchItem = useCallback((userID: string) => {
    setSearchHistory((prevSearchHistory: SearchItemType[]) => {
      const user = prevSearchHistory.find((searchItem: SearchItemType) => searchItem.userID === userID);
      const searchItem = {
        id: Date.now(),
        userID
      };

      if (!user) {
        return [searchItem, ...prevSearchHistory].slice(0, 10);
      }

      return [searchItem, ...prevSearchHistory.filter((item: SearchItemType) => item.userID !== userID)];
    });
  }, []);

  const handleFilterSearchItem = useCallback((userIDs: string[]) => {
    setSearchHistory((prevSearchHistory: SearchItemType[]) => {
      const nextKeyword = prevSearchHistory.filter((item: SearchItemType) => {
        return userIDs.includes(item.userID);
      });

      return prevSearchHistory.length === nextKeyword.length ? prevSearchHistory : nextKeyword;
    });
  }, []);

  const handleRemoveSearchItem = useCallback((userID: string) => {
    setSearchHistory((prevSearchHistory: SearchItemType[]) => {
      return prevSearchHistory.filter((searchItem: SearchItemType) => searchItem.userID !== userID);
    });
  }, []);

  const searchContextValue = useMemo(
    () => ({
      searchHistory,
      setSearchHistory,
      onAddSearchHistory: handleAddSearchItem,
      onFilterSearchItem: handleFilterSearchItem,
      onRemoveSearchItem: handleRemoveSearchItem
    }),
    [searchHistory, handleAddSearchItem, handleFilterSearchItem, handleRemoveSearchItem]
  );

  return (
    <div className={`${defStyles.app} ${styles.mainPage}`}>
      <PageSeo page="home" language={locales.language} />
      <div className={styles.mainHeadContainer}>
        <img src={'/images/main/main-1.webp'} alt={'메인'} />
        <h1>{locales.main['introduce'] || 'introduce'}</h1>
      </div>
      <SearchContext.Provider value={searchContextValue}>
        <SearchUserContainer />
      </SearchContext.Provider>
      <NewsSummaryContainer />
      <EventSummaryContainer events={trophyEvents} type={'curr'} />
      <EventSummaryContainer events={rankedEvents} type={'ranked'} />
      <BrawlerSummaryContainer brawlersTrophy={brawlersTrophy} brawlersRanked={brawlersRanked} />
    </div>
  );
};
