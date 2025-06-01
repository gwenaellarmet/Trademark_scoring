import sqlite3 from 'sqlite3';
import path from 'path';

import { trademarkTable } from './schemas/trademarkTable';
import { documentTable } from './schemas/documentTable';


const db = new sqlite3.Database(path.join(__dirname, '../../trademark_manager.db'));

db.serialize(() => {
  db.run(trademarkTable);
  db.run(documentTable);
});

export default db;