import express from 'express';
import { add, getAll, getOne, remove, update } from './recipes.controller';

const route = express.Router();

route.get('/', getAll);
route.get('/:id', getOne);
route.post('/', add);
route.patch('/:id', update);
route.delete('/:id', remove);

export { route as recipesRoute };