const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const axios = require('axios');
const transporter = require('../utils.js/notification').transporter;

const nameRegex = /^[a-zA-Z_]+$/; 
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
const mobileRegex = /^\+\d{10}$/; 
const addressRegex = /^[a-zA-Z0-9\s,.-]+$/; 
const zipcodeRegex = /^\d{6}$/; 

exports.createCustomer = async (req, res) => {
    const { firstName, lastName, email, mobile, address, zipcode } = req.body;

    // Validate input fields
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        return res.status(400).json({ error: 'Invalid name format. Only alphabets and underscores are allowed.' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (!mobileRegex.test(mobile)) {
        return res.status(400).json({ error: 'Invalid mobile number format (It should start with + followed by 10 numbers).' });
    }

    if (!addressRegex.test(address)) {
        return res.status(400).json({ error: 'Invalid address format.' });
    }

    if (!zipcodeRegex.test(zipcode)) {
        return res.status(400).json({ error: 'Invalid zipcode format.' });
    }

    const query = `
        INSERT INTO "Customers" 
        ("firstName", "lastName", email, "mobile", "address", "zipcode", "createdAt", "updatedAt")
        VALUES (:firstName, :lastName, :email, :mobile, :address, :zipcode, NOW(), NOW()) 
        RETURNING *
    `;
    
    try {
        const [result] = await sequelize.query(query, {
            replacements: { firstName, lastName, email, mobile, address, zipcode },
            type: QueryTypes.INSERT
        });

        const customer = result[0];
        res.status(201).json(customer);

        // After creating the customer, make a subsequent API call using axios
        const couponRequestData = {
            customerId: customer.id,
            email: customer.email,
            message: 'Thank you for your purchase! Here is your coupon.'
        };


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

// Update a customer
exports.updateCustomer = async (req, res) => {
    const customerId = req.params.id;
    const { firstName, lastName, email, mobile, address, zipcode } = req.body;

    // Validate the input
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
        return res.status(400).json({ error: 'Invalid name format. Only alphanumeric and underscores are allowed.' });
    }

    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (!mobileRegex.test(mobile)) {
        return res.status(400).json({ error: 'Invalid mobile number format. It should start with + followed by numbers.' });
    }

    if (!addressRegex.test(address)) {
        return res.status(400).json({ error: 'Invalid address format.' });
    }

    if (!zipcodeRegex.test(zipcode)) {
        return res.status(400).json({ error: 'Invalid zipcode format.' });
    }

    const query = 'UPDATE "Customers" SET "firstName" = :firstName, "lastName" = :lastName, email = :email, "mobile" = :mobile, "address" = :address, "zipcode" = :zipcode WHERE id = :id';
    
    try {
        const [affectedRows] = await sequelize.query(query, {
            replacements: { firstName, lastName, email, mobile, address, zipcode, id: customerId },
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


// Fetch eligible customers and send coupons
const MIN_PRODUCTS_BOUGHT = 2;

exports.fetchEligibleCustomersAndSendCoupons = async (req, res) => {
    try {
        const query = `
            SELECT c.id, c.email
            FROM "Customers" c
            JOIN "CustomerProducts" cp ON c.id = cp."CustomerId"
            GROUP BY c.id, c.email
            HAVING COUNT(cp."ProductId") > :minProductsBought
        `;

        const eligibleCustomers = await sequelize.query(query, {
            replacements: { minProductsBought: MIN_PRODUCTS_BOUGHT },
            type: QueryTypes.SELECT
        });
        console.log("eligibleCustomers", eligibleCustomers);

        if (eligibleCustomers.length === 0) {
            return res.status(200).json({ message: 'No eligible customers found' });
        }

        const sendCouponPromises = eligibleCustomers.map((customer, index) => {
            const couponCode = `PROD${String(index + 1).padStart(3, '0')}`;

            const couponRequestData = {
                customerId: customer.id,
                email: customer.email,
                message: `Thank you for being a valued customer! Here is your coupon: ${couponCode}`
            };

            return axios.post('http://localhost:3000/api/customers/send-coupon', couponRequestData)
                .then(response => {
                    console.log(`Coupon sent to ${customer.email}:`, response.data);
                })
                .catch(error => {
                    console.error(`Error sending coupon to ${customer.email}:`, error.message);
                });
        });

        await Promise.all(sendCouponPromises);
        const emailList = eligibleCustomers.map(customer => customer.email).join(', ');

        res.status(200).json({ message: `Coupons sent successfully to: ${emailList}` });
    } catch (error) {
        console.error('Error fetching eligible customers or sending coupons:', error.message);
        res.status(500).json({ error: error.message });
    }
};


exports.sendCoupon = async (req, res) => {
    const { customerId, email, message } = req.body;

    const mailOptions = {
        from: 'akshaya1907@gmail.com',
        to: email,
        subject: `Customer ID ${customerId} - Your Coupon`, 
        text: message
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Coupon sent successfully' });
    } catch (error) {
        console.error('Error sending coupon:', error.message);
        res.status(500).json({ error: error.message });
    }
};


