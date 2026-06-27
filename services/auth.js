const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET || 'dhruv$123';

function setUser(user){
    const {email, name, type} = user;
    const token = jwt.sign({email, name, type }, secret);
    return token;
}

function getUser(token){
    if(token) return jwt.verify(token, secret); 
}

module.exports = {setUser, getUser};