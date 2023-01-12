import express from 'express';
import { createNewUser, login } from './auth.controller';

const route = express.Router();

route.post('/login', login);
route.post('/user', createNewUser);

export { route as authRoute };