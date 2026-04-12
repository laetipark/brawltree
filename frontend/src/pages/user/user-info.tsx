import React, { useContext } from 'react';

import config from '~/common/config/config';

import { UserContext } from '~/context/user.context';

import styles from '~/assets/styles/pages/user/user-info.module.scss';

export const UserInfoContainer = () => {
  const userContext = useContext(UserContext);
  const { user } = userContext;

  return (
    <div className={styles.userInfoContainer}>
      {user.profileIcon !== '' && <img className={styles.image} src={`${config.assets}/brawlian/profile/${user.profileIcon}.webp`} alt={user.profileIcon} />}
      <div>
        <h1 className={styles.realName}>
          {`${user.userName}`} <span className={styles.userTag}>{user.userID}</span>
        </h1>
        <div className={styles.crewName}>
          <span>{`${user.crew || ''}`}</span>
          <span>{user.crewName ? `[${user.crewName}]` : ''}</span>
        </div>
      </div>
    </div>
  );
};
