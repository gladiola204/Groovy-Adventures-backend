import Joi from "joi";
import JoiObjectId from 'joi-objectid';

export const tourValidationSchema = Joi.object({
    title: Joi.string().required().trim().messages({
        'any.required': 'Please add a title',
        'string.base': 'Title must be a string',
        'string.trim': 'Title should not contain leading or trailing white spaces',
    }),
    category: Joi.string().required().messages({
        'any.required': 'Please add a category',
        'string.base': 'Category must be a string',
    }),
    generalDescription: Joi.string().required().messages({
        'any.required': 'Please add a general description',
        'string.base': 'General description must be a string',
    }),
    dailyItineraryDescription: Joi.string().required().messages({
        'any.required': 'Please add a daily itinerary',
        'string.base': 'Daily itinerary description must be a string',
    }),
    reviews: Joi.array()
        .items(Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({'string.pattern.base': 'Invalid item ID',}), JoiObjectId(Joi))
        .default([])
        .messages({
        'array.base': 'Reviews must be an array',
        }),
});

export const updateTourSchema = tourValidationSchema.keys({
    title: Joi.optional(),
    category: Joi.optional(),
    generalDescription: Joi.optional(),
    dailyItineraryDescription: Joi.optional(),
});

