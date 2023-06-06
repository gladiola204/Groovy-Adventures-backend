import { Request, Response } from "express";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import Tour from "../../../models/tour/tourModel";
import Category from "../../../models/categoryModel";
import uploadImages from "../utils/uploadImages";
import Schedule from "../../../models/schedule/scheduleModel";
import { ObjectId, startSession } from "mongoose";
import Image from "../../../models/image/imageModel";
import { ITourDocument } from "../../../types/tour.interface";
import { tourValidationSchema } from "../../../models/tour/tourValidationSchema";
import { scheduleArrayValidationSchema } from "../../../models/schedule/scheduleValidationSchema";
import validateData from "../../../utils/validators/validateData";

interface ICreateTourBody {
    title: string,
    category: string,
    generalDescription: string,
    dailyItineraryDescription: string,
    schedules: [{
        startDate: string,
        endDate: string,
        price: number,
        availability: number,
    }]
}

async function createTour(req: Request, res: Response) {
    const { title, category, generalDescription, dailyItineraryDescription, schedules }: ICreateTourBody = req.body;
    let tour: ITourDocument;

    checkDataExistence(res,
        [req.body, title, category, schedules, generalDescription, dailyItineraryDescription, req.files], 
        "Please fill in all fields", 
        true
    );

    validateData(tourValidationSchema, {title, category, generalDescription, dailyItineraryDescription}, res);
    validateData(scheduleArrayValidationSchema, schedules, res);

    // Check if title is unique
    const titleDB = await Tour.findOne({ title });

    if(titleDB !== null) {
        res.status(400)
        throw new Error("Title already exist in database");
    }

    // Find category
    const categoryDB = await Category.findOne({title: category});

    if(categoryDB === null) {
        res.status(404)
        throw new Error("Category doesn't exist")
    };

    const session = await startSession();
    session.startTransaction();

    try {
        const uploadedImages = await uploadImages(req, res);
    
        const arrayOfUploadedImagesIds: ObjectId[] = [];
    
        for (const setOfImages of uploadedImages) {
            const image = new Image({ ...setOfImages });
            image.$session(session);

            const uploadedSetOfImages = await image.save();
    
            arrayOfUploadedImagesIds.push(uploadedSetOfImages._id);
        };

        tour = new Tour({
            title, category: categoryDB?._id, generalDescription, dailyItineraryDescription, images: arrayOfUploadedImagesIds,
        });
        tour.$session(session);
        await tour.save();

    
        const scheduleArray: ObjectId[] = [];
        for (const scheduleData of schedules) {
            
            const newSchedule = new Schedule({
                tourId: tour._id,
                ...scheduleData
            });
            newSchedule.$session(session);
            await newSchedule.save();
    
            scheduleArray.push(newSchedule._id);
        }
    
        tour.scheduleIds = [...tour.scheduleIds, ...scheduleArray];
        await tour.save();
      
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    }

    res.status(201).json(tour);
}

export default createTour;