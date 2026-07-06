@echo off
echo Starting all microservices and frontend...

:: Start Backend API Gateway
start "API Gateway" cmd /k "cd backend\api && npm run start:dev"

:: Start Microservices
start "User Service" cmd /k "cd backend\services\user && npm run start:dev"
@REM start "Schedule Service" cmd /k "cd backend\services\schedule && npm run start:dev"
@REM start "Medical Record Service" cmd /k "cd backend\services\medicalrecord && npm run start:dev"
@REM start "Payment Service" cmd /k "cd backend\services\payment && npm run start:dev"
@REM start "Feedback Service" cmd /k "cd backend\services\feedback && npm run start:dev"
@REM start "Notification Service" cmd /k "cd backend\services\notification && npm run start:dev"
start "Log Service" cmd /k "cd backend\services\log && npm run start:dev"

:: Start Frontend Web
start "Frontend Web (CMS)" cmd /k "cd feweb && npm run dev"

echo All services have been started in separate windows!
echo To run the mobile app, please use 'cd femobile ^&^& flutter run' in another terminal after starting your emulator.
