import mongoose, { Document, Model } from "mongoose";

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
    scheduleIds: mongoose.Schema.Types.ObjectId[] | [],
    category: mongoose.Schema.Types.ObjectId,
    generalDescription: string,
    dailyItineraryDescription: string,
    reviews: mongoose.Schema.Types.ObjectId[] | [],
    averageRating: number,
    purchasesCount: number;
    slug: string,
};

export interface ITourDocument extends ITour, Document {}

export interface ITourModel extends Model<ITourDocument> {}