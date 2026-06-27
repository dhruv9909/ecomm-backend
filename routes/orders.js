const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const User = require("../models/users");
const { handleRestrictToLogin } = require("../middlewares/auth");

// Create a new order (clears user cart in DB as well)
router.post("/", handleRestrictToLogin, async (req, res) => {
    try {
        const { orderId, items, totalAmount, shippingAddress, paymentMethod, paymentStatus } = req.body;
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = user._id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "No items to place order" });
        }

        if (!orderId || !totalAmount || !shippingAddress || !paymentMethod) {
            return res.status(400).json({ error: "Missing required order details" });
        }

        const order = await Order.create({
            orderId,
            user: userId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: paymentStatus || "Pending",
        });

        // Clear user's cart in the database
        await User.findByIdAndUpdate(userId, { $set: { cart: [] } });

        res.status(201).json({ status: "Order placed successfully!", order });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ error: error.message || "Failed to create order" });
    }
});

// Get currently logged-in user's orders
router.get("/my-orders", handleRestrictToLogin, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const userId = user._id;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: error.message || "Failed to fetch orders" });
    }
});

module.exports = router;
