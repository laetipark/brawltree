import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { MapInfo } from '~/components/maps/detail/map-info';
import MapMenu from '~/components/combo/grade-combo';
import MapStats from '~/components/maps/detail/stats/map-stats';

import { MapBrawlerStatsType, MapService } from '~/services/map.service';

import styles from './detail.module.scss';
import { Spinner } from '~/components/spinner/spinner';
import { MapInfoType } from '~/common/types/maps.type';
import { PageSeo } from '~/components/seo/page-seo';
import { CdnContext } from '~/context/cdn.context';

const DEFAULT_GRADES = ['4', '5', '6', '7'];

export const MapDetail = () => {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const locales = useContext(CdnContext);
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const routeType = queryParams.get('type') ? '2' : '0';
  const [type, setType] = useState(routeType);
  const [grade, setGrade] = useState(DEFAULT_GRADES);
  const [mapInfo, setMapInfo] = useState<MapInfoType | null>(null);
  const [brawlerStats, setBrawlerStats] = useState<MapBrawlerStatsType[]>([]);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setType((currentType) => (currentType === routeType ? currentType : routeType));
    setGrade((currentGrade) => {
      const isDefaultGrade = currentGrade.length === DEFAULT_GRADES.length && currentGrade.every((value, index) => value === DEFAULT_GRADES[index]);

      return isDefaultGrade ? currentGrade : DEFAULT_GRADES;
    });
  }, [name, routeType]);

  useEffect(() => {
    if (!name) {
      return;
    }

    const mapName = name.replace(/-/g, ' ');
    setLoadFailed(false);
    MapService.getMap({ name: mapName, type, grade })
      .then((data) => {
        setMapInfo(data.map);
        setBrawlerStats(data.stats);

        if (data.map && !data.map.isTrophyLeague && data.map.isPowerLeague) {
          setType('2');
        }
      })
      .catch(() => {
        setMapInfo(null);
        setBrawlerStats([]);
        setLoadFailed(true);
      });
  }, [name, type, grade]);

  useEffect(() => {
    const nextPathname = location.pathname.replace(/ /g, '-');
    const currentPath = `${location.pathname}${location.search}${location.hash}`;
    const nextPath = `${nextPathname}${location.search}${location.hash}`;

    if (nextPath !== currentPath) {
      navigate(nextPath, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  const mapName = mapInfo?.mapName || name?.replace(/-/g, ' ') || 'Map';
  const localizedMapName = mapInfo?.mapID ? locales.map?.map?.[mapInfo.mapID] || mapName : mapName;
  const isKorean = locales.language === 'ko';
  const seoTitle = isKorean ? `${localizedMapName} \uB9F5 \uD1B5\uACC4` : `${mapName} Map Stats`;
  const seoDescription = isKorean
    ? `${localizedMapName} \uB9F5 \uC0C1\uC138 \uC815\uBCF4, \uB85C\uD14C\uC774\uC158, \uCD94\uCC9C \uBE0C\uB864\uB7EC\uB97C \uD655\uC778\uD558\uC138\uC694.`
    : `View ${mapName} map details, rotation info, and recommended brawlers.`;

  return (
    <React.Fragment>
      <PageSeo page="mapDetail" language={locales.language} title={seoTitle} description={seoDescription} noIndex={loadFailed || !name} />
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
