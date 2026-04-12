import axios from 'axios';
import config from '~/common/config/config';

export class BrawlerService {
  static getBrawler = async (id: string) => {
    const result = await axios.get(`${config.url}/brawler/${id}/info`);
    return result.data;
  };

  static getBrawlers = async () => {
    const result = await axios.get(`${config.url}/brawler`);
    return result.data;
  };

  static getBrawlerSummary = async () => {
    const result = await axios.get(`${config.url}/brawler/summary`);
    return result.data;
  };
}
