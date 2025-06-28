import express from 'express';
import cors from 'cors';
import connectDB from './utils/util.js'; // Import the connection utility
import productRouter from './route/product.route.js';
import supplierRouter from './route/supplier.route.js';

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:5175',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json());

// Database Connection
connectDB(); // Use the imported connection utility

// Routes
app.use('/api/products', productRouter);
app.use('/api/suppliers', supplierRouter);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));