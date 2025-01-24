## Installation Guide

1. docker-compose build
2. copy .env.example to .env
3. docker-compose up
4. Database Migrations with Drizzle ORM 
   - docker exec -it remix-basic-cms-app bash 
   - npx drizzle-kit push 