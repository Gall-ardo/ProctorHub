const User = require("../../models/User");
const Instructor = require("../../models/Instructor");
const TeachingAssistant = require("../../models/TeachingAssistant");
const { Op } = require("sequelize");

class UserFetchingService {

    async getInstructors(params = {}) {
        try {
            // console.log('UserFetchingService (getInstructors): Params:', params); // Optional log

            const instructorWhere = {};
            if (params.department && typeof params.department === 'string' && params.department.trim() !== '') {
                instructorWhere.department = params.department.trim();
            } else {
                // Department is crucial for this specific instructor fetching logic
                console.warn('UserFetchingService (getInstructors): Department parameter is missing or invalid. Returning empty list.');
                return [];
            }

            const instructorsFromDb = await Instructor.findAll({
                where: instructorWhere,
                attributes: ['id', 'department'],
                raw: true
            });

            if (instructorsFromDb.length === 0) {
                return [];
            }

            const instructorIds = instructorsFromDb.map(instructor => instructor.id);

            const userWhere = {
                userType: 'instructor', // Ensure correct userType
                id: { [Op.in]: instructorIds }
            };

            // Handle specific ID search: if params.id is present, it should be an ID within the department-filtered instructors
            if (params.id && typeof params.id === 'string' && params.id.trim() !== '') {
                const searchId = params.id.trim();
                if (instructorIds.includes(searchId)) {
                    userWhere.id = searchId; // Refine search to this specific ID
                } else {
                    return []; // Specific ID searched is not an instructor in this department
                }
            }
            
            if (params.name && typeof params.name === 'string' && params.name.trim() !== '') {
                userWhere.name = { [Op.like]: `%${params.name.trim()}%` };
            }
            if (params.email && typeof params.email === 'string' && params.email.trim() !== '') {
                userWhere.email = { [Op.like]: `%${params.email.trim()}%` };
            }

            const usersFromDb = await User.findAll({
                where: userWhere,
                attributes: ['id', 'name', 'email', 'userType'], // Fetch necessary fields
                raw: true
            });

            const departmentMap = {};
            instructorsFromDb.forEach(instructor => {
                departmentMap[instructor.id] = instructor.department;
            });

            const resultWithDept = usersFromDb.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                department: departmentMap[user.id] // Should always exist due to earlier filtering
            }));

            // Final filter should be redundant if logic is sound, but good as a safeguard.
            // All users in resultWithDept should already match params.department.
            return resultWithDept.filter(user => user.department === params.department.trim());

        } catch (error) {
            console.error("Error in UserFetchingService.getInstructors:", error.message, error.stack);
            throw error; // Re-throw to be handled by the controller
        }
    }

    async getTeachingAssistants(params = {}) {
        try {
            // console.log('UserFetchingService (getTeachingAssistants): Params:', params); // Optional log

            const taWhere = {};
            if (params.department && typeof params.department === 'string' && params.department.trim() !== '') {
                taWhere.department = params.department.trim();
            } else {
                console.warn('UserFetchingService (getTeachingAssistants): Department parameter is missing or invalid. Returning empty list.');
                return [];
            }

            const tasFromDb = await TeachingAssistant.findAll({
                where: taWhere,
                attributes: ['id', 'department'],
                raw: true
            });

            if (tasFromDb.length === 0) {
                return [];
            }

            const taIds = tasFromDb.map(ta => ta.id);

            const userWhere = {
                userType: 'ta', // Ensure correct userType
                id: { [Op.in]: taIds }
            };
            
            if (params.id && typeof params.id === 'string' && params.id.trim() !== '') {
                const searchId = params.id.trim();
                if (taIds.includes(searchId)) {
                    userWhere.id = searchId;
                } else {
                    return [];
                }
            }

            if (params.name && typeof params.name === 'string' && params.name.trim() !== '') {
                userWhere.name = { [Op.like]: `%${params.name.trim()}%` };
            }
            if (params.email && typeof params.email === 'string' && params.email.trim() !== '') {
                userWhere.email = { [Op.like]: `%${params.email.trim()}%` };
            }

            const usersFromDb = await User.findAll({
                where: userWhere,
                attributes: ['id', 'name', 'email', 'userType'],
                raw: true
            });

            const departmentMap = {};
            tasFromDb.forEach(ta => {
                departmentMap[ta.id] = ta.department;
            });

            const resultWithDept = usersFromDb.map(user => ({
                id: user.id,
                name: user.name,
                email: user.email,
                userType: user.userType,
                department: departmentMap[user.id]
            }));
            
            return resultWithDept.filter(user => user.department === params.department.trim());

        } catch (error) {
            console.error("Error in UserFetchingService.getTeachingAssistants:", error.message, error.stack);
            throw error;
        }
    }

    async getUsers(params = {}) {
        try {
            // console.log('UserFetchingService (getUsers): Params:', params); // Optional log
            const { userType } = params;

            if (userType === 'instructor') {
                return await this.getInstructors(params);
            } else if (userType === 'ta') {
                return await this.getTeachingAssistants(params);
            } else {
                console.error('UserFetchingService (getUsers): Invalid userType received:', userType);
                throw new Error(`Invalid userType parameter in UserFetchingService.getUsers: ${userType}`);
            }
        } catch (error) {
            // Error is logged in specific methods (getInstructors/getTeachingAssistants)
            // Or here if it's about invalid userType
            throw error; // Re-throw to be handled by the controller
        }
    }
}

module.exports = new UserFetchingService();