import axios from 'axios';
import config from '~/common/config/config';
import {
  MapInfoType,
  MapSummaryResponseType
} from '~/common/types/maps.type';

export type MapBrawlerStatsType = {
  brawlerID: string;
  brawlerName: string;
  pickRate: number;
  victoryRate: number;
};

type MapDetailResponseType = {
  map: MapInfoType;
  stats: MapBrawlerStatsType[];
};

export class MapService {
  static getMaps = () =>
    axios.get<MapSummaryResponseType>(`${config.url}/maps/`).then((result) => result.data);

  static getMap = ({
    name,
    type,
    grade
  }: {
    name: string;
    type: string;
    grade: string[];
  }) =>
    axios
      .get<MapDetailResponseType>(`${config.url}/maps/${name}`, {
        params: {
          type: type,
          grade: grade
        }
      })
      .then((result) => result.data);
}
