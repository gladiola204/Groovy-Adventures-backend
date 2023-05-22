import mongoose, { Document, Model } from "mongoose";

interface IPartialRatings {
    cleanliness: number;
    valuePrice: number;
    food: number;
    communication: number;
    attractions: number;
    atmosphere: number;
};

export interface IReview {
    userID: mongoose.Types.ObjectId,
    comment: string,
    partialRatings: IPartialRatings
    averagePartialRating: number,
};

export interface ITour {
    title: string,
    images: [{
        fileData: {
            fileName: string,
            filePath: string,
            filePublicId: string,
            fileType: string,
            fileSize: string,
        },
        isMain: boolean,
    }],
    schedule: [{
        startDate: Date,
        endDate: Date,
        price: number,
        availability: number,
    }],
    category: mongoose.Schema.Types.ObjectId,
    generalDescription: string,
    dailyItineraryDescription: string,
    reviews: IReview[],
    averageRating: number,
    slug: string,
};

export interface ITourDocument extends ITour, Document {}

export interface ITourModel extends Model<ITourDocument> {}