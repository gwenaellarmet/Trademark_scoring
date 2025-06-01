import { Router } from 'express';
import {
  createTrademark,
  getTrademarks,
  getTrademark,
  updateTrademark,
  deleteTrademark,
} from '../controllers/trademarkController';

const router = Router();

router.post('/', createTrademark);
router.get('/', getTrademarks);
router.get('/:id', getTrademark);
router.put('/:id', updateTrademark);
router.delete('/:id', deleteTrademark);

export default router;