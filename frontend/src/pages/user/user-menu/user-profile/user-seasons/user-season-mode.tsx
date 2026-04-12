import React, { useContext, useState } from 'react';

import { UserSeasonModeItemBox } from './user-season-mode-item';
import { UserSeasonModeType } from '~/common/types/users.type';
import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-seasons/user-season-mode.module.scss';

export const UserSeasonModeBox = ({ season }: { season: UserSeasonModeType }) => {
  const locales = useContext(CdnContext);
  const [hover, setHover] = useState(false);
  const drwCount = (matchCount: number, vicCount: number, defCount: number) => {
    return matchCount - (vicCount + defCount);
  };
  const vicRate = (vicCount: number, defCount: number) => {
    return Math.round((vicCount / (vicCount + defCount)) * 100) || 0;
  };

  return (
    <div className={styles.seasonModeBox}>
      <div className={styles.seasonModeStatsSummaryBox} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <img className={styles.modeImage} src={`${config.assets}/modes/icon/${season.mode}.webp`} alt={'season_mode'} />
        <span>
          <div>
            <span>{season.matchCount}</span>
            <span>{locales.battle['result'].game}</span>
          </div>
          <div style={{ color: 'var(--user-win)' }}>
            <span>{season.victoriesCount}</span>
            <span>{locales.battle['result'].w}</span>
          </div>
          <div style={{ color: 'var(--user-draw)' }}>
            <span>{drwCount(season.matchCount, season.victoriesCount, season.defeatsCount)}</span>
            <span>{locales.battle['result'].d}</span>
          </div>
          <div style={{ color: 'var(--user-loss)' }}>
            <span>{season.defeatsCount}</span>
            <span>{locales.battle['result'].l}</span>
          </div>
          <span>({vicRate(season.victoriesCount, season.defeatsCount)}%)</span>
        </span>
      </div>
      <UserSeasonModeItemBox items={season.items} hover={hover} />
    </div>
  );
};
