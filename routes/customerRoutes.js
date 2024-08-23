const express = require('express');
const companyController = require('../controllers/companyController');
const productController = require('../controllers/productController');
const customerController = require('../controllers/customerController');
const customerProductsController = require('../controllers/customerProductsController');
const router = express.Router();

// Company routes
router.post('/companies', companyController.createCompany);
router.get('/companies', companyController.getAllCompanies);
router.get('/companies/:id', companyController.getCompanyById);
router.put('/companies/:id', companyController.updateCompany);
router.delete('/companies/:id', companyController.deleteCompany);

// Product routes
router.post('/products', productController.createProduct);
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

// Customer routes
router.post('/customers', customerController.createCustomer);
router.get('/customers', customerController.getAllCustomers);
router.put('/customers/:id', customerController.updateCustomer);
router.delete('/customers/:id', customerController.deleteCustomer);
router.get('/customers/by-product-and-company', customerController.getCustomersByProductAndCompany);

router.post('/customer-products', customerProductsController.addCustomerToProduct);
router.delete('/customer-products', customerProductsController.removeCustomerFromProduct);

router.get('/customers/eligible-customers', customerController.fetchEligibleCustomersAndSendCoupons);
router.post('/customers/send-coupon', customerController.sendCoupon);

module.exports = router;
