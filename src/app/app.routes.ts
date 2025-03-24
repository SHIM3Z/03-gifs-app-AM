import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./gifs/pages/dashboard-pages/dashboard-pages.component'),
    children: [
      {
        path: 'trending',
        loadComponent: () =>
          import('./gifs/pages/trending-pages/trending-pages.component'),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./gifs/pages/search-pages/search-pages.component'),
      },
      {
        path: 'history/:query',
        loadComponent: () =>
          import('./gifs/pages/gif-history/gif-history.component'),
      },
      {
        path: '**',
        redirectTo: 'trending',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
