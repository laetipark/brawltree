import styles from './spinner.module.scss';
import React from 'react';

export const Spinner = ({ fill = false }: { fill?: boolean }) => {
  return (
    <div className={`${styles.spinnerWrapper} ${fill ? styles.spinnerWrapperFill : ''}`} role={'status'} aria-live={'polite'} aria-busy={'true'}>
      <img className={styles.spinnerImage} src={'/images/logo/brawltree/logo192.png'} alt={'Loading'} />
      <div className={styles.spinnerLabel}>Loading data...</div>
    </div>
  );
};
