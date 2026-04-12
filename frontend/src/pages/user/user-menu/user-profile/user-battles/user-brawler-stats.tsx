import React, { useContext } from 'react';
import config from '~/common/config/config';
import { CdnContext } from '~/context/cdn.context';

import { UserRecentBrawlersType, UserDailyBrawlersType } from '~/common/types/users.type';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-battles/user-brawler-stats.module.scss';

export const UserBrawlerStatsBox = ({ brawlers, type }) => {
  const locales = useContext(CdnContext);

  const rateContainer = (brawler: UserDailyBrawlersType) => (
    <div className={styles.brawlerSubContainer}>
      <div>
        Pick <span>{brawler.pickRate}%</span>
      </div>
      <div>
        Win <span>{brawler.victoryRate}%</span>
      </div>
    </div>
  );

  const statContainer = (brawler: UserRecentBrawlersType) => {
    return (
      <div>
        <span style={{ color: 'var(--user-win)' }}>
          {brawler.resultCount['-1'] || 0}
          {locales.battle['result'].w}
        </span>
        <span style={{ color: 'var(--user-draw)' }}>
          {brawler.resultCount['0'] || 0}
          {locales.battle['result'].d}
        </span>
        <span style={{ color: 'var(--user-loss)' }}>
          {brawler.resultCount['1'] || 0}
          {locales.battle['result'].l}
        </span>
      </div>
    );
  };

  return brawlers.length ? (
    <div className={styles.userBrawlerStatsBox}>
      {brawlers?.map((brawler: UserDailyBrawlersType | UserRecentBrawlersType) => {
        const subContainer = type === 'rate' ? rateContainer(brawler as UserDailyBrawlersType) : statContainer(brawler as UserRecentBrawlersType);

        return (
          <div key={brawler.brawlerID}>
            <div>
              <img src={`${config.assets}/brawlers/profiles/${brawler.brawlerID}.webp`} alt={locales.brawler['brawler'][`${brawler.brawlerName}`]} />
              <div>
                <h4>{locales.brawler['brawler'][`${brawler.brawlerName}`]}</h4>
                <div>
                  <span>{brawler.matchCount}</span> {locales.application['games']}
                </div>
              </div>
            </div>
            {subContainer}
          </div>
        );
      })}
    </div>
  ) : (
    <div className={styles.noUserBrawlerStatData}>
      <img src={'/images/user/GrimMortis.webp'} alt={'GrimMortis'} />
      <div>{locales.user['noBrawlerData']}</div>
    </div>
  );
};
