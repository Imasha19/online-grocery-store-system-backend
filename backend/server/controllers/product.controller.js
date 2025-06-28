import Product from '../models/product.model.js';
import { upload, imageUploadUtil, cloudinary } from '../utils/cloudinary.util.js';
import PDFDocument from 'pdfkit';

// Create a new product with image upload
export const createProduct = async (req, res) => {
    try {
        console.log('Request files received:', {
            count: req.files?.length,
            files: req.files?.map(f => ({
                name: f.originalname,
                size: f.size,
                type: f.mimetype
            }))
        });

        let images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await imageUploadUtil(file);
                    images.push({
                        public_id: result.public_id,
                        url: result.secure_url
                    });
                } catch (uploadError) {
                    console.error(`Failed to upload ${file.originalname}:`, uploadError);
                    // Continue with other files even if one fails
                }
            }
        }

        if (images.length === 0 && req.files?.length > 0) {
            throw new Error('All image uploads failed');
        }

        const product = new Product({
            ...req.body,
            images
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Product creation failed:', {
            error: error.message,
            body: req.body,
            stack: error.stack
        });
        res.status(400).json({ 
            success: false,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product (with optional image update)
export const updateProduct = async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        // Handle image upload if present
        if (req.files && req.files.length > 0) {
            const images = [];
            for (const file of req.files) {
                try {
                    const result = await imageUploadUtil(file);
                    images.push({
                        public_id: result.public_id,
                        url: result.secure_url
                    });
                } catch (uploadError) {
                    console.error(`Failed to upload ${file.originalname}:`, uploadError);
                    // Continue with other files even if one fails
                }
            }
            
            // Combine existing images with new ones
            if (req.body.existingImages) {
                const existingImages = JSON.parse(req.body.existingImages);
                updateData.images = [...existingImages, ...images];
            } else {
                updateData.images = images;
            }
        } else if (req.body.existingImages) {
            // If no new images but existing images are provided
            updateData.images = JSON.parse(req.body.existingImages);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Product update failed:', {
            error: error.message,
            body: req.body,
            stack: error.stack
        });
        res.status(400).json({ 
            success: false,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// Delete a product (and its images from Cloudinary)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete images from Cloudinary if they exist
        if (product.images && product.images.length > 0) {
            try {
                for (const image of product.images) {
                    if (image.public_id) {
                        await cloudinary.uploader.destroy(image.public_id);
                    }
                }
            } catch (cloudinaryError) {
                console.error('Error deleting images from Cloudinary:', cloudinaryError);
                // Continue with product deletion even if image deletion fails
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get total stock sum of all products
export const getTotalStock = async (req, res) => {
    try {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" }
                }
            }
        ]);

        const totalStock = result.length > 0 ? result[0].totalStock : 0;
        res.json({ totalStock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get comprehensive inventory statistics
export const getInventoryStats = async (req, res) => {
    try {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" },
                    totalProducts: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    categories: { $addToSet: "$category" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalStock: 1,
                    totalProducts: 1,
                    averagePrice: { $round: ["$averagePrice", 2] },
                    totalValue: { $round: ["$totalValue", 2] },
                    categoryCount: { $size: "$categories" }
                }
            }
        ]);

        res.json(result[0] || {
            totalStock: 0,
            totalProducts: 0,
            averagePrice: 0,
            totalValue: 0,
            categoryCount: 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate PDF for products
export const generateProductsPDF = async (req, res) => {
    try {
        const products = await Product.find();
        const stats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" },
                    totalProducts: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    categories: { $addToSet: "$category" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalStock: 1,
                    totalProducts: 1,
                    averagePrice: { $round: ["$averagePrice", 2] },
                    totalValue: { $round: ["$totalValue", 2] },
                    categoryCount: { $size: "$categories" }
                }
            }
        ]).then(result => result[0] || {
            totalStock: 0,
            totalProducts: 0,
            averagePrice: 0,
            totalValue: 0,
            categoryCount: 0
        });
        
        // Create a PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(24).text('Product Inventory Report', { align: 'center' });
        doc.moveDown(1);
        
        // Add date and total products
        doc.fontSize(10);
        const currentDate = new Date().toLocaleDateString();
        doc.text(`Generated on: ${currentDate}`, { align: 'right' });
        doc.moveDown(2);
        
        // Add Inventory Summary section
        doc.fontSize(16).text('Inventory Summary', { align: 'center' });
        doc.moveDown(1);
        
        // Stats grid
        const statsTop = 150;
        const statsLeft = 50;
        const statsWidth = 100;
        const statsHeight = 60;
        
        // Draw stats boxes
        const statsData = [
            { title: 'Total Products', value: stats.totalProducts },
            { title: 'Total Stock', value: stats.totalStock },
            { title: 'Avg. Price', value: `Rs. ${stats.averagePrice.toFixed(2)}` },
            { title: 'Total Value', value: `Rs. ${stats.totalValue.toFixed(2)}` },
            { title: 'Categories', value: stats.categoryCount }
        ];
        
        statsData.forEach((stat, index) => {
            const x = statsLeft + (index * (statsWidth + 20));
            
            // Draw box
            doc.fillColor('#f9fafb');
            doc.rect(x, statsTop, statsWidth, statsHeight).fill();
            doc.strokeColor('#e5e7eb');
            doc.rect(x, statsTop, statsWidth, statsHeight).stroke();
            
            // Add text
            doc.fillColor('#000000');
            doc.fontSize(10).text(stat.title, x + 5, statsTop + 10, { width: statsWidth - 10 });
            doc.fontSize(14).text(stat.value.toString(), x + 5, statsTop + 30, { width: statsWidth - 10 });
        });
        
        doc.moveDown(4);
        
        // Add Product Details section
        doc.fontSize(16).text('Product Details', { align: 'center' });
        doc.moveDown(1);
        
        // Table settings with adjusted column widths
        const tableTop = 350;
        const tableLeft = 50;
        const columnWidths = {
            name: 120,
            price: 80,
            stock: 60,
            category: 100,
            supplier: 120
        };
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        const minRowHeight = 30;
        
        // Draw table headers with background
        doc.fontSize(12);
        doc.fillColor('#f3f4f6'); // Light gray background
        doc.rect(tableLeft, tableTop, totalWidth, minRowHeight).fill();
        doc.fillColor('#000000'); // Reset text color
        
        // Draw header text with wrapping
        let currentX = tableLeft;
        const headerTitles = ['Name', 'Price', 'Stock', 'Category', 'Supplier'];
        const headerKeys = Object.keys(columnWidths);
        let headerHeights = [];
        headerTitles.forEach((title, i) => {
            const height = doc.heightOfString(title, { width: columnWidths[headerKeys[i]] - 10 });
            headerHeights.push(height);
        });
        const headerRowHeight = Math.max(...headerHeights) + 20;
        currentX = tableLeft;
        headerTitles.forEach((title, i) => {
            doc.text(title, currentX + 5, tableTop + 10, { width: columnWidths[headerKeys[i]] - 10 });
            currentX += columnWidths[headerKeys[i]];
        });
        // Draw header borders
        doc.strokeColor('#000000');
        doc.lineWidth(1);
        doc.rect(tableLeft, tableTop, totalWidth, headerRowHeight).stroke();
        
        // Add table rows with wrapping and dynamic height
        let y = tableTop + headerRowHeight;
        products.forEach((product, index) => {
            if (y > 700) { // Start new page if near bottom
                doc.addPage();
                y = 50;
            }
            // Prepare cell values
            const cellValues = [
                product.name || '-',
                `Rs. ${product.price?.toFixed(2) || '-'}`,
                product.stock?.toString() || '-',
                product.category || '-',
                product.supplier || '-'
            ];
            // Calculate max height needed for this row
            let cellHeights = cellValues.map((val, i) =>
                doc.heightOfString(val, { width: columnWidths[headerKeys[i]] - 10 })
            );
            let rowHeight = Math.max(...cellHeights) + 20;
            // Draw row background
            doc.fillColor(index % 2 === 0 ? '#ffffff' : '#f9fafb');
            doc.rect(tableLeft, y, totalWidth, rowHeight).fill();
            doc.fillColor('#000000'); // Reset text color
            // Draw cell borders
            doc.strokeColor('#e5e7eb');
            doc.rect(tableLeft, y, totalWidth, rowHeight).stroke();
            // Draw cell content with wrapping
            currentX = tableLeft;
            cellValues.forEach((val, i) => {
                doc.fontSize(10).text(val, currentX + 5, y + 10, { width: columnWidths[headerKeys[i]] - 10 });
                currentX += columnWidths[headerKeys[i]];
            });
            y += rowHeight;
        });
        
        // Add footer
        doc.fontSize(10);
        doc.text(`© ${new Date().getFullYear()} Quick Cart Grocery Store - Inventory Management System`, 50, y + 20, { align: 'center' });
        doc.text(`Report generated on ${currentDate}`, 50, y + 35, { align: 'center' });
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: error.message });
    }
};