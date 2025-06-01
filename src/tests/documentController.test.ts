import request from 'supertest';
import { app } from '../app';
import db from '../config/database';

describe('Document Controller', () => {
  let trademarkId: number;

  beforeEach((done) => {
    // Clean up and create a trademark for foreign key
    db.serialize(() => {
      db.run('DELETE FROM documents');
      db.run('DELETE FROM trademarks');
      db.run(
        'INSERT INTO trademarks (name, registration_date, score) VALUES (?, ?, ?)',
        ['TestMark', '2020-01-01', 0],
        function (err) {
          trademarkId = this.lastID;
          done();
        }
      );
    });
  });

  it('should create a document', async () => {
    let res = await request(app)
      .post('/documents')
      .send({
        title: 'Facture',
        mime_type: 'text/plain',
        content: 'facture pour TestMark',
        document_date: '2024-01-01',
        trademark_id: trademarkId
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('Facture');
  });

  it('should get all documents', async () => {
    let res = await request(app).get('/documents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a document by id', async () => {
    // Insert a document first
    let postRes = await request(app)
      .post('/documents')
      .send({
        title: 'Contrat',
        mime_type: 'application/pdf',
        content: 'contrat pour TestMark',
        document_date: '2024-02-01',
        trademark_id: trademarkId
      });

    let res = await request(app).get(`/documents/${postRes.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Contrat');
  });

  it('should update a document', async () => {
    // Insert a document first
    let postRes = await request(app)
    .post('/documents')
    .send({
      title: 'Produit',
      mime_type: 'application/pdf',
      content: 'produit pour TestMark',
      document_date: '2024-03-01',
      trademark_id: trademarkId
    });
    let res = await request(app)
      .put(`/documents/${postRes.body.id}`)
      .send({
        title: 'Produit Modifié',
        mime_type: 'application/pdf',
        content: 'produit modifié pour TestMark',
        document_date: '2024-03-01',
        trademark_id: trademarkId
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Produit Modifié');
  });

  it('should delete a document', async () => {
    // Insert a document first
    let postRes = await request(app)
    .post('/documents')
    .send({
      title: 'A supprimer',
      mime_type: 'application/pdf',
      content: 'document à supprimer pour TestMark',
      document_date: '2024-04-01',
      trademark_id: trademarkId
    });
    
    let res = await request(app).delete(`/documents/${postRes.body.id}`);
    expect(res.status).toBe(204);
    // Confirm it's gone
    const getRes = await request(app).get(`/documents/${postRes.body.id}`);
    expect(getRes.status).toBe(404);
  });
});