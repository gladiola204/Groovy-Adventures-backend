import { Response } from 'express';
import cloudinary from 'cloudinary';

async function deleteImages(res: Response, publicId: string) {
    try{
        const result = await cloudinary.v2.uploader.destroy(publicId);
        console.log('Usunięte zasoby:', result.deleted);
    } catch(error) {
        console.error(error);
        res.status(500);
        throw new Error("Image could not be deleted");
    };
};

export default deleteImages;