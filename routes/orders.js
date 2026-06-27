const express = require("express");
const router = express.Router();
const Order = require("../models/orders");
const User = require("../models/users");
const Product = require("../models/products");
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

        // Securely resolve owner and initialize deliveryStatus for each item
        const itemsWithOwners = await Promise.all(items.map(async (item) => {
            let owner = item.owner;
            try {
                const product = await Product.findById(item._id);
                if (product) {
                    owner = product.owner;
                }
            } catch (err) {
                console.log(`Fallback for product ID ${item._id}:`, err.message);
            }
            return {
                _id: item._id,
                title: item.title,
                price: item.price,
                qnty: item.qnty,
                image: item.image,
                owner: owner,
                deliveryStatus: "Pending"
            };
        }));

        const order = await Order.create({
            orderId,
            user: userId,
            items: itemsWithOwners,
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

// Get orders received by the currently logged-in seller
router.get("/seller-orders", handleRestrictToLogin, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.type !== "seller") {
            return res.status(403).json({ error: "Access denied. Seller account required." });
        }

        // Find orders where at least one item is owned by this seller
        const orders = await Order.find({ "items.owner": user._id }).sort({ createdAt: -1 });
        res.json({ orders });
    } catch (error) {
        console.error("Error fetching seller orders:", error);
        res.status(500).json({ error: error.message || "Failed to fetch seller orders" });
    }
});

// Update delivery status of a specific item in an order
router.patch("/:orderId/item/:itemId/status", handleRestrictToLogin, async (req, res) => {
    try {
        const user = await User.findOne({ email: req.user.email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (user.type !== "seller") {
            return res.status(403).json({ error: "Access denied. Seller account required." });
        }

        const { orderId, itemId } = req.params;
        const { deliveryStatus } = req.body;

        if (!["Pending", "Shipped", "Delivered", "Cancelled"].includes(deliveryStatus)) {
            return res.status(400).json({ error: "Invalid delivery status" });
        }

        const order = await Order.findOne({ orderId: orderId });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        const item = order.items.find(i => i._id.toString() === itemId.toString());
        if (!item) {
            return res.status(404).json({ error: "Item not found in this order" });
        }

        // Verify that the logged-in seller owns this item
        if (item.owner.toString() !== user._id.toString()) {
            return res.status(403).json({ error: "Unauthorized to update this item's status" });
        }

        item.deliveryStatus = deliveryStatus;
        await order.save();

        res.json({ message: "Item delivery status updated successfully", order });
    } catch (error) {
        console.error("Error updating item delivery status:", error);
        res.status(500).json({ error: error.message || "Failed to update status" });
    }
});

module.exports = router;
