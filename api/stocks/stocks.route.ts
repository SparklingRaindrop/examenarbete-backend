import express from 'express';
import { getAll } from './stocks.controller';

const route = express.Router();

route.get('/', getAll);

export { route as stocksRoute };