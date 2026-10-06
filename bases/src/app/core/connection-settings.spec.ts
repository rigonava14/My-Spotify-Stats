import { ConnectionSettings } from './connection-settings';
import { spotifyConfig } from './spotify-config';
describe('ConnectionSettings', () => {
  beforeEach(() => localStorage.removeItem('mss.client-id'));
  afterEach(() => localStorage.removeItem('mss.client-id'));
  it('provides the app client ID to a new browser profile', () => {
    expect(new ConnectionSettings().clientId()).toBe(spotifyConfig.clientId);
    const settings = new ConnectionSettings();
    settings.save('0123456789abcdef0123456789abcdef');
    settings.clear();
    expect(settings.clientId()).toBe(spotifyConfig.clientId);
  });
  it('persists the public client ID across instances and clears it', () => {
    const settings = new ConnectionSettings();
    settings.save(' 0123456789abcdef0123456789abcdef ');
    expect(new ConnectionSettings().clientId()).toBe(
      '0123456789abcdef0123456789abcdef',
    );
    settings.clear();
    expect(localStorage.getItem('mss.client-id')).toBeNull();
  });
  it('rejects a URL or token without replacing a saved ID', () => {
    const settings = new ConnectionSettings();
    settings.save('0123456789abcdef0123456789abcdef');
    expect(() => settings.save('https://spotify.com')).toThrow();
    expect(() => settings.save('access-token')).toThrow();
    expect(settings.clientId()).toBe('0123456789abcdef0123456789abcdef');
  });
});
