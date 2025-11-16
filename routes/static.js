const express = require('express');
const router = express.Router();

// Static Routes Only - No other routes here
// This file should only serve static files
router.use(express.static("public"));


module.exports = router;