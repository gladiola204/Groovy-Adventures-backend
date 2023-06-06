import Joi from "joi";
import JoiObjectId from 'joi-objectid';

export const scheduleArrayValidationSchema = Joi.array().items(
    Joi.object({
        _id: Joi.alternatives()
            .try(Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional().messages({
                'string.pattern.base': 'Schedule ID must be a valid ObjectId',
            }),
            JoiObjectId(Joi)).optional().messages({
                'any.invalid': 'Schedule ID must be a valid ObjectId',
                'string.objectId': 'Invalid schedule ID',
            }),
        startDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.base': 'Start date must be a string',
            'string.pattern.base': 'Start date must be in the format "YYYY-MM-DD"',
            'any.required': 'Start date is required',
            }),
        endDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.base': 'End date must be a string',
            'string.pattern.base': 'End date must be in the format "YYYY-MM-DD"',
            'any.required': 'End date is required',
            }),
        price: Joi.number().required().messages({
            'number.base': 'Price must be a number',
            'any.required': 'Price is required',
            }),
        availability: Joi.number().integer().required().messages({
            'any.required': 'Please add a quantity',
            'number.integer': 'Availability must be an integer',
            'number.base': 'Quantity must be a number',
            }),
        discount: Joi.object({
            isDiscounted: Joi.boolean().default(false),
            percentageOfDiscount: Joi.number().when('isDiscounted', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional(),
            }).messages({
            'number.base': 'Percentage of discount must be a number',
            'any.required': 'Percentage of discount is required when discount is enabled',
            }),
            expiresAt: Joi.date().when('isDiscounted', {
                is: true,
                then: Joi.required(),
                otherwise: Joi.optional(),
            }).messages({
            'date.base': 'Expires at must be a valid date',
            'any.required': 'Expires at is required when discount is enabled',
            }),
        }),
    })
).optional().custom((value, helpers) => {
    for (const item of value) {
        const { startDate, endDate } = item;

        console.log(startDate, endDate);
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return helpers.message({custom: 'End date must be later than start date.'});
        };

        if ((startDate && !endDate) || (!startDate && endDate)) {
            return helpers.message({custom: 'Please add start date and end date.'});
        };
    }

    return value;
})

export const deleteScheduleSchema = scheduleArrayValidationSchema.items({
    _id: Joi.required(),
    startDate: Joi.optional(),
    endDate: Joi.optional(),
    price: Joi.optional(),
    availability: Joi.optional(),
});

export const updateScheduleSchema = scheduleArrayValidationSchema.items({
    _id: Joi.required(),
    startDate: Joi.optional(),
    endDate: Joi.optional(),
    price: Joi.optional(),
    availability: Joi.optional(),
});

//.or('startDate', 'endDate', 'price', 'availability', 'discount').required();