import { Request, Response } from "express";
import Category from "../../../models/categoryModel";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import deleteImages from "../utils/deleteImages";
import uploadImages from "../utils/uploadImages";
import Image from "../../../models/image/imageModel";
import { IImageDocument } from "../../../types/image.interface";
import { startSession } from "mongoose";
import { ICategoryDocument } from "../../../types/category.interface";

interface IUpdateCategoryBody {
    title: string
}

async function updateCategory(req: Request, res: Response) {
    const { title }: IUpdateCategoryBody = req.body;
    const { slug } = req.params;
    let updatedCategory: ICategoryDocument | null;

    checkDataExistence(res, [req.body], "Please update at least one field", true);

    if(!title && !req.file) {
        res.status(400);
        throw new Error("Please update at least one field");
    }
    if(title && typeof title !== "string") {
        res.status(400);
        throw new Error("Title must be a string");
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
    
    const session = await startSession();
    session.startTransaction();

    try {
        let imageId: IImageDocument | null = null
        if(uploadedIcon.length === 1) {
            for (const uploadedSingleIcon of uploadedIcon) {
                imageId = new Image({
                    ...uploadedSingleIcon
                });
                imageId.$session(session);
                await imageId.save();
            };
        };

        if(uploadedIcon.length === 1) {
            await deleteImages(res, category.icon.toString(), session);
        };

        updatedCategory = await Category.findOneAndUpdate({ slug }, {
            title,
            icon: uploadedIcon.length === 0 ? category.icon : imageId,
        }, {
            new: true,
            runValidators: true,
        }).populate("icon").session(session);

        if(updatedCategory === null) {
            res.status(500);
            throw new Error("Category not found")
        };
    
        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    }

    res.status(200).json(updatedCategory);
};

export default updateCategory;