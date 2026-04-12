import React from 'react';

import styles from './map-list.module.scss';
import { EventSummaryContainer } from '~/components/maps/event-summary';

export const MapList = ({ maps }) => {
  return Object.keys(maps).map((mode) => {
    const modeMaps = maps[mode];
    const modeName = mode.split('_')[0];

    return maps[`${mode}`].length ? (
      <div id={modeName} className={styles.mapListWrapper} key={mode}>
        <div className={styles.modeList}>{<EventSummaryContainer events={modeMaps} type={mode} />}</div>
      </div>
    ) : null;
  });
};
