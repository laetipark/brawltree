import React from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleLeft, faAngleRight } from '@fortawesome/free-solid-svg-icons';

import styles from './pagination.module.scss';

export const Pagination = ({ page, total, setPage }) => {
  return (
    <div className={styles.pagination}>
      <button onClick={() => setPage(page - 1)} disabled={page <= 1}>
        <FontAwesomeIcon icon={faAngleLeft} /> 이전
      </button>
      <button onClick={() => setPage(page + 1)} disabled={page === total || total === 0}>
        다음 <FontAwesomeIcon icon={faAngleRight} />
      </button>
    </div>
  );
};
