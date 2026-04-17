import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import {
  formatLogFields,
  getErrorCode,
  getErrorMessage,
  getErrorStatus
} from '~/utils/logging';
import { AppConfigService } from '~/utils/services/app-config.service';
import { URLService } from '~/utils/services/url.service';

type NewsCategory = 'release-notes' | 'news' | 'community' | 'esports';

type NewsArticleCategory = {
  title?: string;
};

type NewsArticle = {
  id: string;
  type: string;
  categories?: NewsArticleCategory[];
  title: string;
  thumbnail: {
    largeRetina: {
      path: string;
    };
  };
  postDate: string;
  url?: string;
  embed?: {
    url?: string;
  };
  details?: unknown;
};

type NewsContentResponse = {
  articles?: NewsArticle[];
};

type NewsListItem = {
  id: string;
  type: string;
  category?: NewsCategory;
  title: string;
  thumbnailPath: string;
  postDate: string;
  url: string | null;
};

type NewsDetail = Pick<NewsArticle, 'title' | 'details'>;

const resolveNewsCategory = (title?: string): NewsCategory | undefined => {
  switch (title) {
    case '새 소식':
    case 'Release Notes':
      return 'release-notes';
    case '뉴스':
    case 'News':
      return 'news';
    case '커뮤니티':
    case 'Community':
      return 'community';
    case '이스포츠':
    case 'Esports':
      return 'esports';
    default:
      return undefined;
  }
};

@Injectable()
export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(
    private readonly configService: AppConfigService,
    private readonly httpService: HttpService,
    private readonly urlService: URLService
  ) {}

  /** 지역별 뉴스 목록을 CDN에서 조회해 프론트엔드 응답 형태로 변환합니다. */
  async getNews(region: string): Promise<NewsListItem[] | null> {
    try {
      const articles = await this.fetchNewsArticles(region);
      return articles.map((item) => this.toNewsListItem(item));
    } catch (error) {
      this.logger.warn(
        formatLogFields({
          event: 'news.fetch.error',
          target: region,
          status: getErrorStatus(error),
          code: getErrorCode(error),
          error: getErrorMessage(error)
        })
      );
    }

    return null;
  }

  /** URL title 값과 일치하는 뉴스 상세 본문을 반환합니다. */
  async getNewsItem(region: string, title: string): Promise<NewsDetail | null> {
    try {
      const articles = await this.fetchNewsArticles(region);
      const newsItem = articles.find(
        (item) => this.urlService.transformString(item.title) === title
      );
      if (!newsItem) {
        return null;
      }

      return {
        title: newsItem.title,
        details: newsItem.details
      };
    } catch (error) {
      this.logger.warn(
        formatLogFields({
          event: 'news.item.fetch.error',
          target: title,
          region,
          status: getErrorStatus(error),
          code: getErrorCode(error),
          error: getErrorMessage(error)
        })
      );
    }

    return null;
  }

  private async fetchNewsArticles(region: string): Promise<NewsArticle[]> {
    const response = await firstValueFrom(
      this.httpService.get<NewsContentResponse>(
        `/data/${region}/news/content.json`,
        {
          baseURL: this.configService.getNewsUrl(),
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
    );

    return response.data.articles || [];
  }

  private toNewsListItem(item: NewsArticle): NewsListItem {
    return {
      id: item.id,
      type: item.type,
      category: resolveNewsCategory(item.categories?.[0]?.title),
      title: item.title,
      thumbnailPath: item.thumbnail.largeRetina.path,
      postDate: item.postDate,
      url: item.url || item.embed?.url || null
    };
  }
}
