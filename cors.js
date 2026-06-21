const cors = require("cors");

var corsOptions = {
    origin: "http://localhost:5173", // Replace with your frontend URL
    credentials: true
};

const corsSol = cors(corsOptions);

module.exports = { corsSol };