export type Period = 'short_term' | 'medium_term' | 'long_term';
export type Source = 'demo' | 'spotify';
export interface Artist {
  id: string;
  name: string;
  image: string | null;
  url: string | null;
}
export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string | null;
  durationMs: number;
  url: string | null;
}
export interface Play {
  track: Track;
  playedAt: string;
}
export interface MusicData {
  artists: Artist[];
  tracks: Track[];
  recent: Play[];
}
export interface MusicProvider {
  load(period: Period): Promise<MusicData>;
}
export class MusicError extends Error {
  constructor(
    public readonly kind:
      'expired' | 'restricted' | 'rate' | 'network' | 'config' | 'oauth',
    message: string,
    public readonly retryAfter = 0,
  ) {
    super(message);
  }
}
