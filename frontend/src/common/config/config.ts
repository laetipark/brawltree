const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return '/api';
  }

  return configuredBaseUrl.replace(/\/+$/, '');
};

export default {
  url: getApiBaseUrl(),
  assets: 'https://cdn.brawltree.me'
};
