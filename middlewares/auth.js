const {getUser} = require('../services/auth');

async function handleLoginExistingUser(req, res, next){
    if(!req.cookies.token){return res.json(res.cookies)};
    const token = req.cookies.token;
    const user = getUser(token);
    // console.log('user-middleware', user);
    req.user = user;
    next();
}

async function handleRestrictToLogin(req, res, next){
    const token = req.cookies?.token;
    // if (!token) return res.redirect('/users/login');
    const user = getUser(token);
    // console.log(token);
    if(!user){
        return res.status(401).json({ message: "Unauthorized" })
    }else{
        req.user = user;
    }
    next();
}

async function handleAccountType(req, res, next){
    // console.log('request received');
    
    if(!req.user.type.includes('seller')) return res.status(401).json({ message: "Unauthorized" });
    next();
}

module.exports = { handleLoginExistingUser, handleRestrictToLogin, handleAccountType };