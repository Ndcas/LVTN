@echo off
echo Starting all microservices and frontend...

:: Start Backend API Gateway
start "API" cmd /k "cd backend\api && npm run start:dev"

:: Start Microservices
start "User" cmd /k "cd backend\services\user && npm run start:dev"
start "Schedule" cmd /k "cd backend\services\schedule && npm run start:dev"
start "MedicalRecord" cmd /k "cd backend\services\medicalrecord && npm run start:dev"
start "Payment" cmd /k "cd backend\services\payment && npm run start:dev"
start "Feedback" cmd /k "cd backend\services\feedback && npm run start:dev"
@REM start "Notification" cmd /k "cd backend\services\notification && npm run start:dev"
start "Log" cmd /k "cd backend\services\log && npm run start:dev"

:: Start Frontend Web
start "FE-WEB" cmd /k "cd feweb && npm run dev"

:: Public API
start "Ngrok" cmd /k "D: && cd /ngrok && ngrok http 8080 --url https://marisol-draggletailed-patricia.ngrok-free.dev"

echo All services have been started in separate windows!
echo To run the mobile app, please use 'cd femobile ^&^& flutter run' in another terminal after starting your emulator.
