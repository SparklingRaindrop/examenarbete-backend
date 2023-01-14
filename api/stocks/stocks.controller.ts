import { Request, Response } from 'express';
import Status from '../../types/api';
import { getStocks } from './stocks.model';

export async function getAll(req: Request, res: Response): Promise<void> {
    const { id } = req.user;

    try {
        const stocks = await getStocks(id);
        if (!stocks || stocks.length === 0) {
            // When nothing matches return an empty array
            res.send({ recipes: [] });
            return;
        }

        res.send(stocks);
    } catch (error) {
        console.error(error);
        res.status(Status.ServerError).send({
            error: 'Something occurred on the server.'
        });
    }
}