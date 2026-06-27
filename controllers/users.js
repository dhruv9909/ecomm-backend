const User = require("../models/users");
const jwt = require("jsonwebtoken");
const { setUser } = require("../services/auth");

async function handleGetDetails(req, res) {
    if (!req.user) { return res.json({ status: 'req.user not available!' }) }
    const { email, name, type } = req.user;
    // console.log('user', email);
    const user = await User.findOne({ email, name, type });
    res.json({ user: user });
}

async function handleAddUsers(req, res) {
    const { name, email, number, password, type } = req.body;
    if (!req.body || !name || !email || !number || !password || !type) {
        return res.json({ status: 'All fields are required!' });
    }
    await User.create({
        name: name,
        email: email,
        number: number,
        password: password,
        type: type,
    })
    return res.json({ status: 'Registration success!' });
}

async function handleLoginUser(req, res) {
    const { email, password } = req.body;
    if (!req.body || !email || !password) {
        return res.json({ status: 'All fields are required!' });
    }
    const user = await User.findOne({ email, password });

    if (user) {
        const token = setUser(user);
        // console.log(token);
        res.cookie('token', token, { expiresIn: '1h', httpOnly: true });
        return res.json({ status: 'Login success!', user: user });
    }
    return res.json({ status: 'Invalid email or password!' });
}

async function handleLogOut(req, res) {
    res.clearCookie('token');
    res.json({ status: 'Logged out!' });
}

async function handleUpdateUserCart(req, res) {
    if (!req.body) return res.json({ status: 'All fields are required!' });
    // console.log('req-params', req.params.id);
    // console.log('req-body', req.body);

    const id = req.params.id;
    const { _id, title, description, category, image, price, owner, qnty } = req.body;
    const entry = await User.findOneAndUpdate({ _id : id }, {
        $push: {
            cart: {
                _id: _id,
                title: title,
                description: description,
                category: category,
                image: image,
                price: price,
                owner: owner,
                qnty: qnty,
            }
        }
    });
    if (entry) return res.json({
        status: 'Cart updated successfully!',
        user: entry,
    })
    else return res.json({ status: 'Product not added' });
}

async function handleUpdateUserCartSingleProduct(req, res) {
    if (!req.body) return res.json({ status: 'All fields are required!' });
    const _id = req.params.id;
    const productId = req.params.productId;
    const { title, qnty } = req.body;
    
    // Parse to number if it is numeric to match the database ID type
    const parsedProductId = !isNaN(productId) && productId.trim() !== '' ? Number(productId) : productId;

    console.log('req-params', _id, qnty);
    console.log('req-body', parsedProductId);
    const entry = await User.findOneAndUpdate({ _id },
        {
            $set: {
                "cart.$[element].qnty": qnty
            },
        },
        {
            arrayFilters: [{ "element._id": parsedProductId }],
            new: true,
        }
    )
    if (entry) {
        // console.log(typeof(productId));
        // console.log(entry);
        return res.json({
            status: `${title} updated successfully!`,
            user: entry,
        })
    }
    else return res.json({ status: 'Product not added' });
}

async function handleDeleteProduct(req, res) {
    const _id = req.params.id;
    const productId = req.params.productId;
    
    // Parse to number if it is numeric to match the database ID type
    const parsedProductId = !isNaN(productId) && productId.trim() !== '' ? Number(productId) : productId;

    const entry = await User.findOneAndUpdate({ _id },
        {
            $pull: {
                cart: { _id: parsedProductId }
            }
        },
        { new: true, }
    )
    if (entry) {
        console.log(entry);
        return res.json({ 
            status: `${req.body.title} Deleted!`,
            user: entry
         });
    } else {
        return res.json({ status: 'Product not Deleted!' });
    }
}

async function handleDeleteUserCart(req, res) {
    const _id = req.params.id;
    const entry = await User.findOneAndUpdate({ _id },
        {
            $unset: {
                cart: []
            }
        }
    )
    if (entry) {
        // console.log(entry);
        return res.json({ status: 'Cart Deleted!' });
    } else {
        return res.json({ status: 'Cart not Deleted!' });
    }
}

async function handleDeleteUser(req, res) {
    if (!req.body) return res.json({ status: 'All fields are required!' });
    await User.findByIdAndDelete(req.params.id);
    return res.json({ status: 'User Deleted successfully!' });
}

module.exports = { handleDeleteUserCart, handleDeleteProduct, handleUpdateUserCartSingleProduct, handleLogOut, handleGetDetails, handleAddUsers, handleLoginUser, handleUpdateUserCart, handleDeleteUser };