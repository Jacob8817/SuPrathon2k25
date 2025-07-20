const pool = require('../../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');


exports.showCompany = async (req, res) => {
    try {
        const companies = await pool.query('SELECT * FROM public.companies');
        res.status(200).json(companies.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
    }


exports.showCompanyById = async (req, res) => {
    const { companyId } = req.params;

    try {
        const company = await pool.query('SELECT * FROM public.companies WHERE company_id = $1', [companyId]);
        
        if (company.rows.length === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.status(200).json(company.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
}