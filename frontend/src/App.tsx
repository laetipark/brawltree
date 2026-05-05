import React, { Suspense, lazy } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

import { CdnContext } from '~/context/cdn.context';
import { Spinner } from '~/components/spinner/spinner';
import { AppShell } from '~/components/layout/app-shell';
import { useCdnShell } from '~/hooks/app/use-cdn-shell';

import appShellStyles from '~/assets/styles/components/layout/app-shell.module.scss';

const MainWrapper = lazy(() => import('~/pages/main').then((module) => ({ default: module.MainWrapper })));
const UserWrapper = lazy(() => import('~/pages/user').then((module) => ({ default: module.UserWrapper })));
const Brawlers = lazy(() => import('~/pages/brawlers/brawlers-page').then((module) => ({ default: module.Brawlers })));
const Events = lazy(() => import('~/pages/events/events').then((module) => ({ default: module.Events })));
const MapSummary = lazy(() => import('~/pages/maps/summary/summary').then((module) => ({ default: module.MapSummary })));
const MapDetail = lazy(() => import('~/pages/maps/detail/detail').then((module) => ({ default: module.MapDetail })));
const CrewMembers = lazy(() => import('~/pages/crew/crew-members-page').then((module) => ({ default: module.CrewMembers })));
const NewsWrapper = lazy(() => import('~/pages/news').then((module) => ({ default: module.NewsWrapper })));
const NewsListItem = lazy(() => import('~/pages/news/detail/news-detail-page').then((module) => ({ default: module.NewsListItem })));

const loadingFallback = (
  <div className={appShellStyles.appLoading}>
    <Spinner fill={true} />
  </div>
);

const App = () => {
  const location = useLocation();
  const { contextValue, isLoaded } = useCdnShell(location);
  const routePageKey = `${location.pathname}${location.search}`;

  return (
    <CdnContext.Provider value={contextValue}>
      <AppShell isCdnLoaded={isLoaded}>
        {isLoaded ? (
          <Suspense fallback={loadingFallback}>
            <Routes>
              <Route path="/" element={<MainWrapper />} />
              <Route path="/en" element={<MainWrapper />} />
              <Route path="/brawlian/:id" element={<UserWrapper key={routePageKey} />} />
              <Route path="/en/brawlian/:id" element={<UserWrapper key={routePageKey} />} />
              <Route path="/brawler/:name" element={<Brawlers key={routePageKey} />} />
              <Route path="/en/brawler/:name" element={<Brawlers key={routePageKey} />} />
              <Route path="/events/:mode" element={<Events key={routePageKey} />} />
              <Route path="/en/events/:mode" element={<Events key={routePageKey} />} />
              <Route path="/maps" element={<MapSummary />} />
              <Route path="/en/maps" element={<MapSummary />} />
              <Route path="/maps/:name" element={<MapDetail key={routePageKey} />} />
              <Route path="/en/maps/:name" element={<MapDetail key={routePageKey} />} />
              <Route path="/crew" element={<CrewMembers />} />
              <Route path="/en/crew" element={<CrewMembers />} />
              <Route path="/news" element={<NewsWrapper />} />
              <Route path="/en/news" element={<NewsWrapper />} />
              <Route path="/news/:title" element={<NewsListItem key={routePageKey} />} />
              <Route path="/en/news/:title" element={<NewsListItem key={routePageKey} />} />
            </Routes>
          </Suspense>
        ) : (
          loadingFallback
        )}
      </AppShell>
    </CdnContext.Provider>
  );
};

export default App;
