import express from 'express';
import './config/database';

const app = express();

app.use(express.json());

export { app };