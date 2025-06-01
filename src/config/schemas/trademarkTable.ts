export const trademarkTable = `
  CREATE TABLE IF NOT EXISTS trademarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    registration_date TEXT NOT NULL,
    score INTEGER DEFAULT 0
  )
`;