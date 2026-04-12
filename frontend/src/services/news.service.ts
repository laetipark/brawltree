import axios from 'axios';
import config from '~/common/config/config';

export class NewsService {
  static getNewsList = (region: string) =>
    axios.get(`${config.url}/news?region=${region}`).then((response) => {
      return response.data;
    });

  static getNewsListItem = (region: string, title: string) =>
    axios.get(`${config.url}/news/${title}?region=${region}`).then((response) => {
      return response.data;
    });
}
