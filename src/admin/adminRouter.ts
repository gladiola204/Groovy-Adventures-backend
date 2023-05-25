import { Router } from 'express';
import loginAdmin from './controllers/loginAdmin';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';
import adminProtection from '../middlewares/adminAuthMiddleware';
import { upload } from '../utils/uploadFiles';
import createTour from './controllers/tour/createTour';
import createCategory from './controllers/category/createCategory';
import updateTour from './controllers/tour/updateTour';
import deleteTour from './controllers/tour/deleteTour';
import updateCategory from './controllers/category/updateCategory';
import deleteCategory from './controllers/category/deleteCategory';

const adminRouter = Router();

adminRouter.post('/login', catchAsync(loginAdmin));

adminRouter.post('/tours', catchAsync(protection), adminProtection, upload.array('images', 10), catchAsync(createTour));
adminRouter.patch('/tours/:slug', catchAsync(protection), adminProtection, upload.array('images', 10), catchAsync(updateTour));
adminRouter.delete('/tours/:slug', catchAsync(protection), adminProtection, catchAsync(deleteTour));

adminRouter.post('/categories', catchAsync(protection), adminProtection, upload.single('icon'), catchAsync(createCategory));
adminRouter.patch('/categories/:slug', catchAsync(protection), adminProtection, upload.single('icon'), catchAsync(updateCategory));
adminRouter.delete('/categories/:slug', catchAsync(protection), adminProtection, catchAsync(deleteCategory));


export default adminRouter;