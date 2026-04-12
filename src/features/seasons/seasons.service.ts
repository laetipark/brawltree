import { Injectable } from '@nestjs/common';
import { SeasonDto } from '~/seasons/dto/season.dto';

@Injectable()
export class SeasonsService {
  private readonly seasonResetHour = 18;

  private getSeasonTimeByWeekOfMonth(date: Date, weekOfMonth: number): Date {
    const seasonTime = new Date(date);
    const firstDay = new Date(seasonTime.getFullYear(), seasonTime.getMonth(), 1);
    const firstThursdayOffset = (4 - firstDay.getDay() + 7) % 7;
    const dayOfMonth = 1 + firstThursdayOffset + (weekOfMonth - 1) * 7;

    seasonTime.setDate(dayOfMonth);
    seasonTime.setHours(this.seasonResetHour, 0, 0, 0);

    return seasonTime;
  }

  private getRecentSeasonByWeekOfMonth(weekOfMonth: number): SeasonDto {
    const now = new Date();

    let beginSeasonMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      this.seasonResetHour
    );
    let beginDate = this.getSeasonTimeByWeekOfMonth(
      beginSeasonMonth,
      weekOfMonth
    );

    if (now.getTime() < beginDate.getTime()) {
      beginSeasonMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
        this.seasonResetHour
      );
      beginDate = this.getSeasonTimeByWeekOfMonth(
        beginSeasonMonth,
        weekOfMonth
      );
    }

    const endSeasonMonth = new Date(
      beginSeasonMonth.getFullYear(),
      beginSeasonMonth.getMonth() + 1,
      1,
      this.seasonResetHour
    );
    const endDate = this.getSeasonTimeByWeekOfMonth(endSeasonMonth, weekOfMonth);

    return {
      beginDate,
      endDate
    };
  }

  getRecentSeason(): SeasonDto {
    return this.getRecentNormalSeason();
  }

  getRecentNormalSeason(): SeasonDto {
    return this.getRecentSeasonByWeekOfMonth(1);
  }

  getRecentRankedSeason(): SeasonDto {
    return this.getRecentSeasonByWeekOfMonth(3);
  }

  getRecentAllBattleSeason(): SeasonDto {
    const normalSeason = this.getRecentNormalSeason();
    const rankedSeason = this.getRecentRankedSeason();

    return {
      beginDate:
        normalSeason.beginDate.getTime() < rankedSeason.beginDate.getTime()
          ? normalSeason.beginDate
          : rankedSeason.beginDate,
      endDate:
        normalSeason.endDate.getTime() > rankedSeason.endDate.getTime()
          ? normalSeason.endDate
          : rankedSeason.endDate
    };
  }
}
