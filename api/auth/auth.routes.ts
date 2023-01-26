import express from 'express';
import { checkToken } from '../../middleware/auth';
import { createNewUser, login, logout, refresh, remove, update } from './auth.controller';

const route = express.Router();

route.post('/login', login);
route.post('/refresh', refresh);
route.post('/user', createNewUser);
route.post('/logout', checkToken, logout);
route.delete('/user', checkToken, remove);
route.patch('/user', checkToken, update);

export { route as authRoute };