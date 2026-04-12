import { useQuery } from '@tanstack/react-query';
import { MainService } from '~/services/main.service';

const getResultByKeyword = (keyword: string) => MainService.getUsersByKeyword(keyword);

export const useSearchItems = (keyword: string) =>
  useQuery({
    queryKey: ['keyword', keyword],
    queryFn: () => getResultByKeyword(keyword),
    enabled: keyword.length > 1,
    staleTime: 30_000
  });
