import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 users
    { duration: '30s', target: 100 }, // Stay at 100 users for 30s
    { duration: '10s', target: 0 }, // Ramp down to 0
  ],
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
  // 1. Health check load
  const resHealth = http.get(`${BASE_URL}/health`);
  check(resHealth, {
    'health status is 200': (r) => r.status === 200,
  });

  // 2. Mock recommendation feed request
  // (In a real scenario, this would use a valid JWT token)
  const resRestaurants = http.get(`${BASE_URL}/restaurants`);
  check(resRestaurants, {
    'restaurants status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
