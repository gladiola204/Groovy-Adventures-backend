import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Tour from "../../models/tourModel";
import Review from "../../models/reviewModel";
import { ObjectId } from "mongoose";

async function createReview(req: Request, res: Response) {
    const { slug } = req.params;
    const { cleanliness, valuePrice, food, communication, attractions, atmosphere, comment } = req.body;

    checkDataExistence(res, [req.body, req.user, cleanliness, valuePrice, food, communication, attractions, atmosphere, comment], "Please fill in all required fields", true);

    if(comment.trim().length > 249 || comment.trim().length < 11) {
        res.status(400);
        throw new Error("The comment must be more than 10 and less than 250 characters.");
    };

    const ratings = [cleanliness, valuePrice, food, communication, attractions, atmosphere];

    const isValid = ratings.every(rating => Number(rating) > 0 && Number(rating) < 6);

    if(!isValid) {
        res.status(400);
        throw new Error("Ratings must be minimum 1 point and maximum 5 points.");
    };

    const tour = await Tour.findOne({ slug });

    if(tour === null) {
        res.status(404);
        throw new Error("Tour not found");
    }

    const isUserBoughtTour = req.user?.purchasedTourIds.find((purchasedTour: ObjectId) => purchasedTour.toString() === tour._id.toString());

    if(!isUserBoughtTour) {
        res.status(400);
        throw new Error("The user must purchase the tour to review it.")
    };

    const newReview = await new Review({
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
    }).save();

    res.status(201).json(newReview);

};

export default createReview;