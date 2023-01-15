import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import { checkToken } from '../middleware/auth';
import { handleError } from '../middleware/errorHandler';

import { groceriesRoute } from '../api/groceries';
import { authRoute } from '../api/auth/auth.routes';
import { itemsRoute } from '../api/items/item.routes';
import { recipesRoute } from '../api/recipes/recipes.routes';
import { plansRoute } from '../api/plans/plans.routes';
import { unitsRoute } from '../api/units/units.routes';
import { stocksRoute } from '../api/stocks/stocks.route';

dotenv.config();

export class Server {
    port = process.env.PORT || 4500;
    clientUrl = process.env.CLIENT_URL;
    app: Application = express();

    constructor() {
        const corsOptions = {
            origin: this.clientUrl,
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        };

        // middleware
        this.app.use(bodyParser.json());
        this.app.use(cors(corsOptions));

        // routes
        this.app.use('/groceries', checkToken, groceriesRoute);
        this.app.use('/items', checkToken, itemsRoute);
        this.app.use('/recipes', checkToken, recipesRoute);
        this.app.use('/plans', checkToken, plansRoute);
        this.app.use('/units', checkToken, unitsRoute);
        this.app.use('/stocks', checkToken, stocksRoute);
        this.app.use('/auth', authRoute);

        // error handler
        this.app.use(handleError);

        this.app.listen(this.port, (err?: Error) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('\x1b[32m%s\x1b[0m', `[server]: Server is running on port:${this.port}`);
        });
    }
}