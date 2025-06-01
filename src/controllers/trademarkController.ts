import { Request, Response } from 'express';
import db from '../config/database';

import { Trademark } from '../models/Trademark';
import { scoreTrademark } from '../services/trademarkService';

export const createTrademark = async (req: Request, res: Response) => {
  let { name, registration_date } = req.body;
  
  if (name === undefined || registration_date === undefined) {
    return res.status(400).json({ error: 'Name and registration date are required' });
  }

  let score = 0; // Initial score is always 0 since there is no documents on creation
  let sql = 'INSERT INTO trademarks (name, registration_date, score) VALUES (?, ?, ?)';

  db.run(sql, 
    [name, registration_date, score], 
    function (err: Error | null) {
      if (err) res.status(400).json({ error: err });
      res.status(201).json(this);
    }
  );
}

export const getTrademarks = async (req: Request, res: Response) => {
  let sql = 'SELECT * FROM trademarks';

  db.all(sql,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json(rows);
  });
};

export const getTrademark = async (req: Request, res: Response) => {
  if (req.params.id === undefined) {
    return res.status(400).json({ error: 'Id is required' });
  } 
  
  let sql = 'SELECT * FROM trademarks WHERE id = ?';

  db.get(sql,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Not found' });

      res.json(row);
    });
};

export const updateTrademark = async (req: Request, res: Response) => {
  let { name, registration_date } = req.body;
  
  if (name === undefined || registration_date === undefined || req.params.id === undefined) {
    return res.status(400).json({ error: 'Name, registration date and id are required' });
  }

  let score = scoreTrademark(req.body as Trademark);
  
  let sql = 'UPDATE trademarks SET name = ?, registration_date = ?, score = ? WHERE id = ?';

  db.run(sql, 
    [name, registration_date, score, req.params.id], 
    function (err) {
      if (err) res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });

      res.status(201).json(this);
    }
  );
}

export const deleteTrademark = async (req: Request, res: Response) => {
  if (req.params.id === undefined) {
    return res.status(400).json({ error: 'Id is required' });
  }
 
  // TODO: Check if the trademark has associated documents before deleting; if so : error or delete all documents ? need to think about it

  let sql = 'DELETE FROM trademarks WHERE id = ?';

  db.run(sql, 
    [req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Not found' });

      res.status(204).send();
    });
};