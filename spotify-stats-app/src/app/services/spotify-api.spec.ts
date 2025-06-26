import { TestBed } from '@angular/core/testing';

import { SpotifyApi } from './spotify-api';

describe('SpotifyApi', () => {
  let service: SpotifyApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpotifyApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
