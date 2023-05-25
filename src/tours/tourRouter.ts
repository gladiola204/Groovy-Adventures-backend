import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import getTour from "./controllers/getTour";
import filterTours from "./controllers/filterTours";
import { protection } from "../middlewares/authMiddleware";
import createReview from "./controllers/createReview";


const toursRouter = Router();

// pojedynczy produkt
toursRouter.get('/:slug', catchAsync(getTour));
// produkty z danej kategorii plus filtracje
toursRouter.get('/', catchAsync(filterTours));

// dodawanie recenzji
toursRouter.post('/:slug/reviews', catchAsync(protection), catchAsync(createReview));
// usuwanie recenzji


// Last minutes

// bestsellers


export default toursRouter;