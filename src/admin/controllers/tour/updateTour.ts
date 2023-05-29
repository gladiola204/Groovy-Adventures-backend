import { Request, Response } from "express";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import Category from "../../../models/categoryModel";
import Tour from "../../../models/tourModel";
import uploadImages from "../utils/uploadImages";
import deleteImages from "../utils/deleteImages";
import updateSlug from "../../../utils/updateSlug";
import Schedule from "../../../models/scheduleModel";
import { ObjectId } from "mongoose";

async function updateTour(req: Request, res: Response) {
    const { title, 
        category, 
        generalDescription, 
        dailyItineraryDescription, 
        updatedSchedules,
        newSchedules,
        deleteSchedules,
        publicIds,
        } = req.body;
    const { slug } = req.params;
    const scheduleIds: ObjectId[] = [];
    let images = [];

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
    
    if(publicIds) {
        await deleteImages(res, publicIds);
    };

    // Handle images upload
    const uploadedImages = await uploadImages(req, res);
    images.push(...uploadedImages);
    
    if(publicIds) {
        const filteredImages = tour.images.filter(image => {
            return !publicIds.includes(image.fileData.filePublicId);
        });
        images.push(...filteredImages);
    } else {
        images.push(...tour.images);
    };

    if(updatedSchedules) {
        if(Array.isArray(updatedSchedules)) {
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
            });

            if(schedule === null) {
                res.status(404);
                throw new Error("Schedule not found");
            }
        }
    };

    if(newSchedules) {
        if(Array.isArray(updatedSchedules)) {
            res.status(400);
            throw new Error("Invalid format of updated schedule's data. Please provide an array.")
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
        
            const newSchedule = await new Schedule({
                tourId: tour._id,
                ...scheduleData
            }).save();

            scheduleIds.push(newSchedule._id);
        }
    };

    if(deleteSchedules) {
        if(Array.isArray(updatedSchedules)) {
            res.status(400);
            throw new Error("Invalid format of updated schedule's data. Please provide an array.")
        };
        const arrayOfSchedulesToFilter: string[] = [];

        for (const scheduleData of deleteSchedules) {
            if(!scheduleData.hasOwnProperty("_id")) {
                res.status(400);
                throw new Error("Please fill in schedule's id");
            };
        
            const deletedSchedule = await Schedule.findByIdAndDelete(scheduleData._id);

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

    const updatedTour = await Tour.findOneAndUpdate(
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
    ).populate('scheduleIds');

    if(updatedTour === null) {
        res.status(404);
        throw new Error("Tour not found");
    }

    res.status(200).json(updatedTour);
};

export default updateTour;