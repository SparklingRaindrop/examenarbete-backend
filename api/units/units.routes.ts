import express from 'express';
import { add, getAll, remove } from './units.controller';

const route = express.Router();

route.get('/', getAll);
route.delete('/:id', remove);
route.post('/', add);

export { route as unitsRoute };