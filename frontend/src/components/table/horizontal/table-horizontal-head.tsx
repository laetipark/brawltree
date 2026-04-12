import React from 'react';

import styles from '~/assets/styles/components/table/horizontal/table-horizontal-head.module.scss';

export const TableHorizontalHead = ({ headRowContent }) => {
  return (
    <h2 className={styles.tableHorizontalHeadContainer}>
      <div>{headRowContent}</div>
    </h2>
  );
};
