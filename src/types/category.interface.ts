import { ObjectId, Document, Model } from "mongoose";


export interface ICategory {
    title: string,
    icon: ObjectId,
    slug: string
};

export interface ICategoryDocument extends ICategory, Document {}

export interface ICategoryModel extends Model<ICategoryDocument> {}