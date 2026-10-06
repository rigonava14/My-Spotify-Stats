import { Component, computed, input, signal } from '@angular/core';
import { Artist } from '../core/models';
const positions = [
  { x: 22, y: 25 },
  { x: 65, y: 18 },
  { x: 79, y: 57 },
  { x: 49, y: 76 },
  { x: 20, y: 63 },
  { x: 48, y: 44 },
];
@Component({
  selector: 'app-constellation',
  template: `<p class="constellation-hint">
      Acércate a una estrella para descubrir un artista.
    </p>
    <div
      class="star-map"
      (pointermove)="move($event)"
      (pointerleave)="leave()"
      aria-label="Constelación de tus artistas favoritos"
    >
      <div class="nebula" aria-hidden="true"></div>
      <div class="galaxy-dust" aria-hidden="true">
        @for (star of stars; track $index) {
          <span
            [style.left.%]="star.x"
            [style.top.%]="star.y"
            [style.width.px]="star.size"
            [style.height.px]="star.size"
            [style.animation-delay.s]="star.delay"
          ></span>
        }
      </div>
      <div class="orbit orbit-one" aria-hidden="true"></div>
      <div class="orbit orbit-two" aria-hidden="true"></div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        @for (edge of edges(); track $index) {
          <line
            [class.connected]="active() === edge[0] || active() === edge[1]"
            [attr.x1]="nodes()[edge[0]].x"
            [attr.y1]="nodes()[edge[0]].y"
            [attr.x2]="nodes()[edge[1]].x"
            [attr.y2]="nodes()[edge[1]].y"
          />
        }
        @if (cursor(); as p) {
          @for (node of nodes(); track node.artist.id) {
            <line
              class="cursor-thread"
              [attr.x1]="node.x"
              [attr.y1]="node.y"
              [attr.x2]="p.x"
              [attr.y2]="p.y"
              [style.opacity]="threadOpacity(node.x, node.y, p.x, p.y)"
            />
          }
        }
      </svg>
      @for (node of nodes(); track node.artist.id; let i = $index) {
        <button
          type="button"
          class="star-node"
          [class.revealed]="active() === i"
          [style.left.%]="node.x"
          [style.top.%]="node.y"
          [attr.aria-label]="
            node.artist.name + ', número ' + (i + 2) + ' en tu ranking'
          "
          [attr.aria-pressed]="active() === i"
          (focus)="focused.set(i)"
          (blur)="focused.set(null)"
          (click)="selected.set(selected() === i ? null : i)"
        >
          <span class="star-spark"></span
          ><img
            [src]="node.artist.image || '/placeholder.svg'"
            alt=""
            width="64"
            height="64"
            loading="lazy"
          />
        </button>
      }
    </div>
    <div class="star-caption" aria-live="polite">
      @if (activeNode(); as node) {
        <span class="star-caption-rank">#{{ active()! + 2 }}</span>
        <div>
          <strong>{{ node.artist.name }}</strong>
          @if (node.artist.url) {
            <a
              [href]="node.artist.url"
              target="_blank"
              rel="noopener noreferrer"
              >Abrir en Spotify ↗</a
            >
          } @else {
            <small>Artista de la demo</small>
          }
        </div>
      } @else {
        <span>Tu música conecta estos puntos.</span>
      }
    </div>
    @if (!nodes().length) {
      <p class="empty">Tu constelación aparecerá cuando haya más artistas.</p>
    }`,
  styles: [
    `
      :host {
        display: block;
      }
      .constellation-hint {
        font-size: 11px;
        color: var(--muted);
        margin: 0 0 8px;
      }
      .star-map {
        overflow: hidden;
        border-radius: 14px;
        margin: 12px -8px 20px;
        background-color: #0b121b;
        position: relative;
        height: 360px;
        isolation: isolate;
        background: radial-gradient(
          ellipse at center,
          #b4efb709,
          transparent 70%
        );
      }
      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      line {
        stroke: #b4efb7;
        stroke-opacity: 0.5;
        stroke-width: 0.8;
        vector-effect: non-scaling-stroke;
      }
      .cursor-thread {
        stroke-opacity: 1;
        stroke-width: 0.8;
      }
      .star-node {
        position: absolute;
        transform: translate(-50%, -50%);
        width: 64px;
        height: 64px;
        display: grid;
        place-items: center;
        border: 0;
        padding: 0;
        background: none;
        border-radius: 50%;
        cursor: pointer;
      }
      .star-spark {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--accent);
        box-shadow: 0 3px 12px #b4efb744;
        transition: opacity 0.2s;
      }
      .star-node img {
        position: absolute;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
        border: 2px solid var(--accent);
        opacity: 0;
        transform: scale(0.3);
        transition:
          transform 0.28s cubic-bezier(0.16, 1, 0.3, 1),
          opacity 0.2s;
        pointer-events: none;
      }
      .star-node.revealed img {
        opacity: 1;
        transform: scale(1.15);
      }
      .star-node:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 8px;
      }
      .star-caption {
        border-top: 1px solid var(--line);
        padding-top: 17px;
        min-height: 68px;
        display: flex;
        align-items: center;
        gap: 12px;
        color: var(--muted);
        font-size: 12px;
      }
      .star-caption-rank {
        color: var(--accent);
        font-variant-numeric: tabular-nums;
      }
      .star-caption strong {
        display: block;
        font-size: 14px;
        color: var(--text);
        overflow-wrap: anywhere;
      }
      .star-caption a,
      .star-caption small {
        display: block;
        font-size: 11px;
        margin-top: 6px;
      }
      .star-caption a {
        color: var(--accent);
      }
      .nebula {
        position: absolute;
        inset: -25%;
        pointer-events: none;
        background:
          radial-gradient(ellipse at 30% 40%, #7962bd33, transparent 45%),
          radial-gradient(ellipse at 68% 60%, #3b9e9755, transparent 42%),
          radial-gradient(ellipse at 70% 10%, #5962aa33, transparent 40%);
        animation: nebula-drift 20s ease-in-out infinite alternate;
      }
      .galaxy-dust {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .galaxy-dust span {
        position: absolute;
        border-radius: 50%;
        background: #e4eee9;
        opacity: 0.4;
        animation: twinkle 5s ease-in-out infinite alternate;
      }
      .orbit {
        position: absolute;
        border: 1px solid #b4efb714;
        border-radius: 50%;
        width: 78%;
        height: 55%;
        left: 11%;
        top: 23%;
        pointer-events: none;
        transform: rotate(-24deg);
      }
      .orbit::after {
        content: '';
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #bbead1;
        top: 15%;
        left: 14%;
        box-shadow: 0 0 12px #b4efb7;
      }
      .orbit-one {
        animation: orbit-drift 32s linear infinite;
      }
      .orbit-two {
        width: 65%;
        height: 80%;
        left: 18%;
        top: 10%;
        animation: orbit-drift 48s linear infinite reverse;
        opacity: 0.5;
      }
      line.connected {
        stroke-opacity: 1;
        stroke-width: 1.4;
        stroke-dasharray: 4 7;
        animation: signal-flow 4s linear infinite;
      }
      line {
        transition: stroke-opacity 0.25s;
      }
      .star-spark {
        animation: star-breathe 3.5s ease-in-out infinite;
      }
      .star-node:nth-of-type(even) .star-spark {
        animation-delay: -1.8s;
      }
      .star-node.revealed img {
        box-shadow: 0 8px 28px #0009;
      }
      .star-node.revealed::after {
        content: '';
        position: absolute;
        inset: -12px;
        border: 1px solid #b4efb750;
        border-radius: 50%;
        animation: reveal-ring 2s ease-out infinite;
        pointer-events: none;
      }
      @keyframes twinkle {
        from {
          opacity: 0.18;
          transform: scale(0.7);
        }
        to {
          opacity: 0.85;
          transform: scale(1.15);
        }
      }
      @keyframes nebula-drift {
        from {
          transform: translate(-3%, -2%) rotate(-8deg);
        }
        to {
          transform: translate(3%, 2%) rotate(8deg);
        }
      }
      @keyframes orbit-drift {
        to {
          transform: rotate(336deg);
        }
      }
      @keyframes signal-flow {
        to {
          stroke-dashoffset: -44;
        }
      }
      @keyframes star-breathe {
        50% {
          transform: scale(1.35);
          box-shadow: 0 3px 20px #b4efb788;
        }
      }
      @keyframes reveal-ring {
        from {
          transform: scale(0.75);
          opacity: 0.8;
        }
        to {
          transform: scale(1.25);
          opacity: 0;
        }
      }
      @media (max-width: 700px) {
        .star-map {
          height: 330px;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .nebula,
        .orbit,
        .galaxy-dust span,
        line.connected,
        .star-spark,
        .star-node.revealed::after {
          animation: none !important;
        }
        line {
          transition: none;
        }
      }
      @media (hover: none) {
        .star-node img {
          opacity: 1;
          transform: scale(0.78);
        }
        .star-node.revealed img {
          transform: scale(1.05);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .star-node img,
        .star-spark {
          transition: none;
        }
      }
    `,
  ],
})
export class Constellation {
  readonly stars = Array.from({ length: 64 }, (_, i) => ({
    x: (i * 37 + 11) % 100,
    y: (i * 61 + 7) % 100,
    size: i % 7 === 0 ? 2.5 : 1.2,
    delay: -(i % 9),
  }));
  artists = input.required<Artist[]>();
  nodes = computed(() =>
    this.artists()
      .slice(0, 6)
      .map((artist, i) => ({ ...positions[i], artist })),
  );
  edges = computed(() =>
    [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 0],
      [0, 5],
      [1, 5],
      [3, 5],
    ].filter(([a, b]) => a < this.nodes().length && b < this.nodes().length),
  );
  cursor = signal<{ x: number; y: number } | null>(null);
  hovered = signal<number | null>(null);
  focused = signal<number | null>(null);
  selected = signal<number | null>(null);
  active = computed(() => this.hovered() ?? this.focused() ?? this.selected());
  activeNode = computed(() => {
    const i = this.active();
    return i === null ? null : this.nodes()[i];
  });
  move(event: PointerEvent) {
    if (event.pointerType === 'touch') return;
    const bounds = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    this.cursor.set({ x, y });
    let closest: number | null = null;
    let distance = 42;
    this.nodes().forEach((node, i) => {
      const d = Math.hypot(
        ((node.x - x) * bounds.width) / 100,
        ((node.y - y) * bounds.height) / 100,
      );
      if (d < distance) {
        distance = d;
        closest = i;
      }
    });
    this.hovered.set(closest);
  }
  leave() {
    this.cursor.set(null);
    this.hovered.set(null);
  }
  threadOpacity(x: number, y: number, px: number, py: number) {
    return Math.max(0, 0.65 - Math.hypot(x - px, y - py) / 90);
  }
}
