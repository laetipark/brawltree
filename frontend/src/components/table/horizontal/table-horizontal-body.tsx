import React from 'react';

import styles from '~/assets/styles/components/table/horizontal/table-horizontal-body.module.scss';

export const TableHorizontalBody = ({ bodyRowContents, bodyRowImages }) => {
  return (
    <div className={styles.tableHorizontalBodyContainer}>
      {bodyRowContents.map((col: string, index: number) => (
        <div key={index}>
          <h3>
            {bodyRowImages[index][0] !== null ? <img src={bodyRowImages[index][0]} alt={'col_0'} /> : null}
            {col[0]}
          </h3>
          <div>
            {bodyRowImages[index][1] !== null ? <img src={bodyRowImages[index][1]} alt={'col_1'} /> : null}
            {col[1]}
          </div>
        </div>
      ))}
    </div>
  );
};
