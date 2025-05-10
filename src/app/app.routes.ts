import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./landing/landing.component').then(m => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registration',
    loadComponent: () => import('./auth/registration/registration.component').then(m => m.RegistrationComponent),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./events/events.component').then(m => m.EventsComponent),
  },
  {
    path: 'location',
    loadComponent: () => import('./location/location.component').then(m => m.LocationComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: 'saved-events',
    loadComponent: () => import('./saved-events/saved-events.component').then(m => m.SavedEventsComponent),
  }
];
