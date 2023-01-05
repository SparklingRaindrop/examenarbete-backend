import { removeGrocery, getGroceries, addGrocery, updateGrocery } from './groceries.controllers';
import express from 'express';

const route = express.Router();

route.get('/', getGroceries);
route.delete('/:itemId', removeGrocery);
route.post('/', addGrocery);
route.patch('/:itemId', updateGrocery);

export { route as groceriesRoute };