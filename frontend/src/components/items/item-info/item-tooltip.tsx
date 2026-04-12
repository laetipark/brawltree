import React, { useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from './item-tooltip.module.scss';

const MOBILE_TOOLTIP_QUERY = '(max-width: 1024px), (hover: none) and (pointer: coarse)';

export const ItemTooltip = ({ itemID, itemName, itemKind, values, brawlerPower, brawlerValues }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileTooltipModal, setIsMobileTooltipModal] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(MOBILE_TOOLTIP_QUERY).matches;
  });
  const [desktopTooltipPosition, setDesktopTooltipPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const itemInfoAnchorRef = useRef<HTMLDivElement | null>(null);
  const desktopTooltipRef = useRef<HTMLDivElement | null>(null);

  const locales = useContext(CdnContext);

  const openToolTip = () => {
    if (isMobileTooltipModal) {
      return;
    }
    setIsOpen(true);
  };

  const closeToolTip = () => {
    if (isMobileTooltipModal) {
      return;
    }
    setIsOpen(false);
  };

  const toggleToolTip = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const onInfoAnchorKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen((prev) => !prev);
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  let description = locales.brawler['brawlerItem'].description[`${itemID}`];
  const patternWithBracket = /\{(\d+)}/g;
  const matches = description?.match(patternWithBracket)?.map((item: string) => Number(item.replace(/[{}]/g, ''))) || [];

  matches.forEach((number: number) => {
    let value = undefined;
    if (values) {
      if (typeof values[number] === 'string') {
        const [first, second] = values[number].split('*');
        if (first.includes('.')) {
          const [firstChild, secondChild] = first.split('.');
          value = brawlerValues && `${Number(second) * 100}%(${(brawlerValues[firstChild][secondChild] + brawlerValues[firstChild][secondChild] * (brawlerPower - 1) * 0.1) * Number(second)})`;
        } else {
          value = brawlerValues && `${Number(second) * 100}%(${(brawlerValues[first] + brawlerValues[first] * (brawlerPower - 1) * 0.1) * Number(second)})`;
        }
      } else {
        value = values[number];
      }
    }
    description = description.replace(`{${number}}`, `${value && value}`);
  });

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
    if (!isMobileTooltipModal || !isOpen) {
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobileTooltipModal, isOpen]);

  useEffect(() => {
    if (!isOpen || isMobileTooltipModal) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (itemInfoAnchorRef.current && target && !itemInfoAnchorRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [isOpen, isMobileTooltipModal]);

  useEffect(() => {
    if (!isOpen || isMobileTooltipModal) {
      setDesktopTooltipPosition(null);
      return;
    }

    const updateDesktopTooltipPosition = () => {
      const anchor = itemInfoAnchorRef.current;
      const tooltip = desktopTooltipRef.current;

      if (!anchor || !tooltip) {
        return;
      }

      const edgePadding = 8;
      const gap = 10;
      const anchorRect = anchor.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2;
      left = Math.max(edgePadding, Math.min(left, viewportWidth - tooltipRect.width - edgePadding));

      let top = anchorRect.bottom + gap;
      if (top + tooltipRect.height > viewportHeight - edgePadding) {
        top = Math.max(edgePadding, anchorRect.top - tooltipRect.height - gap);
      }

      setDesktopTooltipPosition({
        left,
        top
      });
    };

    const animationFrame = window.requestAnimationFrame(updateDesktopTooltipPosition);
    window.addEventListener('resize', updateDesktopTooltipPosition);
    window.addEventListener('scroll', updateDesktopTooltipPosition, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', updateDesktopTooltipPosition);
      window.removeEventListener('scroll', updateDesktopTooltipPosition, true);
    };
  }, [description, isOpen, isMobileTooltipModal, itemName]);

  return (
    <React.Fragment>
      <div
        ref={itemInfoAnchorRef}
        className={styles.itemInfoAnchor}
        tabIndex={0}
        role={'button'}
        aria-expanded={isOpen}
        aria-label={`${itemName} info`}
        onMouseEnter={openToolTip}
        onMouseLeave={closeToolTip}
        onClick={toggleToolTip}
        onKeyDown={onInfoAnchorKeyDown}
        onBlur={() => {
          if (!isMobileTooltipModal) {
            closeToolTip();
          }
        }}
      >
        <img className={styles.brawlerItem} src={`${config.assets}/brawlers/${itemKind}s/${itemID}.webp`} alt={itemID} />
      </div>
      {!isMobileTooltipModal &&
        isOpen &&
        createPortal(
          <div
            ref={desktopTooltipRef}
            className={`${styles.brawlerItemToolTipDesktop} ${desktopTooltipPosition ? styles.brawlerItemToolTipVisible : ''}`}
            style={
              desktopTooltipPosition
                ? {
                    left: desktopTooltipPosition.left,
                    top: desktopTooltipPosition.top
                  }
                : undefined
            }
            aria-hidden={!isOpen}
          >
            <div className={styles.itemName}>
              <span>{itemName}</span>
            </div>
            <div className={styles.brawlerItemDescription}>{description}</div>
          </div>,
          document.body
        )}
      {isMobileTooltipModal &&
        isOpen &&
        createPortal(
          <div className={styles.brawlerItemToolTipOverlay} onClick={() => setIsOpen(false)} role={'presentation'}>
            <div className={styles.brawlerItemToolTipMobilePopup} onClick={(popupEvent) => popupEvent.stopPropagation()} role={'dialog'} aria-modal={'true'}>
              <div className={styles.brawlerItemToolTipMobileHeader}>
                <span className={styles.itemName}>{itemName}</span>
                <button className={styles.brawlerItemToolTipCloseIcon} type={'button'} onClick={() => setIsOpen(false)} aria-label={'close item info'}>
                  X
                </button>
              </div>
              <div className={styles.brawlerItemDescription}>{description}</div>
            </div>
          </div>,
          document.body
        )}
    </React.Fragment>
  );
};
