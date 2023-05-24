import { Request, Response } from "express";
import Tour from "../../models/tourModel";

async function getTour(req: Request, res: Response) {
    const { slug } = req.params;

    const tour = await Tour.findOne({ slug });
    
    if(tour === null) {
        res.status(404);
        throw new Error("Tour not found");
    };

    res.status(200).json(tour);
};

export default getTour;