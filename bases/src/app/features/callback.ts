import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
@Component({
  imports: [RouterLink],
  template: `<main class="callback glass">
    <h1>
      {{ error() ? 'No se completó la conexión' : 'Conectando tu música…' }}
    </h1>
    <p role="status">
      {{ error() || 'Estamos verificando tu autorización con Spotify.' }}
    </p>
    @if (error()) {
      <a class="button primary" routerLink="/">Volver a conectar</a
      ><a
        class="button secondary"
        routerLink="/dashboard"
        [queryParams]="{ source: 'demo' }"
        >Explorar demo</a
      >
    }
  </main>`,
})
export class Callback {
  error = signal('');
  private auth = inject(AuthService);
  private router = inject(Router);
  constructor() {
    const params = new URLSearchParams(window.location.search);
    window.history.replaceState({}, '', window.location.pathname);
    void this.finish(params);
  }
  private async finish(params: URLSearchParams) {
    try {
      await this.auth.callback(params);
      await this.router.navigate(['/dashboard'], {
        queryParams: { source: 'spotify' },
        replaceUrl: true,
      });
    } catch (e) {
      this.error.set(
        e instanceof Error
          ? e.message
          : 'No pudimos conectar. Vuelve a intentarlo.',
      );
    }
  }
}
