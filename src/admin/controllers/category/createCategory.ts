import { Request, Response } from "express";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import Category from "../../../models/categoryModel";
import uploadImages from "../utils/uploadImages";
import Image from "../../../models/image/imageModel";
import { IImageDocument } from "../../../types/image.interface";
import { startSession } from "mongoose";
import { ICategoryDocument } from "../../../types/category.interface";

interface ICreateCategoryBody {
    title: string
}

async function createCategory(req: Request, res: Response) {
    const { title }: ICreateCategoryBody = req.body;
    let category: ICategoryDocument;

    checkDataExistence(res, [req.body, title, req.file], "Please fill in all fields", true);

    if(typeof title !== "string") {
        res.status(400);
        throw new Error("Title must be a string");
    }

    const categoryDB = await Category.findOne({ title });
    if(categoryDB !== null) {
        res.status(400);
        throw new Error("Category already exists")
    };

    const uploadedIcon = await uploadImages(req, res);

    const session = await startSession();
    session.startTransaction();

    try {
        let imageId: IImageDocument | null = null
        for (const uploadedSingleIcon of uploadedIcon) {
            imageId = new Image({
                ...uploadedSingleIcon
            });
            imageId.$session(session);
            await imageId.save();
        }

        category = new Category({
            title,
            icon: imageId?._id
        });
        category.$session(session);
        await category.save();

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    };

    res.status(201).json(category);
}

export default createCategory;