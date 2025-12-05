#!/bin/bash
# start_services.sh

echo "Starting Backend..."
cd backend
# Use nohup and disown to ensure it survives
nohup node dist/app.js > backend.log 2>&1 &
echo $! > backend.pid
disown
echo "Backend started with PID $(cat backend.pid)"

cd ../frontend
echo "Starting Frontend..."
nohup npm run dev > frontend.log 2>&1 &
echo $! > frontend.pid
disown
echo "Frontend started with PID $(cat frontend.pid)"
