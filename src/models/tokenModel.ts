import mongoose, { Types } from "mongoose";
import bcryptjs from 'bcryptjs';

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
    const salt = await bcryptjs.genSalt();
    const hashedToken = await bcryptjs.hash(this.token, salt);
    this.token = hashedToken;
    next();
})

const Token = mongoose.model("Token", tokenSchema);

export default Token;