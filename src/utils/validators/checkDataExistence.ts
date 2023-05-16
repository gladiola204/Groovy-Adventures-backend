import { Response } from "express";

const checkDataExistence = (res: Response, data: Array<Object | string | boolean | null>, message: string, shouldExist: boolean) => {
    const foundData = data.every(item => item !== null && item !== undefined);

    if ((foundData && !shouldExist) || (!foundData && shouldExist)) {
        res.status(400);
        throw new Error(message);
  }
}

export default checkDataExistence;