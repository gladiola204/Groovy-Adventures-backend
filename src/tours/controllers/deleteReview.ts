import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Review from "../../models/reviewModel";
import Tour from "../../models/tourModel";
import { IReviewDocument } from "../../types/review.interface";
import { Types, Document } from "mongoose";

async function deleteReview(req: Request, res: Response) {
    const { reviewId } = req.body;

    checkDataExistence(res, [req.body, reviewId], "Please fill in review ID", true);

    let review: (Document<unknown, {}, IReviewDocument> & Omit<IReviewDocument & {_id: Types.ObjectId; }, never>) | null
    if(req.user?.role === "admin") {
        review = await Review.findByIdAndDelete(reviewId);
    } else {
        review = await Review.findOneAndDelete( {_id: reviewId, userID: req.user?._id });
    }

    if(review === null) {
        res.status(404);
        throw new Error("Review not found");
    };

    const { tourID, _id } = review;

    // Calculate average ratings for tourId
    const averageRatings = await Review.aggregate([
        { $match: { tourID } },
        { $group: { _id: tourID, average: { $avg: '$averagePartialRating' } } },
    ]);
  
    if(averageRatings === null) {
        res.status(404);
        throw new Error("Reviews not found")
    }
    
    const tour = await Tour.findByIdAndUpdate(tourID, { 
        averageRating: Math.round(averageRatings[0].average),
        $pull: { reviews: _id }
    });
  
    if(tour === null) {
        res.status(404);
        throw new Error("Tour not found")
    }

    res.status(200).json({ 
        success: true,
        message: 'Review deleted succesfully' 
    });
};

export default deleteReview;
