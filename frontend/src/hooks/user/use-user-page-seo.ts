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
    const cleanTag = id.replace(/^#/, '').toUpperCase();
    const userTag = cleanTag ? `#${cleanTag}` : 'player';
    const isKorean = locales.language === 'ko';

    return {
      title: userInfoLoaded
        ? isKorean
          ? `${user.userName} (${userTag}) 브롤스타즈 전적·배틀로그`
          : `${user.userName} (${userTag}) Brawl Stars Stats and Battle Log`
        : isKorean
          ? `${userTag} 브롤스타즈 플레이어 전적`
          : `${userTag} Brawl Stars Player Stats`,
      description: userInfoLoaded
        ? isKorean
          ? `${user.userName}의 트로피, 랭크, 승리 기록, 브롤러별 통계와 최근 배틀 로그를 브롤트리에서 확인하세요.`
          : `Check ${user.userName}'s trophies, ranked stats, brawler performance, and recent battle logs on BrawlTree.`
        : isKorean
          ? `브롤트리에서 ${userTag} 브롤스타즈 플레이어의 전적, 트로피, 랭크, 브롤러 통계와 최근 배틀 로그를 확인하세요.`
          : `Check Brawl Stars stats, trophies, ranked stats, brawler performance, and recent battle logs for ${userTag} on BrawlTree.`
    };
  }, [id, locales.language, user.userName, userInfoLoaded]);
};
