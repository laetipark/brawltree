import { useEffect } from 'react';
import {
  UserBrawlersContextType,
  UserContextType
} from '~/context/user.context';
import { UserService } from '~/services/user.service';

const BRAWLERS_RETRY_LIMIT = 3;
const BRAWLERS_RETRY_DELAY_MS = 1000;

export const useUserBrawlersData = (
  userContext: UserContextType,
  userBrawlersContext: UserBrawlersContextType
) => {
  const {
    id,
    retryBrawlerCount,
    setRetryBrawlerCount,
    brawlerLoaded,
    setBrawlerLoaded
  } = userContext;
  const {
    setUserWithoutBrawlers,
    setUserOwnedBrawlers,
    setBrawlerItems,
    setBrawlerGraphs
  } = userBrawlersContext;

  useEffect(() => {
    if (brawlerLoaded || retryBrawlerCount >= BRAWLERS_RETRY_LIMIT) {
      return;
    }

    let isActive = true;
    let timeoutID: ReturnType<typeof window.setTimeout> | null = null;

    const loadUserBrawlers = async () => {
      try {
        const data = await UserService.getUserBrawlers({ id });
        if (!isActive) {
          return;
        }

        setUserWithoutBrawlers(data.userWithoutBrawlers);
        setUserOwnedBrawlers(data.userOwnedBrawlers);
        setBrawlerItems(data.brawlerItems);
        setBrawlerGraphs(data.brawlerGraphs);
        setBrawlerLoaded(true);
      } catch (error) {
        if (isActive) {
          setRetryBrawlerCount((retryCount) => retryCount + 1);
        }
      }
    };

    if (retryBrawlerCount === 0) {
      void loadUserBrawlers();
    } else {
      timeoutID = window.setTimeout(() => {
        void loadUserBrawlers();
      }, BRAWLERS_RETRY_DELAY_MS);
    }

    return () => {
      isActive = false;
      if (timeoutID) {
        window.clearTimeout(timeoutID);
      }
    };
  }, [
    brawlerLoaded,
    id,
    retryBrawlerCount,
    setBrawlerGraphs,
    setBrawlerItems,
    setBrawlerLoaded,
    setRetryBrawlerCount,
    setUserOwnedBrawlers,
    setUserWithoutBrawlers
  ]);
};
