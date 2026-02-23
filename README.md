# 3.2 MVC - books library

## Application setup and initialization

### Environment variables that must be defined in the `.env` file:

* **DB_NAME**=<your_database_name>  
* **DB_USER**=<database_user_name>  
* **DB_PASSWORD**=<database_password>  
* **SESSION_SECRET**=<your_secret_key>  
* **ADMIN_LOGIN**=<admin_login>  
* **ADMIN_PASSWORD**=<admin_password>

### Location and execution of migration files

Migration files are located in the directory:
```
database/migrations 
```
To run the database initialization script and apply all migrations
located in the directory, execute:
```js
node database/migration.js
```

### Permanent deletion of books from the database
The script for permanent deletion of books from the database is located at:

```
cronscripts/deleting.js
```
Deletion logs are stored in the directory:
```
cronscripts/logs/deleting_log.txt
```
## Running the application
### For compilation and running:
```
npm run dev
```
### For running:
``` 
npm run start
```
## Database

This project uses **MySQL** as the database management system.

Make sure that MySQL is installed and running on your system before starting the application.
Database connection settings must be provided via environment variables defined in the `.env` file.