import express from 'express';
import { getAll, remove } from './plans.controller';

const route = express.Router();

route.get('/', getAll);
route.delete('/:id', remove);

export { route as plansRoute };