import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { groceriesRoute } from '../api/groceries';

export class Server {
    port = process.env.PORT || 4500;
    clientUrl = process.env.CLIENT_URL;

    constructor() {
        const corsOptions = {
            origin: this.clientUrl,
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        }
        dotenv.config();

        const app: Application = express();
        // middleware
        app.use(cors(corsOptions));
        // routes
        app.use('/groceries', groceriesRoute);

        app.listen(this.port, (err?: Error) => {
            if (err) {
                console.error(err)
                return;
            }
            console.log('\x1b[32m%s\x1b[0m', `[server]: Server is running on port:${this.port}`);
        });
    }
}