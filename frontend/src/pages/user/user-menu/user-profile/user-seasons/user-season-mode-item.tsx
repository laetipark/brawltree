import React, { useContext } from 'react';
import { UserSeasonGradeType } from '~/common/types/users.type';

import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-seasons/user-season-mode-item.module.scss';

export const UserSeasonModeItemBox = ({
  items,
  hover
}: {
  items: UserSeasonGradeType[];
  hover: boolean;
}) => {
  const locales = useContext(CdnContext);
  const drwCount = (matchCount: number, vicCount: number, defCount: number) => {
    return matchCount - (vicCount + defCount);
  };

  return (
    <div className={styles.userSeasonModeItemBox} style={{ display: hover ? 'flex' : 'none' }}>
      {items.map((item) => {
        return (
          <div key={`${item.modeName}_${item.matchType}_${item.matchGrade}`}>
            <div>
              {item.matchType === 0 ? (
                <img className={styles.iconImage} src={`${config.assets}/rank/trophy/grade/${item.matchGrade}.webp`} alt={`trophy_${item.matchGrade}`} />
              ) : [2, 3].includes(item.matchType) ? (
                <img className={styles.iconImage} src={`${config.assets}/rank/ranked/${item.matchGrade}.webp`} alt={`ranked_${item.matchGrade}`} />
              ) : (
                <img className={styles.iconImage} src={`${config.assets}/modes/icon/challenge.webp`} alt={'challenge_mode'} />
              )}
            </div>
            <div>
              <span>{item.matchCount}</span>
              <span>{locales.battle['result'].game}</span>
            </div>
            <div style={{ color: 'var(--user-win)' }}>
              <span>{item.victoriesCount}</span>
              <span>{locales.battle['result'].w}</span>
            </div>
            <div style={{ color: 'var(--user-draw)' }}>
              <span>{drwCount(item.matchCount, item.victoriesCount, item.defeatsCount)}</span>
              <span>{locales.battle['result'].d}</span>
            </div>
            <div style={{ color: 'var(--user-loss)' }}>
              <span>{item.defeatsCount}</span>
              <span>{locales.battle['result'].l}</span>
            </div>
            <div>
              (
              <span>
                {item.victoriesCount > 0 ? Math.round((item.victoriesCount / (item.victoriesCount + item.defeatsCount)) * 100) : 0}
                %)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
