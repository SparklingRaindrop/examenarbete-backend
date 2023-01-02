import { Request, Response } from "express";

async function getItems(req: Request, res: Response): Promise<void> {
    res.send('Test!!!');
}

export {
    getItems,
}