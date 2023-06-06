import Joi from "joi";
import JoiObjectId from 'joi-objectid';


const imageArrayValidationSchema = Joi.array().items(
    Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({'string.pattern.base': 'Invalid item ID',}), 
    JoiObjectId(Joi)
).optional().messages({
    'array.base': 'Reviews must be an array',
});

export default imageArrayValidationSchema;