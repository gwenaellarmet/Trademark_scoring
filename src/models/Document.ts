export type DocumentType = 'invoice' 
                         | 'advertisement' 
                         | 'product' 
                         | 'legal' 
                         | 'other';

export interface Document {
  id: number;
  title: string;
  mime_type: string;
  content: string;
  document_date: Date;
  type: DocumentType;
  trademark_id: number;
}