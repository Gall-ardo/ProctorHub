# Setup Instructions

## 1. Cloning the Repository

First, clone the repository from GitHub:

```bash
git clone https://github.com/Gall-ardo/ProctorHub.git
cd ProctorHub
```

# Step 2: Setting up MySQL and Node.js

Download and install from MySQL and Node.js which suits to your operating system.

## Create database via command line
```bash
mysql -u root -p
# Enter your MySQL password when prompted
CREATE DATABASE proctorhub_db;
exit;
```

## Step 3. Navigating to Frontend and Backend

Open **two separate terminal windows or tabs**. In each, navigate to the corresponding directory:

- **Terminal 1 – Frontend:**

  ```bash
  cd frontend
  npm install
  ```

- **Terminal 2 – Backend:**

  ```bash
  cd backend
  npm install
  npm install dotenv
  ```

# Step 4. Setting Up Environment Variables
In the backend directory, create a .env file and add the following content:

```bash
DB_NAME=proctorhub_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=3306

EMAIL_SERVICE=Gmail
EMAIL_USER=proctorhub@gmail.com
EMAIL_PASSWORD=xknjvvwcjjnqnjjz

JWT_SECRET=3fjs8@K29vNs93l!xzQpLm5rTuw92ksX.
```
Remember to edit the .env file and replace 'yourpassword' with your actual MySQL password

# Step 5: Starting the application
In each terminal, start the application.

## Terminal 1 - Frontend:
```bash
npm start
```

## Terminal 2 - Backend:
```bash
npm start
```

# Step 6: Entering the system
Go the link http://localhost:3000/admin/user and create any type user. The password will come to your mail. You can enter the system with your mail and password.
