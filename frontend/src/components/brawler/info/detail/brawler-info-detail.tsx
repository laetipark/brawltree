import { useContext } from 'react';

import { CdnContext } from '~/context/cdn.context';

import styles from './brawler-info-detail.module.scss';

const powerLevelElement = ['health', 'attack-damage'];

export const BrawlerInfoDetail = ({ infoDetail }) => {
  const locales = useContext(CdnContext);
  const infoLocale = locales.brawler?.info || {};
  const infoGroupedLocale = locales.brawler?.infoGrouped || {};
  const attackLocale = infoGroupedLocale.attack || {};
  const superLocale = infoGroupedLocale.super || {};
  const attackTitle = attackLocale.label || infoLocale.attack || 'attack';
  const superTitle = superLocale.label || infoLocale.super || 'super';
  const renderStatRow = (key: string, label: string, value: number) => {
    return (
      <div className={styles.statRow} key={key}>
        <strong className={styles.statLabel}>{label}</strong>
        <span className={styles.statValue}>{value}</span>
      </div>
    );
  };

  let health: number, speed: number, superAttack, attack;

  if (infoDetail) {
    speed = infoDetail.speed;
    superAttack = infoDetail.super;
    attack = infoDetail.attack;
    health = infoDetail.health;

    return (
      <div className={styles.brawlerInfoDetailWrapper}>
        <div>
          <div>
            {renderStatRow('health', infoLocale.health || 'health', health * 2)}
          </div>
          <div>
            {renderStatRow('speed', infoLocale.speed || 'speed', speed)}
          </div>
        </div>
        <div>
          <div>
            <div className={styles.attackName}>
              {attackTitle}
            </div>
            {Object.entries(attack).map(([key, value]: [string, number]) => {
              if (key !== 'name') {
                return renderStatRow(
                  key,
                  attackLocale[key] || infoLocale[`attack-${key}`] || infoLocale[key] || `attack-${key}`,
                  powerLevelElement.includes(`attack-${key}`) ? value * 2 : value
                );
              }
              return null;
            })}
          </div>
          <div>
            <div className={styles.attackName}>
              {superTitle}
            </div>
            {Object.entries(superAttack).map(([key, value]: [string, number]) => {
              if (key !== 'name') {
                return renderStatRow(
                  key,
                  superLocale[key] || infoLocale[`super-${key}`] || infoLocale[`attack-${key}`] || infoLocale[key] || `super-${key}`,
                  powerLevelElement.includes(`super-${key}`) || powerLevelElement.includes(`attack-${key}`) ? value * 2 : value
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  }
  return null;
};
