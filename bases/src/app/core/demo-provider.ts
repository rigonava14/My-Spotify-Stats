import { Injectable } from '@angular/core';
import { Artist, MusicData, MusicProvider, Period, Track } from './models';
const names = [
  'Luna Norte',
  'Mar de Fondo',
  'Atlas Nocturno',
  'Clara Sol',
  'Días de Radio',
  'Órbita',
];
const titles = [
  'Después de la lluvia',
  'Todo lo que queda',
  'Ciudad en pausa',
  'Un lugar para volver',
  'La última luz',
  'Satélites',
  'Domingo sin prisa',
  'A través del cristal',
];
const palettes = [
  '#42635b',
  '#776651',
  '#5a6588',
  '#8a5362',
  '#57746c',
  '#77658b',
];
function artwork(i: number): string {
  const color = palettes[i % palettes.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="${color}"/><circle cx="300" cy="280" r="185" fill="#e7ddbe"/><circle cx="365" cy="235" r="175" fill="${color}"/><path d="M0 440 Q150 340 300 440 T600 440 V600 H0Z" fill="#18252c"/><path d="M0 495 Q150 410 300 495 T600 495" fill="none" stroke="#e7ddbe" stroke-width="2"/><text x="38" y="70" fill="#f4efdf" font-family="sans-serif" font-size="24" letter-spacing="5">${names[i % names.length].toUpperCase()}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
export const demoArtists: Artist[] = names.map((name, i) => ({
  id: `artist-${i}`,
  name,
  image: artwork(i),
  url: null,
}));
export const demoTracks: Track[] = titles.map((name, i) => ({
  id: `track-${i}`,
  name,
  artist: names[i % names.length],
  album: ['Horizonte', 'Las horas lentas', 'Otro cielo'][i % 3],
  image: artwork(i),
  durationMs: 183000 + i * 13000,
  url: null,
}));
@Injectable({ providedIn: 'root' })
export class DemoProvider implements MusicProvider {
  async load(period: Period): Promise<MusicData> {
    const offset = { short_term: 0, medium_term: 2, long_term: 4 }[period];
    const rotate = <T>(items: T[]) => [
      ...items.slice(offset),
      ...items.slice(0, offset),
    ];
    return {
      artists: rotate(demoArtists),
      tracks: rotate(demoTracks),
      recent: demoTracks.slice(0, 5).map((track, i) => ({
        track,
        playedAt: new Date(
          Date.UTC(2026, 9, 5, 18, 30) - i * 1800000,
        ).toISOString(),
      })),
    };
  }
}
