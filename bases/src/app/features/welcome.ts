import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { demoArtists } from '../core/demo-provider';
import { Icon } from './icon';
import { Brand } from './brand';
@Component({
  imports: [RouterLink, Icon, Brand],
  template: ` <a class="skip" href="#main">Saltar al contenido</a>
    <header class="landing-header">
      <a class="brand" routerLink="/" aria-label="Mood.i · Inicio"
        ><app-brand
      /></a>
      <a routerLink="/about" class="quiet-link"
        >Sobre el proyecto <app-icon name="external"
      /></a>
    </header>
    <main id="main" class="welcome">
      <section class="welcome-copy">
        <span class="status-pill"
          ><span class="status-dot"></span> Tu música, desde otra
          perspectiva</span
        >
        <h1>Lo que escuchas.<br /><em>Lo que te mueve.</em></h1>
        <p>
          Redescubre tus canciones favoritas, los artistas que te acompañan y
          las últimas notas de tu día.
        </p>
        <div class="welcome-actions">
          <a
            class="button primary"
            routerLink="/dashboard"
            [queryParams]="{ source: 'demo' }"
            >Explorar demo <app-icon name="arrow" /></a
          ><button
            class="button secondary"
            (click)="connect()"
            [disabled]="busy()"
          >
            {{ busy() ? 'Conectando…' : 'Conectar Spotify' }}
          </button>
        </div>
        <p class="small">
          Explora sin cuenta. La demo contiene datos ficticios.<br />La conexión
          real requiere una cuenta autorizada por Spotify.
        </p>
        @if (error()) {
          <p class="notice" role="alert">{{ error() }}</p>
        }
      </section>
      <section
        class="welcome-preview glass"
        aria-label="Vista previa de la demo"
      >
        <div class="preview-top">
          <span>Tu banda sonora</span><span class="badge">DEMO</span>
        </div>
        <img
          [src]="artist.image"
          alt="Portada ilustrada de Luna Norte"
          width="600"
          height="600"
        />
        <div class="preview-caption">
          <span>Tu artista favorito</span>
          <h2>{{ artist.name }}</h2>
          <p>Hay canciones que se quedan contigo.</p>
        </div>
      </section>
    </main>
    <footer class="landing-footer">
      <span>Hecho para quienes escuchan con atención.</span
      ><span>Proyecto independiente · Sin afiliación con Spotify</span>
    </footer>`,
})
export class Welcome {
  private auth = inject(AuthService);
  private router = inject(Router);
  artist = demoArtists[0];
  busy = signal(false);
  error = signal('');

  async connect() {
    this.busy.set(true);
    this.error.set('');
    try {
      if (this.auth.connected())
        await this.router.navigate(['/dashboard'], {
          queryParams: { source: 'spotify' },
        });
      else await this.router.navigate(['/settings']);
    } catch (e) {
      this.error.set(
        e instanceof Error
          ? e.message
          : 'No pudimos conectar. Inténtalo de nuevo.',
      );
      this.busy.set(false);
    }
  }
}
