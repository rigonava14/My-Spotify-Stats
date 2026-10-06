import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { SpotifyProvider } from './spotify-provider';
import { MusicError } from './models';
describe('SpotifyProvider', () => {
  let provider: SpotifyProvider;
  let fetchSpy: jasmine.Spy;
  let auth: { token: jasmine.Spy; logout: jasmine.Spy };
  beforeEach(() => {
    auth = {
      token: jasmine.createSpy().and.resolveTo('access'),
      logout: jasmine.createSpy(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: auth },
      ],
    });
    provider = TestBed.inject(SpotifyProvider);
    fetchSpy = spyOn(window, 'fetch');
  });
  it('refreshes once after a 401 and recovers the request', async () => {
    let first = true;
    fetchSpy.and.callFake(() => {
      if (first) {
        first = false;
        return Promise.resolve(new Response('{}', { status: 401 }));
      }
      return Promise.resolve(new Response('{"items":[]}', { status: 200 }));
    });
    const data = await provider.load('short_term');
    expect(data.tracks).toEqual([]);
    expect(auth.token).toHaveBeenCalledWith(true);
  });
  it('clears authentication after a second 401', async () => {
    fetchSpy.and.callFake(() =>
      Promise.resolve(new Response('{}', { status: 401 })),
    );
    await expectAsync(provider.load('short_term')).toBeRejected();
    expect(auth.logout).toHaveBeenCalled();
  });
  it('reports restricted access', async () => {
    fetchSpy.and.callFake(() =>
      Promise.resolve(new Response('{}', { status: 403 })),
    );
    try {
      await provider.load('short_term');
      fail('Expected restriction');
    } catch (e) {
      expect((e as MusicError).kind).toBe('restricted');
    }
  });
  it('preserves Retry-After for the UI', async () => {
    fetchSpy.and.callFake(() =>
      Promise.resolve(
        new Response('{}', { status: 429, headers: { 'Retry-After': '17' } }),
      ),
    );
    try {
      await provider.load('short_term');
      fail('Expected rate limit');
    } catch (e) {
      expect((e as MusicError).kind).toBe('rate');
      expect((e as MusicError).retryAfter).toBe(17);
    }
  });
  it('caches by period and clears cached personal data', async () => {
    fetchSpy.and.callFake(() =>
      Promise.resolve(new Response('{"items":[]}', { status: 200 })),
    );
    await provider.load('short_term');
    await provider.load('short_term');
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    await provider.load('medium_term');
    expect(fetchSpy).toHaveBeenCalledTimes(6);
    provider.clear();
    await provider.load('short_term');
    expect(fetchSpy).toHaveBeenCalledTimes(9);
  });
  it('handles offline errors', async () => {
    fetchSpy.and.rejectWith(new TypeError('offline'));
    await expectAsync(provider.load('short_term')).toBeRejectedWithError(
      /conexión/,
    );
  });
  it('keeps a rate limit across period changes', async () => {
    fetchSpy.and.callFake(() =>
      Promise.resolve(
        new Response('{}', { status: 429, headers: { 'Retry-After': '17' } }),
      ),
    );
    await expectAsync(provider.load('short_term')).toBeRejected();
    const calls = fetchSpy.calls.count();
    await expectAsync(provider.load('long_term')).toBeRejected();
    expect(fetchSpy.calls.count()).toBe(calls);
  });
});
