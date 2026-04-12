import React, { useContext } from 'react';

import { UserFriendMatchType } from '~/common/types/users.type';
import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-friends/user-friend-info-item.module.scss';

export const UserFriendInfoItemBox = ({
  matchList,
  isDetailVisible
}: {
  matchList: UserFriendMatchType[];
  isDetailVisible: boolean;
}) => {
  const locales = useContext(CdnContext);
  const drwCount = (matchCount: number, vicCount: number, defCount: number) => {
    return matchCount - (vicCount + defCount);
  };

  return (
    <div className={styles.friendInfoItemBox} style={{ display: isDetailVisible ? 'flex' : 'none' }}>
      {matchList?.map((match: UserFriendMatchType) => {
        return (
          <div key={`${match.friendID}_${match.mode}_${match.matchType}_${match.matchGrade}`}>
            <div>
              {match.matchType === 0 ? (
                <img className={styles.iconImage} src={`${config.assets}/modes/icon/trophy.webp`} alt={'trophy_mode'} />
              ) : match.matchType === 2 ? (
                <img className={styles.iconImage} src={`${config.assets}/modes/icon/ranked.webp`} alt={'ranked_mode'} />
              ) : match.matchType === 3 ? (
                <img className={styles.iconImage} src={`${config.assets}/modes/icon/powerLeagueTeam.webp`} alt={'powerleague_mode'} />
              ) : (
                <img className={styles.iconImage} src={`${config.assets}/modes/icon/challenge.webp`} alt={'challenge_mode'} />
              )}
              <span>|</span>
              <img className={styles.iconImage} src={`${config.assets}/modes/icon/${match.mode}.webp`} alt={'battle_mode'} />
              <span>|</span>
              {match.matchType === 0 ? (
                <img className={styles.iconImage} src={`${config.assets}/rank/trophy/grade/${match.matchGrade}.webp`} alt={'trophy_grade'} />
              ) : [2, 3].includes(match.matchType) ? (
                <img className={styles.iconImage} src={`${config.assets}/rank/ranked/${match.matchGrade}.webp`} alt={'ranked_grade'} />
              ) : (
                <img className={styles.iconImage} src={`${config.assets}/modes/icon/challenge.webp`} alt={'challenge_grade'} />
              )}
            </div>
            <div>
              <span>{match.matchCount}</span>
              <span>{locales.battle['result'].game}</span>
            </div>
            <div style={{ color: 'var(--user-win)' }}>
              <span>{match.victoriesCount}</span>
              <span>{locales.battle['result'].w}</span>
            </div>
            <div style={{ color: 'var(--user-draw)' }}>
              <span>{drwCount(match.matchCount, match.victoriesCount, match.defeatsCount)}</span>
              <span>{locales.battle['result'].d}</span>
            </div>
            <div style={{ color: 'var(--user-loss)' }}>
              <span>{match.defeatsCount}</span>
              <span>{locales.battle['result'].l}</span>
            </div>
            <div>
              (
              <span>
                {match.victoriesCount > 0 ? Math.round((match.victoriesCount / (match.victoriesCount + match.defeatsCount)) * 100) : 0}
                %)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
