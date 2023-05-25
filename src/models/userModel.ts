import mongoose from "mongoose";
import bcryptjs from 'bcryptjs';
import { IUserDocument, IUserModel } from "../types/user.interface";

const userSchema = new mongoose.Schema<IUserDocument, IUserModel>({
    login: {
        type: String,
        required: [true, "Please add a login"],
        unique: true,
    },
    email: {
        type: String,
        required: [true, "Please add an email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email"
        ],
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLength: [6, 'Password must be more than 6 characters'],
        maxLength: [40, 'Password must be up to 40 characters']
    },
    phone: {
        type: String,
        default: "+48",
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: "user",
    },
    purchasedTourIds: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tour',
        }],
        default: [] as unknown as undefined[],
    }
}, {
    timestamps: true,
});

// Encrypt password before saving
userSchema.pre('save', async function(next: (err?: Error) => void) {
    if(!this.isModified("password")) {
        return next();
    };

    const salt = await bcryptjs.genSalt();
    const hashedPassword = await bcryptjs.hash(this.password, salt);
    this.password = hashedPassword;
    next();
});

const User = mongoose.model('User', userSchema)

export default User;