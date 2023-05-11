import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();
import express, { Request, Response } from 'express';
import cors from 'cors';


export const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.set("x-powered-by", false);


// Routes Middlewares



// Routes
app.get('*', (req: Request, res: Response) => {
    res.status(404).send("Not found");
})


// Error Middleware