import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpotifyApiService {
  private apiUrl = 'https://api.spotify.com/v1';
  constructor(private http: HttpClient) { }

  getTopTracks(token: string, timeRange: string = 'medium_term') {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/me/top/tracks?limit=10`, { headers });
  }

  getTopArtists(token: string, timeRange: string = 'medium_term') {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get(`${this.apiUrl}/me/top/artists?limit=10`, { headers });
  }
}
