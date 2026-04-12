import React, { useEffect, useState } from 'react';
import { EventService } from '~/services/event.service';
import { RotationType } from '~/common/types/maps.type';
import { EventSummaryContainer } from '~/components/maps/event-summary';
import { Spinner } from '~/components/spinner/spinner';

export const RankedEvents = () => {
  const [events, setEvents] = useState<RotationType[]>([]);

  useEffect(() => {
    EventService.getPLEvents().then((data) => setEvents(data));
  }, []);
  return events?.length || 0 > 0 ? <EventSummaryContainer events={events} type={'ranked'} /> : <Spinner />;
};
