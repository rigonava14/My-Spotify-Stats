import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConnectionSettings } from '../core/connection-settings';
import { AuthService } from '../core/auth.service';
import { SpotifyProvider } from '../core/spotify-provider';
@Component({
  imports: [FormsModule, RouterLink],
  template: ` <main class="about glass connection-settings">
    <a
      class="quiet-link"
      routerLink="/dashboard"
      [queryParams]="{ source: 'demo' }"
      >← Volver al dashboard</a
    >
    <h1>Conecta tu Spotify.</h1>
    <p class="lead">
      Guarda el Client ID de tu app y autoriza el acceso a tus rankings desde
      Spotify.
    </p>
    <ol class="setup-steps">
      <li>
        Abre
        <a
          href="https://developer.spotify.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          >Spotify for Developers</a
        >
        y crea o selecciona tu app.
      </li>
      <li>
        En Settings, registra esta dirección en <strong>Redirect URIs</strong> y
        guarda los cambios.
        <div class="callback-address">
          <code>{{ settings.redirectUri }}</code
          ><button class="button secondary" type="button" (click)="copy()">
            Copiar
          </button>
        </div>
      </li>
      <li>
        Copia el <strong>Client ID</strong> de esa app y pégalo aquí. Después
        conecta tu cuenta.
      </li>
    </ol>
    <form (ngSubmit)="save()" class="connection-form">
      <label for="client-id">Client ID</label
      ><input
        id="client-id"
        name="clientId"
        [(ngModel)]="value"
        autocomplete="off"
        spellcheck="false"
        placeholder="Client ID de Spotify"
        aria-describedby="client-help"
        required
        maxlength="64"
      />
      <p id="client-help" class="small">
        Es un identificador público. No pegues el Client Secret, tu contraseña
        ni un access token. Se guarda únicamente en este navegador.
      </p>
      <div class="welcome-actions">
        <button class="button primary" type="submit">
          Guardar configuración</button
        ><button
          class="button secondary"
          type="button"
          (click)="connect()"
          [disabled]="busy()"
        >
          {{ busy() ? 'Conectando…' : 'Conectar Spotify' }}
        </button>
      </div>
    </form>
    @if (message()) {
      <p class="notice" role="status">{{ message() }}</p>
    }
    @if (error()) {
      <p class="notice" role="alert">{{ error() }}</p>
    }
    @if (settings.clientId()) {
      <button class="quiet-button" (click)="clear()">
        Restablecer configuración y cerrar sesión
      </button>
    }
    <h2>Si Spotify restringe el acceso</h2>
    <p>
      En modo de desarrollo, verifica que tu cuenta esté autorizada en la app y
      que el propietario cumpla los requisitos de Spotify Premium. La dirección
      de retorno debe coincidir exactamente; en local usa 127.0.0.1, no
      localhost.
    </p>
    <p class="small">
      La autorización ocurre en Spotify. Esta app solicita únicamente tus
      favoritos y actividad reciente.
    </p>
  </main>`,
})
export class Settings {
  readonly settings = inject(ConnectionSettings);
  private auth = inject(AuthService);
  private spotify = inject(SpotifyProvider);
  value = this.settings.clientId();
  message = signal('');
  error = signal('');
  busy = signal(false);
  save(): boolean {
    this.message.set('');
    this.error.set('');
    try {
      const changed = this.value.trim() !== this.settings.clientId();
      this.settings.save(this.value);
      this.value = this.settings.clientId();
      if (changed) {
        this.auth.logout();
        this.spotify.clear();
      }
      this.message.set('Configuración guardada. Ya puedes conectar Spotify.');
      return true;
    } catch (e) {
      this.error.set(
        e instanceof Error ? e.message : 'No pudimos guardar la configuración.',
      );
      return false;
    }
  }
  async connect() {
    if (!this.save()) return;
    this.busy.set(true);
    try {
      await this.auth.connect();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'No pudimos conectar.');
      this.busy.set(false);
    }
  }
  async copy() {
    try {
      await navigator.clipboard.writeText(this.settings.redirectUri);
      this.message.set('Dirección de retorno copiada.');
    } catch {
      this.error.set('Selecciona y copia la dirección de retorno manualmente.');
    }
  }
  clear() {
    this.settings.clear();
    this.auth.logout();
    this.spotify.clear();
    this.value = this.settings.clientId();
    this.message.set('Client ID predeterminado restaurado y sesión cerrada.');
    this.error.set('');
  }
}
