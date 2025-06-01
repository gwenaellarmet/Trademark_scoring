import db from '../config/database';
import { Trademark } from "../models/Trademark";  

export const getTrademarkbyId = (id: number): Promise<Trademark> => {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM trademarks WHERE id = ?',
      [id],
      (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Trademark not found'));

        resolve(row as Trademark);
      }
    );
  });
};
