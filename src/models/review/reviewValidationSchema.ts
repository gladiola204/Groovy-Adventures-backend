import Joi from "joi";
import JoiObjectId from 'joi-objectid';

export const reviewValidationSchema = Joi.object({
    cleanliness: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Please add a cleanliness rate',
        'number.integer': 'Cleanliness rate must be an integer',
        'number.base': 'Cleanliness rate must be a number',
        'number.less': 'Cleanliness rate must be greater than or equal to 1',
        'number.greater': 'Cleanliness rate must be less than or equal to 5',
    }),
    valuePrice: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Please add a value/price rate',
        'number.integer': 'Value/price rate must be an integer',
        'number.base': 'Value/price rate must be a number',
        'number.less': 'Value/price rate must be greater than or equal to 1',
        'number.greater': 'Value/price rate must be less than or equal to 5',
    }),
    food: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Please add a food rate',
        'number.integer': 'Food rate must be an integer',
        'number.base': 'Food rate must be a number',
        'number.less': 'Food rate must be greater than or equal to 1',
        'number.greater': 'Food rate must be less than or equal to 5',
    }),
    communication: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Please add a communication rate',
        'number.integer': 'Communication rate must be an integer',
        'number.base': 'Communication rate must be a number',
        'number.less': 'Communication rate must be greater than or equal to 1',
        'number.greater': 'Communication rate must be less than or equal to 5',
    }),
    attractions: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Please add an attractions rate',
        'number.integer': 'Attractions rate must be an integer',
        'number.base': 'Attractions rate must be a number',
        'number.less': 'Attractions rate must be greater than or equal to 1',
        'number.greater': 'Attractions rate must be less than or equal to 5',
    }),
    atmosphere: Joi.number().integer().min(1).max(5).required().messages({
        'any.required': 'Please add an atmosphere rate',
        'number.integer': 'Atmosphere rate must be an integer',
        'number.base': 'Atmosphere rate must be a number',
        'number.less': 'Atmosphere rate must be greater than or equal to 1',
        'number.greater': 'Atmosphere rate must be less than or equal to 5',
    }),
    comment: Joi.string().min(15).max(250).optional().trim().messages({
        'string.base': 'Comment must be a string',
        'string.less': 'Comment must be minimum 15 length',
        'string.greater': 'Comment must be up to 250 length',
        'string.trim': 'Comment should not contain leading or trailing white spaces',
    })
});

