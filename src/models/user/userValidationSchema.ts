import Joi from 'joi';

export const userValidationSchema = Joi.object({
    login: Joi.string().required().trim().min(3).max(40).messages({
        'any.required': 'Please provide a login',
        'string.base': 'Login must be a string',
        'string.greater': 'Login must be up to 40 characters',
        'string.less': "Login must include minimum 3 characters",
        'string.trim': 'Login should not contain leading or trailing white spaces',
    }),
    email: Joi.string().required().trim().pattern(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).messages({
        'any.required': 'Please provide an email',
        'string.base': 'Email must be a string',
        'string.pattern.base': 'Invalid email format',
        'string.trim': 'Email should not contain leading or trailing white spaces',
    }),
    password: Joi.string().required().trim().min(6).max(40).messages({
        'any.required': 'Please provide a password',
        'string.base': 'Password must be a string',
        'string.greater': 'Password must be up to 40 characters',
        'string.less': "Password must include minimum 3 characters",
    }),
    phone: Joi.string().optional().pattern(/^\+/).trim().messages({
        'string.base': 'Phone must be a string',
        'string.pattern.base': 'Invalid phone format. Please provide "+" at the beginning of phone number',
        'string.trim': 'Phone should not contain leading or trailing white spaces',
    }),
});

export const loginUserValidation = userValidationSchema.keys({
    login: Joi.optional(),
}) 

export const emailValidation = userValidationSchema.keys({
    login: Joi.optional(),
    password: Joi.optional(),
})

export const passwordValidation = userValidationSchema.keys({
    login: Joi.optional(),
    email: Joi.optional(),
});

export const phoneValidation = userValidationSchema.keys({
    login: Joi.optional(),
    email: Joi.optional(),
    password: Joi.optional(),
    phone: Joi.required(),
})

