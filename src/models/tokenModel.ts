import mongoose, { Types } from "mongoose";
import crypto from 'crypto';

const tokenSchema = new mongoose.Schema({
    userId: {
        type: Types.ObjectId,
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

tokenSchema.pre('save', async function(next: (err?: Error) => void) {
    const hashedToken = crypto.createHash('sha256').update(this.token).digest('hex');
    this.token = hashedToken;
    next();
});

tokenSchema.pre('findOne', async function(next: (err?: Error) => void) {
    const filter = this.getFilter();
    if (filter.token) {
        const hashedToken = crypto.createHash('sha256').update(filter.token).digest('hex');
        filter.token = hashedToken;
        this.setQuery(filter);
    }
    next();
})

const Token = mongoose.model("Token", tokenSchema);

export default Token;