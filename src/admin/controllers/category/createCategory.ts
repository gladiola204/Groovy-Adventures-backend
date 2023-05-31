import { Request, Response } from "express";
import checkDataExistence from "../../../utils/validators/checkDataExistence";
import Category from "../../../models/categoryModel";
import uploadImages from "../utils/uploadImages";
import Image from "../../../models/imageModel";
import { IImageDocument } from "../../../types/image.interface";


async function createCategory(req: Request, res: Response) {
    const { title } = req.body;

    checkDataExistence(res, [req.body, title, req.file], "Please fill in all fields", true);

    const categoryDB = await Category.findOne({ title });
    if(categoryDB !== null) {
        res.status(400);
        throw new Error("Category already exists")
    };

    const uploadedIcon = await uploadImages(req, res);

    let imageId: IImageDocument | null = null
    for (const uploadedSingleIcon of uploadedIcon) {
        imageId = await new Image({
            ...uploadedSingleIcon
        }).save();
    }

    const category = await new Category({
        title,
        icon: imageId?._id
    }).save();

    res.status(201).json(category);
}

export default createCategory;