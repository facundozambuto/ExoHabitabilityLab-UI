import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home.component').then((m) => m.HomeComponent),
    title: 'ExoHabitabilityLab · Home',
  },
  {
    path: 'top',
    loadComponent: () => import('./pages/top.component').then((m) => m.TopComponent),
    title: 'Top Habitable Worlds',
  },
  {
    path: 'explore',
    loadComponent: () => import('./pages/explore.component').then((m) => m.ExploreComponent),
    title: 'Explore Exoplanets',
  },
  {
    path: 'compare',
    loadComponent: () => import('./pages/compare.component').then((m) => m.CompareComponent),
    title: 'Compare Planets',
  },
  {
    path: 'methodology',
    loadComponent: () => import('./pages/methodology.component').then((m) => m.MethodologyComponent),
    title: 'Scoring Methodology',
  },
  {
    path: 'planet/:id',
    loadComponent: () => import('./pages/detail.component').then((m) => m.DetailComponent),
    title: 'Planet Detail',
  },
  { path: '**', redirectTo: '' },
];
