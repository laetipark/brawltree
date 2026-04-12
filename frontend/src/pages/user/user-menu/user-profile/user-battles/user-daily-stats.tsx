import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';

import { UserBrawlerStatsBox } from '~/pages/user/user-menu/user-profile/user-battles/user-brawler-stats';
import { CdnContext } from '~/context/cdn.context';
import { UserDailyBrawlersType } from '~/common/types/users.type';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-battles/user-daily-battles.module.scss';

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 1000 * 60 * 60 * 24;
const KST_OFFSET_MS = 1000 * 60 * 60 * 9;
const THURSDAY = 4;
const CUTOFF_HOUR_KST = 18;

const toLocalDay = (date: Date) => {
  const year = date.getFullYear();
  const month = `0${date.getMonth() + 1}`.slice(-2);
  const day = `0${date.getDate()}`.slice(-2);
  return `${year}-${month}-${day}`;
};

const toKstDayKey = (dateValue: Date | string | undefined) => {
  if (!dateValue) {
    return toLocalDay(new Date());
  }

  if (typeof dateValue === 'string' && DAY_PATTERN.test(dateValue)) {
    return dateValue;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return toLocalDay(new Date());
  }

  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
};

const addDay = (dayKey: string, diff: number) => {
  const [year, month, day] = dayKey.split('-').map((item) => Number(item));
  return new Date(Date.UTC(year, month - 1, day + diff)).toISOString().slice(0, 10);
};

const toUtcMsByDayKey = (dayKey: string) => {
  const [year, month, day] = dayKey.split('-').map((item) => Number(item));
  return Date.UTC(year, month - 1, day);
};

const toWeekStartMonday = (dayKey: string) => {
  const [year, month, day] = dayKey.split('-').map((item) => Number(item));
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = date.getUTCDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  date.setUTCDate(date.getUTCDate() + diff);
  return date.toISOString().slice(0, 10);
};

const shiftYearMonth = (year: number, month: number, diff: number) => {
  const date = new Date(Date.UTC(year, month - 1 + diff, 1));
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1
  };
};

