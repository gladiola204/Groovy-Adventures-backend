import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import getTour from "./controllers/getTour";
import filterTours from "./controllers/filterTours";
import { protection } from "../middlewares/authMiddleware";
import createReview from "./controllers/createReview";
import deleteReview from "./controllers/deleteReview";


const toursRouter = Router();

toursRouter.get('/:slug', catchAsync(getTour));
toursRouter.get('/', catchAsync(filterTours));

toursRouter.post('/:slug/reviews', catchAsync(protection), catchAsync(createReview));
toursRouter.delete('/reviews', catchAsync(protection), catchAsync(deleteReview));

// Last minutes

// bestsellers


export default toursRouter;