import { removeGrocery, getGroceries, addGrocery, updateGrocery } from './groceries.controllers';
import express from 'express';

const route = express.Router();

route.get('/', getGroceries);
route.post('/', addGrocery);
route.delete('/:id', removeGrocery);
route.patch('/:id', updateGrocery);

export { route as groceriesRoute };