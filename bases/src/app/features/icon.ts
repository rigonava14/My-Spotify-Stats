import { Component, input } from '@angular/core';
@Component({
  selector: 'app-icon',
  template: `<svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path [attr.d]="paths[name()] || paths['music']" />
  </svg>`,
  styles: [
    ':host{display:inline-flex;width:20px;height:20px;flex-shrink:0}svg{width:100%;height:100%}',
  ],
})
export class Icon {
  name = input('music');
  paths: Record<string, string> = {
    music:
      'M9 18V5l11-2v13 M9 5l11-2 M9 18c0 3-6 3-6 0s6-3 6 0 M20 16c0 3-6 3-6 0s6-3 6 0',
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
    artist: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2',
    clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 7v5l3 2',
    arrow: 'M5 12h14 M14 7l5 5-5 5',
    logout: 'M9 3H4v18h5 M10 12h11 M16 7l5 5-5 5',
    info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M12 11v6 M12 7v.1',
    external: 'M14 3h7v7 M21 3l-12 12 M10 3H3v18h18v-7',
  };
}
