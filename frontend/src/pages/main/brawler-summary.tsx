import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { BrawlerSummaryItem } from '~/components/main/brawlers/content/brawler-summary-item';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/components/main/brawlers/brawler-summary-container.module.scss';

export const BrawlerSummaryContainer = ({ brawlersTrophy, brawlersRanked }) => {
  const locales = useContext(CdnContext);

  return (
    <div className={styles.brawlersSummaryContainer}>
      <h2>
        <Link to={'./brawler/shelly'}>{locales.main['brawlers']}</Link>
      </h2>
      <div className={styles.brawlerSummaryContent}>
        <div>
          <div>{locales.battle['type'].trophy} Pick Top 12</div>
          <div>
            {brawlersTrophy &&
              brawlersTrophy?.map(({ brawlerID, brawlerName, trophyPickRate, trophyVictoryRate }) => {
                return <BrawlerSummaryItem key={`trophy_${brawlerID}`} brawlerID={brawlerID} brawlerName={brawlerName} pickRate={trophyPickRate} victoryRate={trophyVictoryRate} />;
              })}
          </div>
        </div>
        <div>
          <div>{locales.battle['type'].ranked} Pick Top 12</div>
          <div>
            {brawlersRanked &&
              brawlersRanked?.map(({ brawlerID, brawlerName, rankedPickRate, rankedVictoryRate }) => {
                return <BrawlerSummaryItem key={`ranked_${brawlerID}`} brawlerID={brawlerID} brawlerName={brawlerName} pickRate={rankedPickRate} victoryRate={rankedVictoryRate} />;
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
