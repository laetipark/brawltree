import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';

import { UserInfoContainer } from './user/user-info';
import { UserButtonsContainer } from './user/user-buttons';
import { UserMenuContainer } from './user/user-menu';
import { UserProfileContainer } from '~/pages/user/user-menu/user-profile';
import { UserBrawlersContainer } from '~/pages/user/user-menu/user-brawlers';
import { Spinner } from '~/components/spinner/spinner';

import {
  UserBrawlersContext,
  UserContext,
  UserProfileContext
} from '~/context/user.context';
import { CdnContext } from '~/context/cdn.context';
import { PageSeo } from '~/components/seo/page-seo';
import { useUserBootstrap } from '~/hooks/user/use-user-bootstrap';
import { useUserPageSeo } from '~/hooks/user/use-user-page-seo';
import { useUserPageState } from '~/hooks/user/use-user-page-state';

import defStyles from '~/common/styles/app.module.scss';
import styles from '~/assets/styles/pages/user.module.scss';

export const UserWrapper = () => {
  const locales = useContext(CdnContext);
  const { id: routeId } = useParams();
  const {
    bootstrapState,
    userContextValue,
    userProfileContextValue,
    userBrawlersContextValue,
    menu,
    setMenu,
    userInfoLoaded,
    user
  } = useUserPageState(routeId);
  const { title, description } = useUserPageSeo({
    id: bootstrapState.id,
    locales,
    user,
    userInfoLoaded
  });

  useUserBootstrap(bootstrapState);

  return (
    <React.Fragment>
      <PageSeo page="user" language={locales.language} title={title} description={description} />
      {userInfoLoaded ? (
        <UserContext.Provider value={userContextValue}>
          <div className={`${defStyles.app} ${styles.userPage}`}>
            <div className={styles.userWrapper}>
              <UserInfoContainer />
              <UserButtonsContainer />
            </div>
            <UserMenuContainer menu={menu} setMenu={setMenu} />
            {menu === 'profile' ? (
              <UserProfileContext.Provider value={userProfileContextValue}>
                <UserProfileContainer />
              </UserProfileContext.Provider>
            ) : (
              <UserBrawlersContext.Provider value={userBrawlersContextValue}>
                <UserBrawlersContainer />
              </UserBrawlersContext.Provider>
            )}
          </div>
        </UserContext.Provider>
      ) : (
        <Spinner fill={true} />
      )}
    </React.Fragment>
  );
};
