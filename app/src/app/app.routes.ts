import { Routes } from '@angular/router';
import { Auth } from './components/auth/auth';
import { Home } from './components/home/home';

export const routes: Routes = [
  {
    path: 'auth',
    component: Auth,
    // canActivate ,
  },
  {
    path: '',
    component: Home,
  },
];
