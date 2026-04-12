import React, { useContext, useState } from 'react';
import { UserSeasonButtonBox } from '~/pages/user/user-menu/user-profile/user-seasons/user-season-button';
import { UserSeasonsType } from '~/common/types/users.type';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-seasons.module.scss';

export const UserSeasonsContent = ({ seasonList }: { seasonList: UserSeasonsType[] }) => {
  const locales = useContext(CdnContext);

  const [trophyToggle, setTrophyToggle] = useState(false);
  const [rankedToggle, setRankedToggle] = useState(false);

  const matchCount =
    seasonList.length !== 0
      ? Math.round(
          seasonList.reduce((sum, value) => {
            return sum + (value.matchCount || 0);
          }, 0) * 100
        ) / 100
      : 0;
  const totalMatchVicCount =
    seasonList.length !== 0
      ? Math.round(
          seasonList.reduce((sum, value) => {
            return sum + (value.victoriesCount || 0);
          }, 0) * 100
        ) / 100
      : 0;
  const totalMatchDefCount =
    seasonList.length !== 0
      ? Math.round(
          seasonList.reduce((sum, value) => {
            return sum + (value.defeatsCount || 0);
          }, 0) * 100
        ) / 100
      : 0;

  const trophyMatches = seasonList?.find((item) => {
    return item.matchType === 0;
  });

  const rankedMatches = seasonList?.find((item) => {
    return item.matchType === 2;
  });

  const drwCount = (matchCount: number, vicCount: number, defCount: number) => {
    return matchCount - (vicCount + defCount);
  };
  const vicRate = (vicCount: number, defCount: number) => {
    return Math.round((vicCount / (vicCount + defCount)) * 100) || 0;
  };

  return (
    <div className={styles.seasonContent}>
      <div>
        <h2>
          {locales.user['crew'].seasonRecord}
          <span>
            ({matchCount}
            {locales.battle['result'].game})
          </span>
        </h2>
        <div className={styles.seasonTotalSummaryBox}>
          <div style={{ color: 'var(--user-win)' }}>
            <span>{totalMatchVicCount}</span>
            <span>{locales.battle['result'].w}</span>
          </div>
          <div style={{ color: 'var(--user-draw)' }}>
            <span>{drwCount(matchCount, totalMatchVicCount, totalMatchDefCount)}</span>
            <span>{locales.battle['result'].d}</span>
          </div>
          <div style={{ color: 'var(--user-loss)' }}>
            <span>{totalMatchDefCount}</span>
            <span>{locales.battle['result'].l}</span>
          </div>
          <span>({vicRate(totalMatchVicCount, totalMatchDefCount)}%)</span>
        </div>
      </div>
      <UserSeasonButtonBox matches={trophyMatches} toggle={trophyToggle} setToggle={setTrophyToggle} type={'trophy'} />
      <UserSeasonButtonBox matches={rankedMatches} toggle={rankedToggle} setToggle={setRankedToggle} type={'ranked'} />
    </div>
  );
};
