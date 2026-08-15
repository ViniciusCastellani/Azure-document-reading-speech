const express = require('express');
const multer = require('multer');

const { fast_transcription, text_to_speech } = require('../services/speech.service');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const escapeXml = (text) => text.replace(/[<>&'"]/g, (char) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
}[char]));

router.post('/fast-transcription', upload.single('audio'), async (req, res, next) => {
    try {
        const locales = req.body.locales
            ? req.body.locales.split(',').map((locale) => locale.trim())
            : ['pt-BR'];

        const definition = { locales };

        const result = await fast_transcription(req.file.buffer, req.file.originalname, definition);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.post('/text-to-speech', async (req, res, next) => {
    try {
        const {
            text,
            locale = 'pt-BR',
            voice = 'pt-BR-FranciscaNeural',
            outputFormat = 'audio-16khz-128kbitrate-mono-mp3'
        } = req.body;

        const ssml = `<speak version='1.0' xml:lang='${locale}'><voice xml:lang='${locale}' name='${voice}'>${escapeXml(text || '')}</voice></speak>`;

        const audio = await text_to_speech(ssml, outputFormat);

        res.set('Content-Type', 'audio/mpeg');
        res.send(Buffer.from(audio));
    } catch (error) {
        next(error);
    }
});

module.exports = router;
