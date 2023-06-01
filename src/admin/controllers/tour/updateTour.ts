import { Request, Response } from "express";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import Category from "../../../models/categoryModel";
import Tour from "../../../models/tourModel";
import uploadImages from "../utils/uploadImages";
import deleteImages from "../utils/deleteImages";
import updateSlug from "../../../utils/updateSlug";
import Schedule from "../../../models/scheduleModel";
import { ObjectId, startSession } from "mongoose";
import Image from "../../../models/imageModel";
import { ITourDocument } from "../../../types/tour.interface";

async function updateTour(req: Request, res: Response) {    
    const { title, 
        category, 
        generalDescription, 
        dailyItineraryDescription, 
        updatedSchedules,
        newSchedules,
        deletedSchedules,
        idOfImagesToRemove,
        } = req.body;    
    const { slug } = req.params;
    const scheduleIds: ObjectId[] = [];
    let images: ObjectId[] = [];
    let updatedTour: ITourDocument | null;

    checkDataExistence(res, [req.body], "Please update at least one field", true);

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
            if(!Array.isArray(updatedSchedules)) {
                res.status(400);
                throw new Error("Invalid format of updated schedule's data. Please provide an array.")
            }
            for (const scheduleData of updatedSchedules) {
                const { startDate, endDate, price, availability, lastMinute, discount } = scheduleData;
    
                if(!updatedSchedules.hasOwnProperty("_id")) {
                    res.status(400);
                    throw new Error("Please fill in id schedule"); 
                };
    
                if(startDate && !endDate || !startDate && endDate) {
                    res.status(400);
                    throw new Error("Please provide start date and end date");
                } else if(startDate && endDate) {
                    if( (new Date(startDate)) > (new Date(endDate)) ) {
                        res.status(400);
                        throw new Error("End date must be later than start date.")
                    }
                }
    
                const schedule = await Schedule.findByIdAndUpdate(scheduleData._id, {
                    startDate, endDate, price, availability, lastMinute, discount
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
            if(!Array.isArray(newSchedules)) {
                res.status(400);
                throw new Error("Invalid format of new schedule's data. Please provide an array.")
            };
    
            for (const scheduleData of newSchedules) {
                if(!scheduleData.hasOwnProperty("startDate") || !scheduleData.hasOwnProperty("endDate") || !scheduleData.hasOwnProperty("price") || !scheduleData.hasOwnProperty("availability")) {
                    res.status(400);
                    throw new Error("Please fill in all required data in schedule");
                };
    
                if( (new Date(scheduleData.startDate)) > (new Date(scheduleData.endDate)) ) {
                    res.status(400);
                    throw new Error("End date must be later than start date.")
                }
            
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
            if(!Array.isArray(deletedSchedules)) {
                res.status(400);
                throw new Error("Invalid format of deleted schedule's data. Please provide an array.")
            };
            const arrayOfSchedulesToFilter: string[] = [];
    
            for (const scheduleData of deletedSchedules) {
                if(!scheduleData.hasOwnProperty("_id")) {
                    res.status(400);
                    throw new Error("Please fill in schedule's id");
                };
            
                const deletedSchedule = await Schedule.findByIdAndDelete(scheduleData._id).session(session);
    
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