const Product = require("../models/products");

async function handleGetAllProducts(req, res) {
    const products = await Product.find({});
    return res.json(products);
}

async function handleGetUserProducts(req, res) {
    // console.log('received request');
    const owner = req.params.userId;
    if (owner === undefined || null) {
        res.json({ status: 'No user found!' });
    } else {
        const products = await Product.find({ owner });
        if (!products) {
            return res.json({ status: 'No product added!' });
        }
        res.json({ products: products });
    }
}

async function handleAddProducts(req, res) {
    const { title, description, category, owner, price } = req.body;
    console.log(req.file);
    if (!title || !price || !description || !owner || !category) {
        return res.json({ status: 'All fields are required!' });
    }
    await Product.create({
        title: title,
        description: description,
        category: category,
        image: req.file.filename,
        owner: owner,
        price: price,
    })
    return res.json({ status: 'Product added!' });
}

async function handleUpdateProducts(req, res) {
    const _id = req.params.id;
    // console.log(req.body);
    
    const entry = await Product.findOneAndUpdate({_id}, req.body);
    if(entry){
    return res.json({ status: 'Product updated!' });
    }else{
        return res.json({ status: 'Product not updated!' });
    }
}

async function handleDeleteProduct(req, res) {
    const _id = req.params.id;
    await Product.findByIdAndDelete(_id);
    return res.json({ status: 'Product deleted!' });
}

module.exports = { handleGetUserProducts, handleGetAllProducts, handleAddProducts, handleUpdateProducts, handleDeleteProduct };