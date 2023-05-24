import { Request, Response } from "express";
import deleteImages from "./utils/deleteImages";
import Category from "../../models/categoryModel";

async function deleteCategory(req: Request, res: Response) {
    const { slug } = req.params;
    
    const category = await Category.findOne({ slug });
    
    if(category === null) {
        res.status(404)
        throw new Error("Tour not found");
    };

    deleteImages(res, category.icon.filePublicId);
    
    res.status(200).json({ 
        success: true,
        message: 'Category deleted succesfully' 
    });
}

export default deleteCategory;