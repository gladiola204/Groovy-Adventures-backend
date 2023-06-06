import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Tour from "../../models/tour/tourModel";
import Review from "../../models/review/reviewModel";
import { ObjectId, startSession } from "mongoose";
import { IReviewDocument } from "../../types/review.interface";
import validateData from "../../utils/validators/validateData";
import { reviewValidationSchema } from "../../models/review/reviewValidationSchema";

async function createReview(req: Request, res: Response) {
    const { slug } = req.params;
    const { cleanliness, valuePrice, food, communication, attractions, atmosphere, comment } = req.body;
    let newReview: IReviewDocument;
    checkDataExistence(res, [req.body, req.user, cleanliness, valuePrice, food, communication, attractions, atmosphere, comment], "Please fill in all required fields", true);

    validateData(reviewValidationSchema, req.body, res);

    const session = await startSession();
    session.startTransaction();

    try {
        const tour = await Tour.findOne({ slug }).session(session);

        if(tour === null) {
            res.status(404);
            throw new Error("Tour not found");
        };

        const isUserBoughtTour = req.user?.purchasedTourIds.find((purchasedTour: ObjectId) => purchasedTour.toString() === tour._id.toString());

        if(!isUserBoughtTour) {
            res.status(400);
            throw new Error("The user must purchase the tour to review it.")
        };

        newReview = new Review({
            userID: req.user?._id,
            tourID: tour._id,
            partialRatings: {
                cleanliness: Number(cleanliness), 
                valuePrice: Number(valuePrice), 
                food: Number(food), 
                communication: Number(communication), 
                attractions: Number(attractions), 
                atmosphere: Number(atmosphere),
            },
            comment,
        });
        newReview.$session(session);
        await newReview.save();

        tour.reviews = [...tour.reviews, ...newReview._id];
        await tour.save();

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    }

    res.status(201).json(newReview);

};

export default createReview;