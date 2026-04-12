import React, { useContext, useState } from 'react';

import { UserFriendInfoItemBox } from '~/pages/user/user-menu/user-profile/user-friends/user-friend-info-item';
import { UserFriendType } from '~/common/types/users.type';
import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';
import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-friends/user-friend-info.module.scss';

export const UserFriendInfoBox = ({ friend }: { friend: UserFriendType }) => {
  const locales = useContext(CdnContext);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const drwCount = (matchCount: number, vicCount: number, defCount: number) => {
    return matchCount - (vicCount + defCount);
  };

  return (
    <a key={friend.friendID} href={`../brawlian/${friend.friendID.replace('#', '')}`} className={styles.friendInfoBox}>
      <div className={styles.friendSummaryBox} onMouseLeave={() => setIsDetailVisible(false)}>
        <img src={`${config.assets}/brawlian/profile/${friend.profileIcon}.webp`} alt={friend.profileIcon} />
        <div>
          <h3>
            <span>{friend.friendName}</span>
            <img
              src={'/images/etc/info.webp'}
              alt={'info'}
              onClick={(e) => {
                e.preventDefault();
                setIsDetailVisible(!isDetailVisible);
              }}
            />
          </h3>
          <div>
            <div>
              <span>{friend.matchCount}</span>
              <span>{locales.battle['result'].game}</span>
            </div>
            <div style={{ color: 'var(--user-win)' }}>
              <span>{friend.victoriesCount}</span>
              <span>{locales.battle['result'].w}</span>
            </div>
            <div style={{ color: 'var(--user-draw)' }}>
              <span>{drwCount(friend.matchCount, friend.victoriesCount, friend.defeatsCount)}</span>
              <span>{locales.battle['result'].d}</span>
            </div>
            <div style={{ color: 'var(--user-loss)' }}>
              <span>{friend.defeatsCount}</span>
              <span>{locales.battle['result'].l}</span>
            </div>
            <div>
              (
              <span>
                {friend.victoriesCount > 0
                  ? Math.round(
                      (friend.victoriesCount /
                        (friend.victoriesCount + friend.defeatsCount)) *
                        100
                    )
                  : 0}
                %)
              </span>
            </div>
          </div>
        </div>
      </div>
      <UserFriendInfoItemBox matchList={friend.matchList} isDetailVisible={isDetailVisible} />
    </a>
  );
};
