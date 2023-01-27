import express from 'express';
import { add, getAll, getOne, remove, update } from './item.controller';

const route = express.Router();

route.get('/', getAll);
route.get('/:id', getOne);
route.post('/', add);
route.delete('/:id', remove);
route.patch('/:id', update);

export { route as itemsRoute };