import { remove, getAll, add, update } from './groceries.controllers';
import express from 'express';

const route = express.Router();

route.get('/', getAll);
route.post('/', add);
route.delete('/:id', remove);
route.patch('/:id', update);

export { route as groceriesRoute };