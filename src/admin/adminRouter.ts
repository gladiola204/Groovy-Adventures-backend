import { Router } from 'express';
import loginAdmin from './controllers/loginAdmin';
import { catchAsync } from '../utils/catchAsync';

const adminRouter = Router();

adminRouter.post('/login', catchAsync(loginAdmin));

export default adminRouter;