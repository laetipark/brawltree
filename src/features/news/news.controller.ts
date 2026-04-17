import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';

import { NewsService } from './news.service';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /** 뉴스 목록 조회 */
  @Get('/')
  @HttpCode(200)
  async getNews(@Query('region') regionCode: string = 'ko') {
    return this.newsService.getNews(regionCode);
  }

  /** 뉴스 상세 조회 */
  @Get('/:title')
  @HttpCode(200)
  async getNewsItem(
    @Query('region') regionCode: string = 'ko',
    @Param('title') title: string
  ) {
    return this.newsService.getNewsItem(regionCode, title);
  }
}
