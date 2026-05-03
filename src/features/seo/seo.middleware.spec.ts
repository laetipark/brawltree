import { resolveCanonicalRedirectUrl } from './seo.middleware';

describe('seo middleware redirects', () => {
  it('redirects www requests to the apex host while preserving path and query', () => {
    expect(
      resolveCanonicalRedirectUrl({
        host: 'www.brawltree.me',
        originalUrl: '/brawlian/ABC123?type=ranked'
      })
    ).toBe('https://brawltree.me/brawlian/ABC123?type=ranked');
  });

  it('normalizes legacy English query URLs to /en paths', () => {
    expect(
      resolveCanonicalRedirectUrl({
        host: 'brawltree.me',
        originalUrl: '/brawlian/ABC123?lang=en&utm=1'
      })
    ).toBe('https://brawltree.me/en/brawlian/ABC123?utm=1');
  });

  it('normalizes Korean query URLs to no-prefix paths', () => {
    expect(
      resolveCanonicalRedirectUrl({
        host: 'brawltree.me',
        originalUrl: '/en/maps?lang=ko'
      })
    ).toBe('https://brawltree.me/maps');
  });
});
