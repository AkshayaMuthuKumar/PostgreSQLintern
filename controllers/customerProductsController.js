const CustomerProducts = require ("../models/customerproducts");

// Controller to add a customer to a product
exports.addCustomerToProduct = async (req, res) => {
    const { customerId, productId } = req.body;

    try {
        const existingRelation = await CustomerProducts.findOne({
            where: { CustomerId: customerId, ProductId: productId }
        });

        if (existingRelation) {
            return res.status(400).json({ error: 'Customer is already associated with this product' });
        }

        const newRelation = await CustomerProducts.create({
            CustomerId: customerId,
            ProductId: productId
        });

        res.status(201).json(newRelation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller to remove a customer from a product
exports.removeCustomerFromProduct = async (req, res) => {
    const { customerId, productId } = req.body;

    try {
        const result = await CustomerProducts.destroy({
            where: { CustomerId: customerId, ProductId: productId }
        });

        if (result === 0) {
            return res.status(404).json({ error: 'Association not found' });
        }

        res.status(200).json({ message: 'Customer removed from product successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
