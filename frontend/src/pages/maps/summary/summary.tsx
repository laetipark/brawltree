import React, { useContext, useEffect, useState } from 'react';
import { MapService } from '~/services/map.service';
import { MapInput } from '~/components/maps/summary/map-input/map-input';
import { ModeFilter } from '~/components/maps/summary/mode-filter/mode-filter';
import { MapList } from '~/components/maps/summary/map-list/map-list';
import { MapSummaryType } from '~/common/types/maps.type';

import { isRRMatch } from '~/utils/korean-pattern';
import { CdnContext } from '~/context/cdn.context';
import { PageSeo } from '~/components/seo/page-seo';

import styles from './summary.module.scss';

export const MapSummary = () => {
  const [maps, setMaps] = useState<Record<string, MapSummaryType[]>>({});
  const [searchMapName, setSearchMapName] = useState('');
  const [filterMaps, setFilterMaps] = useState<Record<string, MapSummaryType[]>>({});

  const locales = useContext(CdnContext);
  const isKorean = locales.language === 'ko';
  const mapModeCount = Object.keys(filterMaps).filter((mode) => (filterMaps[mode] || []).length > 0).length;
  const pageTitle = isKorean ? '\uB9F5 \uB85C\uD14C\uC774\uC158' : 'Map Rotation';
  const pageDescription = isKorean
    ? '\uBAA8\uB4DC\uBCC4 \uB85C\uD14C\uC774\uC158 \uB9F5\uC744 \uD55C \uD654\uBA74\uC5D0\uC11C \uBE60\uB974\uAC8C \uCC3E\uACE0 \uBE44\uAD50\uD574 \uBCF4\uC138\uC694.'
    : 'Find and compare rotation maps by mode from one responsive board.';
  const modeCountLabel = isKorean ? `\uD45C\uC2DC \uBAA8\uB4DC ${mapModeCount}\uAC1C` : `${mapModeCount} Modes Visible`;

  useEffect(() => {
    MapService.getMaps().then((data) => {
      setMaps(data.maps);
    });
  }, []);

  useEffect(() => {
    const filteredMaps = {};

    Object.keys(maps).forEach((mode) => {
      filteredMaps[mode] = maps[mode].filter((map) => isRRMatch(searchMapName, locales.map['map'][`${map.mapID}`] || map.mapName));
    });
    setFilterMaps(filteredMaps);
  }, [searchMapName, maps, locales.map]);

  return (
    <div className={styles.mapsPage}>
      <PageSeo page="maps" language={locales.language} />
      <section className={styles.mapsHero}>
        <p className={styles.mapsKicker}>BRAWL STARS</p>
        <h1>{pageTitle}</h1>
        <p>{pageDescription}</p>
        <div className={styles.modeCountBadge}>{modeCountLabel}</div>
      </section>
      <section className={styles.mapsControlCard}>
        <MapInput setMapName={setSearchMapName} />
        <ModeFilter maps={filterMaps} />
      </section>
      <section className={styles.mapsListCard}>
        <MapList maps={filterMaps} />
      </section>
    </div>
  );
};
