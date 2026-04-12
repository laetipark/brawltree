import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CdnContext } from '~/context/cdn.context';
import { isRRMatch } from '~/utils/korean-pattern';

import config from '~/common/config/config';

import styles from './brawler-selection.module.scss';

export const BrawlerSelection = ({ brawlers, brawler, setBrawler }) => {
  const [radio, setRadio] = useState(brawler?.id || '16000000');
  const [searchBrawlerName, setSearchBrawlerName] = useState('');
  const [filterBrawlers, setFilterBrawlers] = useState([]);

  const locales = useContext(CdnContext);
  const brawlerLocale = locales.brawler?.brawler || {};
  const navigate = useNavigate();

  const brawlerListLabel = '브롤러 목록';
  const brawlerSearchPlaceholder = '브롤러 검색 (쉘리, 콜트)';

  useEffect(() => {
    setFilterBrawlers(
      brawlers.filter((nextBrawler) => {
        const localizedName = brawlerLocale[`${nextBrawler.name}`] || nextBrawler.name;
        return isRRMatch(searchBrawlerName, localizedName);
      })
    );
  }, [searchBrawlerName, brawlers, brawlerLocale]);

  useEffect(() => {
    setRadio(brawler.id);
  }, [brawler.id]);

  return (
    <div className={styles.brawlerSelectionWrapper}>
      <div>
        <span>{brawlerListLabel}</span>
        <input
          type={'text'}
          className={styles.searchBrawlers}
          placeholder={brawlerSearchPlaceholder}
          maxLength={12}
          onChange={(event) => setSearchBrawlerName(event.target.value)}
        />
      </div>
      <div>
        {filterBrawlers?.map((nextBrawler) => {
          const portraitUrl = `${config.assets}/brawlers/profiles/${nextBrawler.id}.webp`;

          return (
            <React.Fragment key={nextBrawler.id}>
              <input
                className={styles.brawlerButton}
                type={'radio'}
                id={nextBrawler.id}
                name={'brawler'}
                checked={radio === nextBrawler.id}
                onChange={() => {
                  setBrawler(nextBrawler);
                  navigate(`../brawler/${nextBrawler.name.toLowerCase().replaceAll(' ', '')}`);
                }}
              />
              <label htmlFor={nextBrawler.id} className={styles.brawlerImage}>
                <div className={styles.thumbnailFrame}>
                  <img src={portraitUrl} alt={nextBrawler.id} />
                </div>
                <div>
                  <span>{brawlerLocale[`${nextBrawler.name}`] || nextBrawler.name}</span>
                </div>
              </label>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
