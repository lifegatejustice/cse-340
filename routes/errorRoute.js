const express = require('express')
const router = express.Router()
const baseController = require('../controllers/baseController')

// Route to trigger intentional 500 error
router.get('/trigger-error', baseController.triggerError)

module.exports = router
