import React, { useRef } from 'react';
import moment from 'moment/moment';

import Calendar from 'react-calendar';
import { useWindowClick } from '~/hooks/use-window-click.hook';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAngleRight, faCalendarAlt } from '@fortawesome/free-solid-svg-icons';

import './calendar.css';

const CalendarView = ({ date, beginDate, setDate }) => {
  const dropDownRef = useRef();
  const [checked, setChecked] = useWindowClick(dropDownRef, false);

  const arrowRotate = {
    padding: '2px',
    margin: '0 4px 0 0',
    transform: checked ? 'rotate(90deg)' : '',
    transition: 'transform 0.3s ease'
  };

  return (
    <div className={'calendar-box'} ref={dropDownRef}>
      <div className={'calendar-box__button'}>
        <label>
          <input
            type="checkbox"
            onChange={() => {
              setChecked(!checked);
            }}
            checked={checked}
          />
          <div>
            <span>
              <FontAwesomeIcon icon={faAngleRight} style={arrowRotate} />
              {moment(date).format('YYYY년 MM월 DD일')}
            </span>
            <FontAwesomeIcon icon={faCalendarAlt} />
          </div>
        </label>
      </div>
      <div className={'calendar-box__view'} style={{ display: `${checked ? 'block' : 'none'}` }}>
        <Calendar
          value={date}
          minDate={beginDate}
          maxDate={new Date()}
          formatDay={(locale, date) => moment(date).format('D')}
          onChange={(element: Date) => {
            setDate(new Date(new Date(element).getTime()), new Date(new Date(new Date(element).setDate(element.getDate() + 1)).getTime()));
            setChecked(!checked);
          }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
