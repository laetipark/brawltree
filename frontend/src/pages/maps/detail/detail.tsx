import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import { MapInfo } from '~/components/maps/detail/map-info';
import MapMenu from '~/components/combo/grade-combo';
import MapStats from '~/components/maps/detail/stats/map-stats';

import { MapBrawlerStatsType, MapService } from '~/services/map.service';

import styles from './detail.module.scss';
import { Spinner } from '~/components/spinner/spinner';
import { MapInfoType } from '~/common/types/maps.type';
import { PageSeo } from '~/components/seo/page-seo';
import { CdnContext } from '~/context/cdn.context';

const useQueryParams = () => new URLSearchParams(useLocation().search);

export const MapDetail = () => {
  const { name } = useParams();
  const locales = useContext(CdnContext);
  const queryParams = useQueryParams();
  const isRanked = queryParams.get('type');
  const [type, setType] = useState(isRanked ? '2' : '0');
  const [grade, setGrade] = useState(['4', '5', '6', '7']);
  const [mapInfo, setMapInfo] = useState<MapInfoType | null>(null);
  const [brawlerStats, setBrawlerStats] = useState<MapBrawlerStatsType[]>([]);

  useEffect(() => {
    if (!name) {
      return;
    }

    const mapName = name.replace(/-/g, ' ');
    MapService.getMap({ name: mapName, type, grade }).then((data) => {
      setMapInfo(data.map);
      setBrawlerStats(data.stats);

      if (data.map && !data.map.isTrophyLeague && data.map.isPowerLeague) {
        setType('2');
      }
    });
  }, [name, type, grade]);

  useEffect(() => {
    history.replaceState({}, '', window.location.pathname.replace(/ /g, '-'));
  }, []);

  const mapName = mapInfo?.mapName || name?.replace(/-/g, ' ') || 'Map';

  return (
    <React.Fragment>
      <PageSeo
        page="mapDetail"
        language={locales.language}
        title={`${mapName} Map Stats`}
        description={`View ${mapName} map details, rotation info, and recommended brawlers.`}
      />
      {mapInfo ? (
        <div className={styles.app}>
          <MapInfo mapInfo={mapInfo} />
          {!['soloShowdown', 'duoShowdown', 'duels', 'hunters', 'roboRumble', 'bigGame', 'bossFight'].includes(mapInfo.mode) && (
            <MapMenu type={type} grade={grade} setType={setType} setGrade={setGrade} rotationTL={mapInfo.isTrophyLeague} rotationPL={mapInfo.isPowerLeague} />
          )}
          <MapStats brawlers={brawlerStats} />
        </div>
      ) : (
        <Spinner fill={true} />
      )}
    </React.Fragment>
  );
};
