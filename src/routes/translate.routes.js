const express = require('express');
const { translate_text } = require('../services/translate.service')

const router = express.Router();

router.post('/translate', async (req, res, next) => {
    try {
        const { text, from, to } = req.body;

        if (!text || !to) {
            return res.status(400).json({ error: 'Os parâmetros "text" e "to" são obrigatórios.' });
        }

        const result = await translate_text(text, from, to);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;