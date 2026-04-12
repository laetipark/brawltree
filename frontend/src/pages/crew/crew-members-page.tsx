import React, { useContext, useEffect, useState } from 'react';

import { SearchItem } from '~/components/search/search-item/search-item';
import { Spinner } from '~/components/spinner/spinner';
import { PageSeo } from '~/components/seo/page-seo';

import { CrewMembersType, UserService } from '~/services/user.service';
import { CdnContext } from '~/context/cdn.context';

import styles from './crew-members-page.module.scss';

export const CrewMembers = () => {
  const locales = useContext(CdnContext);
  const [crews, setCrews] = useState<Record<string, CrewMembersType[]>>({});

  useEffect(() => {
    UserService.getCrewMembers().then((data) => {
      setCrews(data);
    });
  }, []);

  const crewKeys = Object.keys(crews);

  return (
    <React.Fragment>
      <PageSeo page="crew" language={locales.language} />
      {crewKeys.length > 0 ? (
        <div className={styles.app}>
          {crewKeys.map((crew) => {
            return (
              <React.Fragment key={crew}>
                <h2 className={styles.crewTitle}>
                  <img src={`/images/logo/${crew.toLowerCase()}/logo192.png`} alt={crew} />
                  {crew}
                </h2>
                <ul className={styles.crewBox}>
                  {crews[crew].map((user) => {
                    return <SearchItem key={user.userID} user={user} onAddSearchHistory={null} onRemoveSearchItem={null} />;
                  })}
                </ul>
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <Spinner fill={true} />
      )}
    </React.Fragment>
  );
};
