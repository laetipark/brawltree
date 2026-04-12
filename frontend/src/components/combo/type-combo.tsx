import React, { useContext, useRef } from 'react';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useWindowClick } from '~/hooks/use-window-click.hook';

import config from '~/common/config/config';

import styles from '~/assets/styles/components/combo/type-combo.module.scss';
import { CdnContext } from '~/context/cdn.context';

const typeNumber = {
  7: 'all',
  0: 'trophy',
  2: 'ranked'
};

export const TypeComboBox = ({ type, setMatchType }) => {
  const dropDownRef = useRef();
  const [checked, setChecked] = useWindowClick(dropDownRef, false);
  const locales = useContext(CdnContext);

  return (
    <div className={styles.typeMenuWrapper} ref={dropDownRef}>
      <button
        className={styles.typeMenuButton}
        onClick={() => {
          setChecked(!checked);
        }}
      >
        <img src={`${config.assets}/modes/icon/${typeNumber[type]}.webp`} alt={'type_7'} />
        <div>{locales.battle['type'][`${typeNumber[type]}`]}</div>
        <FontAwesomeIcon
          style={{
            transform: checked ? 'rotate(180deg)' : '',
            transition: 'transform 0.3s ease'
          }}
          fontSize={14}
          icon={faCaretUp}
        />
      </button>
      <div className={styles.typeMenuList} style={{ display: checked ? 'flex' : 'none' }}>
        <input
          className={styles.typeButton}
          type={'radio'}
          id={'type_7'}
          name={'type_7'}
          value={'7'}
          checked={type === '7'}
          onChange={(e) => {
            setMatchType(e);
            setChecked(!checked);
          }}
        />
        <label htmlFor={'type_7'}>
          <img src={`${config.assets}/modes/icon/all.webp`} alt={'type_7'} />
          <div>{locales.battle[`type`].all}</div>
        </label>
        <input
          className={styles.typeButton}
          type={'radio'}
          id={'type_0'}
          name={'type_0'}
          value={'0'}
          checked={type === '0'}
          onChange={(e) => {
            setMatchType(e);
            setChecked(!checked);
          }}
        />
        <label htmlFor={'type_0'}>
          <img src={`${config.assets}/modes/icon/trophy.webp`} alt={'type_0'} />
          <div>{locales.battle['type'].trophy}</div>
        </label>
        <input
          className={styles.typeButton}
          type={'radio'}
          id={'type_2'}
          name={'type_2'}
          value={'2'}
          checked={type === '2'}
          onChange={(e) => {
            setMatchType(e);
            setChecked(!checked);
          }}
        />
        <label htmlFor={'type_2'}>
          <img src={`${config.assets}/modes/icon/ranked.webp`} alt={'type_2'} />
          <div>{locales.battle['type'].ranked}</div>
        </label>
      </div>
    </div>
  );
};
