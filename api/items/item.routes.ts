import express from 'express';
import { getItems } from './item.model';

const route = express.Router();

route.get('/', getItems);

export { route as itemsRoute };