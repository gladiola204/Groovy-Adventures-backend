import express from 'express';
import { changePassword, confirmEmail, loginUser, logoutUser, registerUser, resendVerificationEmail, statusUser, updateUser } from './usersController';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';

const usersRouter = express.Router();

usersRouter.post('/register', catchAsync(registerUser));
usersRouter.patch('/confirmemail/:token', catchAsync(confirmEmail));
usersRouter.post('/resendverificationemail', catchAsync(resendVerificationEmail));
usersRouter.post('/login', catchAsync(loginUser));
usersRouter.delete('/logout', catchAsync(protection), catchAsync(logoutUser));
usersRouter.get('/loggedin', catchAsync(protection), catchAsync(statusUser));
usersRouter.patch('/updateuser', catchAsync(protection), catchAsync(updateUser));
usersRouter.patch('/changepassword', catchAsync(protection), catchAsync(changePassword));
// usersRouter.post('/forgotpassword', catchAsync(protection), catchAsync(changePassword));

export default usersRouter;