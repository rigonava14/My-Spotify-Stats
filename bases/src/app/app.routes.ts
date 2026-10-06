import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/welcome').then((m) => m.Welcome),
    title: 'Mood.i · Tu universo musical',
  },
  ...[
    { path: 'dashboard', view: 'overview', title: 'Tu banda sonora' },
    { path: 'tracks', view: 'tracks', title: 'Canciones favoritas' },
    { path: 'artists', view: 'artists', title: 'Artistas favoritos' },
    { path: 'recent', view: 'recent', title: 'Últimas escuchas' },
  ].map((r) => ({
    path: r.path,
    data: { view: r.view },
    title: `${r.title} · Mood.i`,
    loadComponent: () =>
      import('./features/dashboard').then((m) => m.Dashboard),
  })),
  {
    path: 'callback',
    loadComponent: () => import('./features/callback').then((m) => m.Callback),
    title: 'Conectar Spotify',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about').then((m) => m.About),
    title: 'Sobre el proyecto · Mood.i',
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings').then((m) => m.Settings),
    title: 'Conectar Spotify · Mood.i',
  },
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];
