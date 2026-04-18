import { Routes } from '@angular/router';
import { Auth } from './components/auth/auth';
import { HomeLayout } from './components/home/home-new';
import { Tasks } from './components/tasks/tasks';
import { Skills } from './components/skills/skills';
import { Cart } from './components/cart/cart';
import { Events } from './components/events/events';
import { WeekDays } from './components/week-days/week-days';
import { WeekendDays } from './components/weekend-days/weekend-days';

export const routes: Routes = [
  {
    path: 'auth',
    component: Auth,
  },
  {
    path: '',
    component: HomeLayout,
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
        path: 'cart',
        component: Cart,
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
    ],
  },
];
