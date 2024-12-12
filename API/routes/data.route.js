const express = require('express');
const router = express.Router();
const data_controller = require('../controllers/data.controller');

router.get('/', data_controller.getAllData);
router.get('/sensors', data_controller.getUniqueSensorNames);
router.get('/by/:sensor_name', data_controller.getDataBySensorName);

module.exports = router;