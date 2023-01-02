import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { shoppingListsRoute } from './api/shoppingLists/shoppingLists.routes';

const port = process.env.PORT || 4500;
const clientUrl = process.env.CLIENT_URL;

const corsOptions = {
    origin: clientUrl,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
dotenv.config();
const app: Application = express();

// middleware
app.use(cors(corsOptions));

// routes
app.use('/shoppingList', shoppingListsRoute);

app.listen(port, () => {
    console.log('\x1b[32m%s\x1b[0m', `[server]: Server is running on port:${port}`);
});