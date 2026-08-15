const express = require('express');
const multer = require('multer');

const { document_intelligence } = require('../services/vision.service');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/document-intelligence', upload.single('file'), async (req, res, next) => {
    try {
        const result = await document_intelligence(req.file.buffer);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
