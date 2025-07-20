const express = require('express');
const router = express.Router();
const extractorController = require('../../Controller/extractor/extractorController');

router.post(
  '/upload',
  extractorController.uploadMiddleware,
  extractorController.uploadPutResume
);

router.post('/extract', extractorController.extractTextFromObjectPdfWithPdfToText);
router.post('/insert', extractorController.insertextractedText);
router.get('/fetch', extractorController.mixeddata);
router.post('/upload', extractorController.uploadPutResume);


module.exports = router;