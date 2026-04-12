import { Dispatch, SetStateAction, useEffect } from 'react';
import {
  UserContextType,
  UserProfileContextType
} from '~/context/user.context';
import { UserService } from '~/services/user.service';

const PROFILE_RETRY_LIMIT = 3;
const PROFILE_RETRY_DELAY_MS = 1000;

export const useUserProfileData = (
  userContext: UserContextType,
  userProfileContext: UserProfileContextType,
  setBattlesStackEnded: Dispatch<SetStateAction<boolean>>
) => {
  const {
    id,
    user,
    retryProfileCount,
    setRetryProfileCount,
    profileLoaded,
    setProfileLoaded,
    battlesLoaded,
    setBattlesLoaded
  } = userContext;
  const {
    type,
    mode,
    setModeTL,
    setModePL,
    setSummaryBattles,
    setDailyBrawlers,
    setCurrentSeason,
    battleStack,
    setRecentBattles,
    setRecentBrawlers,
    setBattles,
    setBattleStack,
    setProfile,
    setIsCrew,
    setFriendList,
    setSeasonList
  } = userProfileContext;

  useEffect(() => {
    if (profileLoaded || retryProfileCount >= PROFILE_RETRY_LIMIT) {
      return;
    }

    let isActive = true;
    let timeoutID: ReturnType<typeof window.setTimeout> | null = null;

    const loadUserSummary = async () => {
      try {
        const data = await UserService.getUserProfile({ id });
        if (!isActive) {
          return;
        }

        if (!data) {
          setRetryProfileCount((retryCount) => retryCount + 1);
          return;
        }

        setProfile(data.profile);

        const isCrewMember = Boolean(user.crew);
        setIsCrew(isCrewMember);
        if (isCrewMember) {
          const crewData = await UserService.getCrewMemberDetail({ id });
          if (!isActive) {
            return;
          }

          setFriendList(crewData.friendList);
          setSeasonList(crewData.seasonList);
        }

        setProfileLoaded(true);
      } catch (error) {
        if (isActive) {
          setRetryProfileCount((retryCount) => retryCount + 1);
        }
      }
    };

    if (retryProfileCount === 0) {
      void loadUserSummary();
    } else {
      timeoutID = window.setTimeout(() => {
        void loadUserSummary();
      }, PROFILE_RETRY_DELAY_MS);
    }

    return () => {
      isActive = false;
      if (timeoutID) {
        window.clearTimeout(timeoutID);
      }
    };
  }, [
    id,
    profileLoaded,
    retryProfileCount,
    setFriendList,
    setIsCrew,
    setProfile,
    setProfileLoaded,
    setRetryProfileCount,
    setSeasonList,
    user.crew
  ]);

  useEffect(() => {
    setBattlesLoaded(false);
    setBattleStack(1);
    setBattlesStackEnded(false);
  }, [mode, setBattleStack, setBattlesLoaded, setBattlesStackEnded, type]);

  useEffect(() => {
    if (battlesLoaded) {
      return;
    }

    let isActive = true;

    const loadUserBattles = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          UserService.getUserBattleStats({ id, type, mode }),
          UserService.getUserBattleLogs({ id, type, mode, battleStack })
        ]);

        if (!isActive) {
          return;
        }

        setSummaryBattles(statsData.summaryBattles);
        setDailyBrawlers(statsData.dailyBrawlers);
        setModeTL(statsData.modeTL);
        setModePL(statsData.modePL);
        setCurrentSeason(statsData.season);
        setRecentBattles(logsData.recentBattles);
        setRecentBrawlers(logsData.recentBrawlers);
        setBattles(logsData.battles);
        setBattlesLoaded(true);
      } catch (error) {
        if (isActive) {
          setBattlesLoaded(false);
        }
      }
    };

    void loadUserBattles();

    return () => {
      isActive = false;
    };
  }, [
    battleStack,
    battlesLoaded,
    id,
    mode,
    setBattles,
    setBattlesLoaded,
    setCurrentSeason,
    setDailyBrawlers,
    setModePL,
    setModeTL,
    setRecentBattles,
    setRecentBrawlers,
    setSummaryBattles,
    type
  ]);
};
