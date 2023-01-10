import express from 'express';
import { login } from './auth.controller';

const route = express.Router();

route.post('/login', login);

export { route as authRoute };