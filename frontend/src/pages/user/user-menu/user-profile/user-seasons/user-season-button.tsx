import React, { useContext } from 'react';

import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { UserSeasonModeBox } from '~/pages/user/user-menu/user-profile/user-seasons/user-season-mode';
import { UserSeasonsType } from '~/common/types/users.type';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-seasons/user-season-button.module.scss';

export const UserSeasonButtonBox = ({
  matches,
  toggle,
  setToggle,
  type
}: {
  matches: UserSeasonsType | undefined;
  toggle: boolean;
  setToggle: (toggle: boolean) => void;
  type: 'trophy' | 'ranked';
}) => {
  const locales = useContext(CdnContext);
  const drwCount = (matchCount: number, vicCount: number, defCount: number) => {
    return matchCount - (vicCount + defCount);
  };
  const vicRate = (vicCount: number, defCount: number) => {
    return Math.round((vicCount / (vicCount + defCount)) * 100) || 0;
  };
  const keys = matches ? Object.keys(matches.matchList) : [];

  return (
    keys.length > 0 && (
      <React.Fragment>
        <h3 className={styles.userSeasonButtonBox} onClick={() => setToggle(!toggle)}>
          <FontAwesomeIcon
            icon={faAngleRight}
            style={{
              padding: '2px',
              transform: toggle ? 'rotate(90deg)' : '',
              transition: 'transform 0.3s ease'
            }}
          />
          <span>{locales.battle['type'][`${type}`]}</span>
        </h3>
        {toggle && (
          <div>
            <div className={styles.seasonTypeSummaryBox}>
              <div style={{ color: 'var(--user-win)' }}>
                <span>{matches.victoriesCount}</span>
                <span>{locales.battle['result'].w}</span>
              </div>
              <div style={{ color: 'var(--user-draw)' }}>
                <span>{drwCount(matches.matchCount, matches.victoriesCount, matches.defeatsCount)}</span>
                <span>{locales.battle['result'].d}</span>
              </div>
              <div style={{ color: 'var(--user-loss)' }}>
                <span>{matches.defeatsCount}</span>
                <span>{locales.battle['result'].l}</span>
              </div>
              <span>({vicRate(matches.victoriesCount, matches.defeatsCount)}%)</span>
            </div>
            <div className={styles.matchListBox}>
              {keys.map((key) => {
                const season = matches.matchList[key];
                return (
                  <React.Fragment key={`${matches.matchType}_${season.mode}`}>
                    <UserSeasonModeBox season={season} />
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}
      </React.Fragment>
    )
  );
};
