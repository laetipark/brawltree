import React, { useContext } from 'react';
import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from './brawler-summary-item.module.scss';

export const BrawlerSummaryItem = ({ brawlerID, brawlerName, pickRate, victoryRate }) => {
  const locales = useContext(CdnContext);

  return (
    <a className={styles.brawlerSummaryItemWrapper} href={`./brawler/${brawlerName.toLowerCase()}`}>
      <div className={styles.brawlerSummaryItemName}>
        <img src={`${config.assets}/brawlers/pins/${brawlerID}.webp`} alt={brawlerID} />
        <h3>{locales.brawler['brawler'][`${brawlerName}`]}</h3>
      </div>
      <div className={styles.brawlerSummaryItemRate}>
        <div>
          Pick <span>{Math.round(pickRate * 100) / 100}%</span>
        </div>
        <div>
          Win <span>{Math.round(victoryRate * 100) / 100}%</span>
        </div>
      </div>
    </a>
  );
};
