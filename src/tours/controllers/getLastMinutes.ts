import { Request, Response } from "express";
import Schedule from "../../models/scheduleModel";


async function getLastMinutes(req: Request, res: Response) {
    const currentDate = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(currentDate.getDate() + 14);

    const lastMinutesTours = await Schedule.find({
        startDate: { $lte: twoWeeksFromNow },
    });
    
    if(lastMinutesTours.length === 0) {
        res.status(404);
        throw new Error("Last minutes not found");
    };

    res.status(200).json(lastMinutesTours);
};

export default getLastMinutes;