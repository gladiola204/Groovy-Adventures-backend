import { Request, Response } from "express";
import checkDataExistence from "../../utils/validators/checkDataExistence";
import Category from "../../models/categoryModel";
import uploadImages from "./utils/uploadImages";
import deleteImages from "./utils/deleteImages";

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
    
    const updatedCategory = await Category.findOneAndUpdate({ slug }, {
        title,
        icon: uploadedIcon.length === 0 ? category.icon : uploadedIcon[0].fileData
    },
    {
        new: true,
        runValidators: true,
    });

    if(updatedCategory === null) {
        res.status(500);
        throw new Error("Category not found")
    }

    if(uploadedIcon.length === 1) {
        await deleteImages(res, category.icon.filePublicId);
    };

    res.status(200).json(updatedCategory);
};

export default updateCategory;