import type { CdnBundle, CdnLocale } from '~/context/cdn.context';
import type { SupportedLanguage } from '~/common/i18n/language';

type CdnNamespace = keyof CdnBundle;

const battleModes = [
  'gemGrab',
  'brawlBall',
  'bounty',
  'heist',
  'hotZone',
  'knockout',
  'basketBrawl',
  'volleyBrawl',
  'wipeout',
  'payload',
  'siege',
  'presentPlunder',
  'holdTheTrophy',
  'botDrop',
  'snowtelThieves',
  'pumpkinPlunder',
  'wipeout5V5',
  'knockout5V5',
  'gemGrab5V5',
  'brawlBall5V5',
  'godzillaCitySmash',
  'paintBrawl',
  'jellyfishing',
  'zombiePlunder',
  'duels',
  'soloShowdown',
  'takedown',
  'loneStar',
  'hunters',
  'trophyEscape',
  'duoShowdown',
  'trioShowdown'
];

const identityLabels = (values: string[]) => {
  return Object.fromEntries(values.map((value) => [value, value]));
};

const fallbackBundle: CdnBundle = {
  application: {
    date: 'Date',
    games: 'games',
    hideMore: 'Hide more',
    pick: 'Pick',
    selected: 'selected',
    showMore: 'Show more',
    updatedAt: 'Updated at',
    win: 'Win'
  },
  battle: {
    mode: identityLabels(battleModes),
    result: {
      '-1': 'Win',
      0: 'Draw',
      1: 'Loss',
      d: 'D',
      game: 'games',
      l: 'L',
      starPlayer: 'Star player',
      w: 'W'
    },
    type: {
      0: 'Trophy',
      2: 'Ranked',
      3: 'Ranked',
      4: 'Challenge',
      5: 'Challenge',
      6: 'Club League',
      7: 'All',
      all: 'All',
      challenge: 'Challenge',
      clubLeague: 'Club League',
      powerLeagueTeam: 'Ranked',
      ranked: 'Ranked',
      trophy: 'Trophy'
    }
  },
  brawler: {},
  main: {
    brawlers: 'Brawlers',
    findTag: 'Find tag',
    input: 'Enter player tag or nickname',
    introduce: 'BrawlTree',
    news: 'News',
    searchProfile: 'Brawl Stars Player Search',
    searchUserContainer: {
      checkClearSearch: 'Clear recent searches?',
      clearSearch: 'Clear',
      recentSearch: 'Recent searches'
    }
  },
  map: {
    event: {
      current: 'Current',
      endsIn: 'ends in',
      ranked: 'Ranked',
      startsIn: 'starts in',
      tomorrow: 'Upcoming'
    },
    map: {}
  },
  news: {
    newsDesc: 'Brawl Stars news and updates'
  },
  user: {
    battle: {
      battles: 'Battles',
      brawlerBattles: 'Brawler battles',
      brawlerRoleUsed: 'Brawler roles',
      d: 'd',
      dailyBattles: 'Daily battles',
      daysAgo: 'days ago',
      h: 'h',
      hoursAgo: 'hours ago',
      m: 'm',
      minutesAgo: 'minutes ago',
      recentBattles: 'Recent battles'
    },
    brawlers: {
      current: 'Current',
      highest: 'Highest',
      items: 'Items',
      order: {
        brawlerID: 'Brawler ID',
        brawlerName: 'Brawler',
        brawlerPower: 'Power',
        currentTrophies: 'Current trophies',
        highestTrophies: 'Highest trophies',
        rarity: 'Rarity'
      },
      ownedBrawlers: 'Owned brawlers',
      withoutBrawlers: 'Missing brawlers'
    },
    crew: {
      seasonRecord: 'Season record',
      userPlayedWith: 'Played with'
    },
    menu: {
      brawlers: 'Brawlers',
      profile: 'Profile'
    },
    noBrawlerData: 'No brawler data',
    records: {
      club: 'Club',
      currentRecord: 'Current record',
      currentSoloRanked: 'Current ranked',
      duoVictories: 'Duo victories',
      highestSoloRanked: 'Highest ranked',
      highestTrophies: 'Highest trophies',
      personalRecord: 'Personal record',
      rank50Brawlers: 'Rank 50 brawlers',
      soloVictories: 'Solo victories',
      trioVictories: 'Trio victories',
      trophies: 'Trophies',
      trophyChange: 'Trophy change'
    },
    title: {
      brawlianStats: 'Brawlian Stats',
      brawlianStatsDesc: 'player performance and match history',
      copyAlert: 'Copied',
      copyTag: 'Copy tag',
      copyTagAndRun: 'Copy tag and open Brawl Stars',
      crewBadge: 'Crew',
      officialApiBadge: 'Official API',
      update: 'Update',
      updateAgo: 'updated ago'
    }
  }
};

