import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { BrawlerStatsType, BrawlerType } from '~/common/types/brawlers.type';
import { CdnContext } from '~/context/cdn.context';
import { useWindowClick } from '~/hooks/use-window-click.hook';

import styles from './brawler-stats.module.scss';
import config from '~/common/config/config';

type SortKey = 'pickDesc' | 'pickAsc' | 'winDesc' | 'winAsc';
type MatchTypeValue = '0' | '2';
type TooltipPlacement = 'top' | 'bottom';
type ActiveMapTooltip = {
  key: string;
  placement: TooltipPlacement;
  offsetX: number;
  maxHeight: number;
};

type ModeOption = {
  value: string;
  label: string;
  icon: string;
};

type MatchTypeOption = {
  value: MatchTypeValue;
  label: string;
  icon: string;
};

type SortOption = {
  value: SortKey;
  label: string;
};

type BrawlerStatsProps = {
  brawler: BrawlerType;
  stats: BrawlerStatsType[];
  maps: BrawlerStatsType[];
};

const TOOLTIP_SAFE_PADDING_X = 12;
const TOOLTIP_SAFE_PADDING_Y = 12;
const TOOLTIP_RIGHT_OFFSET = 10;
const TOOLTIP_MAX_WIDTH = 248;
const TOOLTIP_ANCHOR_GAP = 8;
const TOOLTIP_PREFERRED_HEIGHT = 360;
const MOBILE_TOOLTIP_QUERY = '(max-width: 1024px), (hover: none) and (pointer: coarse)';

const toRateNumber = (value: number | string | undefined) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatRate = (value: number | string | undefined) => {
  return Math.round(toRateNumber(value) * 100) / 100;
};

