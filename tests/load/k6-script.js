/* eslint-disable */
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '1m', target: 50 },   // Stay at 50 users for 1 minute
    { duration: '30s', target: 100 }, // Ramp up to 100 users
    { duration: '1m', target: 100 },  // Stay at 100 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.TEST_TOKEN;

export default function () {
  const authParams = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  };

  // 2. Fetch Recommendations
  const recsRes = http.get(`${BASE_URL}/api/recommendation?lat=10.762&lng=106.660`, authParams);
  
  check(recsRes, {
    'recommendations status is 200': (r) => r.status === 200,
  });

  sleep(1); // User looks at recommendations for 1 second

  // 3. Swipe (Like/Skip)
  const swipePayload = JSON.stringify({
    dishId: `dish-${Math.floor(Math.random() * 500) + 1}`,
    action: Math.random() > 0.5 ? 'like' : 'skip'
  });

  const swipeRes = http.post(`${BASE_URL}/api/recommendation/swipe`, swipePayload, authParams);
  
  check(swipeRes, {
    'swipe status is 200': (r) => r.status === 200,
  });

  sleep(2); // Think time between swipes
}
