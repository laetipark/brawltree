import { Dispatch, SetStateAction, useEffect } from 'react';
import { UserContextType, UserProfileContextType } from '~/context/user.context';
import { UserService } from '~/services/user.service';

/**
 * 사용자 프로필 API 재시도 최대 횟수입니다.
 */
const PROFILE_RETRY_LIMIT = 3;

/**
 * 사용자 프로필 API 재시도 간격입니다.
 */
const PROFILE_RETRY_DELAY_MS = 1000;

/**
 * 사용자 상세 페이지의 프로필, 크루 정보, 배틀 통계를 로드합니다.
 *
 * 프로필은 제한된 재시도로 안정화하고, 배틀 통계는 타입/모드/스택 변경에 맞춰
 * 다시 조회해 컨텍스트 상태를 한 곳에서 갱신합니다.
 */
export const useUserProfileData = (userContext: UserContextType, userProfileContext: UserProfileContextType, setBattlesStackEnded: Dispatch<SetStateAction<boolean>>) => {
  const { id, user, retryProfileCount, setRetryProfileCount, profileLoaded, setProfileLoaded, battlesLoaded, setBattlesLoaded } = userContext;
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
        // 프로필과 크루 부가 정보는 같은 활성 요청 안에서만 상태에 반영한다.
        const data = await UserService.getUserProfile({ id });
        if (!isActive) {
          return;
        }

        if (!data) {
          setRetryProfileCount((retryCount) => retryCount + 1);
          return;
        }

        setProfile(data.profile);

        const isCrewMember = Boolean(user.isCrew);
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
      // crawler 온디맨드 갱신 직후 빈 응답이 올 수 있어 짧게 지연한 뒤 재시도한다.
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
  }, [id, profileLoaded, retryProfileCount, setFriendList, setIsCrew, setProfile, setProfileLoaded, setRetryProfileCount, setSeasonList, user.isCrew]);

  useEffect(() => {
    // 타입/모드가 바뀌면 무한 스크롤 커서와 로딩 완료 상태를 초기화한다.
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
        // 통계와 로그는 같은 필터 조합을 쓰므로 병렬 조회해 화면 전환 지연을 줄인다.
        const [statsData, logsData] = await Promise.all([UserService.getUserBattleStats({ id, type, mode }), UserService.getUserBattleLogs({ id, type, mode, battleStack })]);

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
  }, [battleStack, battlesLoaded, id, mode, setBattles, setBattlesLoaded, setCurrentSeason, setDailyBrawlers, setModePL, setModeTL, setRecentBattles, setRecentBrawlers, setSummaryBattles, type]);
};
