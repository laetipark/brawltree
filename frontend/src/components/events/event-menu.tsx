import React, { useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TrophyCurrentEvents } from '~/components/events/list/trophy-curr';
import { TrophyTomorrowEvents } from '~/components/events/list/trophy-next';
import { RankedEvents } from '~/components/events/list/ranked';

import { CdnContext } from '~/context/cdn.context';
import { withLanguagePath } from '~/common/i18n/language-route';

import styles from './event-menu.module.scss';

const EVENT_MODES = ['curr', 'next', 'ranked'] as const;
type EventMode = (typeof EVENT_MODES)[number];

export const EventMenu = () => {
  const navigate = useNavigate();
  const { mode } = useParams();
  const locales = useContext(CdnContext);
  const selectedMode: EventMode = mode && EVENT_MODES.includes(mode as EventMode) ? (mode as EventMode) : 'curr';

  const changeMenu = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextMode = event.target.id as EventMode;

    if (!EVENT_MODES.includes(nextMode)) {
      return;
    }

    navigate(withLanguagePath(`/events/${nextMode}`, locales.language));
  };

  return (
    <div className={styles.menuWrapper}>
      <div className={styles.menuList}>
        <ul>
          <li>
            <input
              className={styles.typeButton}
              type={'radio'}
              id={'curr'}
              name={'event'}
              checked={selectedMode === 'curr'}
              onChange={changeMenu}
            />
            <label htmlFor={'curr'}>
              <div>{locales.map['event'].current}</div>
            </label>
          </li>
          <li>
            <input
              className={styles.typeButton}
              type={'radio'}
              id={'next'}
              name={'event'}
              checked={selectedMode === 'next'}
              onChange={changeMenu}
            />
            <label htmlFor={'next'}>
              <div>{locales.map['event'].tomorrow}</div>
            </label>
          </li>
          <li>
            <input
              className={styles.typeButton}
              type={'radio'}
              id={'ranked'}
              name={'event'}
              checked={selectedMode === 'ranked'}
              onChange={changeMenu}
            />
            <label htmlFor={'ranked'}>
              <div>{locales.map['event'].ranked}</div>
            </label>
          </li>
        </ul>
      </div>
      <div className={styles.eventPanel}>
        {selectedMode === 'curr' ? <TrophyCurrentEvents /> : selectedMode === 'next' ? <TrophyTomorrowEvents /> : <RankedEvents />}
      </div>
    </div>
  );
};
