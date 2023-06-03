import express from 'express';
import { catchAsync } from '../utils/catchAsync';
import { protection } from '../middlewares/authMiddleware';
import changePassword from './controllers/passwordHandlers/changePassword';
import confirmEmail from './controllers/confirmEmail';
import forgotPassword from './controllers/passwordHandlers/forgotPassword';
import loginUser from './controllers/loginUser';
import logoutUser from './controllers/logoutUser';
import registerUser from './controllers/registerUser';
import resendVerificationEmail from './controllers/resendVerificationEmail';
import resetPassword from './controllers/passwordHandlers/resetPassword';
import statusUser from './controllers/statusUser';
import { updateUser } from './controllers/updateUser';
import purchaseTour from './controllers/purchaseTour';
import recaptcha from '../middlewares/recaptcha';

const usersRouter = express.Router();

usersRouter.post('/register', catchAsync(registerUser));
usersRouter.patch('/confirmemail/:token', catchAsync(confirmEmail));
usersRouter.post('/resendverificationemail', catchAsync(resendVerificationEmail));
usersRouter.post('/login', recaptcha.middleware.verify, catchAsync(loginUser));
usersRouter.delete('/logout', catchAsync(protection, ['admin', 'user']), catchAsync(logoutUser));
usersRouter.get('/loggedin', catchAsync(protection, ['admin', 'user']), catchAsync(statusUser));
usersRouter.patch('/updateuser', catchAsync(protection, ['user']), catchAsync(updateUser));
usersRouter.patch('/changepassword', catchAsync(protection, ['admin', 'user']), catchAsync(changePassword));
usersRouter.post('/forgotpassword', catchAsync(forgotPassword));
usersRouter.patch('/resetpassword/:token', catchAsync(resetPassword));
usersRouter.patch('/purchase', catchAsync(protection, ['user']), catchAsync(purchaseTour));

export default usersRouter;