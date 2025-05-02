// routes/Admin/classroomRoutes.js
const express = require('express');
const router = express.Router();
const classroomController = require('../../controllers/Admin/classroomController');

// Classroom routes
router.post('/', classroomController.createClassroom);
router.get('/', classroomController.getAllClassrooms);
router.get('/search', classroomController.findClassrooms);
router.get('/:id', classroomController.getClassroomById);
router.put('/:id', classroomController.updateClassroom);
router.delete('/:id', classroomController.deleteClassroom);
router.post('/upload', classroomController.uploadClassrooms);

module.exports = router;