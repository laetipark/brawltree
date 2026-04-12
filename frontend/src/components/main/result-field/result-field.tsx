import React, { useContext, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { SearchItem } from '~/components/search/search-item/search-item';

import { SearchUserItemType } from '~/common/types/main.type';
import { SearchContext } from '~/context/search.context';
import { useSearchItems } from '~/utils/search-items';
import { useWindowClick } from '~/hooks/use-window-click.hook';

import styles from './result-field.module.scss';

export const ResultField = ({ inputValue, onChangeInputValue, setToggle }) => {
  const context = useContext(SearchContext);
  const { onAddSearchHistory } = context;
  const { isLoading, data } = useSearchItems(inputValue);
  const dropDownRef = useRef();
  const [checked, setChecked] = useWindowClick(dropDownRef, false);

  useEffect(() => {
    if (inputValue.length > 1) {
      setChecked(true);
      return;
    }

    setChecked(false);
  }, [inputValue, setChecked]);

  const getDataByStatus = () => {
    if (isLoading) {
      return <div>Loading</div>;
    }

    return (
      <ul>
        {data?.map((user: SearchUserItemType) => {
          return <SearchItem key={user.userID} user={user} onAddSearchHistory={onAddSearchHistory} onRemoveSearchItem={null} />;
        })}
        <li>
          <div
            className={styles.addAccount}
            onClick={() => {
              onChangeInputValue('');
              setToggle(true);
            }}
          >
            <div>
              <img src={'/images/etc/random.webp'} alt={'random'} />
              <div>
                <div>{'\ucc3e\ub294 \uacc4\uc815\uc774 \uc5c6\uc73c\uc2e0\uac00\uc694?'}</div>
                <div>{'\uc720\uc800 \ud0dc\uadf8\ub97c \uc785\ub825\ud558\uc138\uc694!'}</div>
              </div>
            </div>
            <div>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} height={40} />
            </div>
          </div>
        </li>
      </ul>
    );
  };

  return data ? (
    <div className={styles.resultFieldWrapper} style={{ display: `${checked ? 'flex' : 'none'}` }} ref={dropDownRef}>
      {getDataByStatus()}
    </div>
  ) : null;
};
