import { SeoService } from './seo.service';

const createQueryBuilder = ({
  rawOne,
  rawMany = [],
  count = 0
}: {
  rawOne?: unknown;
  rawMany?: unknown[];
  count?: number;
}) => {
  const builder = {
    select: jest.fn(),
    addSelect: jest.fn(),
    innerJoin: jest.fn(),
    where: jest.fn(),
    orderBy: jest.fn(),
    offset: jest.fn(),
    limit: jest.fn(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getCount: jest.fn()
  };

  builder.select.mockReturnValue(builder);
  builder.addSelect.mockReturnValue(builder);
  builder.innerJoin.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);
  builder.orderBy.mockReturnValue(builder);
  builder.offset.mockReturnValue(builder);
  builder.limit.mockReturnValue(builder);
  builder.getRawOne.mockResolvedValue(rawOne);
  builder.getRawMany.mockResolvedValue(rawMany);
  builder.getCount.mockResolvedValue(count);

  return builder;
};

describe('SeoService', () => {
  it('builds profile-specific Korean SEO when a player exists', async () => {
    const builder = createQueryBuilder({
      rawOne: {
        userID: '#2QRGJJUYUU',
        userName: 'Hyra'
      }
    });
    const service = new SeoService({
      createQueryBuilder: jest.fn().mockReturnValue(builder)
    } as never);

    const seo = await service.buildBrawlianSeo('2qrgjjuyuu', 'ko');

    expect(seo.title).toBe('Hyra (#2QRGJJUYUU) 브롤스타즈 전적·배틀로그 | 브롤트리');
    expect(seo.description).toContain('Hyra의 트로피');
    expect(seo.canonicalUrl).toBe('https://brawltree.me/brawlian/2QRGJJUYUU');
    expect(seo.alternateUrlEn).toBe('https://brawltree.me/en/brawlian/2QRGJJUYUU');
    expect(seo.robots).toBe('index, follow');
  });

  it('uses tag fallback SEO for valid tags that are not in the database', async () => {
    const builder = createQueryBuilder({
      rawOne: null
    });
    const service = new SeoService({
      createQueryBuilder: jest.fn().mockReturnValue(builder)
    } as never);

    const seo = await service.buildBrawlianSeo('PJL8VCQVV', 'en');

    expect(seo.title).toBe('#PJL8VCQVV Brawl Stars Player Stats | BrawlTree');
    expect(seo.description).toContain('#PJL8VCQVV');
    expect(seo.canonicalUrl).toBe('https://brawltree.me/en/brawlian/PJL8VCQVV');
    expect(seo.robots).toBe('index, follow');
  });

  it('marks invalid profile tags noindex', async () => {
    const repository = {
      createQueryBuilder: jest.fn()
    };
    const service = new SeoService(repository as never);

    const seo = await service.buildBrawlianSeo('BAD!', 'ko');

    expect(seo.title).toBe('브롤스타즈 플레이어 전적 | 브롤트리');
    expect(seo.robots).toBe('noindex, follow');
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('injects profile SEO into an existing SPA shell', async () => {
    const service = new SeoService({} as never);
    const html = '<html lang="ko"><head><title>Old</title><meta name="description" content="Old"></head><body></body></html>';
    const seo = await service.buildBrawlianSeo('BAD!', 'en');
    const result = service.injectSeoIntoHtml(html, seo);

    expect(result).toContain('<html lang="en">');
    expect(result).toContain('<title>Brawl Stars Player Stats | BrawlTree</title>');
    expect(result).toContain('name="robots" content="noindex, follow"');
    expect(result).toContain('rel="canonical" href="https://brawltree.me/en/brawlian/BAD!"');
    expect(result).not.toContain('<title>Old</title>');
  });

  it('renders sitemap index, static URLs, and brawlian lastmod entries', async () => {
    const countBuilder = createQueryBuilder({
      count: 1
    });
    const pageBuilder = createQueryBuilder({
      rawMany: [
        {
          userID: '#PJL8VCQVV',
          lastmod: '2026-05-03T12:00:00.000Z'
        }
      ]
    });
    const repository = {
      createQueryBuilder: jest.fn()
        .mockReturnValueOnce(countBuilder)
        .mockReturnValueOnce(pageBuilder)
    };
    const service = new SeoService(repository as never);

    await expect(service.renderSitemapIndex()).resolves.toContain('https://brawltree.me/sitemaps/brawlians-1.xml');
    await expect(service.renderStaticSitemap()).resolves.toContain('https://brawltree.me/en/maps');
    await expect(service.renderBrawliansSitemap(1)).resolves.toContain('<lastmod>2026-05-03</lastmod>');
  });
});
