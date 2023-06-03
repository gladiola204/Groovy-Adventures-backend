import { Request, Response } from "express";
import Tour from "../../models/tour/tourModel";
import User from "../../models/userModel";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Schedule from "../../models/schedule/scheduleModel";
import { ObjectId, startSession } from "mongoose";

async function purchaseTour(req: Request, res: Response) {
    const { purchaseData } = req.body;
    const arrayOfBoughtTourId: ObjectId[] = [];

    checkDataExistence(res, [req.body, purchaseData], 'Please fill in purchaseData', true);
    
    const session = await startSession();
    session.startTransaction();

    try {
        for (const singlePurchase of purchaseData) {
            const { scheduleId, numberOfParticipants } = singlePurchase;
            checkDataExistence(res, [scheduleId, numberOfParticipants], 'Please fill in scheduleId and numberOfParticipants', true);

            const schedule = await Schedule.findById(singlePurchase.scheduleId).session(session);
    
            if(schedule === null) {
                res.status(404);
                throw new Error("Schedule not found");
            };
    
            if(Number(numberOfParticipants) === 0 ) {
                res.status(400);
                throw new Error("Number of participants must more than 0.");
            }
    
            if(numberOfParticipants > schedule.availability) {
                res.status(400);
                throw new Error(`Availability of this tour's schedule is lower than ${numberOfParticipants}. You cannot buy the tour.`)
            };
    
            schedule.availability = schedule.availability - numberOfParticipants;

            await schedule.save();
        };

        const purchaseTour = await User.findByIdAndUpdate(req.user?._id, {
            $push: { purchasedTourIds: arrayOfBoughtTourId }
        }, {
            runValidators: true,
            new: true,
        }).session(session);
        
        if(purchaseTour === null) {
            res.status(404);
            throw new Error("User not found");
        };

        for (const tourId of arrayOfBoughtTourId) {
            const tour = await Tour.findById(tourId).session(session);

            if(tour === null) {
                res.status(404);
                throw new Error("Tour not found");
            };

            tour.purchasesCount += 1;
            await tour.save();
        };
      
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    }

    res.status(200).json({
        success: true,
        message: "User purchased tour succesfully",
    })

};

export default purchaseTour;