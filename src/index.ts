import { app } from './server';
import mongoose from 'mongoose';

const port = process.env.port || 8000;

connect().catch(err => console.log(err));

async function connect() {
    await mongoose.connect(`${process.env.MONGO_URI}`);
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
};