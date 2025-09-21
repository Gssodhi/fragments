// tests/units/app.test.js
const request = require('supertest');
const app = require('../../src/app'); 

describe('App 404 handler', () => {
  test('should return 404 JSON response for unknown route', async () => {
    const res = await request(app).get('/this-route-does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.message).toBe('not found');
    expect(res.body.error.code).toBe(404);
    
  });
});
