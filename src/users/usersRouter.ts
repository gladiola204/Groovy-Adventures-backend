import express from 'express';
import { confirmEmail, registerUser } from './usersController';
import { catchAsync } from '../utils/catchAsync';

const usersRouter = express.Router();

usersRouter.post('/register', catchAsync(registerUser));
usersRouter.patch('/confirmemail/:token', catchAsync(confirmEmail));

export default usersRouter;