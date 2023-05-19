import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        unique: true,
    },
    icon: {
        type: Object,
        default: {},
        //required: [true, 'Please add an icon']
    },
});

const Category = mongoose.model('Category', categorySchema);

export default Category;