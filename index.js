const express = require("express");
const cookieParser = require('cookie-parser');

const { corsSol } = require('./cors');
const { connectMongodb } = require("./connect");
const { handleRestrictToLogin } = require("./middlewares/auth");
const userRouter = require("./routes/users");
const productRouter = require("./routes/products");
const staticRouter = require("./routes/staticRouter")

const app = express();
const PORT = 5000;

app.use(corsSol);
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static('public'));

app.use('/users', userRouter);
app.use('/products', handleRestrictToLogin, productRouter);
app.use('/allproducts', staticRouter);

connectMongodb('mongodb+srv://dbUser:dbUserPassword@cluster0.d4qt9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
.then(()=>{console.log('mongoDB connected!')});

app.listen(PORT, ()=> console.log(`Server started at http://localhost:${PORT}`));