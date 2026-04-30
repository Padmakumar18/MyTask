import { Routes } from '@angular/router';
import { Auth } from './components/auth/auth';
import { HomeLayout } from './components/home/home';
import { Tasks } from './components/tasks/tasks';
import { Skills } from './components/skills/skills';
import { Cart } from './components/cart/cart';
import { Events } from './components/events/events';
import { WeekDays } from './components/week-days/week-days';
import { WeekendDays } from './components/weekend-days/weekend-days';
import { Youtube } from './components/youtube/youtube';
import { authGuard } from './services/auth.guard';
import { guestGuard } from './services/guest.guard';

export const routes: Routes = [
  {
    path: 'auth',
    component: Auth,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: HomeLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'tasks',
        pathMatch: 'full',
      },
      {
        path: 'tasks',
        component: Tasks,
      },
      {
        path: 'cart-categories',
        loadComponent: () =>
          import('./components/cart-categories/cart-categories').then((m) => m.CartCategories),
      },
      {
        path: 'cart-items/:categoryId',
        loadComponent: () => import('./components/cart-items/cart-items').then((m) => m.CartItems),
      },
      {
        path: 'events',
        component: Events,
      },
      {
        path: 'week-days',
        component: WeekDays,
      },
      {
        path: 'weekend-days',
        component: WeekendDays,
      },
      {
        path: 'skills',
        component: Skills,
      },
      {
        path: 'youtube-categories',
        loadComponent: () =>
          import('./components/youtube-categories/youtube-categories').then(
            (m) => m.YoutubeCategories,
          ),
      },
      {
        path: 'youtube-videos/:categoryId',
        loadComponent: () =>
          import('./components/youtube-videos/youtube-videos').then((m) => m.YoutubeVideos),
      },
    ],
  },
];
