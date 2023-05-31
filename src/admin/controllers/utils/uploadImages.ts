import { Request, Response } from "express";
import cloudinary from 'cloudinary';
import { fileSizeFormatter } from "../../../utils/uploadFiles";
import sharp from "sharp";
import fs from 'fs';

async function uploadImages(req: Request, res: Response) {
    const arrayOfUploadedImages = [];
    let fileList;

    if (req.files || req.file) {
        if (req.files) {
            fileList = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
        } else {
            fileList = [req.file];
        }

        try {
           for (const file of fileList) {
                if(file) {
                    const sizes = [
                        { width: 200, height: 200, path: 'temp_thumbnail_image.jpg', name: 'thumbnail'},
                        { width: 320, height: 240, path: 'temp_small_image.jpg', name: 'small'},
                        { width: 800, height: 600, path: 'temp_medium_image.jpg', name: 'medium'},
                        { width: 1920, height: 1080, path: 'temp_large_image.jpg', name: 'large'}
                    ];

                    const processedImages = [];

                    for (const size of sizes) {
                        const processedImage = await sharp(file.path)
                        .resize(size.width, size.height, { fit: 'cover' })
                        .toBuffer();

                        fs.writeFileSync(size.path, processedImage);
                        // const stats = fs.statSync(size.path);
                        // size.fileSize = stats.size;

                        const uploadedImage = await cloudinary.v2.uploader.upload(size.path, {
                          folder: 'Groovy-Adventures',
                          resource_type: 'image',
                        }, (error, result) => {
                            if (error) {
                                console.log('Error uploading resized image:', error);
                                res.status(500).json({
                                    message: "Error uploading resized image",
                                    error,
                                });
                            }
                        });
                    
                        fs.unlinkSync(size.path);
                        
                        processedImages.push({
                            size: `${size.name}`,
                            filePath: uploadedImage.secure_url,
                            filePublicId: uploadedImage.public_id,
                        });
                    };

                    const uploadedOriginalImage = await cloudinary.v2.uploader.upload(file.path, {
                        folder: 'Groovy-Adventures',
                        resource_type: 'image'
                    }, (error, result) => {
                        if (error) {
                            console.log('Error uploading resized image:', error);
                            res.status(500).json({
                                message: "Error uploading resized image",
                                error,
                            });
                        } else {
                            console.log("main");
                        }
                    });

                    const uploadedImages = {
                        fileName: file.originalname,
                        fileType: file.mimetype,
                        originalFilePath: uploadedOriginalImage.secure_url,
                        originalFilePublicId: uploadedOriginalImage.public_id,
                        originalFileSize: fileSizeFormatter(file.size, 2),
                        differentSizes: processedImages,
                    };

                    arrayOfUploadedImages.push(uploadedImages);
                }
           }
        } catch (error) {
            console.error(error);
            res.status(500);
            throw new Error("Image could not be uploaded")
        };
   };

   return arrayOfUploadedImages;
};

export default uploadImages;