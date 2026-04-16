const DEFAULT_BRAWLER_NAME = 'SHELLY';

export const toBrawlerRouteName = (value?: string) => {
  return (value || DEFAULT_BRAWLER_NAME)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
};

export const toBrawlerDisplayName = (value?: string) => {
  return (value || DEFAULT_BRAWLER_NAME)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};
