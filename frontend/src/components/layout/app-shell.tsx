import React, { ReactNode } from 'react';
import { Header } from '~/components/layout/header';
import { Footer } from '~/components/layout/footer';

import styles from '~/assets/styles/components/layout/app-shell.module.scss';

type AppShellProps = {
  children: ReactNode;
  isCdnLoaded: boolean;
};

export const AppShell = ({ children, isCdnLoaded }: AppShellProps) => {
  return (
    <div className={styles.appShell}>
      <Header isCdnLoading={!isCdnLoaded} />
      <main className={styles.appMain}>{children}</main>
      <Footer />
    </div>
  );
};
