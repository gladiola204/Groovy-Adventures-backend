import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Category from "../../models/categoryModel";

async function createTour(req: Request, res: Response) {
    const { title } = req.body;

    checkDataExistence(res, [req.body, title], "Please fill in all fields", true);

    const categoryDB = await Category.findOne({ title });
    if(categoryDB !== null) {
        res.status(400);
        throw new Error("Category already exists")
    };

    const category = await new Category({
        title
    }).save();

    res.status(201).json(category);
}

export default createTour;