import { Schema, model } from "mongoose";
import { IReviewDocument, IReviewModel } from "../types/review.interface";
import Tour from "./tourModel";


const reviewSchema = new Schema<IReviewDocument, IReviewModel>({
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Add an userID']
    },
    tourID: {
        type: Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Add an tourID']
    },
    partialRatings: {
        type: {
            cleanliness: { type: Number, min: 1, max: 5, required: [true, ''] },
            valuePrice: { type: Number, min: 1, max: 5, required: [true, ''] },
            food: { type: Number, min: 1, max: 5, required: [true, ''] },
            communication: { type: Number, min: 1, max: 5, required: [true, ''] },
            attractions: { type: Number, min: 1, max: 5, required: [true, ''] },
            atmosphere: { type: Number, min: 1, max: 5, required: [true, ''] },
        },
        required: [true, 'Add a partial ratings']
    },
    averagePartialRating: {
        type: Number,
        default: 0,
    },
    comment: {
        type: String,
        default: '',
        minlength: 11,
        maxlength: 249,
        trim: true,
    },
})

reviewSchema.pre('save', function(next: (err?: Error) => void) {
    const { cleanliness, valuePrice, food, communication, attractions, atmosphere } = this.partialRatings;
    
    let summary = cleanliness + valuePrice + food + communication + attractions + atmosphere;

    this.averagePartialRating = Math.round(summary / 6);

    next();
})

reviewSchema.post('save', async function (doc: IReviewDocument, next: (err?: Error) => void) {
    const tourID = doc.tourID;
  
    // Calculate average ratings for tourId
    const averageRatings = await Review.aggregate([
      { $match: { tourID } },
      { $group: { _id: tourID, average: { $avg: '$averagePartialRating' } } },
    ]);

    if(averageRatings === null) {
        throw new Error("Reviews not found")
    }
  
    const tour = await Tour.findByIdAndUpdate(tourID, { 
        averageRating: Math.round(averageRatings[0].average),
        $push: { reviews: doc._id }
    });

    if(tour === null) {
        throw new Error("Tour not found")
    }

    next();
});

const Review = model("Review", reviewSchema);

export default Review;

// zakupione tours