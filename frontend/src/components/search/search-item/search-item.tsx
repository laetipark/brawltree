import React, { useContext } from 'react';

import config from '~/common/config/config';
import { CdnContext } from '~/context/cdn.context';
import { withLanguagePath } from '~/common/i18n/language-route';

import styles from './search-item.module.scss';

const roman = ['I', 'II', 'III'];

export const SearchItem = ({ user, onAddSearchHistory, onRemoveSearchItem }) => {
  const locales = useContext(CdnContext);
  const userTag = user.userID.replace('#', '');
  const linkLabel = locales.language === 'ko'
    ? `${user.userName} ${user.userID} 브롤스타즈 전적`
    : `${user.userName} ${user.userID} Brawl Stars stats`;

  return (
    <li key={user.userID} value={user.userName}>
      <a
        className={styles.searchItemWrapper}
        href={withLanguagePath(`/brawlian/${userTag}`, locales.language)}
        aria-label={linkLabel}
        onClick={() => {
          onAddSearchHistory?.(user.userID);
        }}
      >
        <img className={styles.image} src={`${config.assets}/brawlian/profile/${user.profileIcon}.webp`} alt={user.profileIcon} />
        <div>
          <div className={styles.searchItemTitle}>
            <span>{user.userName}</span>
            {onRemoveSearchItem && (
              <img
                src={'/images/etc/close.webp'}
                alt={'close'}
                onClick={(e) => {
                  e.preventDefault();
                  onRemoveSearchItem(user.userID);
                }}
              />
            )}
          </div>
          {user.crewName && (
            <div className={styles.searchItemContent}>
              <span className={styles.searchItemCrewName}>{user.crewName}</span>
            </div>
          )}
          <div className={styles.searchItemContent}>
            <span className={styles.searchItemTag}>{user.userID}</span>
          </div>
          <div className={styles.searchItemContent}>
            <span className={styles.searchItemTrophy}>
              <img src={`${config.assets}/modes/icon/trophy.webp`} alt={'trophyLeague'} />
              {user.currentTrophies}
            </span>
            <span className={styles.searchItemRanked}>
              <img src={`${config.assets}/rank/ranked/${Math.floor(user.currentSoloRanked / 3)}.webp`} alt={Math.floor(user.currentSoloRanked / 3).toString()} />
              {user.currentSoloRanked / 3 < 6 ? roman[user.currentSoloRanked % 3] : ''}
            </span>
          </div>
        </div>
      </a>
    </li>
  );
};
