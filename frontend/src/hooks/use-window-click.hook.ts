import { useEffect, useState } from 'react';

type ClickOutsideRef = {
  current: HTMLElement | null | undefined;
};

export const useWindowClick = (ref: ClickOutsideRef, initialState: boolean) => {
  const [open, setOpen] = useState(initialState);

  useEffect(() => {
    if (!open) {
      return;
    }

    const pageClickEvent = ({ target }: MouseEvent) => {
      const targetNode = target as Node | null;

      if (ref.current && targetNode && !ref.current.contains(targetNode)) {
        setOpen(false);
      }
    };

    window.addEventListener('click', pageClickEvent);

    return () => {
      window.removeEventListener('click', pageClickEvent);
    };
  }, [open, ref]);

  return [open, setOpen] as const;
};
