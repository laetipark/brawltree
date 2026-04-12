import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

import { SearchUserInputBox } from '~/pages/main/search-user/search-user-input';
import { ResultField } from '~/components/main/result-field/result-field';
import { SearchHistoryBox } from '~/components/search/search-history-box/search-history-box';

import { CdnContext } from '~/context/cdn.context';
import { SearchContext } from '~/context/search.context';
import { debounce } from '~/utils/debounce';

import styles from '~/assets/styles/pages/main/search-user.module.scss';

export const SearchUserContainer = () => {
  const MOBILE_HELP_QUERY = '(max-width: 1024px)';
  const locales = useContext(CdnContext);

  const searchContext = useContext(SearchContext);
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState<string>('');
  const [toggle, setToggle] = useState(false);
  const [isMobileHelpModal, setIsMobileHelpModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(MOBILE_HELP_QUERY).matches;
  });

  const { searchHistory, setSearchHistory } = searchContext;

  /** Function related to searching by nickname OR user tag */
  const handleChangeInputValue = useMemo(
    () =>
      debounce((value: string) => {
        setInputValue(value);
      }, 200),
    []
  );

  const handleChangeInput = ({ target }: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = target.value.replace('#', '');
    target.value = nextValue;
    handleChangeInputValue(nextValue);
  };

  const handleClearSearchHistory = () => {
    if (window.confirm(locales.main['searchUserContainer']?.checkClearSearch || 'checkClearSearch')) {
      setSearchHistory([]);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_HELP_QUERY);
    const handleMediaQuery = (event: MediaQueryListEvent) => {
      setIsMobileHelpModal(event.matches);
    };

    setIsMobileHelpModal(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQuery);
      return () => mediaQuery.removeEventListener('change', handleMediaQuery);
    }

    mediaQuery.addListener(handleMediaQuery);
    return () => mediaQuery.removeListener(handleMediaQuery);
  }, []);

  useEffect(() => {
    if (!isMobileHelpModal || !toggle) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileHelpModal, toggle]);

  return (
    <div className={styles.searchUserContainer}>
      <h2>{locales.main['searchProfile'] || 'searchProfile'}</h2>
      <form
        className={styles.searchForm}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const userTag = String(formData.get('search') || '').toUpperCase();
          navigate(`/brawlian/${userTag}`);
        }}
        >
        <SearchUserInputBox onChangeInput={handleChangeInput} onToggleHelp={() => setToggle((prev) => !prev)} helpOpen={toggle} />
        <ResultField inputValue={inputValue} onChangeInputValue={setInputValue} setToggle={setToggle} />
        {toggle && !isMobileHelpModal && (
          <div className={styles.findTagPopup}>
            <img className={styles.howToFindTag} src={'/images/help/find_tag_kr.webp'} alt={'find_tag'} />
          </div>
        )}
      </form>
      {toggle && isMobileHelpModal &&
        createPortal(
          <div className={styles.findTagOverlay} onClick={() => setToggle(false)} role={'presentation'}>
            <div className={styles.findTagPopupMobile} onClick={(event) => event.stopPropagation()} role={'dialog'} aria-modal={'true'}>
              <img className={styles.howToFindTag} src={'/images/help/find_tag_kr.webp'} alt={'find_tag'} />
              <button className={styles.findTagCloseButton} type={'button'} onClick={() => setToggle(false)}>
                CLOSE
              </button>
            </div>
          </div>,
          document.body
        )}
      <div className={styles.recentSearch}>
        <h2 className={styles.recentSearchTitle}>{locales.main['searchUserContainer']?.recentSearch || 'recentSearch'}</h2>
        <SearchHistoryBox searchHistory={searchHistory} />
        <div className={styles.clearSearch}>
          <div onClick={handleClearSearchHistory}>{locales.main['searchUserContainer']?.clearSearch || 'clearSearch'}</div>
        </div>
      </div>
    </div>
  );
};
