const express = require('express');
const { analyze_text } = require('../services/language.service');

const router = express.Router();

router.post('/analyze-text', async (req, res, next) => {
    try {
        const { text, kind, language, opinionMining } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'O parâmetro "text" é obrigatório.' });
        }

        const result = await analyze_text(text, kind, language, opinionMining);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;