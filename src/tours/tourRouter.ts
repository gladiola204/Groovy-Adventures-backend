import { Router } from "express";
import { catchAsync } from "../utils/catchAsync";
import getTour from "./controllers/getTour";
import filterTours from "./controllers/filterTours";


const toursRouter = Router();

// pojedynczy produkt
toursRouter.get('/:slug', catchAsync(getTour));
// produkty z danej kategorii plus filtracje
toursRouter.get('/', catchAsync(filterTours));
// Last minutes

// bestsellers


export default toursRouter;