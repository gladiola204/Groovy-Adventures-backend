import express from 'express';
import { registerUser } from './usersController';
import { catchAsync } from '../utils/catchAsync';

const usersRouter = express.Router();

usersRouter.post('/register', catchAsync(registerUser));


export default usersRouter;