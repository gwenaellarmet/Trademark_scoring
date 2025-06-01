/*
Each type has an associated list of keywords.  
Each keyword found in the document's `title` or `content` adds **+5 points**.

| Type         | Keywords (in `title` or `content`)                 |
|--------------|----------------------------------------------------|
| invoice      | `facture`, `invoice`, `HT`, `TTC`, `TVA`           |
| advertisement| `pub`, `publicité`, `campagne`, `affiche`          |
| product      | `produit`, `catalogue`, `offre`, `référence`       |
| legal        | `contrat`, `procès`, `litige`, `inpi`              |

- The type with the **highest score** is selected
- If no type reaches **10 points**, it is classified as `other`
*/

const KEYWORDS = {
    invoice: ['facture', 'invoice', 'HT', 'TTC', 'TVA'],
    advertisement: ['pub', 'publicité', 'campagne', 'affiche'],
    product: ['produit', 'catalogue', 'offre', 'référence'],
    legal: ['contrat', 'procès', 'litige', 'inpi'],
  };

export const classifyDocument = (documentTitle: string, documentContent: string): string => {
  let maxScore = 0;
  let selectedType = 'other'; // Default classification

  for (let [type, keywords] of Object.entries(KEYWORDS)) {
    // Build a regex that matches any keyword as a whole word, global and case-insensitive
    let regex = new RegExp('\\b(' + keywords.join('|') + ')\\b', 'gi');

    let matches = (documentTitle + ' ' + documentContent).match(regex) || [];
    let score = matches.length * 5;

    if (score > maxScore && score >= 10) {
      maxScore = score;
      selectedType = type;
    }
  }
  return selectedType;
}

// > ⚠️ A document is only valid if the **trademark name appears in its content**

export const validateDocument = (trademarkName: string, documentContent: string): boolean => {
  return (documentContent.toLowerCase().includes(trademarkName.toLowerCase()))
}