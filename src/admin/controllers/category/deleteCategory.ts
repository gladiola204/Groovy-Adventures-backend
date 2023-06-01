import { Request, Response } from "express";
import Category from "../../../models/categoryModel";
import deleteImages from "../utils/deleteImages";
import { startSession } from "mongoose";


async function deleteCategory(req: Request, res: Response) {
    const { slug } = req.params;

    const session = await startSession();
    session.startTransaction();

    try {
        const category = await Category.findOne({ slug });
    
        if(category === null) {
            res.status(404)
            throw new Error("Tour not found");
        };

        await deleteImages(res, category.icon.toString(), session);
        await category.deleteOne();

        await session.commitTransaction();
    } catch (error) {
        await session.abortTransaction();
        throw new Error(`${error}`);
    } finally {
        session.endSession();
    };

    res.status(200).json({ 
        success: true,
        message: 'Category deleted succesfully' 
    });
}

export default deleteCategory;