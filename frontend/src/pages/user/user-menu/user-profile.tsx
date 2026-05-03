import React, { useContext, useState } from 'react';

import { UserRecordsContent } from '~/pages/user/user-menu/user-profile/user-records';
import { UserBattlesContent } from '~/pages/user/user-menu/user-profile/user-battles';
import { UserFriendsContent } from '~/pages/user/user-menu/user-profile/user-friends';
import { UserSeasonsContent } from '~/pages/user/user-menu/user-profile/user-seasons';
import { Spinner } from '~/components/spinner/spinner';
import { UserContext, UserProfileContext } from '~/context/user.context';
import { useUserProfileData } from '~/hooks/user/use-user-profile-data';

import styles from '~/assets/styles/pages/user/user-menu/user-profile.module.scss';

export const UserProfileContainer = () => {
  const userContext = useContext(UserContext);
  const userProfileContext = useContext(UserProfileContext);
  const [battlesStackEnded, setBattlesStackEnded] = useState(false);

  if (!userContext || !userProfileContext) {
    return null;
  }

  useUserProfileData(userContext, userProfileContext, setBattlesStackEnded);

  const {
    profileLoaded,
    setBattlesLoaded
  } = userContext;
  const {
    profile,
    isCrew,
    friendList,
    seasonList,
    setBattleStack
  } = userProfileContext;

  return profileLoaded ? (
    <div className={styles.userProfileContainer}>
      <UserRecordsContent profile={profile} />
      {isCrew && (
        <React.Fragment>
          <UserFriendsContent friendList={friendList} />
          <UserSeasonsContent seasonList={seasonList} />
          <UserBattlesContent
            setBattleStack={setBattleStack}
            setBattlesLoaded={setBattlesLoaded}
            battlesStackEnded={battlesStackEnded}
            setBattlesStackEnded={setBattlesStackEnded}
          />
        </React.Fragment>
      )}
    </div>
  ) : (
    <Spinner />
  );
};
