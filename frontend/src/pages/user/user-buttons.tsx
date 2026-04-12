import React, { useContext, useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import moment from 'moment/moment';

import { CdnContext } from '~/context/cdn.context';
import { UserContext } from '~/context/user.context';
import { useInterval } from '~/hooks/use-interval.hook';

import styles from '~/assets/styles/pages/user/user-buttons.module.scss';

export const UserButtonsContainer = () => {
  const locales = useContext(CdnContext);

  const context = useContext(UserContext);
  const {
    user,
    setRetryProfileCount,
    setRetryBrawlerCount,
    setProfileLoaded,
    setBrawlerLoaded,
    setBattlesLoaded
  } = context;
  const [lastUpdatedDiff, setLastUpdatedDiff] = useState(moment.duration(moment().diff(moment(user.updatedAt))).asMinutes());

  useInterval(() => {
    setLastUpdatedDiff(moment.duration(moment().diff(moment(user.updatedAt))).asMinutes());
  }, 1000);

  return (
    <div className={styles.buttonBoxContent}>
      <span
        className={styles.userReloadButton}
        onClick={() => {
          if (lastUpdatedDiff > 1) {
            setProfileLoaded(false);
            setBrawlerLoaded(false);
            setBattlesLoaded(false);
            setRetryProfileCount(0);
            setRetryBrawlerCount(0);
          }
        }}
      >
        <span>{locales.user['title'].update}</span>
        <span>
          <span>{Math.floor(lastUpdatedDiff)}</span>
          <span>{locales.user['title'].updateAgo}</span>
        </span>
      </span>
      <CopyToClipboard text={user.userID} onCopy={() => alert(locales.user['title'].copyAlert)}>
        <span className={styles.userReloadButton}>{locales.user['title'].copyTag}</span>
      </CopyToClipboard>
      <CopyToClipboard text={user.userID}>
        <a className={styles.userReloadButton} href={`brawlstars://addFriend?tag=${user.userID}`}>
          {locales.user['title'].copyTagAndRun}
        </a>
      </CopyToClipboard>
    </div>
  );
};
