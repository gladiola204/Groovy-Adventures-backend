import { Request, Response } from "express";
import Tour from "../../models/tour/tourModel";

async function getBestsellers(req: Request, res: Response) {
    const numberOfBestsellers = Number(req.body.numberOfBestsellers) || 3;

    const bestsellers = await Tour.aggregate([
      { $sort: { purchasesCount: -1 } },
      { $limit: numberOfBestsellers }
    ]);

    res.status(200).json(bestsellers);
}

export default getBestsellers;