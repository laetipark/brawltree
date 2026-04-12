import { useEffect } from 'react';

const useTitle = (title: string) => {
  const updateTitle = () => {
    const htmlTitle = document.querySelector('title');
    htmlTitle.innerHTML = title;
  };
  useEffect(updateTitle, [title]);
};

export default useTitle;
