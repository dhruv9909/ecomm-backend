const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    category:{
        type: String,
        required: true,
    },
    image:{
        type: String,
    },
    rating:{
        type: String,
    },
    price:{
        type: Number,
        required: true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    },
    sales:{
        type: Number,
    },
})

const Product = mongoose.model('products',productSchema);
module.exports = Product;