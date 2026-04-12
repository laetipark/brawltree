import React, { useContext, useEffect, useMemo, useState } from 'react';
import { BrawlerInfoDetail } from '~/components/brawler/info/detail/brawler-info-detail';

import { CdnContext } from '~/context/cdn.context';

import config from '~/common/config/config';

import styles from './brawler-info.module.scss';
import itemStyles from '~/components/items/item-info/item-tooltip.module.scss';

export const BrawlerInfo = ({ brawler, skills, items }) => {
  const locales = useContext(CdnContext);
  const brawlerLocale = locales.brawler || {};

  const brawlerGadgets = items?.filter(({ kind }) => kind === 'gadget');
  const brawlerStarPowers = items?.filter(({ kind }) => kind === 'starPower');
  const brawlerGears = items?.filter(({ kind }) => kind === 'gear');
  const [selectedItemID, setSelectedItemID] = useState<string | null>(null);

  const allBrawlerItems = useMemo(() => {
    return [...(brawlerGadgets || []), ...(brawlerStarPowers || []), ...(brawlerGears || [])];
  }, [brawlerGadgets, brawlerStarPowers, brawlerGears]);

  useEffect(() => {
    if (allBrawlerItems.length === 0) {
      setSelectedItemID(null);
      return;
    }

    if (!selectedItemID || !allBrawlerItems.some(({ id }) => id === selectedItemID)) {
      setSelectedItemID(allBrawlerItems[0].id);
    }
  }, [allBrawlerItems, selectedItemID]);

  const selectedItem = useMemo(() => {
    if (allBrawlerItems.length === 0) {
      return undefined;
    }
    return allBrawlerItems.find(({ id }) => id === selectedItemID) || allBrawlerItems[0];
  }, [allBrawlerItems, selectedItemID]);

  const itemKindLabel = (kind: string) => {
    if (kind === 'gadget') {
      return 'Gadget';
    }
    if (kind === 'starPower') {
      return 'Star Power';
    }
    return 'Gear';
  };

  const handleSelectItem = (itemID: string) => {
    setSelectedItemID(itemID);
  };

  const selectedItemDescription = useMemo(() => {
    if (!selectedItem) {
      return '';
    }

    let description = locales.brawler?.brawlerItem?.description?.[`${selectedItem.id}`] || '';
    if (!description) {
      return '';
    }

    const patternWithBracket = /\{(\d+)}/g;
    const indexes = Array.from(description.matchAll(patternWithBracket)).map((match) => Number(match[1]));
    const values = selectedItem.values;

    indexes.forEach((index) => {
      let resolvedValue;

      if (values) {
        const currentValue = values[index];

        if (typeof currentValue === 'string') {
          const [first, second] = currentValue.split('*');
          const ratio = Number(second);

          if (!Number.isNaN(ratio) && skills?.values) {
            if (first.includes('.')) {
              const [firstKey, secondKey] = first.split('.');
              const baseValue = skills.values?.[firstKey]?.[secondKey];
              if (typeof baseValue === 'number') {
                const scaledValue = baseValue + baseValue * 0.1 * 10;
                resolvedValue = `${ratio * 100}%(${scaledValue * ratio})`;
              }
            } else {
              const baseValue = skills.values?.[first];
              if (typeof baseValue === 'number') {
                const scaledValue = baseValue + baseValue * 0.1 * 10;
                resolvedValue = `${ratio * 100}%(${scaledValue * ratio})`;
              }
            }
          }
        } else {
          resolvedValue = currentValue;
        }
      }

      description = description.replace(`{${index}}`, `${resolvedValue ?? ''}`);
    });

    return description;
  }, [selectedItem, locales.brawler, skills?.values]);

  const getRarityToneClass = (rarity: string) => {
    const normalizedRarity = rarity?.toLowerCase().replace(/\s+/g, '');

    switch (normalizedRarity) {
      case 'trophyroad':
        return styles.trophyRoadTone;
      case 'rare':
        return styles.rareTone;
      case 'superrare':
        return styles.superRareTone;
      case 'epic':
        return styles.epicTone;
      case 'mythic':
        return styles.mythicTone;
      case 'legendary':
        return styles.legendaryTone;
      default:
        return styles.defaultTone;
    }
  };

  const rarityToneClass = getRarityToneClass(brawler.rarity);

  return (
    <div className={styles.brawlerStatsWrapper}>
      <div className={`${styles.brawlerTitle} ${rarityToneClass}`}>
        <img src={`${config.assets}/brawlers/profiles/${brawler.id}.webp`} alt={brawler.id} />
        <div>
          <h3>{brawlerLocale?.brawler?.[`${brawler.name}`] || brawler.name}</h3>
          <span className={styles.rarityBadge}>{brawlerLocale?.brawlerRarity?.[`${brawler.rarity}`] || brawler.rarity}</span>
          <span className={styles.metaDivider}>-</span>
          <span className={styles.roleBadge}>{brawlerLocale?.brawlerRole?.[`${brawler.role}`] || brawler.role}</span>
        </div>
      </div>
      <div>
        <BrawlerInfoDetail infoDetail={skills.values} />
        <div className={styles.brawlerItemsBox}>
          <div className={styles.brawlerItemsList}>
            {brawlerGadgets && (
              <div className={styles.brawlerItemsGroup}>
                {brawlerGadgets?.map(({ id, kind }) => (
                  <button
                    key={id}
                    className={`${styles.brawlerItemButton} ${selectedItem?.id === id ? styles.brawlerItemButtonActive : ''}`}
                    type={'button'}
                    onPointerDown={() => handleSelectItem(id)}
                    onClick={() => handleSelectItem(id)}
                    aria-label={id}
                  >
                    <img className={itemStyles.brawlerItem} src={`${config.assets}/brawlers/${kind}s/${id}.webp`} alt={id} />
                  </button>
                ))}
              </div>
            )}
            {brawlerStarPowers && (
              <div className={styles.brawlerItemsGroup}>
                {brawlerStarPowers?.map(({ id, kind }) => (
                  <button
                    key={id}
                    className={`${styles.brawlerItemButton} ${selectedItem?.id === id ? styles.brawlerItemButtonActive : ''}`}
                    type={'button'}
                    onPointerDown={() => handleSelectItem(id)}
                    onClick={() => handleSelectItem(id)}
                    aria-label={id}
                  >
                    <img className={itemStyles.brawlerItem} src={`${config.assets}/brawlers/${kind}s/${id}.webp`} alt={id} />
                  </button>
                ))}
              </div>
            )}
            {brawlerGears && (
              <div className={styles.brawlerItemsGroup}>
                {brawlerGears?.map(({ id, kind }) => (
                  <button
                    key={id}
                    className={`${styles.brawlerItemButton} ${selectedItem?.id === id ? styles.brawlerItemButtonActive : ''}`}
                    type={'button'}
                    onPointerDown={() => handleSelectItem(id)}
                    onClick={() => handleSelectItem(id)}
                    aria-label={id}
                  >
                    <img className={itemStyles.brawlerItem} src={`${config.assets}/brawlers/${kind}s/${id}.webp`} alt={id} />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.brawlerItemPanel}>
            {selectedItem ? (
              <React.Fragment>
                <div className={styles.brawlerItemPanelHeader}>
                  <img src={`${config.assets}/brawlers/${selectedItem.kind}s/${selectedItem.id}.webp`} alt={selectedItem.id} />
                  <div>
                    <h4>{selectedItem.name}</h4>
                    <span>{itemKindLabel(selectedItem.kind)}</span>
                  </div>
                </div>
                <div className={styles.brawlerItemPanelBody}>{selectedItemDescription}</div>
              </React.Fragment>
            ) : (
              <div className={styles.brawlerItemEmpty}>No item selected.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
