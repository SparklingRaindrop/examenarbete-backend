import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import { groceriesRoute } from '../api/groceries';

export class Server {
    port = process.env.PORT || 4500;
    clientUrl = process.env.CLIENT_URL;
    app: Application = express();

    constructor() {
        const corsOptions = {
            origin: this.clientUrl,
            optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
        };
        dotenv.config();

        // middleware
        this.app.use(bodyParser.json());
        this.app.use(cors(corsOptions));

        // routes
        this.app.use('/groceries', groceriesRoute);

        this.app.listen(this.port, (err?: Error) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('\x1b[32m%s\x1b[0m', `[server]: Server is running on port:${this.port}`);
        });
    }
}