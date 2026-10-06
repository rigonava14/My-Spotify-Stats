// Public client ID only. Never include a client secret.
export const spotifyConfig = {
  clientId: '5247336d4f284d5a8978f2860055cb0a',
  redirectUri: `${window.location.origin}/callback`,
  scopes: 'user-top-read user-read-recently-played',
};
