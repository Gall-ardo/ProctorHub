const express = require('express');
const router = express.Router();
const fetchingController = require('../../controllers/Admin/fetchingController');

router.get('/semesters', fetchingController.getAllSemesters); // Reverted to direct call
router.get('/semesters/active', fetchingController.getActiveSemester); // Reverted to direct call

router.get('/users', fetchingController.getUsers); // Reverted to direct call

// Course fetching routes
router.get('/courses', fetchingController.getAllCourses); // Reverted to direct call
router.get('/courses/department/:department', fetchingController.getCoursesByDepartment); // Reverted to direct call
router.get('/courses/search', fetchingController.searchCourses); // Reverted to direct call


// Course association routes
router.get('/courses/:id/instructors', fetchingController.getCourseInstructors); // Reverted to direct call
router.post('/courses/:id/instructors', fetchingController.addInstructorToCourse); // Reverted to direct call
router.get('/courses/:id/teaching-assistants', fetchingController.getCourseTeachingAssistants); // Reverted to direct call
router.post('/courses/:id/teaching-assistants', fetchingController.addTeachingAssistantToCourse); // Reverted to direct call
router.put('/courses/:id/associations', fetchingController.updateCourseAssociations); // Reverted to direct call

module.exports = router;