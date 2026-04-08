import axios from 'axios';

const API = axios.create({
  baseURL: 'https://largeproj.msilvacop4331.site'
});

export const sessionService = {
  createSession: async (sessionData: any) => {
    const response = await API.post('/api/sessions/create', sessionData);
    return response.data;
  },

  getSessions: async () => {
    const response = await API.get('/api/sessions');
    return response.data;
  }
};