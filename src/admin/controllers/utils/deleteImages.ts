import { Response } from 'express';
import cloudinary from 'cloudinary';

async function deleteImages(res: Response, publicId: string[] | string) {
    if(typeof publicId === 'string') {
        await cloudinary.v2.uploader.destroy(publicId, (error, result) => {
            if (error) {
                console.error(error);
                res.status(500);
                throw new Error("Images could not be deleted");
            } else {
                console.log(result);
            }
        });
    }

    if(Array.isArray(publicId)) {
        await cloudinary.v2.api.delete_resources(publicId, (error, result) => {
            if (error) {
                console.error(error);
                res.status(500);
                throw new Error("Images could not be deleted");
            } else {
                console.log(result.deleted);
            }
        });
    }
};

export default deleteImages;