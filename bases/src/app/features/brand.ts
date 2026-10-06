import { Component } from '@angular/core';
@Component({
  selector: 'app-brand',
  template: `<svg viewBox="0 0 144 64" aria-hidden="true">
      <path
        d="M10 48 C22 44 25 16 38 16 S55 49 66 49 S81 16 91 16 S104 34 110 48"
        fill="none"
        stroke="currentColor"
        stroke-width="15"
        stroke-linecap="round"
      />
      <circle cx="134" cy="44" r="9" /></svg
    ><span>mood.i</span>`,
  styles: [
    `
      :host {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      svg {
        width: 56px;
        height: 32px;
        overflow: visible;
        color: var(--accent);
        fill: currentColor;
        flex-shrink: 0;
      }
      span {
        font-family: 'Comfortaa', sans-serif;
        font-weight: 700;
        font-size: 25px;
        letter-spacing: -0.045em;
        color: var(--text);
      }
    `,
  ],
})
export class Brand {}
