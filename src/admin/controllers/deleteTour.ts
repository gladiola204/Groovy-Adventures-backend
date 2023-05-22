import { Request, Response } from "express";
import Tour from "../../models/tourModel";
import deleteImages from "./utils/deleteImages";

async function deleteTour(req: Request, res: Response) {
    const { slug } = req.params;
    
    const tour = await Tour.findOne({ slug });
    
    if(tour === null) {
        res.status(404)
        throw new Error("Tour not found");
    };

    const publicIds: string[] = [];

    tour.images.map((image) => {
        publicIds.push(image.fileData.filePublicId);
    });

    deleteImages(res, publicIds.join(','));
    
    res.status(200).json({ 
        success: true,
        message: 'Tour deleted succesfully' 
    });
}

export default deleteTour;