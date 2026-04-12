import React, { useContext, useRef } from 'react';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useWindowClick } from '~/hooks/use-window-click.hook';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/components/combo/user-brawler-combo.module.scss';

const userBrawlerOrder = ['brawlerID', 'brawlerName', 'rarity', 'brawlerPower', 'currentTrophies', 'highestTrophies'];

export const UserBrawlerComboBox = ({ order, setBrawlerOrder, orderDirection, setBrawlerOrderDirection }) => {
  const dropDownRef = useRef();
  const [checked, setChecked] = useWindowClick(dropDownRef, false);
  const locales = useContext(CdnContext);

  return (
    <div className={styles.userBrawlerComboBox} ref={dropDownRef}>
      <div>
        <button
          onClick={() => {
            setChecked(!checked);
          }}
        >
          <div>{locales.user['brawlers']?.order[order] || order}</div>
        </button>
        <button
          onClick={() => {
            setBrawlerOrderDirection();
          }}
        >
          <FontAwesomeIcon
            style={{
              transform: orderDirection ? 'rotate(180deg)' : '',
              transition: 'transform 0.3s ease'
            }}
            fontSize={14}
            icon={faCaretUp}
          />
        </button>
      </div>
      <div style={{ display: checked ? 'flex' : 'none' }}>
        {userBrawlerOrder.map((brawlerOrder: string) => (
          <React.Fragment key={brawlerOrder}>
            <input
              type={'radio'}
              id={brawlerOrder}
              name={brawlerOrder}
              value={brawlerOrder}
              checked={order === brawlerOrder}
              onChange={(e) => {
                setBrawlerOrder(e);
                setChecked(!checked);
              }}
            />
            <label htmlFor={brawlerOrder}>
              <div>{locales.user['brawlers']?.order[brawlerOrder] || brawlerOrder}</div>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
