import { Request, Response } from "express";
import cloudinary from 'cloudinary';
import { fileSizeFormatter } from "../../../utils/uploadFiles";

async function uploadImages(req: Request, res: Response) {
    const uploadedImages = [];
    if(req.files) {
       const fileList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

        try {
           for (const file of fileList) {
               const uploadedFile = await cloudinary.v2.uploader.upload(file.path, {
                 folder: 'Groovy Adventures',
                 resource_type: 'image'
               });

               const fileData = {
                   fileName: file.originalname,
                   filePath: uploadedFile.secure_url,
                   filePublicId: uploadedFile.public_id,
                   fileType: file.mimetype,
                   fileSize: fileSizeFormatter(file.size, 2),
               };

               const uploadedImage = {
                   fileData,
                   isMain: true
               }
           
               uploadedImages.push(uploadedImage);
           }
        } catch (error) {
            console.error(error);
            res.status(500);
            throw new Error("Image could not be uploaded")
        };
   };
   return uploadedImages;
};

export default uploadImages;