## Installation Guide

## Disclaimer

This repository serves as a sample project provided for guidance and educational purposes only. It demonstrates a basic setup of a Remix application with Docker and database migrations using Drizzle ORM.

---

### 1. Build Docker Images
Run the following command to build the Docker containers:
```bash
docker-compose build
```

### 2. Configure Environment Variables
Copy the example environment file and customize it according to your setup:
```bash
cp .env.example .env
```
Make sure to update the .env file with the required values, such as database connection strings, Azure B2C credentials, and other configurations.

### 3. Start the Application
Start the Docker containers using:
```bash
docker-compose up
```

### 4. Run Database Migrations with Drizzle ORM
Perform database migrations to set up the schema:
1. Access the application container:
```bash
docker exec -it remix-basic-cms-app bash
```
2. Run the Drizzle ORM migration command:
```bash
npx drizzle-kit push
```
Once the migrations are completed, the database schema will be ready for use.
