import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import getTour from "./controllers/getTour";
import filterTours from "./controllers/filterTours";
import { protection } from "../middlewares/authMiddleware";
import createReview from "./controllers/createReview";
import deleteReview from "./controllers/deleteReview";
import getBestsellers from "./controllers/getBestsellers";
import getLastMinutes from "./controllers/getLastMinutes";


const toursRouter = Router();

toursRouter.get('/bestsellers', catchAsync(getBestsellers));
toursRouter.get('/lastminutes', catchAsync(getLastMinutes));

toursRouter.get('/:slug', catchAsync(getTour));
toursRouter.get('/', catchAsync(filterTours));

toursRouter.patch('/:slug/reviews', catchAsync(protection, ['user']), catchAsync(createReview));
toursRouter.delete('/reviews', catchAsync(protection, ['user', 'admin']), catchAsync(deleteReview));

export default toursRouter;