import express from 'express';
import { getAll } from './recipes.controller';

const route = express.Router();

route.get('/', getAll);

export { route as recipesRoute };