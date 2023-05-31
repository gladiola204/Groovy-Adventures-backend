import { Model, Document } from "mongoose";


export interface IImage {
    fileName: string,
    fileType: string,
    originalFilePath: string,
    originalFilePublicId: string,
    originalFileSize: string,
    differentSizes: [{
        size: string,
        filePath: string,
        filePublicId: string,
    }]
};

export interface IImageDocument extends IImage, Document {}

export interface IImageModel extends Model<IImageDocument> {}