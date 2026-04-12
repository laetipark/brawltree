import React, { useContext, useRef } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';

import { useWindowClick } from '~/hooks/use-window-click.hook';
import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from '~/assets/styles/components/combo/mode-combo.module.scss';

export const ModeMenu = ({ mode, setMatchMode, type, modeTL, modePL }) => {
  const locales = useContext(CdnContext);
  const modeAll = Array.from(new Set([...(modeTL || []), ...(modePL || [])]));
  const modeList = type === '0' ? modeTL : type === '2' ? modePL : modeAll;

  const dropDownRef = useRef();
  const [checked, setChecked] = useWindowClick(dropDownRef, false);

  return (
    <div className={styles.typeMenuWrapper} ref={dropDownRef}>
      <button
        className={styles.typeMenuButton}
        onClick={() => {
          setChecked(!checked);
        }}
      >
        <img src={`${config.assets}/modes/icon/${mode}.webp`} alt={mode} />
        <div>{locales.battle['mode'][`${mode}`]}</div>
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
        {modeList?.map((modeName: string) => (
          <React.Fragment key={`${modeName}`}>
            <input
              className={styles.typeButton}
              type={'radio'}
              id={modeName}
              name={modeName}
              value={modeName}
              checked={modeName === mode}
              onChange={(e) => {
                setMatchMode(e);
                setChecked(!checked);
              }}
            />
            <label htmlFor={modeName}>
              <img src={`${config.assets}/modes/icon/${modeName}.webp`} alt={modeName} />
              <div>{locales.battle['mode'][`${modeName}`]}</div>
            </label>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
