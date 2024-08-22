const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');

// Create a new company
exports.createCompany = async (req, res) => {
    const { name, location } = req.body;
    const query = `
        INSERT INTO "Companies" (name, location, "createdAt", "updatedAt")
        VALUES (:name, :location, NOW(), NOW())
        RETURNING *;
    `;
    try {
        const [result] = await sequelize.query(query, {
            replacements: { name, location },
            type: QueryTypes.INSERT
        });
        res.status(201).json(result[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all companies
exports.getAllCompanies = async (req, res) => {
    const query = 'SELECT * FROM "Companies"';
    try {
        const companies = await sequelize.query(query, { type: QueryTypes.SELECT });
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a company by ID
exports.getCompanyById = async (req, res) => {
    const companyId = req.params.id;
    const query = 'SELECT * FROM "Companies" WHERE id = :id';
    try {
        const company = await sequelize.query(query, {
            replacements: { id: companyId },
            type: QueryTypes.SELECT
        });
        if (company.length > 0) {
            res.status(200).json(company[0]);
        } else {
            res.status(404).json({ error: 'Company not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a company
exports.updateCompany = async (req, res) => {
    const companyId = req.params.id;
    const { name, location } = req.body;
    const query = 'UPDATE "Companies" SET name = :name, location = :location WHERE id = :id';
    try {
        const [affectedRows] = await sequelize.query(query, {
            replacements: { name, location, id: companyId },
            type: QueryTypes.UPDATE
        });
        if (affectedRows > 0) {
            res.status(200).json({ message: 'Company updated successfully' });
        } else {
            res.status(404).json({ error: 'Company not found' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete a company
exports.deleteCompany = async (req, res) => {
    const companyId = req.params.id;
    const query = 'DELETE FROM "Companies" WHERE id = :id';
    try {
        const [affectedRows] = await sequelize.query(query, {
            replacements: { id: companyId },
            type: QueryTypes.DELETE
        });
        if (affectedRows > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Company not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
