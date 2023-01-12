import express from 'express';
import { add, getAll, getOne, update } from './item.controller';

const route = express.Router();

route.get('/', getAll);
route.get('/:id', getOne);
route.post('/', add);
route.patch('/:id', update);

export { route as itemsRoute };