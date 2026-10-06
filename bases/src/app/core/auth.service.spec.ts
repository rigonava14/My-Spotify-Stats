import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService, base64url } from './auth.service';
import { ConnectionSettings } from './connection-settings';
describe('AuthService', () => {
  let auth: AuthService;
  let fetchSpy: jasmine.Spy;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    auth = TestBed.inject(AuthService);
    fetchSpy = spyOn(window, 'fetch');
  });
  afterEach(() => sessionStorage.clear());
  it('encodes PKCE bytes using base64url', () =>
    expect(base64url(new Uint8Array([255, 239, 190]))).toBe('_---'));
  it('rejects mismatched state without exchanging a code', async () => {
    sessionStorage.setItem(
      'mss.oauth',
      JSON.stringify({
        state: 'correct',
        verifier: 'verifier',
        createdAt: Date.now(),
      }),
    );
    await expectAsync(
      auth.callback(new URLSearchParams('code=code&state=wrong')),
    ).toBeRejected();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('mss.oauth')).toBeNull();
  });
  it('rejects expired transactions and declined authorization', async () => {
    sessionStorage.setItem(
      'mss.oauth',
      JSON.stringify({
        state: 's',
        verifier: 'v',
        createdAt: Date.now() - 700000,
      }),
    );
    await expectAsync(
      auth.callback(new URLSearchParams('code=c&state=s')),
    ).toBeRejected();
    sessionStorage.setItem(
      'mss.oauth',
      JSON.stringify({ state: 's', verifier: 'v', createdAt: Date.now() }),
    );
    await expectAsync(
      auth.callback(new URLSearchParams('error=access_denied&state=s')),
    ).toBeRejected();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('exchanges a valid callback with a verifier and prevents replay', async () => {
    sessionStorage.setItem(
      'mss.oauth',
      JSON.stringify({ state: 's', verifier: 'v', createdAt: Date.now() }),
    );
    fetchSpy.and.resolveTo(
      new Response(
        JSON.stringify({
          access_token: 'a',
          refresh_token: 'r',
          expires_in: 3600,
        }),
        { status: 200 },
      ),
    );
    await auth.callback(new URLSearchParams('code=c&state=s'));
    expect(auth.connected()).toBeTrue();
    const body = fetchSpy.calls.mostRecent().args[1].body as URLSearchParams;
    expect(body.get('code_verifier')).toBe('v');
    expect(body.has('client_secret')).toBeFalse();
    await expectAsync(
      auth.callback(new URLSearchParams('code=c&state=s')),
    ).toBeRejected();
  });
  it('deduplicates token renewal and keeps the previous refresh token', async () => {
    sessionStorage.setItem(
      'mss.tokens',
      JSON.stringify({
        access_token: 'old',
        refresh_token: 'refresh',
        expiresAt: 0,
      }),
    );
    fetchSpy.and.resolveTo(
      new Response(JSON.stringify({ access_token: 'new', expires_in: 3600 }), {
        status: 200,
      }),
    );
    expect(await Promise.all([auth.token(), auth.token()])).toEqual([
      'new',
      'new',
    ]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(
      JSON.parse(sessionStorage.getItem('mss.tokens')!).refresh_token,
    ).toBe('refresh');
  });
  it('clears an expired session when refresh is rejected', async () => {
    sessionStorage.setItem(
      'mss.tokens',
      JSON.stringify({ access_token: 'old', refresh_token: 'r', expiresAt: 0 }),
    );
    fetchSpy.and.resolveTo(new Response('{}', { status: 400 }));
    await expectAsync(auth.token()).toBeRejected();
    expect(auth.connected()).toBeFalse();
    expect(sessionStorage.getItem('mss.tokens')).toBeNull();
  });
  it('explains missing configuration', async () => {
    TestBed.inject(ConnectionSettings).clientId.set('');
    await expectAsync(auth.connect()).toBeRejectedWithError(/configurada/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('does not restore tokens when logout happens during renewal', async () => {
    sessionStorage.setItem(
      'mss.tokens',
      JSON.stringify({ access_token: 'old', refresh_token: 'r', expiresAt: 0 }),
    );
    let finish!: (response: Response) => void;
    fetchSpy.and.returnValue(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
    const pending = auth.token();
    auth.logout();
    finish(
      new Response(JSON.stringify({ access_token: 'new', expires_in: 3600 }), {
        status: 200,
      }),
    );
    await expectAsync(pending).toBeRejected();
    expect(sessionStorage.getItem('mss.tokens')).toBeNull();
    expect(auth.connected()).toBeFalse();
  });
});
