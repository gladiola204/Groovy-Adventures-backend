import { Request, Response } from "express";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import Category from "../../../models/categoryModel";
import Tour from "../../../models/tour/tourModel";
import uploadImages from "../utils/uploadImages";
import deleteImages from "../utils/deleteImages";
import updateSlug from "../../../utils/updateSlug";
import Schedule from "../../../models/schedule/scheduleModel";
import { ObjectId, startSession } from "mongoose";
import Image from "../../../models/image/imageModel";
import { ITourDocument } from "../../../types/tour.interface";
import { deleteScheduleSchema, scheduleArrayValidationSchema, updateScheduleSchema } from "../../../models/schedule/scheduleValidationSchema";
import { updateTourSchema } from "../../../models/tour/tourValidationSchema";
import imageArrayValidationSchema from "../../../models/image/imageValidationSchema";
import validateData from "../../../utils/validators/validateData";

interface IUpdateTourBody {
    title?: string,
    category?: string,
    generalDescription?: string,
    dailyItineraryDescription?: string,
    newSchedules?: [{
        startDate: string,
        endDate: string,
        price: number,
        availability: number,
    }],
    updatedSchedules?: [{
        _id: ObjectId | string,
        startDate? : string,
        endDate?: string, 
        price?: number, 
        availability?: number, 
        discount?: {
            isDiscounted: boolean,
            percentageOfDiscount: number,
            expiresAt: string,
        },
    }],
    deletedSchedules?: [{
        id: ObjectId | string
    }],
    idOfImagesToRemove?: ObjectId[] | string[],
}

async function updateTour(req: Request, res: Response) {    
    const { title, 
        category, 
        generalDescription, 
        dailyItineraryDescription, 
        updatedSchedules,
        newSchedules,
        deletedSchedules,
        idOfImagesToRemove,
    }: IUpdateTourBody = req.body;    
    const { slug } = req.params;
    const scheduleIds: ObjectId[] = [];
    let images: ObjectId[] = [];
    let updatedTour: ITourDocument | null;

    checkDataExistence(res, [req.body], "Please update at least one field", true);
    
    validateData(updateTourSchema, { title, generalDescription, dailyItineraryDescription }, res);
    validateData(scheduleArrayValidationSchema, newSchedules, res);
    validateData(updateScheduleSchema, updatedSchedules, res);
    validateData(deleteScheduleSchema, deletedSchedules, res);
    validateData(imageArrayValidationSchema, idOfImagesToRemove, res);

    const tour = await Tour.findOne({ slug });

    if(!tour) {
        res.status(404);
        throw new Error('Tour not found');
    };
    
    if(title) {
        const titleDB = await Tour.findOne({ title });
        if(titleDB !== null) {
            res.status(400)
            throw new Error("Title already exist in database");
        };
    };

    if(category) {
        const categoryDB = await Category.findOne({title: category});
    
        if(!categoryDB) {
            res.status(404)
            throw new Error("Category doesn't exist")
        };
    };

    const session = await startSession();
    session.startTransaction();

    try {
        if(idOfImagesToRemove) {
            const arrayOfDeletedImageIds = await deleteImages(res, idOfImagesToRemove, session);
    
            if(arrayOfDeletedImageIds) {
                const filteredImages = tour.images.filter(imageId => {
                    return !arrayOfDeletedImageIds.includes(imageId);
                });
                images.push(...filteredImages);
            } else {
                res.status(500);
                throw new Error("An error occurred while deleting images")
            };
        } else {
            images.push(...tour.images);
        };

        const uploadedImages: any[] = await uploadImages(req, res);

        for (const setOfImages of uploadedImages) {
            const uploadedSetOfImages = new Image({ ...setOfImages })
            uploadedSetOfImages.$session(session);
            await uploadedSetOfImages.save();

            images.push(uploadedSetOfImages._id);
        };

        if(updatedSchedules) {
            for (const scheduleData of updatedSchedules) {
                const { startDate, endDate, price, availability, discount } = scheduleData;
    
                const schedule = await Schedule.findByIdAndUpdate(scheduleData._id, {
                    startDate, endDate, price, availability, discount
                }, {
                    runValidators: true,
                    new: true,
                }).session(session);
    
                if(schedule === null) {
                    res.status(404);
                    throw new Error("Schedule not found");
                };
            };
        };

        if(newSchedules) {
            for (const scheduleData of newSchedules) {
                const newSchedule = new Schedule({
                    tourId: tour._id,
                    ...scheduleData
                });
                newSchedule.$session(session);
                await newSchedule.save();
    
                scheduleIds.push(newSchedule._id);
            }
        };

        if(deletedSchedules) {
            const arrayOfSchedulesToFilter: string[] = [];
    
            for (const scheduleData of deletedSchedules) {    
                const deletedSchedule = await Schedule.findByIdAndDelete(scheduleData.id).session(session);
    
                if(deletedSchedule === null) {
                    res.status(404);
                    throw new Error("Schedule not found")
                }
    
                arrayOfSchedulesToFilter.push(deletedSchedule._id.toString());
            } 
            const filteredSchedulesIds = tour.scheduleIds.filter(scheduleId => !arrayOfSchedulesToFilter.includes(scheduleId.toString()));
    
            scheduleIds.push(...filteredSchedulesIds);
        } else {
            scheduleIds.push(...tour.scheduleIds);
        };

        updatedTour = await Tour.findOneAndUpdate(
            {slug: slug},
            {
                title,
                category,
                dailyItineraryDescription,
                generalDescription,
                scheduleIds,
                images,
                slug: title !== undefined ? updateSlug(title) : slug,
            },
            {
                new: true,
                runValidators: true,
            }
        ).populate('scheduleIds').populate("images").session(session);
    
        if(updatedTour === null) {
            res.status(404);
            throw new Error("Tour not found");
        };
    
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    }
    
    res.status(200).json(updatedTour);
};

export default updateTour;