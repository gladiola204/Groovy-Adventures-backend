import mongoose from "mongoose"
import updateSlug from "../utils/updateSlug";
import { ICategoryDocument, ICategoryModel } from "../types/category.interface";

const categorySchema = new mongoose.Schema<ICategoryDocument, ICategoryModel>({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        unique: true,
    },
    icon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Image',
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