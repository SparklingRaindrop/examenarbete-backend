import express from 'express';
import { checkToken } from '../../middleware/auth';
import { createNewUser, login, logout, remove, update } from './auth.controller';

const route = express.Router();

route.post('/login', login);
route.post('/logout', logout);
route.post('/user', createNewUser);
route.delete('/user', checkToken, remove);
route.patch('/user', checkToken, update);

export { route as authRoute };