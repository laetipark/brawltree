import React, { useContext, useRef } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComputer, faGamepad, faTasks } from '@fortawesome/free-solid-svg-icons';
import { useWindowClick } from '~/hooks/use-window-click.hook';
import { CdnContext } from '~/context/cdn.context';
import { SupportedLanguage } from '~/common/i18n/language';
import { useCdnTranslation } from '~/common/i18n/use-cdn-translation';

import styles from '~/assets/styles/components/layout/footer.module.scss';

const FOOTER_FALLBACK: Record<SupportedLanguage, { openSource: string; devNote: string; contact: string; language: string }> = {
  ko: {
    openSource: '\uC624\uD508 \uC18C\uC2A4',
    devNote: '\uAC1C\uBC1C \uB178\uD2B8',
    contact: '\uBB38\uC758',
    language: '\uC5B8\uC5B4'
  },
  en: {
    openSource: 'Open Source',
    devNote: 'Dev Note',
    contact: 'Contact',
    language: 'Language'
  }
};

export const Footer = () => {
  const locales = useContext(CdnContext);
  const { t } = useCdnTranslation('application');

  const dropDownRef = useRef<HTMLDivElement | null>(null);
  const [isLanguageMenuOpen, setLanguageMenuOpen] = useWindowClick(dropDownRef, false);
  const footerLocale = locales.application?.footer || {};
  const footerFallback = FOOTER_FALLBACK[locales.language || 'ko'];

  const changeLanguage = (lang: SupportedLanguage) => {
    locales.setLanguage(lang);
    setLanguageMenuOpen(false);
  };

  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footerLinks}>
        <a href={'https://github.com/laetipark/brawltree-frontend'} target={'_blank'} rel={'noreferrer'}>
          <FontAwesomeIcon icon={faGamepad} />
          <div>{t('footer.openSource', { defaultValue: footerLocale.openSource || footerFallback.openSource })}</div>
        </a>
        <a href={'https://laetipark.notion.site/BrawlTree-To-Do-List-1754a9b02f298057bf11dc05cb4db234?pvs=4'} target={'_blank'} rel={'noreferrer'}>
          <FontAwesomeIcon icon={faTasks} />
          <div>{t('footer.devNote', { defaultValue: footerLocale.devNote || footerFallback.devNote })}</div>
        </a>
        <a href={'https://open.kakao.com/me/laeti'} target={'_blank'} rel={'noreferrer'}>
          <FontAwesomeIcon icon={faComputer} />
          <div>{t('footer.contact', { defaultValue: footerLocale.contact || footerFallback.contact })}</div>
        </a>
      </div>
      <div ref={dropDownRef} className={styles.languageMenu} onClick={() => setLanguageMenuOpen((prev: boolean) => !prev)}>
        <div>{t('footer.language', { defaultValue: footerLocale.language || footerFallback.language })}</div>
        {isLanguageMenuOpen && (
          <ul>
            <li onClick={() => changeLanguage('ko')}>
              <div>{'\uD55C\uAD6D\uC5B4'}</div>
            </li>
            <li onClick={() => changeLanguage('en')}>
              <div>English</div>
            </li>
          </ul>
        )}
      </div>
    </footer>
  );
};
