import { DemoProvider } from './demo-provider';
describe('DemoProvider', () => {
  const provider = new DemoProvider();
  it('changes rankings without changing the recent fixture', async () => {
    const a = await provider.load('short_term');
    const b = await provider.load('medium_term');
    const c = await provider.load('long_term');
    expect(
      new Set([a.artists[0].id, b.artists[0].id, c.artists[0].id]).size,
    ).toBe(3);
    expect(a.tracks[0].id).not.toBe(b.tracks[0].id);
    expect(a.recent).toEqual(c.recent);
  });
  it('has unique IDs and artwork without pretending to link to Spotify', async () => {
    const d = await provider.load('short_term');
    expect(new Set(d.tracks.map((t) => t.id)).size).toBe(d.tracks.length);
    expect(
      d.artists.every(
        (a) => a.image?.startsWith('data:image/svg+xml') && a.url === null,
      ),
    ).toBeTrue();
  });
});
