const express = require("express");
const router = express.Router();
const Stripe = require("stripe");

router.post("/create-checkout-session", async (req, res) => {
    try {
        const { cartItems } = req.body;

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const stripeSecret = process.env.STRIPE_SECRET_KEY;
        if (!stripeSecret || stripeSecret === "your_stripe_secret_key_here") {
            return res.status(400).json({ 
                error: "Stripe Secret Key is not configured on the server. Please update STRIPE_SECRET_KEY in server/.env file." 
            });
        }

        const stripe = new Stripe(stripeSecret);

        // Map cart items to Stripe line items format
        const lineItems = cartItems.map((item) => ({
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.title,
                    description: item.description ? item.description.substring(0, 100) : "",
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects amount in cents
            },
            quantity: item.qnty,
        }));

        const origin = process.env.CORS_ORIGIN || "http://localhost:5173";

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${origin}/checkout?success=true`,
            cancel_url: `${origin}/checkout?cancel=true`,
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Stripe Checkout Session Error:", error);
        res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
});

module.exports = router;
