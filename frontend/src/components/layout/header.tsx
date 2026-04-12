import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

import { CdnContext } from '~/context/cdn.context';
import { SupportedLanguage } from '~/common/i18n/language';

import styles from '~/assets/styles/components/layout/header.module.scss';

type HeaderProps = {
  isCdnLoading?: boolean;
};

const HEADER_FALLBACK: Record<SupportedLanguage, { main: string; brawler: string; events: string; maps: string; news: string }> = {
  ko: {
    main: '\uBA54\uC778',
    brawler: '\uBE0C\uB864\uB7EC',
    events: '\uB85C\uD14C\uC774\uC158',
    maps: '\uB9F5',
    news: '\uB274\uC2A4'
  },
  en: {
    main: 'Main',
    brawler: 'Brawler',
    events: 'Events',
    maps: 'Maps',
    news: 'News'
  }
};

export const Header = ({ isCdnLoading = false }: HeaderProps) => {
  const locales = useContext(CdnContext);
  const headerLocale = locales.application?.header || {};
  const headerFallback = HEADER_FALLBACK[locales.language || 'ko'];
  const hasHeaderLocale = Object.keys(headerLocale).length > 0;
  const shouldShowSkeleton = isCdnLoading && !hasHeaderLocale;
  const toggleVisible = useMediaQuery({ maxWidth: 768 });
  const [isToggled, setIsToggled] = useState(false);

  // 768px 이하에서는 메뉴를 토글로 보여주기
  const menuList = (
    <ul
      className={styles.headerMenuContent}
      style={
        toggleVisible
          ? isToggled
            ? {
                visibility: 'visible',
                minHeight: 240,
                paddingBottom: 8
              }
            : {
                visibility: 'hidden',
                minHeight: 0
              }
          : {}
      }
    >
      <li>
        <Link to={'/'} onClick={() => setIsToggled(false)}>
          <div>{headerLocale.main || headerFallback.main}</div>
        </Link>
      </li>
      <li>
        <Link to={'/brawler/shelly'} onClick={() => setIsToggled(false)}>
          <div>{headerLocale.brawler || headerFallback.brawler}</div>
        </Link>
      </li>
      <li>
        <Link to={'/events/curr'} onClick={() => setIsToggled(false)}>
          <div>{headerLocale.events || headerFallback.events}</div>
        </Link>
      </li>
      <li>
        <Link to={'/maps'} onClick={() => setIsToggled(false)}>
          <div>{headerLocale.maps || headerFallback.maps}</div>
        </Link>
      </li>
      <li>
        <Link to={'/news'} onClick={() => setIsToggled(false)}>
          <div>{headerLocale.news || headerFallback.news}</div>
        </Link>
      </li>
    </ul>
  );

  return (
    <React.Fragment>
      <header className={styles.headerMenuContainer}>
        <a href={'/'}>
          <img className={styles.menuLogo} src={`/images/logo/brawltree/logo192.png`} alt={'Logo'} />
          <div>Brawl Tree</div>
        </a>
        {shouldShowSkeleton ? (
          <div className={styles.headerSkeleton} aria-hidden={'true'}>
            <span className={styles.skeletonText} />
            <span className={styles.skeletonText} />
            <span className={styles.skeletonText} />
          </div>
        ) : toggleVisible ? (
          <div
            className={styles.menuToggle}
            onClick={() => {
              setIsToggled(!isToggled);
            }}
          >
            <FontAwesomeIcon icon={!isToggled ? faBars : faTimes} fontSize={24} />
          </div>
        ) : (
          menuList
        )}
      </header>
      {toggleVisible && !shouldShowSkeleton && menuList}
    </React.Fragment>
  );
};
