// frontend/src/api/auth.js
// Auth-gerelateerde API-calls, gebruikmakend van de centrale httpClient

import http from './httpClient';

export default {
  login(credentials) {
    return http.post('/auth/login', credentials);
  },

  signup(data) {
    return http.post('/auth/signup', data);
  },

  me() {
    return http.get('/auth/me');
  },

  logout() {
    return http.post('/auth/logout', {});
  },
};
