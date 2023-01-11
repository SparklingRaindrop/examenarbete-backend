import express from 'express';
import { getAll } from './plans.controller';

const route = express.Router();

route.get('/', getAll);

export { route as plansRoute };