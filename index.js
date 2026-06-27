require('dotenv').config();
const express = require("express");
const cookieParser = require('cookie-parser');

const { corsSol } = require('./cors');
const { connectMongodb } = require("./connect");
const { handleRestrictToLogin } = require("./middlewares/auth");
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const staticRouter = require("./routes/staticRouter");
const checkoutRouter = require("./routes/checkout");
const orderRouter = require("./routes/orders");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(corsSol);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/users', userRouter);
app.use('/products', handleRestrictToLogin, productRouter);
app.use('/allproducts', staticRouter);
app.use('/checkout', checkoutRouter);
app.use('/orders', orderRouter);

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("Error: MONGO_URI environment variable is not defined.");
    process.exit(1);
}

const mongoose = require("mongoose");

connectMongodb(mongoUri)
.then(async ()=>{
    console.log('mongoDB connected!');
    try {
        const db = mongoose.connection.db;
        const collections = await db.listCollections({ name: 'orders' }).toArray();
        if (collections.length > 0) {
            const indexes = await db.collection('orders').indexes();
            if (indexes.some(idx => idx.name === 'id_1')) {
                await db.collection('orders').dropIndex('id_1');
                console.log("Successfully dropped duplicate unique index 'id_1' on orders collection.");
            }
            if (indexes.some(idx => idx.name === 'stripeSessionId_1')) {
                await db.collection('orders').dropIndex('stripeSessionId_1');
                console.log("Successfully dropped duplicate unique index 'stripeSessionId_1' on orders collection.");
            }
        }
    } catch (err) {
        console.error("Error trying to check/drop indexes on orders collection:", err.message);
    }
})
.catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    console.error('Please verify your connection string in the .env file and ensure MongoDB is running/accessible.');
});

app.listen(PORT, ()=> console.log(`Server started at http://localhost:${PORT}`));