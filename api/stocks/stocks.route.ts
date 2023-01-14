import express from 'express';
import { add, getAll, remove, update } from './stocks.controller';

const route = express.Router();

route.get('/', getAll);
route.post('/', add);
route.delete('/:id', remove);
route.patch('/:id', update);

export { route as stocksRoute };