const koFallbackBundle: CdnBundle = {
  ...fallbackBundle,
  application: {
    ...fallbackBundle.application,
    date: '날짜',
    games: '경기',
    hideMore: '접기',
    pick: '픽',
    selected: '선택됨',
    showMore: '더보기',
    updatedAt: '업데이트',
    win: '승률'
  },
  battle: {
    ...fallbackBundle.battle,
    result: {
      ...fallbackBundle.battle.result,
      '-1': '승리',
      0: '무승부',
      1: '패배',
      d: '무',
      game: '경기',
      l: '패',
      starPlayer: '스타 플레이어',
      w: '승'
    },
    type: {
      ...fallbackBundle.battle.type,
      0: '트로피',
      2: '랭크',
      3: '랭크',
      4: '챌린지',
      5: '챌린지',
      6: '클럽 리그',
      7: '전체',
      all: '전체',
      challenge: '챌린지',
      clubLeague: '클럽 리그',
      powerLeagueTeam: '랭크',
      ranked: '랭크',
      trophy: '트로피'
    }
  },
  main: {
    ...fallbackBundle.main,
    brawlers: '브롤러',
    findTag: '태그 찾기',
    input: '플레이어 태그 또는 닉네임 입력',
    introduce: '브롤트리',
    news: '뉴스',
    searchProfile: '브롤스타즈 플레이어 검색',
    searchUserContainer: {
      checkClearSearch: '최근 검색 기록을 지울까요?',
      clearSearch: '지우기',
      recentSearch: '최근 검색'
    }
  },
  map: {
    ...fallbackBundle.map,
    event: {
      current: '현재',
      endsIn: '종료까지',
      ranked: '랭크',
      startsIn: '시작까지',
      tomorrow: '예정'
    }
  },
  news: {
    newsDesc: '브롤스타즈 소식과 업데이트'
  },
  user: {
    ...fallbackBundle.user,
    battle: {
      battles: '전투',
      brawlerBattles: '브롤러 전투',
      brawlerRoleUsed: '브롤러 역할',
      d: '일',
      dailyBattles: '일일 전투',
      daysAgo: '일 전',
      h: '시간',
      hoursAgo: '시간 전',
      m: '분',
      minutesAgo: '분 전',
      recentBattles: '최근 전투'
    },
    brawlers: {
      current: '현재',
      highest: '최고',
      items: '아이템',
      order: {
        brawlerID: '브롤러 ID',
        brawlerName: '브롤러',
        brawlerPower: '파워',
        currentTrophies: '현재 트로피',
        highestTrophies: '최고 트로피',
        rarity: '희귀도'
      },
      ownedBrawlers: '보유 브롤러',
      withoutBrawlers: '미보유 브롤러'
    },
    crew: {
      seasonRecord: '시즌 기록',
      userPlayedWith: '함께 플레이한 유저'
    },
    menu: {
      brawlers: '브롤러',
      profile: '프로필'
    },
    noBrawlerData: '브롤러 데이터 없음',
    records: {
      club: '클럽',
      currentRecord: '현재 기록',
      currentSoloRanked: '현재 랭크',
      duoVictories: '듀오 승리',
      highestSoloRanked: '최고 랭크',
      highestTrophies: '최고 트로피',
      personalRecord: '개인 기록',
      rank50Brawlers: '랭크 50 브롤러',
      soloVictories: '솔로 승리',
      trioVictories: '트리오 승리',
      trophies: '트로피',
      trophyChange: '트로피 변화'
    },
    title: {
      brawlianStats: '브롤리안 통계',
      brawlianStatsDesc: '플레이어 성과 및 전투 기록',
      copyAlert: '복사되었습니다',
      copyTag: '태그 복사',
      copyTagAndRun: '태그 복사 후 브롤스타즈 실행',
      update: '업데이트',
      updateAgo: '전 업데이트'
    }
  }
};

const fallbackBundles: Record<SupportedLanguage, CdnBundle> = {
  en: fallbackBundle,
  ko: koFallbackBundle
};

export const getDefaultCdnBundle = (language: SupportedLanguage): CdnBundle => {
  return JSON.parse(JSON.stringify(fallbackBundles[language] || fallbackBundle)) as CdnBundle;
};

export const getDefaultCdnLocale = (language: SupportedLanguage, namespace: CdnNamespace): CdnLocale => {
  return getDefaultCdnBundle(language)[namespace] || {};
};
