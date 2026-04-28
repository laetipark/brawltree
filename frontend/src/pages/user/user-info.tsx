import React, { useContext } from 'react';

import config from '~/common/config/config';

import { CdnContext } from '~/context/cdn.context';
import { UserContext } from '~/context/user.context';

import styles from '~/assets/styles/pages/user/user-info.module.scss';

const isActiveFlag = (value: unknown) => value === true || value === 1 || value === '1';

export const UserInfoContainer = () => {
  const locales = useContext(CdnContext);
  const userContext = useContext(UserContext);
  const { user } = userContext;
  const isCrew = isActiveFlag(user.isCrew);
  const isVerified = isActiveFlag(user.isVerified);
  const shouldDisplayStatusBadge = isCrew || isVerified;
  const statusLabel = isCrew ? locales.user?.title?.crewBadge || 'Crew' : isVerified ? locales.user?.title?.officialApiBadge || 'Official API' : null;
  const statusClassName = isCrew ? styles.crewBadge : styles.officialBadge;

  return (
    <div className={styles.userInfoContainer}>
      {user.profileIcon !== '' && <img className={styles.image} src={`${config.assets}/brawlian/profile/${user.profileIcon}.webp`} alt={user.profileIcon} />}
      <div>
        <h1 className={styles.realName}>
          {`${user.userName}`} <span className={styles.userTag}>{user.userID}</span>
        </h1>
        {shouldDisplayStatusBadge && statusLabel && <div className={`${styles.statusBadge} ${statusClassName}`}>{statusLabel}</div>}
        <div className={styles.crewName}>
          <span>{`${user.crew || ''}`}</span>
          <span>{user.crewName ? `[${user.crewName}]` : ''}</span>
        </div>
      </div>
    </div>
  );
};
