const express = require('express');

const visionRoutes = require('./vision.routes');
const speechRoutes = require('./speech.routes');

const router = express.Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));

router.use('/vision', visionRoutes);
router.use('/speech', speechRoutes);

module.exports = router;
