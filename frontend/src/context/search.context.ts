import { Dispatch, SetStateAction, createContext } from 'react';
import { SearchItemType } from '~/common/types/main.type';

type SearchContextType = {
  searchHistory: SearchItemType[];
  setSearchHistory: Dispatch<SetStateAction<SearchItemType[]>>;
  onAddSearchHistory: (userID: string) => void;
  onFilterSearchItem: (userIDs: string[]) => void;
  onRemoveSearchItem: (userID: string) => void;
};

export const SearchContext = createContext<SearchContextType>({
  searchHistory: [],
  setSearchHistory: () => undefined,
  onAddSearchHistory: () => undefined,
  onFilterSearchItem: () => undefined,
  onRemoveSearchItem: () => undefined
});
