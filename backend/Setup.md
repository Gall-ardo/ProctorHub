## How to setup

- Setup mysql to computer, also mysql workbench if you want
- pull all changes.
- Create a new schema called `proctorhub_db` (by workbench, or ask gpt how to achieve)
- Set it as the default schema
- create .env file in backend folder:

```bash
DB_NAME=proctorhub_db
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```
- type "npm install" in backend folder
- type "node server.js"
```bash
✅ DB Connected & Models Synced
🚀 Server running on port 5000
```
- if you don't see: reach me (Arda) 
