import { getDocumentbyId, classifyDocument, validateDocument } from '../services/documentService';

import db from '../config/database';

jest.mock('../config/database');

describe('documentService', () => {

  describe('getDocumentbyId', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('resolves with a document when found', async () => {
      // Arrange: mock db.get to call callback with a fake row
      let fakeRow = { id: 1, title: 'Test', mime_type: 'text/plain', content: '...', document_date: new Date(), type: 'invoice', trademark_id: 2 };
      (db.get as jest.Mock).mockImplementation((_sql, _params, cb) => cb(null, fakeRow));

      let result = await getDocumentbyId(1);
      expect(result).toEqual(fakeRow);
    });

    it('rejects if not found', async () => {
      (db.get as jest.Mock).mockImplementation((_sql, _params, cb) => cb(null, undefined));
      await expect(getDocumentbyId(1)).rejects.toThrow('Document not found');
    });

    it('rejects on db error', async () => {
      (db.get as jest.Mock).mockImplementation((_sql, _params, cb) => cb(new Error('DB error')));
      await expect(getDocumentbyId(1)).rejects.toThrow('DB error');
    });
  });

  describe('classifyDocument', () => {
    it('classifies as invoice if invoice keywords are present', () => {
      let title = 'Facture pour achat';
      let content = 'Le montant HT est indiqué sur la facture. TVA incluse.';
      expect(classifyDocument(title, content)).toBe('invoice');
    });

    it('classifies as advertisement if advertisement keywords are present', () => {
      let title = 'Nouvelle campagne';
      let content = 'Publicité pour notre produit. Affiche disponible.';
      expect(classifyDocument(title, content)).toBe('advertisement');
    });

    it('classifies as product if product keywords are present', () => {
      let title = 'Catalogue de produits';
      let content = 'Découvrez notre nouvelle offre et référence.';
      expect(classifyDocument(title, content)).toBe('product');
    });

    it('classifies as legal if legal keywords are present', () => {
      let title = 'Procès en cours';
      let content = 'Litige avec INPI concernant le contrat.';
      expect(classifyDocument(title, content)).toBe('legal');
    });

    it('returns "other" if no type reaches 10 points', () => {
      let title = 'Note interne';
      let content = 'Ceci est un document sans mots-clés pertinents.';
      expect(classifyDocument(title, content)).toBe('other');
    });

    it('returns the type with the highest score', () => {
      let title = 'Facture et contrat';
      // 2x 'facture' = 10, 4x 'contrat' = 20 => 'legal'
      let content = 'Facture, facture, contrat, contrat, contrat, contrat';
      expect(classifyDocument(title, content)).toBe('legal');
    });
  });

  describe('validateDocument', () => {
    it('returns true if trademark name is in content (case-insensitive)', () => {
      expect(validateDocument('Apple', 'Ce document concerne apple.')).toBe(true);
    });

    it('returns false if trademark name is not in content', () => {
      expect(validateDocument('Apple', 'Ce document concerne Microsoft.')).toBe(false);
    });
  });
});