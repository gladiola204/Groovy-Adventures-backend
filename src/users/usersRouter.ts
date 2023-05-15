import express from 'express';
import { confirmEmail, loginUser, logoutUser, registerUser, resendVerificationEmail } from './usersController';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';

const usersRouter = express.Router();

usersRouter.post('/register', catchAsync(registerUser));
usersRouter.patch('/confirmemail/:token', catchAsync(confirmEmail));
usersRouter.post('/resendverificationemail', catchAsync(resendVerificationEmail));
usersRouter.post('/login', catchAsync(loginUser));
usersRouter.delete('/logout', catchAsync(protection), catchAsync(logoutUser));

export default usersRouter;