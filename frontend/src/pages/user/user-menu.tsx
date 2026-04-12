import React, { useContext } from 'react';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/user/user-menu.module.scss';

export const UserMenuContainer = ({ menu, setMenu }) => {
  const locales = useContext(CdnContext);

  const menuRadioButtonHandler = ({ target }) => {
    setMenu(target.name);
  };

  return (
    <div className={styles.userMenuContainer}>
      <div className={styles.userMenuContent}>
        <ul>
          <li>
            <input className={styles.typeButton} type={'radio'} id={'profile'} name={'profile'} checked={menu === 'profile'} onChange={menuRadioButtonHandler} />
            <label htmlFor={'profile'}>
              <div>{locales.user['menu'].profile || 'profile'}</div>
            </label>
          </li>
          <li>
            <input className={styles.typeButton} type={'radio'} id={'brawlers'} name={'brawlers'} checked={menu === 'brawlers'} onChange={menuRadioButtonHandler} />
            <label htmlFor={'brawlers'}>
              <div>{locales.user['menu'].brawlers || 'brawlers'}</div>
            </label>
          </li>
        </ul>
      </div>
    </div>
  );
};
