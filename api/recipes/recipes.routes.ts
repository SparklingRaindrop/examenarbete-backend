import express from 'express';
import { getAll, getOne, remove } from './recipes.controller';

const route = express.Router();

route.get('/', getAll);
route.get('/:id', getOne);
route.delete('/:id', remove);

export { route as recipesRoute };