import express from 'express';
import { getAll } from './item.controller';

const route = express.Router();

route.get('/', getAll);

export { route as itemsRoute };