import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Tour from "../../models/tourModel";
import Category from "../../models/categoryModel";
import uploadImages from "./utils/uploadImages";

async function createTour(req: Request, res: Response) {
    //const { title, categories, schedule, description } = req.body;
    //const { startDate, endDate, price, availability } = schedule;
    const { title, category, generalDescription, dailyItineraryDescription, price, availability, startDate, endDate } = req.body;

    checkDataExistence(res,
        [req.body, title, category, startDate, endDate, price, availability, generalDescription, dailyItineraryDescription], 
        "Please fill in all fields", 
        true
    );

    const schedule = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: Number(price),
        availability: Number(availability),
    }

    // Check if title is unique
    const titleDB = await Tour.findOne({ title });

    if(titleDB !== null) {
        res.status(400)
        throw new Error("Title already exist in database");
    }

    // Find category
    const categoryDB = await Category.findOne({title: category});

    if(!categoryDB) {
        res.status(404)
        throw new Error("Category doesn't exist")
    };

    // Handle images upload
    const uploadedImages = await uploadImages(req, res);

    const tour = await new Tour({
        title, category: categoryDB._id, schedule, generalDescription, dailyItineraryDescription, images: uploadedImages,
    }).save();

    res.status(201).json(tour);
}

export default createTour;