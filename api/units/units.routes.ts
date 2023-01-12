import express from 'express';
import { getAll } from './units.controller';

const route = express.Router();

route.get('/', getAll);

export { route as unitsRoute };