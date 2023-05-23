import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Category from "../../models/categoryModel";
import uploadImages from "./utils/uploadImages";

async function createCategory(req: Request, res: Response) {
    const { title } = req.body;

    checkDataExistence(res, [req.body, title, req.file], "Please fill in all fields", true);

    const categoryDB = await Category.findOne({ title });
    if(categoryDB !== null) {
        res.status(400);
        throw new Error("Category already exists")
    };

    const uploadedIcon = await uploadImages(req, res);

    const category = await new Category({
        title,
        icon: uploadedIcon[0].fileData
    }).save();

    res.status(201).json(category);
}

export default createCategory;