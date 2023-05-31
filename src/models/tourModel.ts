import mongoose from "mongoose";

import { ITourDocument, ITourModel } from "../types/tour.interface";
import updateSlug from "../utils/updateSlug";

const tourSchema = new mongoose.Schema<ITourDocument, ITourModel>({
    title: {
        type: String,
        required: [true, "Please add a title"],
        unique: true,
    },
    images: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Image',
        }],
        required: [true, "Please add images"],
    },
    scheduleIds: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Schedule',
        }],
        default: [] as unknown as undefined[],
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Please add a category'],
    },
    generalDescription: {
        type: String,
        required: [true, "Please add a general description"],
    },
    dailyItineraryDescription: {
        type: String,
        required: [true, "Please add a daily itinerary"],
    },
    reviews: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Review',
        }],
        default: [] as unknown as undefined[],
    },
    averageRating: {
        type: Number,
        default: 0
    },
    purchasesCount: {
        type: Number,
        default: 0,
    },
    slug: {
        type: String, 
        unique: true
    },
}, {
    timestamps: true,
});

tourSchema.pre('save', function (next: (err?: Error) => void) {
    if (this.isModified('title')) {
        this.slug = updateSlug(this.title);
        this.title = this.title.toLowerCase();
    }

    next();
});

tourSchema.pre('findOne', function (next: (err?: Error) => void) {
    const filters = this.getFilter();
    if(filters.title) {
        filters.title = filters.title.toLowerCase();
    };

    next();
});

tourSchema.pre('findOneAndUpdate', function (next: (err?: Error) => void) {
    const filters = this.getFilter();
    if(filters.title) {
        filters.title = filters.title.toLowerCase();
    };

    next();
});

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;