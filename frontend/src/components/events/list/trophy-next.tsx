import React, { useEffect, useState } from 'react';
import { EventService } from '~/services/event.service';
import { RotationType } from '~/common/types/maps.type';

import { Spinner } from '~/components/spinner/spinner';
import { EventSummaryContainer } from '~/components/maps/event-summary';

export const TrophyTomorrowEvents = () => {
  const [events, setEvents] = useState<RotationType[]>([]);

  useEffect(() => {
    EventService.getTLTomorrowEvents().then((data) => setEvents(data));
  }, []);

  return events?.length || 0 > 0 ? <EventSummaryContainer events={events} type={'next'} /> : <Spinner />;
};
