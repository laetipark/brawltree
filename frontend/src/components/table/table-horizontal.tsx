import React from 'react';

import { TableHorizontalHead } from './horizontal/table-horizontal-head';
import { TableHorizontalBody } from './horizontal/table-horizontal-body';

import styles from '~/assets/styles/components/table/table-horizontal.module.scss';

const TableHorizontal = ({ headRow, bodyRowContents, bodyRowImages }) => {
  return (
    <div className={styles.tableHorizontalWrapper}>
      <TableHorizontalHead headRowContent={headRow} />
      <TableHorizontalBody bodyRowContents={bodyRowContents} bodyRowImages={bodyRowImages} />
    </div>
  );
};

export default TableHorizontal;
