import { removeItem, getItems } from "./groceries.controllers";
import express from 'express';

const route = express.Router();

route.get('/', getItems);
route.delete('/:itemId', removeItem);

export { route as groceriesRoute };