import React, { useContext, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import { TypeComboBox } from '~/components/combo/type-combo';
import { ModeMenu } from '~/components/combo/mode-combo';
import { UserDailyStatsBox } from '~/pages/user/user-menu/user-profile/user-battles/user-daily-stats';
import { UserBattleLogsBox } from '~/pages/user/user-menu/user-profile/user-battles/user-battle-logs';

import { CdnContext } from '~/context/cdn.context';
import { UserProfileContext } from '~/context/user.context';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-battles.module.scss';

export const UserBattlesContent = ({ setBattleStack, setBattlesLoaded, battlesStackEnded, setBattlesStackEnded }) => {
  const locales = useContext(CdnContext);

  const userSummaryContext = useContext(UserProfileContext);
  const target = useRef(null);

  const { type, setType, mode, setMode, modeTL, modePL } = userSummaryContext;
  const { summaryBattles, dailyBrawlers, currentSeason } = userSummaryContext;
  const { recentBattles, recentBrawlers, battles } = userSummaryContext;

  const setMatchType = ({ target }) => {
    setType(target.value);
    setMode('all');
  };

  const setMatchMode = ({ target }) => {
    setMode(target.value);
  };

  useEffect(() => {
    const options = {
      threshold: 1.0
    };

    const callback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry: IntersectionObserverEntry) => {
        if (entry.isIntersecting) {
          setBattleStack((prevStack: number) => {
            if (recentBattles.length % 30 === 0) {
              setBattlesLoaded(false);
              return prevStack + 1;
            } else {
              setBattlesStackEnded(true);
            }

            return prevStack;
          });
        }
      });
    };

    const observer = new IntersectionObserver(callback, options);

    if (target.current) {
      observer.observe(target.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [recentBattles]);

  return (
    <div className={styles.battlesContent}>
      <h2>{locales.user['battle']?.battles || 'battles'}</h2>
      <div className={styles.battleStatsGroup}>
        <div className={styles.battleStatsMenus}>
          <TypeComboBox type={type} setMatchType={setMatchType} />
          <ModeMenu mode={mode} setMatchMode={setMatchMode} type={type} modeTL={modeTL} modePL={modePL} />
        </div>
        <UserDailyStatsBox summaryBattles={summaryBattles} dailyBrawlers={dailyBrawlers} season={currentSeason} />
      </div>
      <UserBattleLogsBox recentBattles={recentBattles} recentBrawlers={recentBrawlers} battles={battles} />
      <div className={styles.breakLine} style={{ display: !battlesStackEnded ? 'flex' : 'none' }} ref={target}>
        {<FontAwesomeIcon icon={faEllipsis} fontSize={28} />}
      </div>
    </div>
  );
};
