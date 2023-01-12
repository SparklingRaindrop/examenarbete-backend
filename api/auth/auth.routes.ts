import express from 'express';
import { createNewUser, login, remove } from './auth.controller';

const route = express.Router();

route.post('/login', login);
route.post('/user', createNewUser);
route.delete('/user', remove);

export { route as authRoute };