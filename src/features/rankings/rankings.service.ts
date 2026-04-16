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

@Injectable()
export class RankingsService {
  private readonly logger = new Logger(RankingsService.name);

  constructor(
    private readonly configService: AppConfigService,
    private readonly httpService: HttpService
  ) {}

  /** 사용자 ID를 통한 사용자 정보 변경 및 결과 반환
   * @param url
   */
  async getRankingsFromAPI(url: string) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`api/data?query=${url}`, {
          baseURL: this.configService.getAPIUrl(),
          headers: {
            'Content-Type': 'application/json'
          }
        })
      );

      return res.data?.items || [];
    } catch (error) {
      this.logger.warn(
        formatLogFields({
          event: 'rankings.fetch.error',
          target: url,
          status: getErrorStatus(error),
          code: getErrorCode(error),
          error: getErrorMessage(error)
        })
      );
    }

    return null;
  }
}
