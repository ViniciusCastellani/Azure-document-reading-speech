const express = require('express');

const visionRoutes = require('./vision.routes');
const speechRoutes = require('./speech.routes');
const translateRoutes = require('./translate.routes')
const languageRoutes = require('./language.routes')

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/vision', visionRoutes);
router.use('/speech', speechRoutes);
router.use('/', translateRoutes)
router.use('/', languageRoutes)

module.exports = router;
