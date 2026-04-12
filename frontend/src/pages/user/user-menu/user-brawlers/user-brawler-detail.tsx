import React, { useContext } from 'react';
import ReactECharts from 'echarts-for-react';

import { ItemTooltip } from '~/components/items/item-info/item-tooltip';

import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import defStyles from '~/common/styles/app.module.scss';
import styles from '~/assets/styles/pages/user/user-menu/user-brawlers/user-brawler-detail.module.scss';

export const UserBrawlerDetailContent = ({
  brawlerID,
  brawlerRarity,
  rankedPickRate,
  trophyPickRate,
  rankedVictoryRate,
  trophyVictoryRate,
  userBrawlerItems,
  brawlerPower,
  brawlerValues,
  brawlerGraphs,
  checkedList
}) => {
  const locales = useContext(CdnContext);
  const isVisible = checkedList.includes(brawlerID);

  const brawlerGadgets = userBrawlerItems?.filter(({ brawlerID: item, itemKind }) => item === brawlerID && itemKind === 'gadget');
  const brawlerStarPowers = userBrawlerItems?.filter(({ brawlerID: item, itemKind }) => item === brawlerID && itemKind === 'starPower');
  const brawlerGears = userBrawlerItems?.filter(({ brawlerID: item, itemKind }) => item === brawlerID && itemKind === 'gear');
  const brawlerData = brawlerGraphs?.filter((item) => item.brawlerID === brawlerID) || [];
  const lineCategories = brawlerData.map(({ x }) => x);
  const lineValues = brawlerData.map(({ y }) => y);
  const minTrophy = lineValues.length > 0 ? Math.min(...lineValues) - 40 : 0;
  const maxTrophy = lineValues.length > 0 ? Math.max(...lineValues) + 40 : 100;
  const lineOption = {
    animation: false,
    tooltip: {
      show: true,
      trigger: 'axis',
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#8fb2bf',
          width: 1
        }
      },
      borderColor: '#b6cdd8',
      borderWidth: 1,
      backgroundColor: '#f8fcff',
      textStyle: {
        color: '#233348',
        fontFamily:
          '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      },
      formatter: (params) => {
        const point = Array.isArray(params) ? params[0] : params;
        if (!point) {
          return '';
        }

        return `${point.axisValue}<br/>${locales.user['records']?.trophies || 'trophies'}: ${point.value}`;
      }
    },
    grid: {
      top: 14,
      right: 16,
      bottom: 42,
      left: 52
    },
    xAxis: {
      type: 'category',
      data: lineCategories,
      axisTick: {
        show: true,
        alignWithLabel: true,
        length: 4
      },
      axisLine: {
        lineStyle: {
          color: '#a6c4d2'
        }
      },
      axisLabel: {
        color: '#4f657b',
        fontSize: 11,
        fontFamily:
          '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      },
      name: locales.application['date'] || 'date',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: '#233348',
        fontWeight: 700,
        fontSize: 12,
        fontFamily:
          '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      }
    },
    yAxis: {
      type: 'value',
      min: minTrophy,
      max: maxTrophy,
      axisTick: {
        show: true,
        length: 4
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#a6c4d2'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#c7dce5',
          width: 1
        }
      },
      axisLabel: {
        color: '#4f657b',
        fontSize: 11,
        fontFamily:
          '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      },
      name: locales.user['records']?.trophies || 'trophies',
      nameLocation: 'middle',
      nameGap: 40,
      nameRotate: 90,
      nameTextStyle: {
        color: '#233348',
        fontWeight: 700,
        fontSize: 12,
        fontFamily:
          '"Main Medium", "JP Medium", "CN Medium", "N Medium", -apple-system, BlinkMacSystemFont, "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif'
      }
    },
    series: [
      {
        type: 'line',
        data: lineValues,
        smooth: false,
        silent: false,
        symbol: 'circle',
        symbolSize: 7,
        lineStyle: {
          color: '#8fb2bf',
          width: 2
        },
        itemStyle: {
          color: '#8fb2bf',
          borderColor: '#8fb2bf',
          borderWidth: 2
        },
        areaStyle: {
          color: 'rgba(143, 178, 191, 0.28)'
        }
      }
    ]
  };

  return (
    <div className={`${styles.userBrawlerDetailContent} ${defStyles[`${brawlerRarity}Background`]}`} style={{ display: isVisible ? 'flex' : 'none' }}>
      <div>
        <h4>{locales.user['brawlers']?.items || 'items'}</h4>
        {brawlerGadgets && (
          <div>
            {brawlerGadgets?.map(({ itemID, itemName, values }) => (
              <ItemTooltip key={itemID} itemID={itemID} itemName={itemName} itemKind={'gadget'} values={values} brawlerPower={brawlerPower} brawlerValues={brawlerValues} />
            ))}
          </div>
        )}
        {brawlerStarPowers && (
          <div>
            {brawlerStarPowers?.map(({ itemID, itemName, values }) => (
              <ItemTooltip key={itemID} itemID={itemID} itemName={itemName} itemKind={'starPower'} values={values} brawlerPower={brawlerPower} brawlerValues={brawlerValues} />
            ))}
          </div>
        )}
        {brawlerGears && (
          <div>
            {brawlerGears?.map(({ itemID, itemName, values }) => (
              <ItemTooltip key={itemID} itemID={itemID} itemName={itemName} itemKind={'gear'} values={values} brawlerPower={brawlerPower} brawlerValues={brawlerValues} />
            ))}
          </div>
        )}
      </div>
      <div>
        <img src={`${config.assets}/modes/icon/trophy.webp`} alt={locales.battle['type']?.trophy} />
        <h4>{locales.battle['type']?.trophy || 'trophy'}</h4>
        <div>
          <span>{locales.application['pick'] || 'pick'}</span>
          <span>{trophyPickRate}%</span>
        </div>
        <div>
          <span>{locales.application['win'] || 'win'}</span>
          <span>{trophyVictoryRate}%</span>
        </div>
      </div>
      <div>
        <img src={`${config.assets}/modes/icon/ranked.webp`} alt={locales.battle['type']?.ranked} />
        <h4>{locales.battle['type']?.ranked || 'ranked'}</h4>
        <div>
          <span>{locales.application['pick'] || 'pick'}</span>
          <span>{rankedPickRate}%</span>
        </div>
        <div>
          <span>{locales.application['win'] || 'win'}</span>
          <span>{rankedVictoryRate}%</span>
        </div>
      </div>
      {isVisible && brawlerData.length > 1 && (
        <div className={styles.brawlerLineChartFrame}>
          <ReactECharts key={`${brawlerID}-${lineCategories.length}`} option={lineOption} notMerge={true} lazyUpdate={true} opts={{ renderer: 'svg' }} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  );
};
