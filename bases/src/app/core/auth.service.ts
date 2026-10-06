import { inject, Injectable, signal } from '@angular/core';
import { MusicError } from './models';
import { spotifyConfig } from './spotify-config';
import { ConnectionSettings } from './connection-settings';
interface Tokens {
  access_token: string;
  refresh_token: string;
  expiresAt: number;
}
interface Transaction {
  state: string;
  verifier: string;
  createdAt: number;
}
const tokenKey = 'mss.tokens';
const transactionKey = 'mss.oauth';
export function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private settings = inject(ConnectionSettings);
  readonly connected = signal(!!sessionStorage.getItem(tokenKey));
  private generation = 0;
  private refreshTask: Promise<string> | null = null;
  async connect(): Promise<void> {
    if (!this.settings.clientId())
      throw new MusicError(
        'config',
        'La conexión con Spotify todavía no está configurada. Puedes explorar la demo.',
      );
    if (window.location.hostname === 'localhost')
      throw new MusicError(
        'config',
        'Abre la app con http://127.0.0.1:' +
          window.location.port +
          '/settings antes de conectar. Spotify no acepta localhost como dirección de retorno.',
      );
    const verifier = base64url(crypto.getRandomValues(new Uint8Array(64)));
    const state = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = base64url(
      new Uint8Array(
        await crypto.subtle.digest(
          'SHA-256',
          new TextEncoder().encode(verifier),
        ),
      ),
    );
    sessionStorage.setItem(
      transactionKey,
      JSON.stringify({ verifier, state, createdAt: Date.now() }),
    );
    const params = new URLSearchParams({
      client_id: this.settings.clientId(),
      response_type: 'code',
      redirect_uri: spotifyConfig.redirectUri,
      scope: spotifyConfig.scopes,
      state,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });
    window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
  }
  async callback(params: URLSearchParams): Promise<void> {
    const raw = sessionStorage.getItem(transactionKey);
    sessionStorage.removeItem(transactionKey);
    let tx: Transaction | null = null;
    try {
      tx = raw ? (JSON.parse(raw) as Transaction) : null;
    } catch {
      /* invalid transaction */
    }
    if (
      !tx ||
      params.get('state') !== tx.state ||
      Date.now() - tx.createdAt > 600000 ||
      !tx.verifier
    )
      throw new MusicError(
        'oauth',
        'No pudimos verificar la conexión. Vuelve a conectar Spotify.',
      );
    if (params.has('error'))
      throw new MusicError(
        'oauth',
        'No autorizaste el acceso. Puedes volver a intentarlo o explorar la demo.',
      );
    const code = params.get('code');
    if (!code)
      throw new MusicError(
        'oauth',
        'Falta el código de autorización. Vuelve a conectar Spotify.',
      );
    await this.exchange({
      grant_type: 'authorization_code',
      code,
      redirect_uri: spotifyConfig.redirectUri,
      code_verifier: tx.verifier,
    });
  }
  async token(force = false): Promise<string> {
    let tokens: Tokens | null = null;
    try {
      tokens = JSON.parse(
        sessionStorage.getItem(tokenKey) || 'null',
      ) as Tokens | null;
    } catch {
      this.logout();
    }
    if (!tokens?.refresh_token || !tokens.access_token) {
      this.logout();
      throw new MusicError(
        'expired',
        'Tu sesión terminó. Conecta Spotify de nuevo.',
      );
    }
    if (!force && tokens.expiresAt > Date.now() + 60000)
      return tokens.access_token;
    if (!this.refreshTask)
      this.refreshTask = this.exchange(
        { grant_type: 'refresh_token', refresh_token: tokens.refresh_token },
        tokens.refresh_token,
      ).finally(() => {
        this.refreshTask = null;
      });
    return this.refreshTask;
  }
  private async exchange(
    values: Record<string, string>,
    previousRefresh = '',
  ): Promise<string> {
    const generation = this.generation;
    let response: Response;
    try {
      response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          ...values,
          client_id: this.settings.clientId(),
        }),
      });
    } catch {
      throw new MusicError(
        'network',
        'No pudimos contactar con Spotify. Revisa tu conexión e inténtalo de nuevo.',
      );
    }
    if (!response.ok) {
      if (
        values['grant_type'] === 'refresh_token' &&
        [400, 401].includes(response.status)
      ) {
        this.logout();
        throw new MusicError(
          'expired',
          'Tu sesión terminó. Conecta Spotify de nuevo.',
        );
      }
      throw new MusicError(
        'oauth',
        'Spotify no pudo completar la conexión. Vuelve a intentarlo.',
      );
    }
    const data = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };
    if (
      !data.access_token ||
      !(data.refresh_token || previousRefresh) ||
      !Number.isFinite(data.expires_in)
    )
      throw new MusicError(
        'oauth',
        'Spotify devolvió una sesión incompleta. Vuelve a conectar.',
      );
    if (generation !== this.generation)
      throw new MusicError(
        'expired',
        'La sesión se cerró. Conecta Spotify de nuevo.',
      );
    sessionStorage.setItem(
      tokenKey,
      JSON.stringify({
        access_token: data.access_token,
        refresh_token: data.refresh_token || previousRefresh,
        expiresAt: Date.now() + data.expires_in * 1000,
      }),
    );
    this.connected.set(true);
    return data.access_token;
  }
  logout(): void {
    this.generation++;
    sessionStorage.removeItem(tokenKey);
    sessionStorage.removeItem(transactionKey);
    this.connected.set(false);
  }
}
