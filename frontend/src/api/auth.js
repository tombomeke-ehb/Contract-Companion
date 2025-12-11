// frontend/src/api/auth.js
// Auth-gerelateerde API-calls, gebruikmakend van de centrale httpClient

import http from './httpClient';

export default {
  login(credentials) {
    return http.post('/api/auth/login', credentials);
  },

  signup(data) {
    return http.post('/api/auth/register', data);
  },

  me() {
    return http.get('/api/auth/me');
  },

  logout() {
    return http.post('/api/auth/logout', {});
  },
};
