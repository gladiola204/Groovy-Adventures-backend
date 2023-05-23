import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Category from "../../models/categoryModel";
import Tour from "../../models/tourModel";
import uploadImages from "./utils/uploadImages";
import deleteImages from "./utils/deleteImages";
import updateSlug from "../../utils/updateSlug";

async function updateTour(req: Request, res: Response) {
    const { title, 
        category, 
        generalDescription, 
        dailyItineraryDescription, 
        price, 
        availability, 
        startDate, 
        endDate,
        publicIds} = req.body;
    const { slug } = req.params;

    checkDataExistence(res, [req.body], "Please update at least one field", true);

    const tour = await Tour.findOne({ slug });

    if(!tour) {
        res.status(404);
        throw new Error('Tour not found');
    };

    // Zmienić jak już zakończę testy w Postmanie

        // const schedule = {
        //     startDate: new Date(startDate),
        //     endDate: new Date(endDate),
        //     price: Number(price),
        //     availability: Number(availability),
        // }
    const schedule = undefined;
    
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
    };
    
    if(publicIds) {
        await deleteImages(res, publicIds);
    }

    // Handle images upload
    const uploadedImages = await uploadImages(req, res);

    const filteredImages = tour.images.filter(image => {
        return !publicIds.includes(image.fileData.filePublicId);
    });

    const images = [...uploadedImages, ...filteredImages];

    const updatedTour = await Tour.findOneAndUpdate(
        {slug: slug},
        {
            title,
            category,
            dailyItineraryDescription,
            generalDescription,
            schedule,
            images,
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