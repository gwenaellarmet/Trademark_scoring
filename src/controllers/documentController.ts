import { Request, Response } from 'express';
import db from '../config/database';
import { Trademark } from '../models/Trademark';
import { Document } from '../models/Document';


export const createDocument = async (req: Request, res: Response) => {
  const { title, mime_type, content, document_date, trademark_id } = req.body;

  if (!title || !mime_type || !content || !document_date || !trademark_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  // TODO: Validate if the document is valid for this trademark if not; return error ?

  let sql = 'INSERT INTO documents (title, mime_type, content, document_date, type, trademark_id) VALUES (?, ?, ?, ?, ?, ?)'

  let type = 'other' // TODO : classify the document before creation

  db.run(
    sql,
    [title, mime_type, content, document_date, type, trademark_id],
     function (err) {
      if (err) return res.status(400).json({ error: err.message });

      // TODO: Update the trademark score since a new document was added

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
  const { title, mime_type, content, document_date, trademark_id } = req.body;

  if (!title || !mime_type || !content || !document_date || !trademark_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  //TODO : Validate if the document is valid for this trademark if not; return error ?

  let sql = 'UPDATE documents SET title = ?, mime_type = ?, content = ?, document_date = ?, type = ?, trademark_id = ? WHERE id = ?'

  let type = 'other' // TODO : classify the document before update

  db.run(
    sql,
    [title, mime_type, content, document_date, type, trademark_id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });

      // TODO: Update the trademark score since a new document was updated

      res.status(201).json({ id: req.params.id, title, mime_type, content, document_date, type, trademark_id });
    }
  );
}

export const deleteDocument = async (req: Request, res: Response) => {
  if (!req.params.id) {
    return res.status(400).json({ error: 'Id is required' });
  }

  let sql = 'DELETE FROM documents WHERE id = ?';

  db.run(sql,
    [req.params.id], 
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });

      // TODO: Update the associated trademark score since a document was deleted

      res.status(204).send();
    });
};