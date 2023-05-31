import { Request, Response } from "express";
import Category from "../../../models/categoryModel";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import deleteImages from "../utils/deleteImages";
import uploadImages from "../utils/uploadImages";
import Image from "../../../models/imageModel";
import { IImageDocument } from "../../../types/image.interface";


async function updateCategory(req: Request, res: Response) {
    const { title } = req.body;
    const { slug } = req.params;

    checkDataExistence(res, [req.body], "Please update at least one field", true);

    if(!title && !req.file) {
        res.status(400);
        throw new Error("Please update at least one field");
    }

    const category = await Category.findOne({ slug });

    if(category === null) {
        res.status(404);
        throw new Error("Category not found");
    };

    if(title) {
        const checkIfTitleAlreadyExist = await Category.findOne({ title });

        if(checkIfTitleAlreadyExist !== null) {
            res.status(400);
            throw new Error("Name of category already exists.");
        };
    };

    const uploadedIcon = await uploadImages(req, res);
    
    let imageId: IImageDocument | null = null
    if(uploadedIcon.length === 1) {
        for (const uploadedSingleIcon of uploadedIcon) {
            imageId = await new Image({
                ...uploadedSingleIcon
            }).save();
        };
    }

    const updatedCategory = await Category.findOneAndUpdate({ slug }, {
        title,
        icon: uploadedIcon.length === 0 ? category.icon : imageId,
    },
    {
        new: true,
        runValidators: true,
    }).populate("icon");

    if(updatedCategory === null) {
        res.status(500);
        throw new Error("Category not found")
    }

    if(uploadedIcon.length === 1) {
        await deleteImages(res, category.icon.toString());
    };

    res.status(200).json(updatedCategory);
};

export default updateCategory;