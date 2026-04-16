import axios from 'axios';
import config from '~/common/config/config';
import { BrawlerSummaryItemType, BrawlerSummaryResponseType } from '~/common/types/brawlers.type';

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return !!value && typeof value === 'object' && !Array.isArray(value);
};

const toRateNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeSummaryItems = (items: unknown): BrawlerSummaryItemType[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.flatMap((item) => {
    if (!isRecord(item)) {
      return [];
    }

    const brawlerID = String(item.brawlerID ?? item.id ?? '').trim();
    const brawlerName = String(item.brawlerName ?? item.name ?? '').trim();

    if (!brawlerID || !brawlerName) {
      return [];
    }

    return [
      {
        brawlerID,
        brawlerName,
        trophyPickRate: toRateNumber(item.trophyPickRate),
        trophyVictoryRate: toRateNumber(item.trophyVictoryRate),
        rankedPickRate: toRateNumber(item.rankedPickRate),
        rankedVictoryRate: toRateNumber(item.rankedVictoryRate)
      }
    ];
  });
};

const normalizeBrawlerSummaryResponse = (
  payload: unknown
): BrawlerSummaryResponseType => {
  const source = isRecord(payload) ? payload : {};
  const nestedCandidates = [
    source,
    isRecord(source.summary) ? source.summary : {},
    isRecord(source.data) ? source.data : {},
    isRecord(source.result) ? source.result : {}
  ];
  const summarySource =
    nestedCandidates.find((candidate) => {
      return Array.isArray(candidate.brawlersTrophy) || Array.isArray(candidate.brawlersRanked);
    }) || source;

  return {
    brawlersTrophy: normalizeSummaryItems(summarySource.brawlersTrophy),
    brawlersRanked: normalizeSummaryItems(summarySource.brawlersRanked)
  };
};

export class BrawlerService {
  static getBrawler = async (id: string) => {
    const result = await axios.get(`${config.url}/brawler/${id}/info`);
    return result.data;
  };

  static getBrawlers = async () => {
    const result = await axios.get(`${config.url}/brawler`);
    return result.data;
  };

  static getBrawlerSummary = async () => {
    const result = await axios.get<BrawlerSummaryResponseType>(`${config.url}/brawler/summary`);
    return normalizeBrawlerSummaryResponse(result.data);
  };
}
