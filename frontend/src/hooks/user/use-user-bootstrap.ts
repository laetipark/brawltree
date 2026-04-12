import { useEffect } from 'react';
import { UserService } from '~/services/user.service';
import {
  UserBootstrapState,
  createEmptyUser
} from '~/hooks/user/use-user-page-state';

const USER_FETCH_RETRY_LIMIT = 3;
const USER_FETCH_RETRY_DELAY_MS = 1000;

export const useUserBootstrap = ({
  id,
  setUser,
  userPageLoaded,
  setUserPageLoaded,
  userInfoLoaded,
  setUserInfoLoaded,
  profileLoaded,
  setProfileLoaded,
  brawlerLoaded,
  setBrawlerLoaded,
  retryUserInfoCount,
  setRetryUserInfoCount,
  setRetryProfileCount,
  setRetryBrawlerCount,
  setBattlesLoaded
}: UserBootstrapState) => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }

    // 유저 태그가 바뀌면 하위 메뉴의 로딩 상태를 모두 초기화한다.
    setUser(createEmptyUser(id));
    setUserPageLoaded(false);
    setUserInfoLoaded(false);
    setProfileLoaded(false);
    setBrawlerLoaded(false);
    setBattlesLoaded(false);
    setRetryUserInfoCount(0);
    setRetryProfileCount(0);
    setRetryBrawlerCount(0);
  }, [
    id,
    setUser,
    setUserPageLoaded,
    setUserInfoLoaded,
    setProfileLoaded,
    setBrawlerLoaded,
    setBattlesLoaded,
    setRetryUserInfoCount,
    setRetryProfileCount,
    setRetryBrawlerCount
  ]);

  useEffect(() => {
    if (userPageLoaded) {
      return;
    }

    setUserPageLoaded(
      (userInfoLoaded && profileLoaded) || (userInfoLoaded && brawlerLoaded)
    );
  }, [brawlerLoaded, profileLoaded, setUserPageLoaded, userInfoLoaded, userPageLoaded]);

  useEffect(() => {
    if (!id || userInfoLoaded || retryUserInfoCount >= USER_FETCH_RETRY_LIMIT) {
      return;
    }

    let isActive = true;
    let timeoutID: ReturnType<typeof window.setTimeout> | null = null;

    const loadUser = async () => {
      const data = await UserService.getUser({ id });
      if (!isActive) {
        return;
      }

      if (!data) {
        setRetryUserInfoCount((retryCount) => retryCount + 1);
        return;
      }

      setUser(data.user);
      setUserInfoLoaded(true);
    };

    if (retryUserInfoCount === 0) {
      setRetryProfileCount(0);
      setRetryBrawlerCount(0);
      void loadUser();
    } else {
      timeoutID = window.setTimeout(() => {
        void loadUser();
      }, USER_FETCH_RETRY_DELAY_MS);
    }

    return () => {
      isActive = false;
      if (timeoutID) {
        window.clearTimeout(timeoutID);
      }
    };
  }, [
    id,
    retryUserInfoCount,
    setRetryBrawlerCount,
    setRetryProfileCount,
    setRetryUserInfoCount,
    setUser,
    setUserInfoLoaded,
    userInfoLoaded
  ]);
};
