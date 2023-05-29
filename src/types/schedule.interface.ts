import { Model, Document, ObjectId } from "mongoose";


export interface ISchedule {
    tourId: ObjectId,
    startDate: Date,
    endDate: Date,
    price: number,
    availability: number,
    lastMinute: {
        isLastMinute: boolean,
        expiresAt?: Date,
    },
    discount: {
        isDiscounted: boolean,
        percentageOfDiscount?: number,
        expiresAt?: Date,
    },
};

export interface IScheduleDocument extends ISchedule, Document {}

export interface IScheduleModel extends Model<IScheduleDocument> {}