require('dotenv').config();
const express = require("express");
const cookieParser = require('cookie-parser');

const { corsSol } = require('./cors');
const { connectMongodb } = require("./connect");
const { handleRestrictToLogin } = require("./middlewares/auth");
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const staticRouter = require("./routes/staticRouter")

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

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
    console.error("Error: MONGO_URI environment variable is not defined.");
    process.exit(1);
}

connectMongodb(mongoUri)
.then(()=>{console.log('mongoDB connected!')})
.catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    console.error('Please verify your connection string in the .env file and ensure MongoDB is running/accessible.');
});

app.listen(PORT, ()=> console.log(`Server started at http://localhost:${PORT}`));