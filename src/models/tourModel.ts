import mongoose from "mongoose";

import { ITourDocument, ITourModel } from "../types/tour.interface";
import updateSlug from "../utils/updateSlug";

const tourSchema = new mongoose.Schema<ITourDocument, ITourModel>({
    title: {
        type: String,
        required: [true, "Please add a title"],
        unique: true,
    },
    images: [{
        fileData: {
            type: {
                fileName: {type: String, required: [true, 'Please add a file name']},
                filePath: {type: String, required: [true, 'Please add a file path']},
                filePublicId: {type: String, required: [true, 'Please add a file public ID']},
                fileType: {type: String, required: [true, 'Please add a file type']},
                fileSize: {type: String, required: [true, 'Please add a file size']},
            },
            default: {},
            required: [true, "Please add an image's url"]
        },
        isMain: {
            type: Boolean,
            required: [true, "Please write 'false' if image is not main, and 'true' if it is"],
            default: false,
        },
    }],
    schedule: [{
        startDate: {
            type: Date,  // np. new Date('2023-07-01'),
            required: [true, "Please add a start date of journey"]
        },
        endDate: {
            type: Date,
            required: [true, "Please add an end date of journey"]
        },
        price: {
            type: Number,
            required: [true, "Please add a price"]
        },
        availability: {
            type: Number,
            required: [true, "Please add a quantity"],
        },
    }],
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
    slug: {
        type: String, 
        unique: true
    }
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