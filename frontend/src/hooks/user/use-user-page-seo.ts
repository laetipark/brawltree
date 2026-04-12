import { useMemo } from 'react';
import { CdnContextType } from '~/context/cdn.context';
import { UsersType } from '~/common/types/users.type';

type UserPageSeoParams = {
  id: string;
  locales: CdnContextType;
  user: UsersType;
  userInfoLoaded: boolean;
};

export const useUserPageSeo = ({
  id,
  locales,
  user,
  userInfoLoaded
}: UserPageSeoParams) => {
  return useMemo(() => {
    const userTag = id ? `#${id}` : 'player';

    return {
      title: userInfoLoaded
        ? `${user.userName} (${user.userID}) Stats`
        : `${userTag.toUpperCase()} ${locales.user['title'].brawlianStats || 'Brawlian Stats'}`,
      description: userInfoLoaded
        ? `${user.userName} (${user.userID}) ${locales.user['title'].brawlianStatsDesc || 'player performance and match history'}`
        : 'Check player trophy progress, ranked stats, and recent battle logs.'
    };
  }, [id, locales.user, user.userID, user.userName, userInfoLoaded]);
};
