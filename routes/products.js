const express = require("express");
const { handleGetUserProducts, handleAddProducts, handleUpdateProducts, handleDeleteProduct } = require("../controllers/products");
const { handleAccountType } = require("../middlewares/auth");
const { upload } = require('../multer');

const router = express.Router();

router.get('/:userId',handleAccountType, handleGetUserProducts);

router.post('/', handleAccountType, upload.single('image'), handleAddProducts);

router.patch('/:id', handleAccountType, handleUpdateProducts);

router.delete('/:id', handleAccountType, handleDeleteProduct);

module.exports = router;