import { Response } from "express";

const checkDataExistence = (res: Response, data: Array<any>, message: string, shouldExist: boolean) => {
    const foundData = data.every(item => item !== null && item !== undefined);

    if ((foundData && !shouldExist) || (!foundData && shouldExist)) {
        res.status(400);
        throw new Error(message);
  }
}

export default checkDataExistence;