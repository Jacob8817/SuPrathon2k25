const express = require('express');
const router = express.Router();
const CompanyController = require('../../Controller/company/companyController');

router.get('/companies', CompanyController.showCompany);
router.get('/companies/:companyId', CompanyController.showCompanyById);

module.exports = router;