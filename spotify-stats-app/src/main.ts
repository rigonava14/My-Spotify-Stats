import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { DashboardPage } from './app/dashboard/dashboard.page';

bootstrapApplication(DashboardPage, appConfig)
  .catch((err) => console.error(err));
