import { Router } from 'express';
import loginAdmin from './controllers/loginAdmin';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';
import adminProtection from '../middlewares/adminAuthMiddleware';
import { upload } from '../utils/uploadFiles';
import createTour from './controllers/createTour';
import createCategory from './controllers/createCategory';

const adminRouter = Router();

adminRouter.post('/login', catchAsync(loginAdmin));
adminRouter.post('/tours', catchAsync(protection), adminProtection, upload.array('images', 10), catchAsync(createTour));
adminRouter.post('/categories', catchAsync(protection), adminProtection, upload.single('image'), catchAsync(createCategory));
//adminRouter.patch('/tours/:productId', catchAsync(protection), catchAsync(adminProtection), catchAsync(loginAdmin));


export default adminRouter;