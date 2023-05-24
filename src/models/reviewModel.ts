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
            cleanliness: { type: Number, min: 0, max: 5, required: [true, ''] },
            valuePrice: { type: Number, required: [true, ''] },
            food: { type: Number, required: [true, ''] },
            communication: { type: Number, required: [true, ''] },
            attractions: { type: Number, required: [true, ''] },
            atmosphere: { type: Number, required: [true, ''] },
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
        minlength: 100,
        maxlength: 250,
    },
})

reviewSchema.pre('save', function(next: (err?: Error) => void) {
    let summary = 0;
    let numberOfProp = 0;
    Object.entries(this.partialRatings).forEach(([rate, value]) => {
       summary += value; 
       numberOfProp += 1;
    });

    this.averagePartialRating = summary / numberOfProp;

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
        averageRatings: averageRatings[0].average,
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