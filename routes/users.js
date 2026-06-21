const express = require("express");
const { handleDeleteUserCart, handleDeleteProduct, handleUpdateUserCartSingleProduct, handleLogOut, handleGetDetails, handleAddUsers, handleLoginUser, handleUpdateUserCart, handleDeleteUser } = require("../controllers/users");
const { handleRestrictToLogin, handleLoginExistingUser } = require("../middlewares/auth");

const router = express.Router();
//token based authentication
router.get('/auth',handleLoginExistingUser, handleGetDetails);

router.post('/register', handleAddUsers);

router.post('/login', handleLoginUser);

router.get('/logout', handleLogOut);

router.patch('/cart/:id',handleRestrictToLogin, handleUpdateUserCart);

router.delete('/cart/:id',handleRestrictToLogin, handleDeleteUserCart);

router.patch('/cart/:id/:productId',handleRestrictToLogin, handleUpdateUserCartSingleProduct);

router.delete('/cart/:id/:productId', handleRestrictToLogin, handleDeleteProduct);

router.delete('/',handleRestrictToLogin, handleDeleteUser);

module.exports = router;