import express from 'express';
import { getAll, remove, getOne, add } from './plans.controller';

const route = express.Router();

route.get('/', getAll);
route.delete('/:id', remove);
route.get('/:id', getOne);
route.post('/', add);

export { route as plansRoute };