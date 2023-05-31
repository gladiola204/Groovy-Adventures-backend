import { Request, Response } from "express";
import Category from "../../../models/categoryModel";
import deleteImages from "../utils/deleteImages";


async function deleteCategory(req: Request, res: Response) {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug });
    
    if(category === null) {
        res.status(404)
        throw new Error("Tour not found");
    };

    await deleteImages(res, category.icon.toString());
    await category.deleteOne();
    
    res.status(200).json({ 
        success: true,
        message: 'Category deleted succesfully' 
    });
}

export default deleteCategory;