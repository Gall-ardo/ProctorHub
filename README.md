# ProctorHub

<!-- General description -->
**ProctorHub** is a modern web application designed to assign teaching assistants(TAs) to exams as proctors while ensuring a balanced workload distribution.This website automates proctor assignment tasks, which were formerly done manually, a method that often led to scheduling conflicts and uneven workload allocation. By implementing automation, the system aims to create a more balanced assignment process while lessening the workload for administrative staff. In addition to proctoring assignments, the application allows TAs to log and submit work hours for approval, keeps track of leave periods to prevent scheduling conflicts, supports proctoring swaps, automates student exam room distribution, and generates reports on TA workload and system activity.

<!-- Functions -->
## Key Features
### Automated Proctor Assignment
- Authorized staff or the instructor enters the exam by the course, sections, date/time, duration, exam type and number of proctors requested.
- Authorized staff or the course instructor can either select an automatic or a manual assignment.
- The automatic assignment ensures fair distribution of proctoring tasks by also considering the TAs course and department.
### Workload Management for Teaching Assistants
- TAs can log their work hours by specifying the type of task(Lab work, Grading, Recitation, Office Hour, Exam Proctoring etc.) they have worked on.
- Course instructors review and approve TA work submissions.
### Proctoring Date Exchange
- TAs can request to change their proctoring date and time.
- Exchange is done if another TA accepts this request.
### Student Exam Room Distribution
- The system assigns students to exam rooms based on distribution criteria specified by authorized staff.
### Reports and Logs
- The system generates reports on the total TA workload, proctoring history, and system activity.
- Maintains logs of all actions, including logins, assignments, and proctoring exchanges.


## Tentative Technology Stack
- Database: MySQL
- Front-End: React.js
- Back-End: Express.js, Node.js


## Actors
- **Teaching Assistants**
  - Log work hours
  - Request leaves
  - Accept/decline proctoring assignments
  - Request/accept/reject proctor swaps
- **Course Instructors**
  - Approve/reject TA work submissions
  - Assign TAs to proctoring duties manually 
  - Enter exam details, including course, schedule, and proctor requirements
- **Authorized Staff:** Administrative Assistant, Department's Chair, Dean's Office
  - Assign and manage proctoring
  - Approve/reject leave requests
  - Generate reports
  - Enter exam details, including course, schedule, and proctor requirements


## Team Members
- [Halil Arda Özongun](https://github.com/Gall-ardo) - 22202709
- [Emine İrem Esendemir](https://github.com/iremEsendemir) - 22202103
- [Yunus Emre Erkan](https://github.com/yunusee) - 22203670
- [Sude Ergün](https://github.com/SudeErgun) - 22203822
- [Elif Lara Oğuzhan](https://github.com/eliflaraoguzhan) - 22203138
- 
## Setup Instructions
For detailed setup instructions, please refer to our [Setup Guide](https://github.com/Gall-ardo/ProctorHub/blob/main/SETUP.md).
