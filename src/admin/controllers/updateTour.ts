import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Category from "../../models/categoryModel";
import Tour, { updateSlug } from "../../models/tourModel";
import { fileSizeFormatter } from "../../utils/uploadFiles";
import cloudinary from 'cloudinary';

async function updateTour(req: Request, res: Response) {
    const { title, category, generalDescription, dailyItineraryDescription, price, availability, startDate, endDate } = req.body;
    const { slug } = req.params;

    checkDataExistence(res,
        [req.body], 
        "Please update at least one field", 
        true
    );

    const tour = await Tour.findOne({ slug });

    if(!tour) {
        res.status(404);
        throw new Error('Tour not found');
    };

    // Zmienić jak już zakończę testy w Postmanie

    const schedule = {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: Number(price),
        availability: Number(availability),
    }
    
    // Check if title is unique
    if(title) {
        const titleDB = await Tour.findOne({ title });
        if(titleDB !== null) {
            res.status(400)
            throw new Error("Title already exist in database");
        };
    };

    // Find category
    if(category) {
        const categoryDB = await Category.findOne({title: category});
    
        if(!categoryDB) {
            res.status(404)
            throw new Error("Category doesn't exist")
        };
    }

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

    const updatedTour = await Tour.findOneAndUpdate(
        {slug: slug},
        {
            title,
            category,
            dailyItineraryDescription,
            generalDescription,
            schedule,
            images: uploadedImages.length === 0 ? tour.images : uploadedImages,
            slug: title !== undefined ? updateSlug(title) : slug,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json(updatedTour);
    
};

export default updateTour;