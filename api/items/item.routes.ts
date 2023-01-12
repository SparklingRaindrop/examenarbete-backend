import express from 'express';
import { add, getAll, getOne } from './item.controller';

const route = express.Router();

route.get('/', getAll);
route.get('/:id', getOne);
route.post('/', add);

export { route as itemsRoute };