import { remove, getAll, add, update, generateGroceries } from './groceries.controllers';
import express from 'express';

const route = express.Router();

route.get('/', getAll);
route.post('/', add);
route.post('/generate/', generateGroceries);
route.delete('/:id', remove);
route.patch('/:id', update);

export { route as groceriesRoute };