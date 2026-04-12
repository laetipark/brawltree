import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';

import { UserBattleLogsItemBox } from '~/pages/user/user-menu/user-profile/user-battles/user-battle-logs-item';
import { UserBrawlerStatsBox } from '~/pages/user/user-menu/user-profile/user-battles/user-brawler-stats';
import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-battles/user-battle-logs.module.scss';

export const UserBattleLogsBox = ({ recentBattles, recentBrawlers, battles }) => {
  const locales = useContext(CdnContext);
  const [graphWidth, setGraphWidth] = useState<number>(0);
  const graphContainerRef = useRef<HTMLDivElement | null>(null);
  const battlePieRef = useRef<any>(null);
  const rolePieRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const element = graphContainerRef.current;
    if (!element) {
      return;
    }

    let rafId = 0;
    const updateWidth = () => {
      const nextWidth = Math.round(element.getBoundingClientRect().width);
      if (nextWidth <= 0) {
        return;
      }

      setGraphWidth((prevWidth) => (prevWidth === nextWidth ? prevWidth : nextWidth));
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
        rafId = window.requestAnimationFrame(updateWidth);
      });

      observer.observe(element);
      return () => {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const resizeCharts = () => {
      battlePieRef.current?.getEchartsInstance?.().resize();
      rolePieRef.current?.getEchartsInstance?.().resize();
    };

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.requestAnimationFrame(resizeCharts);
      } else {
        resizeCharts();
      }
    }, 40);

    return () => clearTimeout(timer);
  }, [graphWidth, recentBattles?.length]);

  const matchCount = recentBattles?.length || 0;
  const vicCount = recentBattles?.filter(({ gameResult }) => gameResult === -1).length || 0;
  const drwCount = recentBattles?.filter(({ gameResult }) => gameResult === 0).length || 0;
  const defCount = recentBattles?.filter(({ gameResult }) => gameResult === 1).length || 0;

  const artCount = recentBattles?.filter(({ role }) => role === 'Artillery').length || 0;
  const sinCount = recentBattles?.filter(({ role }) => role === 'Assassin').length || 0;
  const cntCount = recentBattles?.filter(({ role }) => role === 'Controller').length || 0;
  const dmgCount = recentBattles?.filter(({ role }) => role === 'Damage Dealer').length || 0;
  const mrkCount = recentBattles?.filter(({ role }) => role === 'Marksman').length || 0;
  const supCount = recentBattles?.filter(({ role }) => role === 'Support').length || 0;
  const tnkCount = recentBattles?.filter(({ role }) => role === 'Tank').length || 0;

  const battleData = [
    {
      name: locales.battle['result']['1'],
      value: defCount,
      itemStyle: { color: '#d19aa7' }
    },
    {
      name: locales.battle['result']['0'],
      value: drwCount,
      itemStyle: { color: '#93aed2' }
    },
    {
      name: locales.battle['result']['-1'],
      value: vicCount,
      itemStyle: { color: '#84b898' }
    }
  ];

  const brawlerData = [
    {
      name: locales.brawler['brawlerRole'].Artillery,
      value: Number(((artCount / matchCount) * 100).toFixed(1)) || 0
    },
    {
      name: locales.brawler['brawlerRole'].Assassin,
      value: Number(((sinCount / matchCount) * 100).toFixed(1)) || 0
    },
    {
      name: locales.brawler['brawlerRole'].Tank,
      value: Number(((tnkCount / matchCount) * 100).toFixed(1)) || 0
    },
    {
      name: locales.brawler['brawlerRole']['Damage Dealer'],
      value: Number(((dmgCount / matchCount) * 100).toFixed(1)) || 0
    },
    {
      name: locales.brawler['brawlerRole'].Marksman,
      value: Number(((mrkCount / matchCount) * 100).toFixed(1)) || 0
    },
    {
      name: locales.brawler['brawlerRole'].Support,
      value: Number(((supCount / matchCount) * 100).toFixed(1)) || 0
    },
    {
      name: locales.brawler['brawlerRole'].Controller,
      value: Number(((cntCount / matchCount) * 100).toFixed(1)) || 0
    }
  ];

  const effectiveWidth = graphWidth || (typeof window !== 'undefined' ? window.innerWidth : 1024);
  const pieTier = useMemo(() => {
    if (effectiveWidth < 320) {
      return 'xs';
    }
    if (effectiveWidth < 430) {
      return 'sm';
    }
    if (effectiveWidth < 640) {
      return 'md';
    }
    return 'lg';
  }, [effectiveWidth]);

  const pieRadiusByTier: Record<string, [string, string]> = {
    xs: ['30%', '56%'],
    sm: ['32%', '58%'],
    md: ['36%', '63%'],
    lg: ['38%', '66%']
  };
  const pieCenterByTier: Record<string, [string, string]> = {
    xs: ['50%', '33%'],
    sm: ['50%', '35%'],
    md: ['50%', '38%'],
    lg: ['50%', '41%']
  };
  const pieRadius = pieRadiusByTier[pieTier];
  const pieCenter = pieCenterByTier[pieTier];
  const isNarrowPie = pieTier === 'sm' || pieTier === 'xs';
  const isVeryNarrowPie = pieTier === 'xs';
  const pieRenderKeySeed = Math.floor(effectiveWidth / 24);

  const battlePieOption = useMemo(
    () => ({
      animation: false,
      tooltip: { show: false },
      legend: {
        type: isVeryNarrowPie ? 'scroll' : 'plain',
        bottom: isVeryNarrowPie ? 12 : isNarrowPie ? 18 : 22,
        left: 'center',
        itemWidth: isVeryNarrowPie ? 8 : isNarrowPie ? 9 : 11,
        itemHeight: isVeryNarrowPie ? 8 : isNarrowPie ? 9 : 11,
        itemGap: isVeryNarrowPie ? 8 : isNarrowPie ? 10 : 14,
        pageIconColor: '#6d95b3',
        pageTextStyle: {
          color: '#4f657b',
          fontSize: 10
        },
        textStyle: {
          color: '#233348',
          fontSize: isVeryNarrowPie ? 10 : isNarrowPie ? 11 : 12,
          fontWeight: 700,
          fontFamily:
            '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
        }
      },
      series: [
        {
          type: 'pie',
          radius: pieRadius,
          center: pieCenter,
          silent: true,
          label: {
            show: !isVeryNarrowPie,
            position: 'inside',
            formatter: (params: { value: number }) => (params.value > 0 ? `${params.value}` : ''),
            color: '#233348',
            fontWeight: 700,
            fontSize: isVeryNarrowPie ? 9 : isNarrowPie ? 10 : 12
          },
          labelLine: { show: false },
          itemStyle: {
            borderColor: '#f8fcff',
            borderWidth: 1
          },
          data: battleData
        }
      ]
    }),
    [battleData, isNarrowPie, isVeryNarrowPie, pieCenter, pieRadius]
  );

  const rolePieOption = useMemo(
    () => ({
      animation: false,
      tooltip: { show: false },
      legend: {
        type: isNarrowPie ? 'scroll' : 'plain',
        bottom: isVeryNarrowPie ? 12 : isNarrowPie ? 18 : 22,
        left: 'center',
        itemWidth: isVeryNarrowPie ? 6 : isNarrowPie ? 7 : 8,
        itemHeight: isVeryNarrowPie ? 6 : isNarrowPie ? 7 : 8,
        itemGap: isVeryNarrowPie ? 6 : isNarrowPie ? 8 : 12,
        pageIconColor: '#6d95b3',
        pageTextStyle: {
          color: '#4f657b',
          fontSize: 10
        },
        textStyle: {
          color: '#233348',
          fontSize: isVeryNarrowPie ? 9 : isNarrowPie ? 10 : 12,
          fontWeight: 700,
          fontFamily:
            '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
        }
      },
      series: [
        {
          type: 'pie',
          radius: pieRadius,
          center: pieCenter,
          silent: true,
          label: {
            show: false,
            formatter: (params: { value: number }) => {
              return params.value > 0 ? `${params.value}%` : '';
            },
            color: '#233348',
            fontWeight: 700,
            fontSize: 11
          },
          labelLine: { show: false },
          itemStyle: {
            borderColor: '#f8fcff',
            borderWidth: 1
          },
          data: brawlerData
        }
      ]
    }),
    [brawlerData, isNarrowPie, isVeryNarrowPie, pieCenter, pieRadius]
  );

  return (
    (recentBattles?.length || 0) > 0 && (
      <div className={styles.userBattleLogBox}>
        <div className={styles.recentBattlesBox}>
          <div className={styles.recentBattlesGraphBox} ref={graphContainerRef}>
            <div>
              <div>
                <h3>{locales.user['battle']?.recentBattles || 'recentBattles'}</h3>
                <div>
                  <span>
                    {matchCount}
                    {locales.battle['result'].game}
                  </span>{' '}
                  <span style={{ color: 'var(--user-win)' }}>
                    {vicCount}
                    {locales.battle['result'].w}
                  </span>{' '}
                  <span style={{ color: 'var(--user-draw)' }}>
                    {drwCount}
                    {locales.battle['result'].d}
                  </span>{' '}
                  <span style={{ color: 'var(--user-loss)' }}>
                    {defCount}
                    {locales.battle['result'].l}
                  </span>{' '}
                  <span>
                    ({battles.length} {locales.application['games']})
                  </span>
                </div>
              </div>
              <div className={`${styles.pieFrame} ${styles.pieFrameCompact}`}>
                <ReactECharts
                  key={`battle-pie-${pieTier}-${pieRenderKeySeed}`}
                  ref={battlePieRef}
                  option={battlePieOption}
                  notMerge={true}
                  lazyUpdate={true}
                  opts={{ renderer: 'svg' }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
            <div>
              <h3>{locales.user['battle'].brawlerRoleUsed}</h3>
              <div className={styles.pieFrame}>
                <ReactECharts
                  key={`role-pie-${pieTier}-${pieRenderKeySeed}`}
                  ref={rolePieRef}
                  option={rolePieOption}
                  notMerge={true}
                  lazyUpdate={true}
                  opts={{ renderer: 'svg' }}
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>
          </div>
          <div className={styles.recentBrawlerRecordBox}>
            <div className={styles.battleLogsText}>
              <h3>{locales.user['battle']?.brawlerBattles || 'brawlerBattles'}</h3>
            </div>
            <UserBrawlerStatsBox brawlers={recentBrawlers} type={'stat'} />
          </div>
        </div>
        <div className={styles.battleLogsBox}>
          {battles?.map(({ battleInfo, battlePlayers }) => {
            return <UserBattleLogsItemBox key={battleInfo.battleTime} battleInfo={battleInfo} battlePlayers={battlePlayers} />;
          })}
        </div>
      </div>
    )
  );
};
