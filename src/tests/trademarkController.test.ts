import request from 'supertest';
import { app } from '../app';
import db from '../config/database';

describe('Trademark Controller', () => {
  let trademarkId: number;

  beforeEach((done) => {
    db.serialize(() => {
      db.run('DELETE FROM documents');
      db.run('DELETE FROM trademarks', done);
    });
  });

  it('should create a trademark', async () => {
    const res = await request(app)
      .post('/trademarks')
      .send({
        name: 'TestTrademark',
        registration_date: '2024-01-01'
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('TestTrademark');
  });

  it('should get all trademarks', async () => {
    // Insert a trademark first
    let postRes = await request(app)
    .post('/trademarks')
    .send({
      name: 'Trademark',
      registration_date: '2024-02-01'
    });
    const res = await request(app).get('/trademarks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a trademark by id', async () => {
    // Insert a trademark first
    let postRes = await request(app)
    .post('/trademarks')
    .send({
      name: 'Trademark',
      registration_date: '2024-02-01'
    });
    const res = await request(app).get(`/trademarks/${postRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(postRes.body.id);
    expect(res.body.name).toBe('Trademark');
  });

  it('should update a trademark', async () => {
    // Insert a trademark first
    let postRes = await request(app)
    .post('/trademarks')
    .send({
      name: 'Trademark',
      registration_date: '2024-02-01'
    });
    let res = await request(app)
      .put(`/trademarks/${postRes.body.id}`)
      .send({
        name: 'TrademarkUpdated',
        registration_date: '2024-02-01'
      });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('TrademarkUpdated');
  });

  it('should delete a trademark', async () => {
    // Insert a trademark first
    let postRes = await request(app)
    .post('/trademarks')
    .send({
      name: 'Trademark',
      registration_date: '2024-02-01'
    });
    const res = await request(app).delete(`/trademarks/${postRes.body.id}`);
    expect(res.status).toBe(204);
    // Confirm it's gone
    const getRes = await request(app).get(`/trademarks/${postRes.body.id}`);
    expect(getRes.status).toBe(404);
  });
});