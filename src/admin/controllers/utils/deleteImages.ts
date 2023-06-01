import { Response } from 'express';
import cloudinary from 'cloudinary';
import Image from '../../../models/imageModel';
import { IImageDocument } from '../../../types/image.interface';
import { ClientSession, ObjectId } from 'mongoose';

async function deleteImages(res: Response, id: ObjectId[] | string | string[], session: ClientSession | null = null) {
    const arrayOfAllImageIds: string[] = [];

    let stringSetOfImages: IImageDocument | null = null;
    let arrayOfImages: IImageDocument[] = [];

    if(typeof id === 'string') {
        stringSetOfImages = await Image.findById(id).session(session);

        if(stringSetOfImages === null) {
            res.status(404);
            throw new Error("Image not found")
        };

        stringSetOfImages.differentSizes.map(size => arrayOfAllImageIds.push(size.filePublicId));

        arrayOfAllImageIds.push(stringSetOfImages.originalFilePublicId);
    }

    if(Array.isArray(id)) {
        for (const singleId of id) {
            const arraySetOfImages = await Image.findById(singleId).session(session);

            if(arraySetOfImages === null) {
                res.status(404);
                throw new Error("Image not found")
            };

            arraySetOfImages.differentSizes.map(size => arrayOfAllImageIds.push(size.filePublicId));

            console.log(arrayOfAllImageIds);
            arrayOfAllImageIds.push(arraySetOfImages.originalFilePublicId);
            arrayOfImages.push(arraySetOfImages);
        };
    };

    console.log(arrayOfAllImageIds);

    await cloudinary.v2.api.delete_resources(arrayOfAllImageIds, (error, result) => {
        if (error) {
            console.error(error);
            res.status(500);
            throw new Error("Images could not be deleted");
        } else {
            console.log(result.deleted);
        }
    });

    const arrayOfImageObjectIds: ObjectId[] = [];
    if(typeof id === 'string') {
        if(stringSetOfImages !== null) {
            try {
                const oneImageDB = await stringSetOfImages.deleteOne();
                arrayOfImageObjectIds.push(oneImageDB._id);
                return arrayOfImageObjectIds;
            } catch (error) {
                res.status(500);
                throw new Error(`${error}`);
            }
        }
    } else if(Array.isArray(id)) {
        try {
            for (const imageDB of arrayOfImages) {
                await imageDB.deleteOne();
                arrayOfImageObjectIds.push(imageDB._id);
            }
            
            return arrayOfImageObjectIds;
        } catch (error) {
            res.status(500);
            throw new Error(`${error}`);
        }
    };
};

export default deleteImages;