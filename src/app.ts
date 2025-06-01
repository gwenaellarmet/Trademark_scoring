import express from 'express';
import './config/database';

import trademarkRoutes from './routes/trademarkRoutes';
import documentRoutes from './routes/trademarkRoutes';

const app = express();

app.use(express.json());

app.use('/trademarks', trademarkRoutes);
app.use('/documents', documentRoutes);

export { app };