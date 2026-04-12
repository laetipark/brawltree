import React, { useContext } from 'react';

import TableHorizontal from '~/components/table/table-horizontal';

import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-records.module.scss';

const roman = ['I', 'II', 'III'];

export const UserRecordsContent = ({ profile }) => {
  const locales = useContext(CdnContext);

  return (
    <div className={styles.userRecordsContent}>
      <TableHorizontal
        headRow={locales.user['records']?.currentRecord || 'currentRecord'}
        bodyRowContents={[
          [locales.user['records']?.trophies || 'trophies', `${profile.currentTrophies}`],
          [locales.user['records']?.trophyChange || 'trophyChange', `${profile.trophyChange > 0 ? `+${profile.trophyChange}` : profile.trophyChange || 0}`],
          [locales.user['records']?.currentSoloRanked || 'currentSoloRanked', profile.currentSoloRanked / 3 < 6 ? roman[profile.currentSoloRanked % 3] : ''],
          [locales.user['records']?.club || 'club', profile?.clubName?.replace(/(<+)([/c]+|c[1-9])(>)/g, '') || 'No Club']
        ]}
        bodyRowImages={[
          [null, null],
          [null, null],
          [null, `${config.assets}/rank/ranked/${Math.floor(profile.currentSoloRanked / 3)}.webp`],
          [null, null]
        ]}
      />
      <TableHorizontal
        headRow={locales.user['records']?.personalRecord || 'personalRecord'}
        bodyRowContents={[
          [locales.user['records']?.highestTrophies || 'highestTrophies', `${profile.highestTrophies}`],
          [locales.user['records']?.trioVictories || 'trioVictories', `${profile.trioMatchVictories}`],
          [locales.user['records']?.duoVictories || 'duoVictories', `${profile.duoMatchVictories}`],
          [locales.user['records']?.soloVictories || 'soloVictories', `${profile.soloMatchVictories}`],
          [locales.user['records']?.rank50Brawlers || 'rank50Brawlers', `${profile.brawlerRank50}`],
          [locales.user['records']?.highestSoloRanked || 'highestSoloRanked', profile.highestSoloRanked / 3 < 6 ? roman[profile.highestSoloRanked % 3] : '']
        ]}
        bodyRowImages={[
          [null, null],
          [null, null],
          [null, null],
          [null, null],
          [null, null],
          [null, `${config.assets}/rank/ranked/${Math.floor(profile.highestSoloRanked / 3)}.webp`]
        ]}
      />
    </div>
  );
};