export const BrawlerStats = ({ brawler, stats, maps }: BrawlerStatsProps) => {
  const locales = useContext(CdnContext);
  const statsLocale = locales.brawler?.stats || {};
  const statsFilterLocale = locales.brawler?.statsFilter || {};
  const [selectedMode, setSelectedMode] = useState('all');
  const [selectedMatchType, setSelectedMatchType] = useState<MatchTypeValue>('0');
  const [sortKey, setSortKey] = useState<SortKey>('pickDesc');
  const [activeMapTooltip, setActiveMapTooltip] = useState<ActiveMapTooltip | null>(null);
  const [isMobileTooltipModal, setIsMobileTooltipModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(MOBILE_TOOLTIP_QUERY).matches;
  });
  const modeMenuRef = useRef<HTMLDivElement | null>(null);
  const matchTypeMenuRef = useRef<HTMLDivElement | null>(null);
  const sortMenuRef = useRef<HTMLDivElement | null>(null);
  const mapInfoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [modeMenuOpen, setModeMenuOpen] = useWindowClick(modeMenuRef, false);
  const [matchTypeMenuOpen, setMatchTypeMenuOpen] = useWindowClick(matchTypeMenuRef, false);
  const [sortMenuOpen, setSortMenuOpen] = useWindowClick(sortMenuRef, false);

  const brawlerTrophy = stats.find(({ brawlerID, matchType }) => {
    return brawlerID === String(brawler.id) && Number(matchType) === 0;
  });
  const brawlerRanked = stats.find(({ brawlerID, matchType }) => {
    return brawlerID === String(brawler.id) && Number(matchType) === 2;
  });

  const brawlerMaps = useMemo(() => {
    return maps.filter(({ brawlerID }) => String(brawlerID) === String(brawler.id));
  }, [maps, brawler.id]);

  const brawlerMapsByMatchType = useMemo(() => {
    return brawlerMaps.filter(({ matchType }) => String(matchType ?? '0') === selectedMatchType);
  }, [brawlerMaps, selectedMatchType]);

  const modeOptions = useMemo<string[]>(() => {
    return Array.from(new Set(brawlerMapsByMatchType.map(({ mode }) => mode))).sort((leftMode, rightMode) => {
      const leftLabel = locales.battle?.mode?.[`${leftMode}`] || leftMode;
      const rightLabel = locales.battle?.mode?.[`${rightMode}`] || rightMode;
      return leftLabel.localeCompare(rightLabel);
    });
  }, [brawlerMapsByMatchType, locales.battle]);

  const modeOptionItems = useMemo<ModeOption[]>(() => {
    return [
      {
        value: 'all',
        label: statsFilterLocale.allModes || locales.battle?.type?.all || 'All Modes',
        icon: 'all'
      },
      ...modeOptions.map((mode) => ({
        value: mode,
        label: locales.battle?.mode?.[`${mode}`] || mode,
        icon: mode
      }))
    ];
  }, [modeOptions, statsFilterLocale.allModes, locales.battle]);

  const matchTypeOptions = useMemo<MatchTypeOption[]>(() => {
    return [
      {
        value: '0',
        label: locales.battle?.type?.trophy || 'Trophy',
        icon: 'trophy'
      },
      {
        value: '2',
        label: locales.battle?.type?.ranked || 'Ranked',
        icon: 'ranked'
      }
    ];
  }, [locales.battle]);

  const sortOptions = useMemo<SortOption[]>(() => {
    const pick = locales.application?.pick || 'Pick';
    const win = locales.application?.win || 'Win';
    const descendingLabel = statsFilterLocale.descending || 'Descending';
    const ascendingLabel = statsFilterLocale.ascending || 'Ascending';

    return [
      { value: 'pickDesc' as const, label: `${pick} ${descendingLabel}` },
      { value: 'pickAsc' as const, label: `${pick} ${ascendingLabel}` },
      { value: 'winDesc' as const, label: `${win} ${descendingLabel}` },
      { value: 'winAsc' as const, label: `${win} ${ascendingLabel}` }
    ];
  }, [locales.application, statsFilterLocale.ascending, statsFilterLocale.descending]);

  const selectedModeOption = modeOptionItems.find(({ value }) => value === selectedMode) || modeOptionItems[0];
  const selectedMatchTypeOption = matchTypeOptions.find(({ value }) => value === selectedMatchType) || matchTypeOptions[0];
  const selectedSortOption = sortOptions.find(({ value }) => value === sortKey) || sortOptions[0];

  useEffect(() => {
    if (selectedMode !== 'all' && !modeOptions.includes(selectedMode)) {
      setSelectedMode('all');
    }
  }, [selectedMode, modeOptions]);

  const filteredBrawlerMaps = useMemo(() => {
    const filtered = brawlerMapsByMatchType.filter(({ mode }) => {
      if (selectedMode === 'all') {
        return true;
      }
      return mode === selectedMode;
    });

    const sorted = [...filtered].sort((leftMap, rightMap) => {
      const pickDiff = toRateNumber(leftMap.pickRate) - toRateNumber(rightMap.pickRate);
      const winDiff = toRateNumber(leftMap.victoryRate) - toRateNumber(rightMap.victoryRate);

      switch (sortKey) {
        case 'pickAsc':
          return pickDiff || winDiff;
        case 'winDesc':
          return -winDiff || -pickDiff;
        case 'winAsc':
          return winDiff || pickDiff;
        case 'pickDesc':
        default:
          return -pickDiff || -winDiff;
      }
    });

    return sorted.slice(0, 10);
  }, [brawlerMapsByMatchType, selectedMode, sortKey]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_TOOLTIP_QUERY);
    const handleMediaQuery = (event: MediaQueryListEvent) => {
      setIsMobileTooltipModal(event.matches);
    };

    setIsMobileTooltipModal(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQuery);
      return () => mediaQuery.removeEventListener('change', handleMediaQuery);
    }

    mediaQuery.addListener(handleMediaQuery);
    return () => mediaQuery.removeListener(handleMediaQuery);
  }, []);

  useEffect(() => {
    if (!isMobileTooltipModal || !activeMapTooltip) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileTooltipModal, activeMapTooltip]);

  useEffect(() => {
    if (!activeMapTooltip) {
      return;
    }

    if (isMobileTooltipModal) {
      return;
    }

    const activeAnchor = mapInfoRefs.current[activeMapTooltip.key];
    if (!activeAnchor) {
      setActiveMapTooltip(null);
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (target && !activeAnchor.contains(target)) {
        setActiveMapTooltip(null);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [activeMapTooltip, isMobileTooltipModal]);

  useEffect(() => {
    if (!activeMapTooltip) {
      return;
    }

    const hasActiveMap = filteredBrawlerMaps.some(({ mapID, matchType }) => `${mapID}_${matchType ?? '0'}` === activeMapTooltip.key);
    if (!hasActiveMap) {
      setActiveMapTooltip(null);
    }
  }, [filteredBrawlerMaps, activeMapTooltip]);

  const resolveTooltipLayout = (mapKey: string): Omit<ActiveMapTooltip, 'key'> => {
    if (typeof window === 'undefined') {
      return { placement: 'bottom', offsetX: 0, maxHeight: 360 };
    }

    const anchor = mapInfoRefs.current[mapKey];
    if (!anchor) {
      return { placement: 'bottom', offsetX: 0, maxHeight: 360 };
    }

    if (window.innerWidth <= 575) {
      return {
        placement: 'bottom',
        offsetX: 0,
        maxHeight: Math.max(220, window.innerHeight - TOOLTIP_SAFE_PADDING_Y * 2)
      };
    }

    const anchorRect = anchor.getBoundingClientRect();
    const anchorParent = anchor.closest(`.${styles.statsSummaryMapButton}`) as HTMLElement | null;
    const anchorParentStyles = anchorParent ? window.getComputedStyle(anchorParent) : null;
    const parentHorizontalPadding = anchorParentStyles
      ? Math.max(Number.parseFloat(anchorParentStyles.paddingLeft) || 0, Number.parseFloat(anchorParentStyles.paddingRight) || 0)
      : 0;
    const safePaddingX = Math.max(TOOLTIP_SAFE_PADDING_X, parentHorizontalPadding);

    const footerElement = document.querySelector('footer');
    const footerTop = footerElement?.getBoundingClientRect().top ?? window.innerHeight;
    const lowerBoundary = Math.min(window.innerHeight, footerTop) - TOOLTIP_SAFE_PADDING_Y;
    const upperBoundary = TOOLTIP_SAFE_PADDING_Y;
    const spaceBelow = lowerBoundary - anchorRect.bottom - TOOLTIP_ANCHOR_GAP;
    const spaceAbove = anchorRect.top - upperBoundary - TOOLTIP_ANCHOR_GAP;

    const safeSpaceBelow = Math.max(120, spaceBelow);
    const safeSpaceAbove = Math.max(120, spaceAbove);
    const placement: TooltipPlacement =
      safeSpaceBelow < TOOLTIP_PREFERRED_HEIGHT && safeSpaceAbove > safeSpaceBelow ? 'top' : 'bottom';
    const maxHeight = Math.max(160, placement === 'top' ? safeSpaceAbove : safeSpaceBelow);

    const tooltipWidth = Math.min(TOOLTIP_MAX_WIDTH, window.innerWidth - safePaddingX * 2);
    const minLeft = safePaddingX;
    const maxRight = window.innerWidth - safePaddingX;
    const defaultRight = anchorRect.right + TOOLTIP_RIGHT_OFFSET;
    const defaultLeft = defaultRight - tooltipWidth;

    let offsetX = 0;

    if (defaultLeft < minLeft) {
      offsetX += minLeft - defaultLeft;
    }

    if (defaultRight + offsetX > maxRight) {
      offsetX -= defaultRight + offsetX - maxRight;
    }

    return {
      placement,
      offsetX: Math.round(offsetX),
      maxHeight: Math.round(maxHeight)
    };
  };

  useEffect(() => {
    if (!activeMapTooltip) {
      return;
    }

    const updatePlacement = () => {
      setActiveMapTooltip((prev) => {
        if (!prev) {
          return prev;
        }

        const nextLayout = resolveTooltipLayout(prev.key);
        if (prev.placement === nextLayout.placement && prev.offsetX === nextLayout.offsetX && prev.maxHeight === nextLayout.maxHeight) {
          return prev;
        }

        return {
          ...prev,
          placement: nextLayout.placement,
          offsetX: nextLayout.offsetX,
          maxHeight: nextLayout.maxHeight
        };
      });
    };

    updatePlacement();

    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);

    return () => {
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [activeMapTooltip?.key]);

  const handleToggleModeMenu = () => {
    const nextOpen = !modeMenuOpen;
    setModeMenuOpen(nextOpen);
    if (nextOpen) {
      setMatchTypeMenuOpen(false);
      setSortMenuOpen(false);
    }
  };

  const handleToggleMatchTypeMenu = () => {
    const nextOpen = !matchTypeMenuOpen;
    setMatchTypeMenuOpen(nextOpen);
    if (nextOpen) {
      setModeMenuOpen(false);
      setSortMenuOpen(false);
    }
  };

  const handleToggleSortMenu = () => {
    const nextOpen = !sortMenuOpen;
    setSortMenuOpen(nextOpen);
    if (nextOpen) {
      setModeMenuOpen(false);
      setMatchTypeMenuOpen(false);
    }
  };

  const toggleMapInfoTooltip = (event: React.MouseEvent<HTMLDivElement>, mapKey: string) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveMapTooltip((prev) => {
      if (prev?.key === mapKey) {
        return null;
      }

      const nextLayout = resolveTooltipLayout(mapKey);
      return {
        key: mapKey,
        placement: nextLayout.placement,
        offsetX: nextLayout.offsetX,
        maxHeight: nextLayout.maxHeight
      };
    });
  };

  const onMapInfoKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, mapKey: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      setActiveMapTooltip((prev) => {
        if (prev?.key === mapKey) {
          return null;
        }

        const nextLayout = resolveTooltipLayout(mapKey);
        return {
          key: mapKey,
          placement: nextLayout.placement,
          offsetX: nextLayout.offsetX,
          maxHeight: nextLayout.maxHeight
        };
      });
      return;
    }

    if (event.key === 'Escape') {
      setActiveMapTooltip(null);
    }
  };

  const activeMapTooltipData = useMemo(() => {
    if (!activeMapTooltip) {
      return null;
    }

    return filteredBrawlerMaps.find(({ mapID, matchType }) => `${mapID}_${matchType ?? '0'}` === activeMapTooltip.key) || null;
  }, [filteredBrawlerMaps, activeMapTooltip]);

  return (
    <div className={styles.brawlerStatsWrapper}>
      <div className={styles.brawlerStatsSummaryBox}>
        <div>
          <div>
            <img src={`${config.assets}/modes/icon/trophy.webp`} alt={'trophyLeague'} />
            <div>
              <div className={styles.brawlerRateTitle}>{statsLocale.trophyLeaguePick || 'Trophy Pick Rate'}</div>
              <div className={styles.brawlerRateContent}>
                <span>{Math.round(brawlerTrophy?.pickRate * 100) / 100.0 || 0}</span>
                <span>%</span>
              </div>
            </div>
          </div>
          <div>
            <img src={`${config.assets}/modes/icon/trophy.webp`} alt={'trophyLeague'} />
            <div>
              <div className={styles.brawlerRateTitle}>{statsLocale.trophyLeagueWin || 'Trophy Win Rate'}</div>
              <div className={styles.brawlerRateContent}>
                <span>{Math.round(brawlerTrophy?.victoryRate * 100) / 100.0 || 0}</span>
                <span>%</span>
              </div>
            </div>
          </div>
          <div>
            <img src={`${config.assets}/modes/icon/powerLeague.webp`} alt={'powerLeague'} />
            <div>
              <div className={styles.brawlerRateTitle}>{statsLocale.powerLeaguePick || 'Ranked Pick Rate'}</div>
              <div className={styles.brawlerRateContent}>
                <span>{Math.round(brawlerRanked?.pickRate * 100) / 100.0 || 0}</span>
                <span>%</span>
              </div>
            </div>
          </div>
          <div>
            <img src={`${config.assets}/modes/icon/powerLeague.webp`} alt={'powerLeague'} />
            <div>
              <div className={styles.brawlerRateTitle}>{statsLocale.powerLeagueWin || 'Ranked Win Rate'}</div>
              <div className={styles.brawlerRateContent}>
                <span>{Math.round(brawlerRanked?.victoryRate * 100) / 100.0 || 0}</span>
                <span>%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.statsFilterBar}>
        <div className={styles.statsFilterCombo} ref={modeMenuRef}>
          <div className={styles.statsFilterComboLabel}>{statsFilterLocale.mode || 'Game Mode'}</div>
          <button className={styles.statsFilterButton} type={'button'} onClick={handleToggleModeMenu} aria-expanded={modeMenuOpen}>
            <div className={styles.statsFilterButtonContent}>
              <img src={`${config.assets}/modes/icon/${selectedModeOption.icon}.webp`} alt={selectedModeOption.label} />
              <span>{selectedModeOption.label}</span>
            </div>
            <FontAwesomeIcon className={`${styles.statsFilterCaret} ${modeMenuOpen ? styles.statsFilterCaretActive : ''}`} icon={faCaretUp} />
          </button>
          <div className={styles.statsFilterList} style={{ display: modeMenuOpen ? 'flex' : 'none' }}>
            {modeOptionItems.map((modeOption) => {
              return (
                <button
                  key={modeOption.value}
                  className={`${styles.statsFilterOption} ${modeOption.value === selectedMode ? styles.statsFilterOptionActive : ''}`}
                  type={'button'}
                  onClick={() => {
                    setSelectedMode(modeOption.value);
                    setModeMenuOpen(false);
                  }}
                >
                  <img src={`${config.assets}/modes/icon/${modeOption.icon}.webp`} alt={modeOption.label} />
                  <span>{modeOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.statsFilterCombo} ref={matchTypeMenuRef}>
          <div className={styles.statsFilterComboLabel}>{statsFilterLocale.matchType || 'Match Type'}</div>
          <button className={styles.statsFilterButton} type={'button'} onClick={handleToggleMatchTypeMenu} aria-expanded={matchTypeMenuOpen}>
            <div className={styles.statsFilterButtonContent}>
              <img src={`${config.assets}/modes/icon/${selectedMatchTypeOption.icon}.webp`} alt={selectedMatchTypeOption.label} />
              <span>{selectedMatchTypeOption.label}</span>
            </div>
            <FontAwesomeIcon className={`${styles.statsFilterCaret} ${matchTypeMenuOpen ? styles.statsFilterCaretActive : ''}`} icon={faCaretUp} />
          </button>
          <div className={styles.statsFilterList} style={{ display: matchTypeMenuOpen ? 'flex' : 'none' }}>
            {matchTypeOptions.map((matchTypeOption) => {
              return (
                <button
                  key={matchTypeOption.value}
                  className={`${styles.statsFilterOption} ${matchTypeOption.value === selectedMatchType ? styles.statsFilterOptionActive : ''}`}
                  type={'button'}
                  onClick={() => {
                    setSelectedMatchType(matchTypeOption.value);
                    setMatchTypeMenuOpen(false);
                  }}
                >
                  <img src={`${config.assets}/modes/icon/${matchTypeOption.icon}.webp`} alt={matchTypeOption.label} />
                  <span>{matchTypeOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.statsFilterCombo} ref={sortMenuRef}>
          <div className={styles.statsFilterComboLabel}>{statsFilterLocale.sort || 'Sort'}</div>
          <button className={styles.statsFilterButton} type={'button'} onClick={handleToggleSortMenu} aria-expanded={sortMenuOpen}>
            <div className={styles.statsFilterButtonContent}>
              <span>{selectedSortOption.label}</span>
            </div>
            <FontAwesomeIcon className={`${styles.statsFilterCaret} ${sortMenuOpen ? styles.statsFilterCaretActive : ''}`} icon={faCaretUp} />
          </button>
          <div className={styles.statsFilterList} style={{ display: sortMenuOpen ? 'flex' : 'none' }}>
            {sortOptions.map((sortOption) => {
              return (
                <button
                  key={sortOption.value}
                  className={`${styles.statsFilterOption} ${sortOption.value === sortKey ? styles.statsFilterOptionActive : ''}`}
                  type={'button'}
                  onClick={() => {
                    setSortKey(sortOption.value);
                    setSortMenuOpen(false);
                  }}
                >
                  <span>{sortOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.statsSummaryWrapper}>
        {filteredBrawlerMaps.length === 0 && <div className={styles.statsSummaryEmpty}>{statsFilterLocale.empty || 'No map stats found for this filter.'}</div>}
        {filteredBrawlerMaps.map(({ mapID, mapName, mode, pickRate, victoryRate, matchType }) => {
          const mapKey = `${mapID}_${matchType ?? '0'}`;
          const isMapToolTipVisible = activeMapTooltip?.key === mapKey;
          const isTooltipTop = isMapToolTipVisible && activeMapTooltip?.placement === 'top';
          const mapNameText = locales.map['map'][`${mapID}`] || mapName;

          return (
            <a
              key={mapKey}
              className={`${styles.statsSummaryMapButton} ${isMapToolTipVisible ? styles.statsSummaryMapButtonActive : ''}`}
              href={`../maps/${mapID}`}
            >
              <img src={`${config.assets}/modes/icon/${mode}.webp`} alt={mode} />
              <span className={styles.statsMapName}>{mapNameText}</span>
              <div
                ref={(node) => {
                  mapInfoRefs.current[mapKey] = node;
                }}
                className={styles.statsMapInfoAnchor}
                tabIndex={0}
                role={'button'}
                aria-expanded={isMapToolTipVisible}
                aria-label={`${mapNameText} info`}
                onClick={(event) => toggleMapInfoTooltip(event, mapKey)}
                onKeyDown={(event) => onMapInfoKeyDown(event, mapKey)}
              >
                <img src={'/images/etc/info.webp'} alt={'info'} />
                {isMapToolTipVisible && !isMobileTooltipModal && (
                  <div
                    className={`${styles.statsMapToolTip} ${isTooltipTop ? styles.statsMapToolTipTop : ''}`}
                    style={
                      {
                        '--stats-map-tooltip-offset-x': `${activeMapTooltip?.offsetX ?? 0}px`,
                        '--stats-map-tooltip-max-height': `${activeMapTooltip?.maxHeight ?? 360}px`
                      } as React.CSSProperties
                    }
                  >
                    <h3 className={styles.statsMapToolTipTitle}>{mapNameText}</h3>
                    <img src={`${config.assets}/maps/w220/${mapID}.webp`} alt={mapID} />
                  </div>
                )}
              </div>
              <div className={styles.statsRateBadge}>
                <span>{locales.application?.pick || 'Pick'}</span>
                <span>{formatRate(pickRate)}</span>
                <span>%</span>
              </div>
              <div className={styles.statsRateBadge}>
                <span>{locales.application?.win || 'Win'}</span>
                <span>{formatRate(victoryRate)}</span>
                <span>%</span>
              </div>
            </a>
          );
        })}
      </div>
      {isMobileTooltipModal &&
        activeMapTooltipData &&
        createPortal(
          <div className={styles.statsMapToolTipOverlay} onClick={() => setActiveMapTooltip(null)} role={'presentation'}>
            <div className={styles.statsMapToolTipMobilePopup} onClick={(event) => event.stopPropagation()} role={'dialog'} aria-modal={'true'}>
              <div className={styles.statsMapToolTipMobileHeader}>
                <h3 className={styles.statsMapToolTipTitle}>{locales.map['map'][`${activeMapTooltipData.mapID}`] || activeMapTooltipData.mapName}</h3>
                <button className={styles.statsMapToolTipCloseIcon} type={'button'} onClick={() => setActiveMapTooltip(null)} aria-label={'close map info'}>
                  X
                </button>
              </div>
              <img src={`${config.assets}/maps/w220/${activeMapTooltipData.mapID}.webp`} alt={activeMapTooltipData.mapID} />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
