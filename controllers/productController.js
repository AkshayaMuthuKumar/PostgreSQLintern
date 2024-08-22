const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

// Create a new product
exports.createProduct = async (req, res) => {
    const { name, price, companyId } = req.body;
    const query = 'INSERT INTO "Products" (name, price, "companyId", "createdAt", "updatedAt") VALUES (:name, :price, :companyId, NOW(), NOW()) RETURNING *';
    try {
        const [result] = await sequelize.query(query, {
            replacements: { name, price, companyId },
            type: QueryTypes.INSERT
        });
        res.status(201).json(result[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all products
exports.getAllProducts = async (req, res) => {
    const query = 'SELECT * FROM "Products"';
    try {
        const products = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a product by ID
exports.getProductById = async (req, res) => {
    const productId = req.params.id;
    const query = 'SELECT * FROM "Products" WHERE id = :id';
    try {
        const product = await sequelize.query(query, {
            replacements: { id: productId },
            type: QueryTypes.SELECT
        });
        if (product.length > 0) {
            res.status(200).json(product[0]);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a product
exports.updateProduct = async (req, res) => {
    const productId = req.params.id;
    const { name, price, companyId } = req.body;
    const query = 'UPDATE "Products" SET name = :name, price = :price, "companyId" = :companyId WHERE id = :id';
    try {
        const [affectedRows] = await sequelize.query(query, {
            replacements: { name, price, companyId, id: productId },
            type: QueryTypes.UPDATE
        });
        if (affectedRows > 0) {
            res.status(200).json({ message: 'Product updated successfully' });
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
    const productId = req.params.id;
    const query = 'DELETE FROM "Products" WHERE id = :id';
    try {
        const [affectedRows] = await sequelize.query(query, {
            replacements: { id: productId },
            type: QueryTypes.DELETE
        });
        if (affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
