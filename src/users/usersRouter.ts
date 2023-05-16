import express from 'express';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';
import changePassword from './controllers/changePassword';
import confirmEmail from './controllers/confirmEmail';
import forgotPassword from './controllers/forgotPassword';
import loginUser from './controllers/loginUser';
import logoutUser from './controllers/logoutUser';
import registerUser from './controllers/registerUser';
import resendVerificationEmail from './controllers/resendVerificationEmail';
import resetPassword from './controllers/resetPassword';
import statusUser from './controllers/statusUser';
import { updateUser } from './controllers/updateUser';

const usersRouter = express.Router();

usersRouter.post('/register', catchAsync(registerUser));
usersRouter.patch('/confirmemail/:token', catchAsync(confirmEmail));
usersRouter.post('/resendverificationemail', catchAsync(resendVerificationEmail));
usersRouter.post('/login', catchAsync(loginUser));
usersRouter.delete('/logout', catchAsync(protection), catchAsync(logoutUser));
usersRouter.get('/loggedin', catchAsync(protection), catchAsync(statusUser));
usersRouter.patch('/updateuser', catchAsync(protection), catchAsync(updateUser));
usersRouter.patch('/changepassword', catchAsync(protection), catchAsync(changePassword));
usersRouter.post('/forgotpassword', catchAsync(forgotPassword));
usersRouter.patch('/resetpassword/:token', catchAsync(resetPassword));

export default usersRouter;