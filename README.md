# Employee Retention and Decision Support System

## Structure
- Backend: Spring Boot with MySQL, JWT auth, employee CRUD, CSV import, modular retention risk scoring.
- Frontend: Next.js App Router + Tailwind dashboard with auth, employee directory, bulk upload.

## Run Backend
1. Create MySQL database `employee_retention`.
2. Update credentials in `backend/src/main/resources/application.properties` if needed.
3. Run:
   - `cd backend`
   - `mvn spring-boot:run`

## Run Frontend
1. Install dependencies:
   - `cd frontend`
   - `npm install`
2. Start the app:
   - `npm run dev`
