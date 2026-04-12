import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { EventMenu } from '~/components/events/event-menu';
import { PageSeo } from '~/components/seo/page-seo';
import { CdnContext } from '~/context/cdn.context';

import styles from './events.module.scss';

export const Events = () => {
  const { mode } = useParams();
  const locales = useContext(CdnContext);
  const isKorean = locales.language === 'ko';
  const modeLabel = mode === 'ranked' ? 'Ranked' : mode === 'next' ? 'Upcoming' : 'Current';
  const modeLabelLocalized =
    mode === 'ranked'
      ? locales.map?.event?.ranked || (isKorean ? '\uB7AD\uD06C' : 'Ranked')
      : mode === 'next'
        ? locales.map?.event?.tomorrow || (isKorean ? '\uB2E4\uC74C' : 'Upcoming')
        : locales.map?.event?.current || (isKorean ? '\uD604\uC7AC' : 'Current');
  const pageTitle = isKorean ? '\uC774\uBCA4\uD2B8 \uB85C\uD14C\uC774\uC158' : 'Event Rotation';
  const pageDescription = isKorean
    ? '\uD604\uC7AC/\uC608\uC815/\uB7AD\uD06C \uB85C\uD14C\uC774\uC158\uC744 \uD55C \uB208\uC5D0 \uBE44\uAD50\uD558\uACE0 \uBC14\uB85C \uB9F5 \uD398\uC774\uC9C0\uB85C \uC774\uB3D9\uD558\uC138\uC694.'
    : 'Compare current, upcoming, and ranked rotations quickly and jump to each map page.';

  return (
    <React.Fragment>
      <PageSeo
        page="events"
        language={locales.language}
        title={`${modeLabel} Event Rotation`}
        description={`Browse ${modeLabel.toLowerCase()} Brawl Stars event rotation and map pool.`}
      />
      <div className={styles.eventsPage}>
        <section className={styles.eventsHero}>
          <p className={styles.eventsKicker}>BRAWL STARS</p>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
          <div className={styles.modeBadge}>{modeLabelLocalized}</div>
        </section>
        <section className={styles.eventsContentCard}>
          <EventMenu />
        </section>
      </div>
    </React.Fragment>
  );
};
