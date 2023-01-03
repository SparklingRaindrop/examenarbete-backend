import { removeItem, getItems, addItem } from './groceries.controllers';
import express from 'express';

const route = express.Router();

route.get('/', getItems);
route.delete('/:itemId', removeItem);
route.post('/', addItem);

export { route as groceriesRoute };