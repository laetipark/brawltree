import React, { useContext, useEffect, useState } from 'react';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { UserFriendInfoBox } from '~/pages/user/user-menu/user-profile/user-friends/user-friend-info';
import { UserFriendListType, UserFriendType } from '~/common/types/users.type';

import { CdnContext } from '~/context/cdn.context';

import styles from '~/assets/styles/pages/user/user-menu/user-profile/user-friends.module.scss';

export const UserFriendsContent = ({ friendList }: { friendList: UserFriendListType }) => {
  const locales = useContext(CdnContext);
  const { friends, friendsUpdatedAt } = friendList;

  const [filterFriends, setFilterFriends] = useState<UserFriendType[]>([]);
  const [isMore, setIsMore] = useState(false);

  useEffect(() => {
    setFilterFriends(friends.slice(0, 6));
  }, [friends]);

  useEffect(() => {
    if (isMore) {
      setFilterFriends(friends);
    } else {
      setFilterFriends(friends.slice(0, 6));
    }
  }, [isMore]);

  return (
    <div className={styles.friendsContent}>
      <div className={styles.friendsTitleBox}>
        <h2>{locales.user['crew']?.userPlayedWith || 'userPlayedWith'}</h2>
        {friendsUpdatedAt && (
          <div>
            {locales.application['updatedAt'] || 'updatedAt'} {new Date(friendsUpdatedAt).toLocaleString()}
          </div>
        )}
      </div>
      <div className={styles.friendsListBox}>
        {filterFriends?.map((friend) => {
          return <UserFriendInfoBox key={friend.friendID} friend={friend} />;
        })}
      </div>
      {friends.length > 6 && (
        <div className={styles.moreButton} onClick={() => setIsMore(!isMore)}>
          <span>{!isMore ? locales.application['showMore'] || 'showMore' : locales.application['hideMore'] || 'hideMore'}</span>
          <span>
            <FontAwesomeIcon
              style={{
                transform: isMore ? 'rotate(180deg)' : '',
                transition: 'transform 0.3s ease'
              }}
              fontSize={14}
              icon={faAngleDown}
            />
          </span>
        </div>
      )}
    </div>
  );
};
