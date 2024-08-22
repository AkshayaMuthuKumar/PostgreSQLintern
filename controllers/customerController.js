const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

// Create a new customer
exports.createCustomer = async (req, res) => {
    const { firstName, lastName, email } = req.body;
    const query = 'INSERT INTO "Customers" ("firstName", "lastName", email, "createdAt", "updatedAt") VALUES (:firstName, :lastName, :email, NOW(), NOW()) RETURNING *';
    try {
        const [result] = await sequelize.query(query, {
            replacements: { firstName, lastName, email },
            type: QueryTypes.INSERT
        });
        res.status(201).json(result[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all customers
exports.getAllCustomers = async (req, res) => {
    const query = 'SELECT * FROM "Customers"';
    try {
        const customers = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a customer by ID
// exports.getCustomerById = async (req, res) => {
//     const customerId = req.params.id;
//     const query = 'SELECT * FROM "Customers" WHERE id = :id';
//     try {
//         const customer = await sequelize.query(query, {
//             replacements: { id: customerId },
//             type: QueryTypes.SELECT
//         });
//         if (customer.length > 0) {
//             res.status(200).json(customer[0]);
//         } else {
//             res.status(404).json({ error: 'Customer not found' });
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Update a customer
exports.updateCustomer = async (req, res) => {
    const customerId = req.params.id;
    const { firstName, lastName, email } = req.body;
    const query = 'UPDATE "Customers" SET "firstName" = :firstName, "lastName" = :lastName, email = :email WHERE id = :id';
    try {
        const [affectedRows] = await sequelize.query(query, {
            replacements: { firstName, lastName, email, id: customerId },
            type: QueryTypes.UPDATE
        });
        if (affectedRows > 0) {
            res.status(200).json({ message: 'Customer updated successfully' });
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a customer
exports.deleteCustomer = async (req, res) => {
    const customerId = req.params.id;
    const query = 'DELETE FROM "Customers" WHERE id = :id';
    try {
        const [affectedRows] = await sequelize.query(query, {
            replacements: { id: customerId },
            type: QueryTypes.DELETE
        });
        if (affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Customer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get customers by product and company
exports.getCustomersByProductAndCompany = async (req, res) => {
    const productId = parseInt(req.query.productId, 10);
    const companyId = parseInt(req.query.companyId, 10);

    if (isNaN(productId) || isNaN(companyId)) {
        return res.status(400).json({ error: 'Invalid productId or companyId' });
    }

    const query = `
        SELECT c.*
        FROM "Customers" c
        JOIN "CustomerProducts" cp ON c.id = cp."CustomerId"
        JOIN "Products" p ON cp."ProductId" = p.id
        JOIN "Companies" co ON p."companyId" = co.id
        WHERE p.id = :productId AND co.id = :companyId
    `;

    try {
        const customers = await sequelize.query(query, {
            replacements: { productId, companyId },
            type: QueryTypes.SELECT
        });

        if (customers.length === 0) {
            return res.status(404).json({ error: 'No customers found for the specified product and company' });
        }

        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};




