import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../core/auth.service';
import { DemoProvider } from '../core/demo-provider';
import { SpotifyProvider } from '../core/spotify-provider';
import { MusicData, MusicError, Period, Source } from '../core/models';
import { Icon } from './icon';
import { Brand } from './brand';
import { Constellation } from './constellation';
@Component({
  imports: [DatePipe, RouterLink, RouterLinkActive, Icon, Brand, Constellation],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  readonly auth = inject(AuthService);
  private demo = inject(DemoProvider);
  private spotify = inject(SpotifyProvider);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroy = inject(DestroyRef);
  source = signal<Source>('demo');
  period = signal<Period>('short_term');
  view = signal('overview');
  data = signal<MusicData | null>(null);
  loading = signal(false);
  error = signal<MusicError | null>(null);
  retrySeconds = signal(0);
  private request = 0;
  private timer?: ReturnType<typeof setInterval>;
  periods: { value: Period; label: string }[] = [
    { value: 'short_term', label: '4 semanas' },
    { value: 'medium_term', label: '6 meses' },
    { value: 'long_term', label: '1 año' },
  ];
  nav = [
    { path: '/dashboard', label: 'Resumen', icon: 'grid' },
    { path: '/tracks', label: 'Canciones', icon: 'music' },
    { path: '/artists', label: 'Artistas', icon: 'artist' },
    { path: '/recent', label: 'Recientes', icon: 'clock' },
  ];
  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed())
      .subscribe((d) => this.view.set((d['view'] as string) || 'overview'));
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      this.source.set(q.get('source') === 'spotify' ? 'spotify' : 'demo');
      const p = q.get('period');
      this.period.set(
        p === 'medium_term' || p === 'long_term' ? p : 'short_term',
      );
      void this.load();
    });
    this.destroy.onDestroy(() => {
      this.request++;
      if (this.timer) clearInterval(this.timer);
    });
  }
  skipHref() {
    return this.router.url.split('#')[0] + '#main';
  }
  title() {
    return (
      {
        overview: 'Tu banda sonora',
        tracks: 'Tus canciones favoritas',
        artists: 'Los artistas que te acompañan',
        recent: 'Tus últimas escuchas',
      } as Record<string, string>
    )[this.view()];
  }
  async load() {
    const id = ++this.request;
    this.loading.set(true);
    this.data.set(null);
    this.error.set(null);
    try {
      const data = await (
        this.source() === 'demo' ? this.demo : this.spotify
      ).load(this.period());
      if (id === this.request) this.data.set(data);
    } catch (e) {
      if (id === this.request) {
        const error =
          e instanceof MusicError
            ? e
            : new MusicError(
                'network',
                'No pudimos cargar los datos. Vuelve a intentarlo.',
              );
        this.error.set(error);
        if (error.kind === 'rate') this.cooldown(error.retryAfter);
      }
    } finally {
      if (id === this.request) this.loading.set(false);
    }
  }
  selectPeriod(period: Period) {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { period },
      queryParamsHandling: 'merge',
    });
  }
  cooldown(seconds: number) {
    if (this.timer) clearInterval(this.timer);
    this.retrySeconds.set(seconds);
    this.timer = setInterval(() => {
      this.retrySeconds.update((s) => Math.max(0, s - 1));
      if (!this.retrySeconds()) clearInterval(this.timer);
    }, 1000);
  }
  async connect() {
    try {
      await this.router.navigate(['/settings']);
    } catch (e) {
      this.error.set(
        e instanceof MusicError
          ? e
          : new MusicError('network', 'No pudimos conectar con Spotify.'),
      );
    }
  }
  logout() {
    this.auth.logout();
    this.spotify.clear();
    void this.router.navigate(['/']);
  }
  duration(ms: number) {
    return `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  }
}
