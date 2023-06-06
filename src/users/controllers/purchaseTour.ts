import { Request, Response } from "express";
import Tour from "../../models/tour/tourModel";
import User from "../../models/user/userModel";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Schedule from "../../models/schedule/scheduleModel";
import { ObjectId, startSession } from "mongoose";
import Joi from "joi";
import JoiObjectId from 'joi-objectid';
import validateData from "../../utils/validators/validateData";

interface IPurchaseDataProps {
    purchaseData: [{
        scheduleId: ObjectId | string,
        numberOfParticipants: number,
    }]
};

const purchaseDataSchema = Joi.array().items({
    scheduleId: Joi.alternatives()
    .try(Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Schedule ID must be a valid ObjectId',
    }),
    JoiObjectId(Joi)).required().messages({
        'any.invalid': 'Schedule ID must be a valid ObjectId',
        'string.objectId': 'Invalid schedule ID',
    }),
    numberOfParticipants: Joi.number().required().min(1).messages({
        'any.required': 'Please add a number of participants',
        'number.base': 'Please add a number of participants',
        'number.less': 'Number of participants must be minimum 1',
    })
})

async function purchaseTour(req: Request, res: Response) {
    const { purchaseData }: IPurchaseDataProps = req.body;
    const arrayOfBoughtTourId: ObjectId[] = [];

    checkDataExistence(res, [req.body, purchaseData], 'Please fill in purchaseData', true);

    validateData(purchaseDataSchema, req.body, res);
    
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
    
            if(numberOfParticipants > schedule.availability) {
                res.status(400);
                throw new Error(`Availability of this tour's schedule is lower than ${numberOfParticipants}. You cannot buy the tour.`)
            };
    
            schedule.availability = schedule.availability - numberOfParticipants;

            await schedule?.save();
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