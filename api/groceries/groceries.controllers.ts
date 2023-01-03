import { Request, Response } from "express";
import { getAll } from "./groceries.model";

async function getItems(req: Request, res: Response): Promise<void> {
    const data = await getAll();
    res.json(data);
}

export {
    getItems,
}