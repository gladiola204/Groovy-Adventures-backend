import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';
import { upload } from '../utils/uploadFiles';
import createTour from './controllers/tour/createTour';
import createCategory from './controllers/category/createCategory';
import updateTour from './controllers/tour/updateTour';
import deleteTour from './controllers/tour/deleteTour';
import updateCategory from './controllers/category/updateCategory';
import deleteCategory from './controllers/category/deleteCategory';

const adminRouter = Router();

adminRouter.post('/tours', catchAsync(protection, ['admin']), upload.array('images', 10), catchAsync(createTour));
adminRouter.patch('/tours/:slug', catchAsync(protection, ['admin']), upload.array('images', 10), catchAsync(updateTour));
adminRouter.delete('/tours/:slug', catchAsync(protection, ['admin']), catchAsync(deleteTour));

adminRouter.post('/categories', catchAsync(protection, ['admin']), upload.single('icon'), catchAsync(createCategory));
adminRouter.patch('/categories/:slug', catchAsync(protection, ['admin']), upload.single('icon'), catchAsync(updateCategory));
adminRouter.delete('/categories/:slug', catchAsync(protection, ['admin']), catchAsync(deleteCategory));

export default adminRouter;