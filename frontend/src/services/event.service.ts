import axios from 'axios';
import config from '~/common/config/config';
import { RotationType } from '~/common/types/maps.type';

export class EventService {
  static getTLCurrentEvents = () =>
    axios.get<RotationType[]>(`${config.url}/events/tl/curr`).then((result) => result.data);

  static getTLTomorrowEvents = () =>
    axios.get<RotationType[]>(`${config.url}/events/tl/tomm`).then((result) => result.data);

  static getPLEvents = () =>
    axios.get<RotationType[]>(`${config.url}/events/pl`).then((result) => result.data);
}
