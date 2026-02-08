require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/Product');
const Order = require('./models/Order');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection (Using simple local string for now; can be replaced with Atlas later)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/priya_traders';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB');
        seedInitialProducts();
    })
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Initial Seed Function
async function seedInitialProducts() {
    try {
        const count = await Product.countDocuments();
        if (count === 0) {
            const initialProducts = [
                {
                    name: 'Premium Idly Batter',
                    description: 'Stone-ground, naturally fermented, home-style batter for soft and fluffy idlis.',
                    price: 70,
                    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&q=80&w=800',
                    category: 'Batter',
                    maker: 'Priya Traders - Home Made'
                },
                {
                    name: 'Crispy Dosa Batter',
                    description: 'Perfectly balanced batter for restaurant-style thin and crispy golden dosas.',
                    price: 70,
                    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&q=80&w=800',
                    category: 'Batter',
                    maker: 'Priya Traders - Home Made'
                }
            ];
            await Product.insertMany(initialProducts);
            console.log('✅ Initial products seeded');
        } else {
            // Force Sync Prices to 70 for existing items
            await Product.updateMany({ name: 'Premium Idly Batter' }, { $set: { price: 70 } });
            await Product.updateMany({ name: 'Crispy Dosa Batter' }, { $set: { price: 70 } });
            console.log('✅ Product prices synced to ₹70');
        }
    } catch (err) {
        console.error('❌ Error seeding products:', err);
    }
}

// Routes
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find({ inStock: true });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = new Order(req.body);
        const savedOrder = await newOrder.save();
        res.status(201).json(savedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.patch('/api/orders/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/api/orders/check/:phone', async (req, res) => {
    try {
        const phone = req.params.phone;
        const count = await Order.countDocuments({ customerPhone: phone });
        res.json({ hasPreviousOrders: count > 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
