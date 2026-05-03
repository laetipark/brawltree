import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SearchUserContainer } from '~/pages/main/search-user';
import { BrawlerSummaryContainer } from '~/pages/main/brawler-summary';
import { EventSummaryContainer } from '~/components/maps/event-summary';
import { NewsSummaryContainer } from '~/pages/main/news-summary';

import { SearchItemType, SearchUserItemType } from '~/common/types/main.type';
import { BrawlerSummaryItemType } from '~/common/types/brawlers.type';

import { EventService } from '~/services/event.service';
import { BrawlerService } from '~/services/brawler.service';
import { MainService } from '~/services/main.service';
import { CdnContext } from '~/context/cdn.context';
import { SearchContext } from '~/context/search.context';
import { PageSeo } from '~/components/seo/page-seo';
import { SearchItem } from '~/components/search/search-item/search-item';

import defStyles from '~/common/styles/app.module.scss';
import styles from '~/assets/styles/pages/main.module.scss';

export const MainWrapper = () => {
  const locales = useContext(CdnContext);

  const [searchHistory, setSearchHistory] = useState(() => JSON.parse(localStorage.getItem('searchHistory') || '[]'));
  const [trophyEvents, setTrophyEvents] = useState([]);
  const [rankedEvents, setRankedEvents] = useState([]);
  const [brawlersTrophy, setBrawlersTrophy] = useState<
    BrawlerSummaryItemType[]
  >([]);
  const [brawlersRanked, setBrawlersRanked] = useState<
    BrawlerSummaryItemType[]
  >([]);
  const [featuredUsers, setFeaturedUsers] = useState<SearchUserItemType[]>([]);
  const isKorean = locales.language === 'ko';
  const homeCopy = isKorean
    ? {
        title: '브롤스타즈 전적 검색',
        subtitle: '브롤트리에서 플레이어 태그 또는 닉네임으로 전적, 트로피, 랭크, 브롤러 통계와 최근 배틀 로그를 확인하세요.',
        infoTitle: '브롤트리에서 확인할 수 있는 정보',
        infoItems: [
          '브롤스타즈 플레이어 전적과 트로피 변화',
          '최근 배틀 로그와 승패 기록',
          '브롤러별 승률과 사용 기록',
          '맵별 추천 브롤러와 이벤트 로테이션'
        ],
        featuredTitle: '최근 업데이트된 브롤스타즈 플레이어 전적'
      }
    : {
        title: 'Brawl Stars Player Stats Search',
        subtitle: 'Search BrawlTree by player tag or nickname to check trophies, ranked stats, brawler stats, and recent battle logs.',
        infoTitle: 'What You Can Check on BrawlTree',
        infoItems: [
          'Brawl Stars player stats and trophy changes',
          'Recent battle logs and match results',
          'Brawler win rates and usage history',
          'Recommended brawlers by map and event rotation'
        ],
        featuredTitle: 'Recently Updated Brawl Stars Player Stats'
      };

  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    EventService.getTLCurrentEvents().then((data) => setTrophyEvents(data));
    EventService.getPLEvents().then((data) => setRankedEvents(data));
  }, []);

  useEffect(() => {
    MainService.getFeaturedUsers(12)
      .then((data) => setFeaturedUsers(data))
      .catch(() => setFeaturedUsers([]));
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    BrawlerService.getBrawlerSummary()
      .then((data) => {
        if (!isSubscribed) {
          return;
        }

        setBrawlersTrophy(data.brawlersTrophy);
        setBrawlersRanked(data.brawlersRanked);
      })
      .catch(() => {
        if (!isSubscribed) {
          return;
        }

        setBrawlersTrophy([]);
        setBrawlersRanked([]);
      });

    return () => {
      isSubscribed = false;
    };
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
        <img src={'/images/main/main-1.webp'} alt={isKorean ? '브롤트리 메인' : 'BrawlTree main'} />
        <div className={styles.mainHeroCopy}>
          <h1>{homeCopy.title}</h1>
          <p>{homeCopy.subtitle}</p>
        </div>
      </div>
      <SearchContext.Provider value={searchContextValue}>
        <SearchUserContainer />
      </SearchContext.Provider>
      <section className={styles.mainInfoSection}>
        <h2>{homeCopy.infoTitle}</h2>
        <ul>
          {homeCopy.infoItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
      {featuredUsers.length > 0 && (
        <section className={styles.featuredUsersSection}>
          <h2>{homeCopy.featuredTitle}</h2>
          <ul>
            {featuredUsers.map((user) => (
              <SearchItem key={user.userID} user={user} onAddSearchHistory={handleAddSearchItem} onRemoveSearchItem={null} />
            ))}
          </ul>
        </section>
      )}
      <NewsSummaryContainer />
      <EventSummaryContainer events={trophyEvents} type={'curr'} />
      <EventSummaryContainer events={rankedEvents} type={'ranked'} />
      <BrawlerSummaryContainer brawlersTrophy={brawlersTrophy} brawlersRanked={brawlersRanked} />
    </div>
  );
};
