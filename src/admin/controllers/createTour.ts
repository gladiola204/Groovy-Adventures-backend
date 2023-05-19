import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import cloudinary from 'cloudinary';
import { fileSizeFormatter } from "../../utils/uploadFiles";
import Tour from "../../models/tourModel";
import Category from "../../models/categoryModel";

async function createTour(req: Request, res: Response) {
    //const { title, categories, schedule, description } = req.body;
    //const { startDate, endDate, price, availability } = schedule;
    //const { general, dailyItinerary } = description;
    const { title, category, general, dailyItinerary, price, availability, startDate, endDate } = req.body;

    checkDataExistence(res,
        [req.body, title, category, startDate, endDate, price, availability, general, dailyItinerary], 
        "Please fill in all fields", 
        true
    );

    const description = {
        general,
        dailyItinerary,
    };

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
     const uploadedImages = [];
     if(req.files) {
        const fileList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

        try {
            for (const file of fileList) {
                const uploadedFile = await cloudinary.v2.uploader.upload(file.path, {
                  folder: 'Groovy Adventures',
                  resource_type: 'image'
                });

                const fileData = {
                    fileName: file.originalname,
                    filePath: uploadedFile.secure_url,
                    fileType: file.mimetype,
                    fileSize: fileSizeFormatter(file.size, 2),
                };

                const uploadedImage = {
                    fileData,
                    isMain: true
                }
            
                uploadedImages.push(uploadedImage);
            }
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded")
        };
    };

    const tour = await new Tour({
        title, category: categoryDB._id, schedule, description, images: uploadedImages,
    }).save();

    res.status(201).json(tour);
}

export default createTour;