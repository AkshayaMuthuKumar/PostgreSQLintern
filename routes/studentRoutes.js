const express = require('express');
const studentDetailsController = require('../controllers/studentController');
const router = express.Router();

router.post('/student-details', studentDetailsController.createStudentDetail);
router.get('/student-details', studentDetailsController.getAllStudentDetails);
router.get('/student-details/:id', studentDetailsController.getStudentDetailById);
router.put('/student-details/:id', studentDetailsController.updateStudentDetail);
router.delete('/student-details/:id', studentDetailsController.deleteStudentDetail);
router.get('/student-details/time-range', studentDetailsController.getStudentDetailsByTime);
router.get('/track-email', studentDetailsController.trackEmailOpen);

module.exports = router;
