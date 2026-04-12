import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BrawlerSelection } from '~/components/brawler/selection/brawler-selection';
import { BrawlerInfo } from '~/components/brawler/info/brawler-info';
import { BrawlerStats } from '~/components/brawler/stats/brawler-stats';
import { Spinner } from '~/components/spinner/spinner';
import { PageSeo } from '~/components/seo/page-seo';

import { BrawlerType } from '~/common/types/brawlers.type';
import { BrawlerService } from '~/services/brawler.service';

import styles from './brawlers-page.module.scss';

const toDisplayName = (value?: string) => {
  return (value || 'shelly')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

export const Brawlers = () => {
  const { name } = useParams();
  const [brawlers, setBrawlers] = useState([]);
  const [brawler, setBrawler] = useState<BrawlerType>({
    id: '16000000',
    name: 'SHELLY',
    rarity: 'Trophy Road',
    role: 'Damage Dealer',
    gender: 'Female'
  });

  const [brawlerStats, setBrawlerStats] = useState([]);
  const [brawlerMaps, setBrawlerMaps] = useState([]);

  const [brawlerSkills, setBrawlerSkills] = useState({});
  const [brawlerItems, setBrawlerItems] = useState({});

  useEffect(() => {
    BrawlerService.getBrawlers().then((data) => {
      setBrawlers(data.brawlers);
      setBrawlerStats(data.stats);
      setBrawlerMaps(data.maps);
    });
  }, []);

  useEffect(() => {
    BrawlerService.getBrawler(brawler.id).then((data) => {
      setBrawlerSkills(data.info);
      setBrawlerItems(data.items);
    });
  }, [brawler.id]);

  useEffect(() => {
    const brawlerByName = brawlers.find((brawler) => brawler.name.toLowerCase().replaceAll(' ', '') === name);
    setBrawler(
      brawlerByName || {
        id: '16000000',
        name: 'SHELLY',
        rarity: 'Trophy Road',
        role: 'Damage Dealer',
        gender: 'Female'
      }
    );
  }, [name, brawlers]);

  const brawlerName = toDisplayName(name);

  return (
    <React.Fragment>
      <PageSeo
        page="brawler"
        title={`${brawlerName} Stats and Build`}
        description={`Check ${brawlerName} performance, best maps, and item combinations.`}
      />
      {brawlers.length > 0 ? (
        <div className={styles.app}>
          <BrawlerSelection brawlers={brawlers} brawler={brawler} setBrawler={setBrawler} />
          <div>
            <BrawlerInfo brawler={brawler} skills={brawlerSkills} items={brawlerItems} />
            <BrawlerStats brawler={brawler} stats={brawlerStats} maps={brawlerMaps} />
          </div>
        </div>
      ) : (
        <Spinner fill={true} />
      )}
    </React.Fragment>
  );
};
