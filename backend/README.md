# 🧠 Backend Structure

## 📁 Folder Structure (Backend)

```
backend/
├── config/    # DB setup
├── models/    # Sequelize entity classes (tables)
├── controllers/ # Connects API requests to service logic
├── services/  # Core app logic (like CourseService)
├── routes/    # Defines API endpoints (URLs)
├── middleware/ # Auth, logging, error handling
├── utils/     # Helpers (notifications, email, etc.)
├── scripts/   # Additional functions used when creating the App
└── server.js  # Entry point – starts the app
```

---

## 🔍 Folder-by-Folder Explanation

### 🔧 `config/`
**What's here?**  
Setup files — especially for connecting to MySQL.
- `db.js`: Defines the database connection using Sequelize.

---

### 📦 `models/`
**What's here?**  
This is where we define the **entities** from the class diagram, like:
- `User.js`
- `TeachingAssistant.js`
- `Course.js`
- `Exam.js`

Each file defines a **table** in MySQL using Sequelize.

---

### 🧠 `services/`
**What's here?**  
The **logic of our app** lives here. These files do the "thinking."

For example:
- `CourseService` can validate course data and assign TAs.
- `ExamService` can generate exams and assign proctors.

These match the **service classes** in the Mermaid diagram (like `CourseService`, `TeachingAssistantService`).

---

### 🧭 `controllers/`
**What's here?**  
These receive API requests and call the appropriate service logic.
- Example: `courseController.js` handles HTTP requests like "create course".

Controllers are like a middle layer between the **frontend** and our **services**.

---

### 🌐 `routes/`
**What's here?**  
Defines the API **URLs** the frontend will use.

For example:
- `POST /api/courses` → handled by `courseController.createCourse()`

---

### 🧱 `middleware/`
**What's here?**  
Optional, but useful reusable functions like:
- Authentication
- Error handling
- Request logging

---

### 🧰 `utils/`
**What's here?**  
Helper functions shared across the app.

Examples:
- Sending email notifications
- Formatting dates
- Excel import/export

---

### 🚀 `server.js`
**What's here?**  
The **main entry point** of the backend app.

It does:
- Starts the Express server
- Connects to the database
- Loads all routes

Run this file to launch the backend:
```bash
node server.js
```
