import React, { useEffect, useState } from 'react';

import styles from './search-box.module.scss';

interface InputData {
  name?: string;
}

export const SearchBox = ({ crews, setFilterMembers }) => {
  const [keyword, setKeyword] = useState<string>('');
  const [members, setMembers] = useState<InputData[]>([]);

  useEffect(() => {
    setMembers(Object.values(crews).flat());
  }, [crews]);

  const onChangeData = (e: React.FormEvent<HTMLInputElement>) => {
    setKeyword(e.currentTarget.value);
  };

  const updateData = () => {
    const filter = keyword ? members.filter((list: InputData) => new RegExp(`${keyword}.*`, `g`).test(list.name.toLowerCase())) : members;
    setFilterMembers(filter);
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      updateData();
    }, 200);

    return () => {
      clearTimeout(debounce);
    };
  }, [keyword, members]);

  return (
    <div className={styles.searchWrapper}>
      <input className={styles.search} value={keyword} onChange={onChangeData} />
      <img src={'/images/etc/search.webp'} alt={'search'} />
    </div>
  );
};
