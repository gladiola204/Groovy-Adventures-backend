import { Request, Response } from "express";
import Tour from "../../../models/tourModel";
import deleteImages from "../utils/deleteImages";

async function deleteTour(req: Request, res: Response) {
    const { slug } = req.params;
    
    const tour = await Tour.findOne({ slug });
    
    if(tour === null) {
        res.status(404)
        throw new Error("Tour not found");
    };

    await deleteImages(res, tour.images);

    await tour.deleteOne();
    
    res.status(200).json({ 
        success: true,
        message: 'Tour deleted succesfully' 
    });
}

export default deleteTour;