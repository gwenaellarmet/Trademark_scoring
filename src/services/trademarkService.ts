import db from '../config/database';
import { Trademark } from "../models/Trademark";
import { Document } from '../models/Document';  

import { getDocumentsByTrademarkId } from './documentService';

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


// Start of scoring functions
export const updateTrademarkScore = async (trademark: Trademark): Promise<void> => {
  let score = await scoreTrademark(trademark);

  return new Promise((resolve, reject) => {
    if (!trademark.id) {
      return reject(new Error('Trademark ID is required'));
    }

    let sql = 'UPDATE trademarks SET score = ? WHERE id = ?';

    db.run(sql, 
      [score, trademark.id], 
      function (err) {
        if (err) return reject(err);
        resolve();
      });
  });
};

/*

### ✅ Final Score

```txt
score = key_documents + time_coverage + document_count
```
*/
export const scoreTrademark = async (trademark: Trademark): Promise<number> => {
  if (!trademark.id) {
    throw new Error('Trademark ID is required');
  }
  return getDocumentsByTrademarkId(trademark.id).then((docs) => {
    let score = 0;
    // Presence of Key Document Types (max 40 points)
    score += _calculateKeyDocumentScore(docs);

    // Time Coverage (max 30 points)
    score += _calculateTimeCoverageScore(trademark, docs);

    // Document Volume (max 30 points)
    score += _calculateDocumentVolumeScore(docs);

    return score;
  });
}

/*

### 1. ✅ Presence of Key Document Types (max 40 points)

Give **+10 points** for each of the following types present at least once:

- `invoice`
- `advertisement`
- `product`
- `legal`

→ max: **40 points**  
The `other` type gives **0 points**
*/
const KEY_TYPES = ['invoice', 'advertisement', 'product', 'legal']

export const _calculateKeyDocumentScore = (documents: Document[]): number => {
  let documentsPresent: String[] = [];

  for (let doc of documents) {
    if (KEY_TYPES.includes(doc.type) && !documentsPresent.includes(doc.type)) {
      documentsPresent.push(doc.type);
    }
  }

  return Math.min(documentsPresent.length * 10, 40); // Capped at 40 points
}

/*
### 2. 📅 Time Coverage (max 30 points)

- Compute the number of **calendar years** between `date_depot` and today (inclusive)
- Spread the **30 points** across those years
- Give points based on the number of **distinct years covered** by documents

> Example:  
> 4 years since registration, 2 years covered → (2/4) × 30 = **15 points**
*/
export const _calculateTimeCoverageScore = (trademark: Trademark, documents: Document[]): number => {
  let yearsSinceRegistration = new Date().getFullYear() - new Date(trademark.registration_date).getFullYear() + 1;
  
  let yearsCovered: String[] = [];

  for (let doc of documents) {
    let doc_date = new Date(doc.document_date);
    if (!yearsCovered.includes(doc_date.getFullYear().toString())) {
      yearsCovered.push(doc_date.getFullYear().toString());
    }
  }

  return Math.min(yearsCovered.length / yearsSinceRegistration * 30, 30); // Capped at 30 points
}

/*
### 3. 📦 Document Volume (max 30 points)

- **+2 points per document**, up to a maximum of **15 documents**

> → 8 documents = 16 points  
> → 20 documents = **30 points max**
*/
export const _calculateDocumentVolumeScore = (documents: Document[]): number => {
  return Math.min(documents.length * 2, 30); // Capped at 30 points
}