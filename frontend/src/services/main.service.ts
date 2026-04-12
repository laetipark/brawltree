import axios from 'axios';
import config from '~/common/config/config';
import { SearchItemType } from '~/common/types/main.type';

export class MainService {
  static getYoutubePlayListItem = (playlistID: string) =>
    axios
      .get(`/youtube/playlistItems?part=snippet&playlistId=${playlistID}&maxResults=1&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`)
      .then((result) => {
        return result.data;
      });

  static getUsersByKeyword = (keyword: string) =>
    axios
      .get(`${config.url}/brawlian/keyword`, {
        params: {
          keyword: keyword
        }
      })
      .then((result) => result.data);

  static getUsersByUserIDs = async (searchHistory: SearchItemType[]) => {
    const userIDs = searchHistory.map((item: SearchItemType) => item.userID);

    const result = await axios.get(`${config.url}/brawlian/ids`, {
      params: {
        userIDs: userIDs
      }
    });
    return result.data.sort((a: SearchItemType, b: SearchItemType) => {
      return userIDs.indexOf(a.userID) - userIDs.indexOf(b.userID);
    });
  };
}
