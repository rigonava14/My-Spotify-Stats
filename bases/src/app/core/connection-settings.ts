import { Injectable, signal } from '@angular/core';
import { spotifyConfig } from './spotify-config';
const key = 'mss.client-id';
@Injectable({ providedIn: 'root' })
export class ConnectionSettings {
  readonly clientId = signal(
    localStorage.getItem(key) || spotifyConfig.clientId,
  );
  readonly redirectUri = spotifyConfig.redirectUri;
  save(value: string): void {
    const id = value.trim();
    if (!/^[a-f0-9]{32}$/i.test(id))
      throw new Error(
        'Pega el Client ID de Spotify: 32 caracteres, sin espacios ni enlaces.',
      );
    localStorage.setItem(key, id);
    this.clientId.set(id);
  }
  clear(): void {
    localStorage.removeItem(key);
    this.clientId.set(spotifyConfig.clientId);
  }
}
