import { Routes } from '@angular/router';
import { CounterComponent } from './pages/counter/counter';
import { Login } from './pages/login/login';

export const routes: Routes = [
  {
    path: '',
    component: CounterComponent,
  },
  {
    path: 'login',
    component: Login, // Replace with actual login component
  }
];
