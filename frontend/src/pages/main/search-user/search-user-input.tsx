import React, { useCallback, useContext } from 'react';
import { SearchContext } from '~/context/search.context';
import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/main/search-user/search-user-input.module.scss';

export const SearchUserInputBox = ({ onChangeInput, onToggleHelp, helpOpen }) => {
  const locales = useContext(CdnContext);
  const context = useContext(SearchContext);
  const { onAddSearchHistory } = context;
  const isKorean = locales.language === 'ko';
  const placeholder = isKorean ? '플레이어 태그 또는 닉네임 입력' : 'Enter player tag or nickname';
  const cta = isKorean ? '전적 검색' : 'Search Stats';

  const handleEnterKey = useCallback(
    ({ key, currentTarget }: React.KeyboardEvent<HTMLInputElement>) => {
      if (key === 'Enter') {
        onAddSearchHistory(currentTarget.value);
      }
    },
    [onAddSearchHistory]
  );

  return (
    <React.Fragment>
      <img className={styles.searchImage} src={'/images/etc/search.webp'} alt={'search'} />
      <div className={styles.searchInputBox}>
        <input
          className={styles.searchInput}
          type={'text'}
          name={'search'}
          required={true}
          placeholder={placeholder}
          maxLength={12}
          pattern="#?[O0289PYLQGRJCUVopylqgrjcuv]{3,12}"
          style={{ textTransform: 'uppercase' }}
          autoComplete="off"
          onChange={onChangeInput}
          onKeyDown={handleEnterKey}
        />
        <button
          className={`${styles.helpIconButton} ${helpOpen ? styles.helpIconButtonActive : ''}`}
          type={'button'}
          onClick={onToggleHelp}
          aria-label={locales.main['findTag'] || 'Find Tag'}
          aria-pressed={helpOpen}
        >
          ?
        </button>
      </div>
      <button className={styles.searchButton} type={'submit'}>
        {cta}
      </button>
    </React.Fragment>
  );
};
