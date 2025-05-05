// routes/Admin/fetchingRoutes.js
const express = require('express');
const router = express.Router();
const fetchingController = require('../../controllers/Admin/fetchingController');

// Semester routes
router.get('/semesters', fetchingController.getAllSemesters);
router.get('/semesters/active', fetchingController.getActiveSemester);

// User routes
router.get('/users', fetchingController.getUsers);
router.get('/instructors', fetchingController.getUsers); // Route reused with default params
router.get('/teaching-assistants', fetchingController.getUsers); // Route reused with default params

// Course fetching routes
router.get('/courses', fetchingController.getAllCourses);
router.get('/courses/department/:department', fetchingController.getCoursesByDepartment);
router.get('/courses/search', fetchingController.searchCourses);

// Course association routes
router.get('/courses/:id/instructors', fetchingController.getCourseInstructors);
router.post('/courses/:id/instructors', fetchingController.addInstructorToCourse);

router.get('/courses/:id/teaching-assistants', fetchingController.getCourseTeachingAssistants);
router.post('/courses/:id/teaching-assistants', fetchingController.addTeachingAssistantToCourse);

router.put('/courses/:id/associations', fetchingController.updateCourseAssociations);

module.exports = router;