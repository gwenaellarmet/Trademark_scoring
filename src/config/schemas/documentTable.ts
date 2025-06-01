export const documentTable = `
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    content TEXT NOT NULL,
    document_date TEXT NOT NULL,
    type TEXT NOT NULL,
    trademark_id INTEGER NOT NULL,
    FOREIGN KEY (trademark_id) REFERENCES trademarks(id) ON DELETE CASCADE
  )
`;