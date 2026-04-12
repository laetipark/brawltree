import React, { useContext, useEffect, useState } from 'react';
import { SearchItem } from '~/components/search/search-item/search-item';

import { SearchUserItemType } from '~/common/types/main.type';
import { SearchContext } from '~/context/search.context';
import { MainService } from '~/services/main.service';

import styles from './search-history-box.module.scss';

export const SearchHistoryBox = ({ searchHistory }) => {
  const [historyUsers, setHistoryUsers] = useState([]);
  const context = useContext(SearchContext);
  const { onFilterSearchItem, onRemoveSearchItem } = context;

  useEffect(() => {
    MainService.getUsersByUserIDs(searchHistory).then((data) => {
      const userIDs = data.map((user: SearchUserItemType) => user.userID);
      onFilterSearchItem(userIDs);
      setHistoryUsers(data);
    });
  }, [searchHistory]);

  return (
    <ul className={styles.SearchHistoryContainer}>
      {historyUsers.map((user) => {
        return <SearchItem key={user.userID} user={user} onAddSearchHistory={null} onRemoveSearchItem={onRemoveSearchItem} />;
      })}
    </ul>
  );
};
