import { Router } from 'express';
import loginAdmin from './controllers/loginAdmin';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';
import adminProtection from '../middlewares/adminAuthMiddleware';
import { upload } from '../utils/uploadFiles';
import createTour from './controllers/createTour';
import createCategory from './controllers/createCategory';
import updateTour from './controllers/updateTour';
import deleteTour from './controllers/deleteTour';
import updateCategory from './controllers/updateCategory';
import deleteCategory from './controllers/deleteCategory';

const adminRouter = Router();

adminRouter.post('/login', catchAsync(loginAdmin));

adminRouter.post('/tours', catchAsync(protection), adminProtection, upload.array('images', 10), catchAsync(createTour));
adminRouter.patch('/tours/:slug', catchAsync(protection), adminProtection, upload.array('images', 10), catchAsync(updateTour));
adminRouter.delete('/tours/:slug', catchAsync(protection), adminProtection, catchAsync(deleteTour));

adminRouter.post('/categories', catchAsync(protection), adminProtection, upload.single('icon'), catchAsync(createCategory));
adminRouter.patch('/categories/:slug', catchAsync(protection), adminProtection, upload.single('icon'), catchAsync(updateCategory));
adminRouter.delete('/categories/:slug', catchAsync(protection), adminProtection, catchAsync(deleteCategory));



export default adminRouter;