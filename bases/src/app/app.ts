import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GalaxyMotion } from './features/galaxy-motion';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GalaxyMotion],
  template: '<app-galaxy-motion /><router-outlet />',
})
export class App {}
