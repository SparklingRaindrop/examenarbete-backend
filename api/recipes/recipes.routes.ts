import express from 'express';
import { getAll, getOne } from './recipes.controller';

const route = express.Router();

route.get('/', getAll);
route.get('/:id', getOne);

export { route as recipesRoute };