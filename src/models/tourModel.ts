import mongoose from "mongoose";
import slugify from "slugify";
import { IReview, ITourDocument, ITourModel } from "../types/tour.interface";

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
            userID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: [true, 'Add an userID']
            },
            partialRatings: {
                type: {
                    cleanliness: { type: Number, min: 0, max: 5, required: [true, ''] },
                    valuePrice: { type: Number, required: [true, ''] },
                    food: { type: Number, required: [true, ''] },
                    communication: { type: Number, required: [true, ''] },
                    attractions: { type: Number, required: [true, ''] },
                    atmosphere: { type: Number, required: [true, ''] },
                },
                required: [true, 'Add a partial ratings']
            },
            averagePartialRating: {
                type: Number,
                default: 0,
            },
            comment: {
                type: String,
                default: '',
                minlength: 100,
                maxlength: 250,
            }
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

tourSchema.methods.calculateAveragePartialRating = function () {
    if (this.reviews.length === 0) {
      return;
    };

    this.reviews.forEach((review: IReview) => {
        const { cleanliness, valuePrice, food, communication, attractions, atmosphere } = review.partialRatings;
        const summary = cleanliness + valuePrice + food + communication + attractions + atmosphere;
        review.averagePartialRating = summary / Object.keys(review.partialRatings).length;
    });
};

export function updateSlug(title: string) {
    const slug = slugify(title, { lower: true, strict: true });
    return slug;
};

tourSchema.pre('save', async function (next: (err?: Error) => void) {
    if (this.isModified("reviews") && this.reviews.length !== 0) {
        const totalRating = this.reviews.reduce((sum: number, review: IReview) => sum + review.averagePartialRating, 0);
        this.averageRating = totalRating / this.reviews.length;
    };

    if (this.isModified('title')) {
        this.slug = updateSlug(this.title);
    }

    next();
});

const Tour = mongoose.model('Tour', tourSchema);

export default Tour;