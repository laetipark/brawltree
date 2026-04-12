import React from 'react';
import styles from './map-input.module.scss';

export const MapInput = ({ setMapName }) => {
  const mapSearchPlaceholder = '\uB9F5 \uAC80\uC0C9 (\uC608: \uBCC4\uB0B4\uB9BC \uACC4\uACE1)';

  return (
    <div className={styles.mapInputWrapper}>
      <input type={'text'} className={styles.mapInput} placeholder={mapSearchPlaceholder} maxLength={12} onChange={(event) => setMapName(event.target.value)} />
    </div>
  );
};
