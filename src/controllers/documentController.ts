import { Request, Response } from 'express';
import db from '../config/database';

import { classifyDocument, 
         validateDocument,
         validateDocumentDate,
         getDocumentbyId } from '../services/documentService';
import { getTrademarkbyId,
         updateTrademarkScore } from '../services/trademarkService';

export const createDocument = async (req: Request, res: Response) => {
  const { title, mime_type, content, document_date, trademark_id } = req.body;

  if (!title || !mime_type || !content || !document_date || !trademark_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  let trademark = await getTrademarkbyId(trademark_id);
  if (!validateDocument(trademark.name, content) || 
      !validateDocumentDate(new Date(trademark.registration_date), new Date(document_date))) return res.status(400).json({ error: 'Invalid Document' });


  let sql = 'INSERT INTO documents (title, mime_type, content, document_date, type, trademark_id) VALUES (?, ?, ?, ?, ?, ?)'

  let type = classifyDocument(title, content);

  db.run(
    sql,
    [title, mime_type, content, document_date, type, trademark_id],
     async function (err) {
      if (err) return res.status(400).json({ error: err.message });

      await updateTrademarkScore(trademark);

      res.status(201).json({ id: this.lastID, title, mime_type, content, document_date, type, trademark_id });
    }
  );
}

export const getDocuments = async (req: Request, res: Response) => {
  let sql = 'SELECT * FROM documents';

  db.all(sql,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      res.json(rows);
    });
};

export const getDocument = async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'Id is required' });
  }

  let sql = 'SELECT * FROM documents WHERE id = ?';

  db.get(sql,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Not found' });

      res.json(row);
    });
};

export const updateDocument = async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'Id is required' });
  }
  
  const { title, mime_type, content, document_date, trademark_id } = req.body;

  if (!title || !mime_type || !content || !document_date || !trademark_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  let trademark = await getTrademarkbyId(trademark_id);
  if (!validateDocument(trademark.name, content) 
   || !validateDocumentDate(new Date(trademark.registration_date), new Date(document_date))) return res.status(400).json({ error: 'Invalid Document' });

  let sql = 'UPDATE documents SET title = ?, mime_type = ?, content = ?, document_date = ?, type = ?, trademark_id = ? WHERE id = ?'

  let type = classifyDocument(title, content);

  db.run(
    sql,
    [title, mime_type, content, document_date, type, trademark_id, req.params.id],
    async function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });

      await updateTrademarkScore(trademark);

      res.status(201).json({ id: req.params.id, title, mime_type, content, document_date, type, trademark_id });
    }
  );
}

export const deleteDocument = async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'Id is required' });
  }

  let document = await getDocumentbyId(req.params.id as unknown as number);
  let trademark = await getTrademarkbyId(document.trademark_id);

  let sql = 'DELETE FROM documents WHERE id = ?';

  db.run(sql,
    [req.params.id], 
    async function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });

      await updateTrademarkScore(trademark);

      res.status(204).send();
    });
};