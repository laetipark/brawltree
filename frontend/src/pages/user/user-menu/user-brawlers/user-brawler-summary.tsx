import React, { useContext } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/free-solid-svg-icons';

import config from '~/common/config/config';
import { CdnContext } from '~/context/cdn.context';

import defStyles from '~/common/styles/app.module.scss';
import styles from '~/assets/styles/pages/user/user-menu/user-brawlers/user-brawler-summary.module.scss';

export const UserBrawlerSummaryContent = ({ brawlerID, brawlerName, brawlerRarity, brawlerPower, brawlerRank, beginTrophies, currentTrophies, highestTrophies, checkedList, checkHandler }) => {
  const locales = useContext(CdnContext);

  const trophyChange = currentTrophies && (currentTrophies - beginTrophies > 0 ? `+${currentTrophies - beginTrophies}` : currentTrophies - beginTrophies);
  const arrowRotate = checkedList && {
    transform: checkedList.includes(brawlerID) ? 'rotate(180deg)' : '',
    transition: 'transform 0.3s ease'
  };

  return (
    <div key={brawlerID} className={styles.userBrawlerSummary}>
      <input
        type={'checkbox'}
        id={`brawler_${brawlerID}`}
        name={`brawler_${brawlerID}`}
        checked={checkedList && checkedList.includes(brawlerID)}
        onChange={(e) => checkHandler && checkHandler(e, brawlerID)}
      />
      <label htmlFor={`brawler_${brawlerID}`} style={{ backgroundColor: !brawlerPower ? 'var(--user-card-muted)' : '' }}>
        <img src={`${config.assets}/brawlers/profiles/${brawlerID}.webp`} alt={brawlerID} />
        <div>
          <div>
            <img src={`${config.assets}/rank/trophy/${brawlerRank || 0}.webp`} alt={'브롤러'} />
            <h3 className={defStyles[`${brawlerRarity}Color`]}>{locales.brawler['brawler'][`${brawlerName}`]}</h3>
            {brawlerPower && (
              <span>
                ({locales.brawler['power']} : {brawlerPower})
              </span>
            )}
          </div>
          {brawlerPower && (
            <div>
              <div>
                <img src={`${config.assets}/modes/icon/trophy.webp`} alt={'브롤러'} />
                <span>{locales.user['records']?.trophies || 'trophies'}</span>
              </div>
              <div>
                <div>
                  <span>{locales.user['brawlers']?.current || 'current'} :</span>
                  <span>
                    {currentTrophies}
                    {trophyChange ? `(${trophyChange})` : ''}
                  </span>
                </div>
                <div>
                  <span>{locales.user['brawlers']?.highest || 'highest'} :</span>
                  <span>{highestTrophies}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {checkedList && <FontAwesomeIcon style={arrowRotate} fontSize={14} icon={faAngleUp} />}
      </label>
    </div>
  );
};
