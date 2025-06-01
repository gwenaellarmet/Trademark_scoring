// @ts-ignore: access private function for test
import * as trademarkService from '../services/trademarkService'; // @ts-ignore: access private function for test
import { getDocumentsByTrademarkId } from '../services/documentService';

import db from '../config/database';

import { Document } from '../models/Document';
import { Trademark } from '../models/Trademark';


jest.mock('../config/database');
let mockedDb = db as jest.Mocked<typeof db>;

// Mock getDocumentsByTrademarkId
jest.mock('../services/documentService', () => ({
  getDocumentsByTrademarkId: jest.fn(),
}));

describe('trademarkService', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('getTrademarkbyId', () => {
    it('resolves with a trademark when found', async () => {
      const fakeRow = { id: 1, name: 'Test', registration_date: new Date().toISOString() };
      mockedDb.get.mockImplementation((_sql, _params, cb) => cb(null, fakeRow));
      const result = await trademarkService.getTrademarkbyId(1);
      expect(result).toEqual(fakeRow);
    });

    it('rejects if not found', async () => {
      mockedDb.get.mockImplementation((_sql, _params, cb) => cb(null, undefined));
      await expect(trademarkService.getTrademarkbyId(1)).rejects.toThrow('Trademark not found');
    });

    it('rejects on db error', async () => {
      mockedDb.get.mockImplementation((_sql, _params, cb) => cb(new Error('DB error')));
      await expect(trademarkService.getTrademarkbyId(1)).rejects.toThrow('DB error');
    });
  });

  describe('updateTrademarkScore', () => {
    it('updates the score for a trademark', async () => {
      const trademark = { id: 1, name: 'Test', registration_date: new Date().toISOString() } as unknown as Trademark;
      const fakeScore = 42;
      jest.spyOn(trademarkService, 'scoreTrademark').mockResolvedValue(fakeScore);
      mockedDb.run.mockImplementation((_sql, _params, cb) => cb(null));
      await expect(trademarkService.updateTrademarkScore(trademark)).resolves.toBeUndefined();
      expect(mockedDb.run).toHaveBeenCalledWith(
        expect.any(String),
        [fakeScore, trademark.id],
        expect.any(Function)
      );
    });

    it('rejects if trademark id is missing', async () => {
      const trademark = { name: 'Test', registration_date: new Date().toISOString() } as unknown as Trademark;
      await expect(trademarkService.updateTrademarkScore(trademark)).rejects.toThrow('Trademark ID is required');
    });

    it('rejects on db error', async () => {
      const trademark = { id: 1, name: 'Test', registration_date: new Date().toISOString() } as unknown as Trademark;
      jest.spyOn(trademarkService, 'scoreTrademark').mockResolvedValue(10);
      mockedDb.run.mockImplementation((_sql, _params, cb) => cb(new Error('DB error')));
      await expect(trademarkService.updateTrademarkScore(trademark)).rejects.toThrow('DB error');
    });
  });

  describe('scoreTrademark', () => {
    it('calculates the correct score', async () => {
      const trademark = { id: 1, name: 'Test', registration_date: new Date('2020-01-01').toISOString() } as unknown as Trademark;
      const docs: Document[] = [
        { id: 1, title: '', mime_type: '', content: '', document_date: new Date('2020-01-01'), type: 'invoice', trademark_id: 1 },
        { id: 2, title: '', mime_type: '', content: '', document_date: new Date('2021-01-01'), type: 'advertisement', trademark_id: 1 },
        { id: 3, title: '', mime_type: '', content: '', document_date: new Date('2022-01-01'), type: 'product', trademark_id: 1 },
        { id: 4, title: '', mime_type: '', content: '', document_date: new Date('2023-01-01'), type: 'legal', trademark_id: 1 },
        { id: 5, title: '', mime_type: '', content: '', document_date: new Date('2023-01-01'), type: 'other', trademark_id: 1 },
      ];
      (getDocumentsByTrademarkId as jest.Mock).mockResolvedValue(docs);

      const score = await trademarkService.scoreTrademark(trademark);

      const yearsSinceRegistration = new Date().getFullYear() - 2020 + 1;
      const yearsCovered = 4;
      const expectedTimeCoverage = Math.min((yearsCovered / yearsSinceRegistration) * 30, 30);
      const expectedScore = 40 + expectedTimeCoverage + 10;

      expect(score).toBeCloseTo(expectedScore);
    });


    it('calculates the correct score with no documents', async () => {
      const trademark = { id: 1, name: 'Test', registration_date: new Date('2020-01-01').toISOString() } as unknown as Trademark;
      const docs: Document[] = [];
      (getDocumentsByTrademarkId as jest.Mock).mockResolvedValue(docs);

      const score = await trademarkService.scoreTrademark(trademark);

      expect(score).toBeCloseTo(0);
    });
  });

  describe('calculateKeyDocumentScore', () => {
    it('returns 0 if no key types', () => {
      const docs: Document[] = [
        { id: 1, title: '', mime_type: '', content: '', document_date: new Date(), type: 'other', trademark_id: 1 },
      ];

      expect(trademarkService._calculateKeyDocumentScore(docs)).toBe(0);
    });

    it('returns 10 per key types present', () => {
      const docs: Document[] = [
        { id: 1, title: '', mime_type: '', content: '', document_date: new Date(), type: 'invoice', trademark_id: 1 },
        { id: 2, title: '', mime_type: '', content: '', document_date: new Date(), type: 'advertisement', trademark_id: 1 },
      ];

      expect(trademarkService._calculateKeyDocumentScore(docs)).toBe(20);
    });

    it('returns 40 if all key types present', () => {
      const docs: Document[] = [
        { id: 1, title: '', mime_type: '', content: '', document_date: new Date(), type: 'invoice', trademark_id: 1 },
        { id: 2, title: '', mime_type: '', content: '', document_date: new Date(), type: 'advertisement', trademark_id: 1 },
        { id: 3, title: '', mime_type: '', content: '', document_date: new Date(), type: 'product', trademark_id: 1 },
        { id: 4, title: '', mime_type: '', content: '', document_date: new Date(), type: 'legal', trademark_id: 1 },
      ];

      expect(trademarkService._calculateKeyDocumentScore(docs)).toBe(40);
    });
  });

  describe('calculateTimeCoverageScore', () => {
    it('returns correct time coverage score', () => {
      const trademark = { id: 1, name: 'Test', registration_date: new Date('2020-01-01').toISOString() } as unknown as Trademark;
      const docs: Document[] = [
        { id: 1, title: '', mime_type: '', content: '', document_date: new Date('2020-01-01'), type: 'invoice', trademark_id: 1 },
        { id: 2, title: '', mime_type: '', content: '', document_date: new Date('2021-01-01'), type: 'invoice', trademark_id: 1 },
      ];

      const score = trademarkService._calculateTimeCoverageScore(trademark, docs);
      const yearsSinceRegistration = new Date().getFullYear() - 2020 + 1;
      const expected = Math.min((2 / yearsSinceRegistration) * 30, 30);

      expect(score).toBeCloseTo(expected, 1);
    });
  });

  describe('calculateDocumentVolumeScore', () => {
    it('returns 2 points per document, capped at 30', () => {
      const docs: Document[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        title: '', mime_type: '', content: '', document_date: new Date(), type: 'invoice', trademark_id: 1,
      }));

      expect(trademarkService._calculateDocumentVolumeScore(docs)).toBe(20);
    });
    it('returns 2 points per document, capped at 30', () => {
      const docs: Document[] = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        title: '', mime_type: '', content: '', document_date: new Date(), type: 'invoice', trademark_id: 1,
      }));

      expect(trademarkService._calculateDocumentVolumeScore(docs)).toBe(30);
    });
  });
});