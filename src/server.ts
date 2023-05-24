import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';
import errorHandler from './middlewares/errorMiddleware';
import usersRouter from './users/usersRouter';
import removeExpiredTokens from './utils/removeExpiredTokens';
import adminRouter from './admin/adminRouter';
import toursRouter from './tours/tourRouter';


export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("x-powered-by", false);


// Routes Middlewares
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/tours', toursRouter);

// Routes
app.get('*', (req: Request, res: Response) => {
    res.status(404).send("Not found");
})


// Error Middleware
app.use(errorHandler);

// We run a function to remove invalid tokens every 1 hour
setInterval(removeExpiredTokens, 3600000);