import express from 'express';
import { getAll, remove, getOne } from './plans.controller';

const route = express.Router();

route.get('/', getAll);
route.delete('/:id', remove);
route.get('/:id', getOne);

export { route as plansRoute };