import React, { useContext, useEffect, useRef, useState } from 'react';
import moment from 'moment/moment';
import { createPortal } from 'react-dom';

import { useInterval } from '~/hooks/use-interval.hook';
import { RotationType } from '~/common/types/maps.type';

import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';
import styles from '~/assets/styles/components/maps/event-summary/event-summary0item.module.scss';

const MOBILE_TOOLTIP_QUERY = '(max-width: 1024px), (hover: none) and (pointer: coarse)';
const TOOLTIP_SAFE_PADDING_Y = 12;
const TOOLTIP_ANCHOR_GAP = 8;
const TOOLTIP_PREFERRED_HEIGHT = 260;

export const EventItemContent = ({
  event,
  type
}: {
  event: RotationType;
  type: string;
}) => {
  const locales = useContext(CdnContext);
  const imgSrc = `${config.assets}/maps/w220/${event.mapID}.webp`;
  const hasCountdown =
    (type === 'curr' && event.endTime) || (type === 'next' && event.startTime);
  const time = hasCountdown
    ? moment(type === 'curr' ? event.endTime : event.startTime)
    : null;
  if (type !== 'curr' && time) {
    time.set('date', new Date().getDate());
    if (moment.duration(time.diff(moment())).asSeconds() < 0) {
      time.set('date', new Date().getDate() + 1);
    }
  }
  const isRanked = type === 'ranked';

  const diffTime = {
    day:
      type === 'curr' && time
        ? moment.duration(time.diff(moment())).days()
        : time && moment.duration(time.diff(moment())).days() > 0
          ? moment.duration(time.diff(moment())).days()
          : 0,
    hour: time
      ? type === 'curr'
        ? moment.duration(time.diff(moment())).hours()
        : Math.abs(moment.duration(time.diff(moment())).hours())
      : 0,
    minute: time
      ? type === 'curr'
        ? moment.duration(time.diff(moment())).minutes()
        : Math.abs(moment.duration(time.diff(moment())).minutes())
      : 0
  };
  const [mouseOver, setMouseOver] = useState(false);
  const [isToolTipUp, setIsToolTipUp] = useState(false);
  const [tooltipMaxHeight, setTooltipMaxHeight] = useState(360);
  const [isMobileTooltipModal, setIsMobileTooltipModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(MOBILE_TOOLTIP_QUERY).matches;
  });
  const infoAnchorRef = useRef<HTMLDivElement | null>(null);
  const toolTipRef = useRef<HTMLDivElement | null>(null);

  const getTooltipBottomBoundary = () => {
    if (typeof window === 'undefined') {
      return 0;
    }

    const viewportBottom = window.innerHeight - TOOLTIP_SAFE_PADDING_Y;
    const footerElement = document.querySelector('footer');

    if (!footerElement) {
      return viewportBottom;
    }

    const footerTop = footerElement.getBoundingClientRect().top;

    if (footerTop > 0 && footerTop < viewportBottom) {
      return footerTop - TOOLTIP_SAFE_PADDING_Y;
    }

    return viewportBottom;
  };

  const updateTooltipDirection = (toolTipHeight = TOOLTIP_PREFERRED_HEIGHT) => {
    if (typeof window === 'undefined' || !infoAnchorRef.current) {
      return;
    }

    const anchorRect = infoAnchorRef.current.getBoundingClientRect();
    const lowerBoundary = getTooltipBottomBoundary() - TOOLTIP_ANCHOR_GAP;
    const upperBoundary = TOOLTIP_SAFE_PADDING_Y + TOOLTIP_ANCHOR_GAP;
    const spaceBelow = lowerBoundary - anchorRect.bottom;
    const spaceAbove = anchorRect.top - upperBoundary;
    const safeSpaceBelow = Math.max(120, spaceBelow);
    const safeSpaceAbove = Math.max(120, spaceAbove);
    const nextIsToolTipUp = safeSpaceBelow < toolTipHeight && safeSpaceAbove > safeSpaceBelow;
    const nextMaxHeight = Math.max(160, Math.round(nextIsToolTipUp ? safeSpaceAbove : safeSpaceBelow));

    setIsToolTipUp(nextIsToolTipUp);
    setTooltipMaxHeight(nextMaxHeight);
  };

  const openMapToolTip = () => {
    if (isMobileTooltipModal) {
      return;
    }
    updateTooltipDirection();
    setMouseOver(true);
  };

  const closeMapToolTip = () => {
    if (isMobileTooltipModal) {
      return;
    }
    setMouseOver(false);
  };

  const toggleMapToolTip = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    updateTooltipDirection();
    setMouseOver((prev) => !prev);
  };

  const onInfoAnchorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      updateTooltipDirection();
      setMouseOver((prev) => !prev);
      return;
    }

    if (event.key === 'Escape') {
      setMouseOver(false);
    }
  };

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
    if (!isMobileTooltipModal || !mouseOver) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileTooltipModal, mouseOver]);

  useEffect(() => {
    if (!mouseOver) {
      return;
    }

    if (isMobileTooltipModal) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (infoAnchorRef.current && target && !infoAnchorRef.current.contains(target)) {
        setMouseOver(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [mouseOver, isMobileTooltipModal]);

  useEffect(() => {
    if (isMobileTooltipModal || !mouseOver) {
      return;
    }

    const syncDirection = () => {
      const measuredTooltipHeight = toolTipRef.current?.offsetHeight || 260;
      updateTooltipDirection(measuredTooltipHeight);
    };

    syncDirection();
    window.addEventListener('resize', syncDirection);
    window.addEventListener('scroll', syncDirection, true);

    return () => {
      window.removeEventListener('resize', syncDirection);
      window.removeEventListener('scroll', syncDirection, true);
    };
  }, [mouseOver, isMobileTooltipModal]);

  useEffect(() => {
    if (isMobileTooltipModal || !mouseOver || !toolTipRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver(() => {
      const measuredTooltipHeight = toolTipRef.current?.offsetHeight || TOOLTIP_PREFERRED_HEIGHT;
      updateTooltipDirection(measuredTooltipHeight);
    });

    observer.observe(toolTipRef.current);

    return () => {
      observer.disconnect();
    };
  }, [mouseOver, isMobileTooltipModal]);

  useInterval(() => {
    if (!time) {
      return;
    }

    diffTime.day = type === 'curr' ? moment.duration(time.diff(moment())).days() : 0;
    diffTime.hour =
      type === 'curr'
        ? moment.duration(time.diff(moment())).hours()
        : Math.abs(moment.duration(time.diff(moment())).hours());
    diffTime.minute =
      type === 'curr'
        ? moment.duration(time.diff(moment())).minutes()
        : Math.abs(moment.duration(time.diff(moment())).minutes());
  }, 1000);

  return (
    <React.Fragment>
      <a key={event.mapID} className={styles.mapItemBox} href={`../maps/${event.mapName}${isRanked ? '?type=ranked' : ''}`}>
        <img src={`${config.assets}/modes/icon/${event.mode}.webp`} alt={event.mode} />
        <div>
          <div className={styles.eventInfoBox}>
            <h4>{locales.map['map'][`${event.mapID}`] || event.mapName}</h4>
            <div
              ref={infoAnchorRef}
              className={styles.infoAnchor}
              tabIndex={0}
              role={'button'}
              aria-expanded={mouseOver}
              aria-label={`${locales.map['map'][`${event.mapID}`] || event.mapName} info`}
              onMouseEnter={openMapToolTip}
              onMouseLeave={closeMapToolTip}
              onClick={toggleMapToolTip}
              onKeyDown={onInfoAnchorKeyDown}
              onBlur={() => {
                if (!isMobileTooltipModal) {
                  closeMapToolTip();
                }
              }}
            >
              <img src={'/images/etc/info.webp'} alt={'info'} />
              {!isMobileTooltipModal && mouseOver && (
                <div
                  ref={toolTipRef}
                  className={`${styles.mapToolTip} ${isToolTipUp ? styles.mapToolTipUp : ''}`}
                  style={{ '--event-map-tooltip-max-height': `${tooltipMaxHeight}px` } as React.CSSProperties}
                >
                  <h3 className={styles.mapToolTipTitle}>{locales.map['map'][`${event.mapID}`] || event.mapName}</h3>
                  <img
                    src={imgSrc}
                    alt={event.mapID}
                    onLoad={() => {
                      const measuredTooltipHeight = toolTipRef.current?.offsetHeight || TOOLTIP_PREFERRED_HEIGHT;
                      updateTooltipDirection(measuredTooltipHeight);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          {['curr', 'next'].includes(type) ? (
            <div>
              {type === 'curr' ? locales.map['event'].endsIn : locales.map['event'].startsIn} {diffTime.day}
              {locales.user['battle'].d} {diffTime.hour}
              {locales.user['battle'].h} {diffTime.minute}
              {locales.user['battle'].m}
            </div>
          ) : (
            <div>&nbsp;</div>
          )}
        </div>
      </a>
      {isMobileTooltipModal &&
        mouseOver &&
        createPortal(
          <div className={styles.mapToolTipOverlay} onClick={() => setMouseOver(false)} role={'presentation'}>
            <div className={styles.mapToolTipMobilePopup} onClick={(popupEvent) => popupEvent.stopPropagation()} role={'dialog'} aria-modal={'true'}>
              <div className={styles.mapToolTipMobileHeader}>
                <h3 className={styles.mapToolTipTitle}>{locales.map['map'][`${event.mapID}`] || event.mapName}</h3>
                <button className={styles.mapToolTipCloseIcon} type={'button'} onClick={() => setMouseOver(false)} aria-label={'close map info'}>
                  X
                </button>
              </div>
              <img src={imgSrc} alt={event.mapID} />
            </div>
          </div>,
          document.body
        )}
    </React.Fragment>
  );
};
