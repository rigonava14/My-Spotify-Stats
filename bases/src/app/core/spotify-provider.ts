import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {
  Artist,
  MusicData,
  MusicError,
  MusicProvider,
  Period,
  Track,
} from './models';
interface ApiArtist {
  id: string;
  name: string;
  images?: { url: string }[];
  external_urls?: { spotify?: string };
}
interface ApiTrack {
  id: string;
  name: string;
  artists: ApiArtist[];
  album: { name: string; images: { url: string }[] };
  duration_ms: number;
  external_urls?: { spotify?: string };
}
const mapArtist = (a: ApiArtist): Artist => ({
  id: a.id,
  name: a.name,
  image: a.images?.[0]?.url || null,
  url: a.external_urls?.spotify || null,
});
const mapTrack = (t: ApiTrack): Track => ({
  id: t.id,
  name: t.name,
  artist: t.artists.map((a) => a.name).join(', '),
  album: t.album.name,
  image: t.album.images[0]?.url || null,
  durationMs: t.duration_ms,
  url: t.external_urls?.spotify || null,
});
@Injectable({ providedIn: 'root' })
export class SpotifyProvider implements MusicProvider {
  private auth = inject(AuthService);
  private retryAt = 0;
  private cache = new Map<Period, { data: MusicData; at: number }>();
  clear(): void {
    this.cache.clear();
  }
  private async get<T>(path: string, retry = true): Promise<T> {
    const token = await this.auth.token();
    let response: Response;
    try {
      response = await fetch(`https://api.spotify.com/v1/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      throw new MusicError(
        'network',
        'No pudimos cargar tus datos. Revisa tu conexión y vuelve a intentarlo.',
      );
    }
    if (response.status === 401 && retry) {
      await this.auth.token(true);
      return this.get<T>(path, false);
    }
    if (response.status === 401) {
      this.auth.logout();
      throw new MusicError(
        'expired',
        'Tu sesión terminó. Conecta Spotify de nuevo.',
      );
    }
    if (response.status === 403)
      throw new MusicError(
        'restricted',
        'Spotify restringió el acceso. Verifica los permisos y que tu cuenta esté autorizada para esta app.',
      );
    if (response.status === 429) {
      const seconds = Math.max(
        1,
        Number(response.headers.get('Retry-After')) || 30,
      );
      this.retryAt = Date.now() + seconds * 1000;
      throw new MusicError(
        'rate',
        'Spotify recibió demasiadas solicitudes. Espera antes de volver a intentarlo.',
        seconds,
      );
    }
    if (!response.ok)
      throw new MusicError(
        'network',
        'Spotify no pudo cargar tus datos. Vuelve a intentarlo.',
      );
    return response.json() as Promise<T>;
  }
  async load(period: Period): Promise<MusicData> {
    if (this.retryAt > Date.now())
      throw new MusicError(
        'rate',
        'Spotify recibió demasiadas solicitudes. Espera antes de volver a intentarlo.',
        Math.ceil((this.retryAt - Date.now()) / 1000),
      );
    await this.auth.token();
    const cached = this.cache.get(period);
    if (cached && Date.now() - cached.at < 120000) return cached.data;
    const [artists, tracks, recent] = await Promise.all([
      this.get<{ items: ApiArtist[] }>(
        `me/top/artists?time_range=${period}&limit=20`,
      ),
      this.get<{ items: ApiTrack[] }>(
        `me/top/tracks?time_range=${period}&limit=20`,
      ),
      this.get<{ items: { track: ApiTrack; played_at: string }[] }>(
        'me/player/recently-played?limit=20',
      ),
    ]);
    const data: MusicData = {
      artists: artists.items.map(mapArtist),
      tracks: tracks.items.map(mapTrack),
      recent: recent.items
        .filter((p) => !!p.track)
        .map((p) => ({ track: mapTrack(p.track), playedAt: p.played_at })),
    };
    this.cache.set(period, { data, at: Date.now() });
    return data;
  }
}
