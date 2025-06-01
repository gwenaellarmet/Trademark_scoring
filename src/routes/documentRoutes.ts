import { Router } from 'express';
import {
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from '../controllers/documentController';

const router = Router();

router.post('/', createDocument);
router.get('/', getDocuments);
router.get('/:id', getDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;