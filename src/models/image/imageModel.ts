import { Schema, model } from "mongoose";
import { IImageDocument, IImageModel } from "../../types/image.interface";


const imageSchema = new Schema<IImageDocument, IImageModel>({
    fileName: {type: String, required: [true, 'Please add a file name']},
    fileType: {type: String, required: [true, 'Please add a file type']},
    originalFilePath: {type: String, required: [true, 'Please add a file type']},
    originalFilePublicId: {type: String, required: [true, 'Please add a file public ID']},
    originalFileSize: {type: String, required: [true, 'Please add a file size']},
    differentSizes: {
        type: [{
            size: {type: String, required: [true, 'Please add a file size']},
            filePath: {type: String, required: [true, 'Please add a file path']},
            filePublicId: {type: String, required: [true, 'Please add a file public ID']},
        }]
    },
    
});

const Image = model("Image", imageSchema);

export default Image;