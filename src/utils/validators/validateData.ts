import { Response } from "express";
import Joi from "joi";

type SchemaType = Joi.ArraySchema<any[]> | Joi.ObjectSchema<any>;
type DataType = any[] | object | undefined;

function validateData(schema: SchemaType, data: DataType, res: Response) {
    const { error } = schema.validate(data);

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join('. ');
      res.status(400);
      throw new Error(errorMessage);
    }
};

export default validateData;