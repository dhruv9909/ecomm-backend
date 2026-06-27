const cors = require("cors");

var corsOptions = {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173", // Replace with your frontend URL
    credentials: true
};

const corsSol = cors(corsOptions);

module.exports = { corsSol };