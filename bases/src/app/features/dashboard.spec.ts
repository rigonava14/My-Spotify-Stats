import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Dashboard } from './dashboard';
import { DemoProvider } from '../core/demo-provider';
import { SpotifyProvider } from '../core/spotify-provider';
import { MusicError } from '../core/models';
describe('Dashboard routes', () => {
  let spotify: { load: jasmine.Spy; clear: jasmine.Spy };
  beforeEach(() => {
    sessionStorage.clear();
    spotify = {
      load: jasmine
        .createSpy()
        .and.rejectWith(new MusicError('restricted', 'Cuenta no autorizada')),
      clear: jasmine.createSpy(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: SpotifyProvider, useValue: spotify },
        provideRouter([
          {
            path: 'dashboard',
            component: Dashboard,
            data: { view: 'overview' },
          },
          { path: 'tracks', component: Dashboard, data: { view: 'tracks' } },
        ]),
      ],
    });
  });
  it('changes the selected period and rankings through URL navigation', async () => {
    const h = await RouterTestingHarness.create();
    let c = await h.navigateByUrl(
      '/dashboard?source=demo&period=short_term',
      Dashboard,
    );
    await h.fixture.whenStable();
    expect(c.data()?.artists[0].name).toBe('Luna Norte');
    c = await h.navigateByUrl(
      '/dashboard?source=demo&period=medium_term',
      Dashboard,
    );
    await h.fixture.whenStable();
    expect(c.period()).toBe('medium_term');
    expect(c.data()?.artists[0].name).toBe('Atlas Nocturno');
  });
  it('switches from demo to Spotify and makes the access error recoverable', async () => {
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/dashboard?source=demo', Dashboard);
    await h.fixture.whenStable();
    const c = await h.navigateByUrl('/dashboard?source=spotify', Dashboard);
    await h.fixture.whenStable();
    expect(spotify.load).toHaveBeenCalledWith('short_term');
    expect(c.data()).toBeNull();
    expect(c.error()?.kind).toBe('restricted');
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain('Explorar demo');
  });
  it('renders empty data with a recovery message', async () => {
    spyOn(TestBed.inject(DemoProvider), 'load').and.resolveTo({
      artists: [],
      tracks: [],
      recent: [],
    });
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/tracks?source=demo', Dashboard);
    await h.fixture.whenStable();
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain(
      'Selecciona otro período',
    );
  });
  it('keeps long names intact and the skip link on the current route', async () => {
    const data = await new DemoProvider().load('short_term');
    data.tracks[0].name =
      'Una canción con un nombre extraordinariamente largo que debe seguir siendo completamente legible en cualquier pantalla';
    spyOn(TestBed.inject(DemoProvider), 'load').and.resolveTo(data);
    const h = await RouterTestingHarness.create();
    await h.navigateByUrl('/tracks?source=demo&period=long_term', Dashboard);
    await h.fixture.whenStable();
    h.detectChanges();
    expect(h.routeNativeElement?.textContent).toContain(data.tracks[0].name);
    expect(
      h.routeNativeElement?.querySelector('.skip')?.getAttribute('href'),
    ).toBe('/tracks?source=demo&period=long_term#main');
  });
});
