const { Offering, TimeSlot, Course, TeachingAssistant, Semester } = require('../../models');
const { Op } = require('sequelize');
const moment = require('moment');

const getOfferingScheduleForTA = async (taId) => {
  try {
    console.log(`Fetching offerings for TA ID: ${taId}`);

    const offerings = await Offering.findAll({
      include: [
        {
          model: TeachingAssistant,
          as: 'studentTAs',
          where: { id: taId },
          attributes: [],
          through: { attributes: [] }
        },
        {
          model: Course,
          attributes: ['courseCode', 'courseName'],
        },
        {
          model: TimeSlot,
          as: 'TimeSlot',
          attributes: ['id', 'startTime', 'endTime', 'day'],
          where: {
            [Op.or]: [
              { startTime: { [Op.ne]: null } },
              { endTime: { [Op.ne]: null } }
            ]
          },
          required: false
        },
        {
          model: Semester,
          attributes: ['id', 'year', 'semesterType'],
        }
      ]
    });

    console.log(`Found ${offerings.length} offerings for TA`);
    const formattedOfferings = [];

    for (const offering of offerings) {
      if (offering.TimeSlot && offering.TimeSlot.length > 0) {
        console.log(`Processing offering ${offering.id} with ${offering.TimeSlot.length} time slots`);
        
        // Get semester info for this offering
        let semesterYear = new Date().getFullYear();
        let semesterType = 'FALL';
        let color = 'green';
        
        if (offering.Semester) {
          semesterYear = offering.Semester.year;
          semesterType = offering.Semester.semesterType;
          
          // Assign color based on semester type
          if (semesterType === 'FALL') {
            color = '#e67e22'; // Orange
          } else if (semesterType === 'SPRING') {
            color = '#27ae60'; // Green
          } else if (semesterType === 'SUMMER') {
            color = '#3498db'; // Blue
          }
          
          console.log(`Offering ${offering.id} is in ${semesterType} ${semesterYear}`);
        } else {
          console.log(`Warning: Offering ${offering.id} has no semester information`);
        }
        
        for (const timeSlot of offering.TimeSlot) {
          const dayMap = {
            'Monday': 0,
            'Tuesday': 1,
            'Wednesday': 2,
            'Thursday': 3,
            'Friday': 4,
            'Saturday': 5,
            'Sunday': 6
          };

          const startTimeParts = timeSlot.startTime.split(':');
          const endTimeParts = timeSlot.endTime.split(':');
          const startTimeDecimal = parseInt(startTimeParts[0]) + (parseInt(startTimeParts[1]) / 60);
          const endTimeDecimal = parseInt(endTimeParts[0]) + (parseInt(endTimeParts[1]) / 60);

          // Define semester date ranges based on type
          let semesterStartDate, semesterEndDate;
          
          if (semesterType === 'FALL') {
            semesterStartDate = new Date(semesterYear, 8, 15); // September 15
            semesterEndDate = new Date(semesterYear, 11, 31); // December 31
          } else if (semesterType === 'SPRING') {
            semesterStartDate = new Date(semesterYear, 0, 15); // January 15
            semesterEndDate = new Date(semesterYear, 5, 1); // June 1
          } else if (semesterType === 'SUMMER') {
            semesterStartDate = new Date(semesterYear, 5, 15); // June 15
            semesterEndDate = new Date(semesterYear, 8, 1); // September 1
          } else {
            // Default dates if semester type is unknown
            const today = new Date();
            semesterStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            semesterEndDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
          }
          
          // Get the day of week for this time slot
          const dayOfWeek = dayMap[timeSlot.day];
          if (dayOfWeek === undefined) {
            console.log(`Warning: Invalid day "${timeSlot.day}" for time slot ${timeSlot.id}`);
            continue;
          }
          
          // Start with the semester start date
          let currentDate = new Date(semesterStartDate);
          
          // Adjust to first occurrence of this day of week
          const dayDiff = (dayOfWeek - currentDate.getDay() + 7) % 7;
          currentDate.setDate(currentDate.getDate() + dayDiff);
          
          // Create an event for each week in the semester
          while (currentDate <= semesterEndDate) {
            const formattedDate = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
            
            formattedOfferings.push({
              id: `offering-${offering.id}-${timeSlot.id}-${formattedDate}`,
              title: offering.Course ? `${offering.Course.courseCode} - Section ${offering.sectionNumber}` : `Section ${offering.sectionNumber}`,
              examDate: formattedDate,
              day: dayOfWeek,
              startTime: startTimeDecimal,
              endTime: endTimeDecimal,
              color: color,
              isExam: false,
              isOffering: true,
              rooms: 'TBA',
              description: offering.Course ? offering.Course.courseName : 'Course Session',
              courseId: offering.courseId,
              offeringId: offering.id,
              timeSlotId: timeSlot.id,
              semesterInfo: {
                year: semesterYear,
                type: semesterType
              }
            });
            
            // Move to next week
            currentDate.setDate(currentDate.getDate() + 7);
          }
        }
      }
    }

    console.log(`Created ${formattedOfferings.length} formatted offerings`);
    return {
      success: true,
      data: formattedOfferings
    };

  } catch (error) {
    console.error('Error in getOfferingScheduleForTA service:', error);
    throw error;
  }
};

module.exports = {
  getOfferingScheduleForTA
};