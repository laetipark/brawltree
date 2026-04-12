import React, { useContext } from 'react';

import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from './map-info.module.scss';

export const MapInfo = ({ mapInfo }) => {
  const locales = useContext(CdnContext);

  return (
    <div className={styles.mapWrapper}>
      <div className={styles.mapTitle}>
        <div>
          <img src={`${config.assets}/modes/icon/${mapInfo.mode}.webp`} alt={mapInfo.mode} />
          <span>{locales.map['map'][`${mapInfo.mapID}`] || mapInfo.mapName}</span>
        </div>
        <div>
          {mapInfo.isTrophyLeague > 0 && <img src={`${config.assets}/modes/icon/trophy.webp`} alt={`trophyLeague`} />}
          {mapInfo.isPowerLeague > 0 && <img src={`${config.assets}/modes/icon/ranked.webp`} alt={`trophyLeague`} />}
        </div>
      </div>
      <div className={styles.mapImage}>
        <img src={`${config.assets}/maps/${mapInfo.mapID}.webp`} alt={mapInfo.mapID} />
      </div>
    </div>
  );
};