const getNthWeekdayCutoff = (year: number, month: number, weekday: number, nth: number, hourKst: number) => {
  const monthStartWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const offset = (weekday - monthStartWeekday + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  const dayKey = new Date(Date.UTC(year, month - 1, day)).toISOString().slice(0, 10);
  const cutoffUtcMs = Date.UTC(year, month - 1, day, hourKst - 9, 0, 0, 0);

  return {
    dayKey,
    cutoffUtcMs
  };
};

const getUpcomingMonthlyCutoffDay = (baseDayKey: string, nthWeek: number) => {
  const [baseYear, baseMonth] = baseDayKey.split('-').map((value) => Number(value));
  let target = getNthWeekdayCutoff(baseYear, baseMonth, THURSDAY, nthWeek, CUTOFF_HOUR_KST);

  if (Date.now() >= target.cutoffUtcMs) {
    const next = shiftYearMonth(baseYear, baseMonth, 1);
    target = getNthWeekdayCutoff(next.year, next.month, THURSDAY, nthWeek, CUTOFF_HOUR_KST);
  }

  return target.dayKey;
};

const toMonthKey = (dayKey: string) => dayKey.slice(0, 7);

const toMonthStart = (dayKey: string) => `${toMonthKey(dayKey)}-01`;

const formatShortDay = (dayKey: string) => {
  const [, month, day] = dayKey.split('-');
  return `${Number(month)}.${Number(day)}`;
};

export const UserDailyStatsBox = ({ summaryBattles, dailyBrawlers, season }) => {
  const locales = useContext(CdnContext);
  const [dailyBrawlerItem, setDailyBrawlerItem] = useState<UserDailyBrawlersType[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string>(toLocalDay(new Date()));
  const calendarFrameRef = useRef<HTMLDivElement | null>(null);
  const [calendarFrameWidth, setCalendarFrameWidth] = useState<number>(0);

  const calendarColors = ['#d8e8d4', '#b8d3bc', '#96bd9f', '#6f9b88'];
  const seasonBeginDate = season?.beginDate ? new Date(new Date(season.beginDate).getTime() - DAY_MS) : new Date();
  const fromDate = toKstDayKey(seasonBeginDate);
  const toDate = toKstDayKey(season?.endDate);
  const nowKstDayKey = toKstDayKey(new Date());
  const rangeStart = fromDate <= toDate ? fromDate : toDate;
  const rangeEnd = fromDate <= toDate ? toDate : fromDate;
  const monthRangeStart = toMonthStart(rangeStart);
  const calendarEndDay = rangeEnd;
  const rankedCutoffDay = useMemo(() => getUpcomingMonthlyCutoffDay(nowKstDayKey, 3), [nowKstDayKey]);
  const trophyCutoffDay = useMemo(() => getUpcomingMonthlyCutoffDay(nowKstDayKey, 1), [nowKstDayKey]);
  const calendarWeekSpan = useMemo(() => {
    const startWeekKey = toWeekStartMonday(monthRangeStart);
    const endWeekKey = toWeekStartMonday(rangeEnd);
    const dayDiff = Math.floor((toUtcMsByDayKey(endWeekKey) - toUtcMsByDayKey(startWeekKey)) / DAY_MS);
    return Math.max(1, Math.floor(dayDiff / 7) + 1);
  }, [monthRangeStart, rangeEnd]);
  const effectiveCalendarWidth = calendarFrameWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
  const isCompactCalendar = effectiveCalendarWidth < 390;
  const calendarSidePadding = isCompactCalendar ? 18 : 24;
  const calendarFrameHeightByWidth = Math.round(effectiveCalendarWidth * (isCompactCalendar ? 0.72 : 0.74));
  const calendarTargetFrameHeight = Math.max(isCompactCalendar ? 236 : 272, Math.min(isCompactCalendar ? 300 : 360, calendarFrameHeightByWidth));
  const calendarFrameBasePadding = isCompactCalendar ? 58 : 108;
  const calendarCellSizeByWidth = Math.floor(Math.max(220, effectiveCalendarWidth - calendarSidePadding) / 7);
  const calendarCellSizeByHeight = Math.floor((calendarTargetFrameHeight - calendarFrameBasePadding) / Math.max(1, calendarWeekSpan));
  const calendarCellSize = Math.max(10, Math.min(isCompactCalendar ? 22 : 30, calendarCellSizeByWidth, calendarCellSizeByHeight));
  const calendarGridWidth = calendarCellSize * 7;
  const calendarGridHeight = calendarCellSize * calendarWeekSpan;

  const summarySource = useMemo(() => (Array.isArray(summaryBattles?.[0]) ? summaryBattles[0] : summaryBattles || []), [summaryBattles]);
  const summaryChangeSource = useMemo(() => (Array.isArray(summaryBattles?.[1]) ? summaryBattles[1] : []), [summaryBattles]);
  const summaryDayKeys = useMemo(() => summarySource.map(({ day }) => toKstDayKey(day)), [summarySource]);
  const battleByDay = useMemo(() => new Map(summarySource.map(({ day, value }) => [toKstDayKey(day), Number(value) || 0])), [summarySource]);
  const calendarData = useMemo(() => {
    const result: Array<[string, number]> = [];
    let cursor = monthRangeStart;

    while (cursor <= calendarEndDay) {
      result.push([cursor, (battleByDay.get(cursor) as number) || 0]);
      cursor = addDay(cursor, 1);
    }

    return result;
  }, [battleByDay, calendarEndDay, monthRangeStart]);
  const calendarMaxValue = useMemo(() => {
    const values = calendarData.map(([, value]) => value);
    return values.length ? Math.max(...values) : 0;
  }, [calendarData]);
  const calendarLegendPieces = useMemo(() => {
    if (calendarMaxValue <= 0) {
      return [
        {
          min: 0,
          max: 0,
          label: '0',
          color: '#d9dde2'
        }
      ];
    }

    const step = Math.max(1, Math.ceil(calendarMaxValue / 4));
    const firstMax = step;
    const secondMax = step * 2;
    const thirdMax = step * 3;

    return [
      {
        min: 0,
        max: 0,
        label: '0',
        color: '#d9dde2'
      },
      {
        min: 1,
        max: firstMax,
        label: `1-${firstMax}`,
        color: calendarColors[0]
      },
      {
        min: firstMax + 1,
        max: secondMax,
        label: `${firstMax + 1}-${secondMax}`,
        color: calendarColors[1]
      },
      {
        min: secondMax + 1,
        max: thirdMax,
        label: `${secondMax + 1}-${thirdMax}`,
        color: calendarColors[2]
      },
      {
        min: thirdMax + 1,
        label: `${thirdMax + 1}+`,
        color: calendarColors[3]
      }
    ];
  }, [calendarColors, calendarMaxValue]);
  const cutoffDayTheme = useMemo(
    () =>
      new Map([
        [
          rankedCutoffDay,
          {
            label: 'Ranked cutoff',
            borderColor: '#3d6f9f',
            fillColor: '#8fb6da'
          }
        ],
        [
          trophyCutoffDay,
          {
            label: 'Trophy cutoff',
            borderColor: '#a77745',
            fillColor: '#d9bc98'
          }
        ]
      ]),
    [rankedCutoffDay, trophyCutoffDay]
  );
  const heatmapData = useMemo(
    () =>
      calendarData.map(([day, value]) => {
        const cutoffTheme = cutoffDayTheme.get(day);
        if (!cutoffTheme) {
          return [day, value];
        }

        return {
          value: [day, value],
          itemStyle: {
            color: cutoffTheme.fillColor,
            borderColor: cutoffTheme.borderColor,
            borderWidth: 1
          }
        };
      }),
    [calendarData, cutoffDayTheme]
  );
  const matchChangeByDay = useMemo(() => new Map(summaryChangeSource.map(({ day, value }) => [toKstDayKey(day), Number(value) || 0])), [summaryChangeSource]);

  useEffect(() => {
    if (!summaryDayKeys.length) {
      return;
    }

    setSelectedDayKey((prevKey) => {
      if (summaryDayKeys.includes(prevKey)) {
        return prevKey;
      }

      return summaryDayKeys[summaryDayKeys.length - 1];
    });
  }, [summaryDayKeys]);

  useEffect(() => {
    if (!dailyBrawlers.length) {
      return;
    }

    const dateItem: {
      date: Date | string;
      brawlers: UserDailyBrawlersType[];
    } = dailyBrawlers.find(({ date }) => toKstDayKey(date) === selectedDayKey);

    setDailyBrawlerItem(dateItem ? dateItem.brawlers : []);
  }, [dailyBrawlers, selectedDayKey]);

  useEffect(() => {
    if (typeof window === 'undefined' || !calendarFrameRef.current) {
      return;
    }

    const element = calendarFrameRef.current;
    let rafId = 0;

    const updateWidth = () => {
      const nextWidth = Math.round(element.getBoundingClientRect().width);
      if (nextWidth <= 0) {
        return;
      }

      setCalendarFrameWidth((prevWidth) => (prevWidth === nextWidth ? prevWidth : nextWidth));
    };

    updateWidth();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
        rafId = window.requestAnimationFrame(updateWidth);
      });

      observer.observe(element);
      return () => {
        if (rafId) {
          window.cancelAnimationFrame(rafId);
        }
        observer.disconnect();
      };
    }

    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [summaryBattles]);

  const selectedDateLabel = useMemo(() => {
    const date = new Date(`${selectedDayKey}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
      return selectedDayKey;
    }

    return date.toLocaleDateString();
  }, [selectedDayKey]);

  const chartOption = useMemo(
    () => ({
      animation: false,
      tooltip: {
        trigger: 'item',
        borderColor: '#b6cdd8',
        borderWidth: 1,
        backgroundColor: '#f8fcff',
        textStyle: {
          color: '#233348',
          fontFamily:
            '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
        },
        formatter: (params: { value: [string, number] }) => {
          const day = toKstDayKey(params?.value?.[0]);
          const battles = params?.value?.[1] || 0;
          const matchChange = matchChangeByDay.get(day) || 0;
          const changeText = matchChange > 0 ? `+${matchChange}` : `${matchChange}`;
          const cutoffTheme = cutoffDayTheme.get(day);
          const cutoffText = cutoffTheme ? `<br/>${cutoffTheme.label}` : '';

          return `${day}<br/>${battles} battles (${changeText})${cutoffText}`;
        }
      },
      visualMap: {
        type: 'piecewise',
        show: !isCompactCalendar,
        orient: 'horizontal',
        left: 'center',
        bottom: isCompactCalendar ? 10 : 16,
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 10,
        textGap: 4,
        calculable: false,
        textStyle: {
          color: '#233348',
          fontWeight: 700,
          fontSize: 11
        },
        pieces: calendarLegendPieces
      },
      calendar: {
        top: isCompactCalendar ? 16 : 22,
        bottom: isCompactCalendar ? 10 : 72,
        left: 'center',
        orient: 'vertical',
        width: calendarGridWidth,
        height: calendarGridHeight,
        cellSize: 'auto',
        range: [monthRangeStart, rangeEnd],
        splitLine: {
          show: true,
          lineStyle: {
            color: '#e5ecf0',
            width: 1
          }
        },
        itemStyle: {
          borderColor: '#e5ecf0',
          borderWidth: 1
        },
        dayLabel: {
          show: !isCompactCalendar,
          firstDay: 1,
          margin: 8,
          color: '#4f657b',
          nameMap: 'en'
        },
        monthLabel: {
          color: '#233348',
          margin: isCompactCalendar ? 8 : 14,
          position: 'start',
          nameMap: 'en',
          fontSize: isCompactCalendar ? 11 : 12,
          fontFamily:
            '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
        },
        yearLabel: {
          show: false
        }
      },
      series: [
        {
          type: 'heatmap',
          coordinateSystem: 'calendar',
          data: heatmapData
        }
      ]
    }),
    [calendarGridHeight, calendarGridWidth, calendarLegendPieces, cutoffDayTheme, heatmapData, isCompactCalendar, matchChangeByDay, monthRangeStart, rangeEnd]
  );

  const chartEvents = {
    click: (params: { value?: [string, number] }) => {
      const nextDate = params?.value?.[0];
      if (!nextDate) {
        return;
      }

      setSelectedDayKey(toKstDayKey(nextDate));
    }
  };

  return (
    <div className={styles.userDailyStatsBox}>
      <div className={styles.userDailyStatsGraphBox}>
        <h3>{locales.user['battle']?.dailyBattles || 'dailyBattles'}</h3>
        <div className={styles.selectedDate}>
          ({selectedDateLabel} {locales.application['selected'] || 'selected'})
        </div>
        <div className={styles.cutoffLegend}>
          <span className={styles.rankedCutoff}>- {formatShortDay(rankedCutoffDay)} Ranked cutoff</span>
          <span className={styles.trophyCutoff}>- {formatShortDay(trophyCutoffDay)} Trophy cutoff</span>
        </div>
        {summaryBattles && (
          <div className={styles.dailyCalendarChartFrame} ref={calendarFrameRef}>
            <ReactECharts option={chartOption} onEvents={chartEvents} notMerge={true} lazyUpdate={true} opts={{ renderer: 'svg' }} style={{ width: '100%', height: '100%' }} />
          </div>
        )}
      </div>
      <div className={styles.userDailyBrawlerStatBox}>
        <h3>{locales.user['battle']?.brawlerBattles || 'brawlerBattles'}</h3>
        <div className={styles.selectedDate}>
          ({selectedDateLabel} {locales.application['selected'] || 'selected'})
        </div>
        <UserBrawlerStatsBox brawlers={dailyBrawlerItem} type={'rate'} />
      </div>
    </div>
  );
};
