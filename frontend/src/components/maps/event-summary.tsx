import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { EventItemContent } from '~/components/maps/event-summary/event-summary-item';

import { RotationType } from '~/common/types/maps.type';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/components/maps/event-summary.module.scss';

export const EventSummaryContainer = ({
  events,
  type
}: {
  events: RotationType[];
  type: string;
}) => {
  const locales = useContext(CdnContext);

  return (
    <div className={styles.eventsSummaryContainer}>
      <h2>
        <Link to={`/events/${['ranked', 'curr', 'next'].includes(type) ? type : 'curr'}`}>
          {type === 'ranked' ? locales.map['event'].ranked : type === 'curr' ? locales.map['event'].current : type === 'next' ? locales.map['event'].tomorrow : locales.battle['mode'][`${type}`]}
        </Link>
      </h2>
      <div className={styles.eventItemContent}>
        {(events.length || 0) > 0 &&
          events.map((event: RotationType) => {
            return <EventItemContent key={event.mapID} event={event} type={type} />;
          })}
      </div>
    </div>
  );
};
