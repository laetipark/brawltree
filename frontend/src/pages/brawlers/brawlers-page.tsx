import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BrawlerSelection } from '~/components/brawler/selection/brawler-selection';
import { BrawlerInfo } from '~/components/brawler/info/brawler-info';
import { BrawlerStats } from '~/components/brawler/stats/brawler-stats';
import { Spinner } from '~/components/spinner/spinner';
import { PageSeo } from '~/components/seo/page-seo';

import { BrawlerType } from '~/common/types/brawlers.type';
import { BrawlerService } from '~/services/brawler.service';
import { CdnContext } from '~/context/cdn.context';
import { toBrawlerDisplayName, toBrawlerRouteName } from '~/utils/brawler-route';

import styles from './brawlers-page.module.scss';

/**
 * 라우트 또는 API 응답이 비어 있을 때 보여줄 기본 브롤러입니다.
 */
const DEFAULT_BRAWLER: BrawlerType = {
  id: '16000000',
  name: 'SHELLY',
  rarity: 'Trophy Road',
  role: 'Damage Dealer',
  gender: 'Female'
};

/**
 * 브롤러 상세 페이지의 개요, 상세 정보, 통계 섹션을 조립합니다.
 *
 * 라우트 이름을 정규화해 선택 브롤러를 맞추고, 개요 API와 상세 API 실패를
 * 분리해 일부 데이터 장애가 전체 페이지를 막지 않도록 합니다.
 */
export const Brawlers = () => {
  const { name } = useParams();
  const locales = useContext(CdnContext);
  const [brawlers, setBrawlers] = useState<BrawlerType[]>([]);
  const [brawler, setBrawler] = useState<BrawlerType>(DEFAULT_BRAWLER);

  const [brawlerStats, setBrawlerStats] = useState([]);
  const [brawlerMaps, setBrawlerMaps] = useState([]);

  const [brawlerSkills, setBrawlerSkills] = useState({});
  const [brawlerItems, setBrawlerItems] = useState([]);
  const [overviewLoadFailed, setOverviewLoadFailed] = useState(false);
  const [detailLoadFailed, setDetailLoadFailed] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    // 목록/맵/전체 통계는 페이지 진입 시 한 번만 받아 선택 UI와 요약 카드에 공유한다.
    BrawlerService.getBrawlers()
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setOverviewLoadFailed(false);
        setBrawlers(data.brawlers);
        setBrawlerStats(data.stats);
        setBrawlerMaps(data.maps);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        console.error('Failed to load brawler overview:', error);
        setOverviewLoadFailed(true);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    // 선택된 브롤러가 바뀔 때만 스킬/아이템 상세 정보를 별도로 갱신한다.
    BrawlerService.getBrawler(brawler.id)
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setDetailLoadFailed(false);
        setBrawlerSkills(data.info);
        setBrawlerItems(data.items);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        console.error(`Failed to load brawler detail: ${brawler.id}`, error);
        setDetailLoadFailed(true);
        setBrawlerSkills({});
        setBrawlerItems([]);
      });

    return () => {
      isCancelled = true;
    };
  }, [brawler.id]);

  useEffect(() => {
    // URL 친화 이름과 API 원본 이름을 같은 규칙으로 비교해 직접 진입 라우트를 지원한다.
    const brawlerByName = brawlers.find((currentBrawler) => {
      return toBrawlerRouteName(currentBrawler.name) === toBrawlerRouteName(name);
    });

    setBrawler(brawlerByName || DEFAULT_BRAWLER);
  }, [name, brawlers]);

  const brawlerName = toBrawlerDisplayName(brawler.name || name);
  const localizedBrawlerName = locales.brawler?.brawler?.[brawler.name] || brawlerName;
  const isKorean = locales.language === 'ko';
  const seoTitle = isKorean ? `${localizedBrawlerName} \uBE0C\uB864\uB7EC \uD1B5\uACC4\uC640 \uBE4C\uB4DC` : `${brawlerName} Stats and Build`;
  const seoDescription = isKorean
    ? `${localizedBrawlerName} \uC131\uB2A5, \uCD94\uCC9C \uB9F5, \uAC00\uC82F\uACFC \uC2A4\uD0C0\uD30C\uC6CC \uC870\uD569\uC744 \uD655\uC778\uD558\uC138\uC694.`
    : `Check ${brawlerName} performance, best maps, and item combinations.`;

  return (
    <React.Fragment>
      <PageSeo page="brawler" language={locales.language} title={seoTitle} description={seoDescription} noIndex={overviewLoadFailed && brawlers.length === 0} />
      {overviewLoadFailed && brawlers.length === 0 ? (
        <div className={styles.statusCard}>
          <h2>Failed to load brawler data.</h2>
          <p>Please try again in a moment.</p>
        </div>
      ) : brawlers.length > 0 ? (
        <div className={styles.app}>
          {detailLoadFailed && <div className={styles.statusBanner}>Some detail data for this brawler could not be loaded.</div>}
          <BrawlerSelection brawlers={brawlers} brawler={brawler} setBrawler={setBrawler} />
          <div>
            <BrawlerInfo brawler={brawler} skills={brawlerSkills} items={brawlerItems} />
            <BrawlerStats brawler={brawler} stats={brawlerStats} maps={brawlerMaps} />
          </div>
        </div>
      ) : (
        <Spinner fill={true} />
      )}
    </React.Fragment>
  );
};
