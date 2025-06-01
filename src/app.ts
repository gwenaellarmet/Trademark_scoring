import express from 'express';
import './config/database';

import trademarkRoutes from './routes/trademarkRoutes';

const app = express();

app.use(express.json());

app.use('/trademarks', trademarkRoutes);

export { app };