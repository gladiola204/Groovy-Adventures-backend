import { Request, Response } from "express";
import Tour from "../../../models/tour/tourModel";
import deleteImages from "../utils/deleteImages";
import { startSession } from "mongoose";
import Schedule from "../../../models/schedule/scheduleModel";

async function deleteTour(req: Request, res: Response) {
    const { slug } = req.params;

    const session = await startSession();
    session.startTransaction();

    try {
        const tour = await Tour.findOne({ slug }).session(session);
    
        if(tour === null) {
            res.status(404)
            throw new Error("Tour not found");
        };
        
        const scheduleIdArray = [...tour.scheduleIds];
        for (const singleScheduleId of scheduleIdArray) {
            await Schedule.findByIdAndDelete(singleScheduleId).session(session);
        };
        await deleteImages(res, tour.images, session);
        
        await tour.deleteOne();
        
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    }
    
    res.status(200).json({ 
        success: true,
        message: 'Tour deleted succesfully' 
    });
}

export default deleteTour;