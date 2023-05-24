import mongoose from "mongoose"
import updateSlug from "../utils/updateSlug";

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        unique: true,
    },
    icon: {
        type: {
            fileName: {type: String, required: [true, 'Please add a file name']},
            filePath: {type: String, required: [true, 'Please add a file path']},
            filePublicId: {type: String, required: [true, 'Please add a file public ID']},
            fileType: {type: String, required: [true, 'Please add a file type']},
            fileSize: {type: String, required: [true, 'Please add a file size']},
        },
        required: [true, 'Please add an icon']
    },
    slug: {
        type: String, 
        unique: true
    }
});

categorySchema.pre('save', function (next: (err?: Error) => void) {
    if (this.isModified('title')) {
        this.slug = updateSlug(this.title);
        this.title = this.title.toLowerCase();
    }

    next();
});

categorySchema.pre('findOne', function (next: (err?: Error) => void) {
    const filters = this.getFilter();
    if(filters.title) {
        filters.title = filters.title.toLowerCase();
    };

    next();
});

categorySchema.pre('findOneAndUpdate', function (next: (err?: Error) => void) {
    const filters = this.getFilter();
    if(filters.title) {
        filters.title = filters.title.toLowerCase();
    };

    next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;