import { Types, Model, Document } from "mongoose";

interface IPartialRatings {
    cleanliness: number;
    valuePrice: number;
    food: number;
    communication: number;
    attractions: number;
    atmosphere: number;
};

export interface IReview {
    userID: Types.ObjectId,
    tourID: Types.ObjectId,
    comment: string,
    partialRatings: IPartialRatings
    averagePartialRating: number,
};

export interface IReviewDocument extends IReview, Document {}

export interface IReviewModel extends Model<IReviewDocument> {}