import React, { ChangeEvent, useContext, useState } from 'react';

import { UserBrawlerSummaryContent } from '~/pages/user/user-menu/user-brawlers/user-brawler-summary';
import { UserBrawlersContext, UserContext } from '~/context/user.context';
import { CdnContext } from '~/context/cdn.context';
import { UserBrawlerDetailContent } from '~/pages/user/user-menu/user-brawlers/user-brawler-detail';
import { UserBrawlerComboBox } from '~/components/combo/user-brawler-combo';
import { Spinner } from '~/components/spinner/spinner';
import { useUserBrawlersData } from '~/hooks/user/use-user-brawlers-data';
import { UserOwnedBrawlersType } from '~/common/types/users.type';

import styles from '~/assets/styles/pages/user/user-menu/user-brawlers.module.scss';

const userRarityOrder = ['Trophy Road', 'Rare', 'Super Rare', 'Epic', 'Mythic', 'Legendary'];

const toRarityClassName = (rarity: string) => {
  return rarity
    ?.toLowerCase()
    .split(' ')
    .map((word: string, index: number) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
};

export const UserBrawlersContainer = () => {
  const locales = useContext(CdnContext);
  const context = useContext(UserContext);
  const userBrawlersContext = useContext(UserBrawlersContext);

  if (!context || !userBrawlersContext) {
    return null;
  }

  useUserBrawlersData(context, userBrawlersContext);

  const { brawlerLoaded } = context;
  const {
    userWithoutBrawlers,
    setUserWithoutBrawlers,
    userOwnedBrawlers,
    setUserOwnedBrawlers,
    brawlerItems,
    setBrawlerItems,
    brawlerGraphs,
    setBrawlerGraphs
  } = userBrawlersContext;

  const [order, setOrder] = useState('currentTrophies');
  const [orderDirection, setOrderDirection] = useState(false);
  const [checkedList, setCheckedList] = useState<string[]>([]);
  const [isChecked, setIsChecked] = useState(false);

  const getSortedBrawlers = (nextOrder: string): UserOwnedBrawlersType[] => {
    return [...userOwnedBrawlers].sort((left, right) => {
      const leftName = locales.brawler['brawler'][`${left.name}`] || '';
      const rightName = locales.brawler['brawler'][`${right.name}`] || '';
      const nameSort = leftName.localeCompare(rightName);
      const raritySort = userRarityOrder.indexOf(right.rarity) - userRarityOrder.indexOf(left.rarity);

      if (nextOrder === 'brawlerID') {
        return left.brawlerID.localeCompare(right.brawlerID);
      }

      if (nextOrder === 'brawlerName') {
        return nameSort;
      }

      if (nextOrder === 'rarity') {
        return left.rarity === right.rarity ? nameSort : raritySort;
      }

      if (nextOrder === 'brawlerPower') {
        if (left.brawlerPower === right.brawlerPower) {
          return left.rarity === right.rarity ? nameSort : raritySort;
        }

        return right.brawlerPower - left.brawlerPower;
      }

      if (nextOrder === 'currentTrophies') {
        return right.currentTrophies - left.currentTrophies;
      }

      if (nextOrder === 'highestTrophies') {
        return right.highestTrophies - left.highestTrophies;
      }

      return 0;
    });
  };

  const setBrawlerOrder = ({ target }: ChangeEvent<HTMLSelectElement>) => {
    const nextOrder = target.value;
    setOrder(nextOrder);
    setOrderDirection(!['brawlerID', 'brawlerName'].includes(nextOrder));
    setUserOwnedBrawlers(getSortedBrawlers(nextOrder));
  };

  const setBrawlerOrderDirection = () => {
    setOrderDirection(!orderDirection);
    setUserOwnedBrawlers([...userOwnedBrawlers].reverse());
  };

  const checkedItemHandler = (value: string, nextIsChecked: boolean) => {
    if (nextIsChecked) {
      setCheckedList((prev) => [...prev, value]);
      return;
    }

    setCheckedList((prev) => prev.filter((item) => item !== value));
  };

  const checkHandler = (event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setIsChecked(!isChecked);
    checkedItemHandler(value, event.target.checked);
  };

  return brawlerLoaded ? (
    <div className={styles.brawlersContainer}>
      <div>
        <h2 className={styles.brawlersTitleBox}>
          {locales.user['brawlers']?.ownedBrawlers || 'ownedBrawlers'}
          <span>
            ({userOwnedBrawlers?.length}/{userOwnedBrawlers?.length + userWithoutBrawlers?.length})
          </span>
        </h2>
        <UserBrawlerComboBox order={order} setBrawlerOrder={setBrawlerOrder} orderDirection={orderDirection} setBrawlerOrderDirection={setBrawlerOrderDirection} />
      </div>
      <div className={styles.ownedBrawlersContent}>
        {userOwnedBrawlers?.map(
          ({ brawlerID, name, rarity, brawlerPower, beginTrophies, currentTrophies, highestTrophies, rankedPickRate, trophyPickRate, rankedVictoryRate, trophyVictoryRate, brawlerRank, values }) => {
            const rarityClassName = toRarityClassName(rarity);

            return (
              <div key={brawlerID}>
                <UserBrawlerSummaryContent
                  brawlerID={brawlerID}
                  brawlerName={name}
                  brawlerRarity={rarityClassName}
                  brawlerPower={brawlerPower}
                  brawlerRank={brawlerRank}
                  beginTrophies={beginTrophies}
                  currentTrophies={currentTrophies}
                  highestTrophies={highestTrophies}
                  checkedList={checkedList}
                  checkHandler={checkHandler}
                />
                <UserBrawlerDetailContent
                  brawlerID={brawlerID}
                  brawlerRarity={rarityClassName}
                  rankedPickRate={rankedPickRate}
                  trophyPickRate={trophyPickRate}
                  rankedVictoryRate={rankedVictoryRate}
                  trophyVictoryRate={trophyVictoryRate}
                  userBrawlerItems={brawlerItems}
                  brawlerPower={brawlerPower}
                  brawlerValues={values}
                  brawlerGraphs={brawlerGraphs}
                  checkedList={checkedList}
                />
              </div>
            );
          }
        )}
      </div>
      <h2 className={styles.brawlersTitleBox}>
        {locales.user['brawlers']?.withoutBrawlers || 'withoutBrawlers'}
        <span>
          ({userWithoutBrawlers?.length}/{userOwnedBrawlers?.length + userWithoutBrawlers?.length})
        </span>
      </h2>
      <div className={styles.ownedBrawlersContent}>
        {userWithoutBrawlers.map(({ brawlerID, name, rarity }) => {
          return (
            <UserBrawlerSummaryContent
              key={brawlerID}
              brawlerID={brawlerID}
              brawlerName={name}
              brawlerRarity={rarity}
              brawlerPower={null}
              brawlerRank={null}
              beginTrophies={null}
              currentTrophies={null}
              highestTrophies={null}
              checkedList={null}
              checkHandler={null}
            />
          );
        })}
      </div>
    </div>
  ) : (
    <Spinner />
  );
};
