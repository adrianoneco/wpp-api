#!/bin/bash
set -e

echo "=== WPP API Entrypoint ==="

# Function to cleanup browser processes and locks
cleanup_browser() {
  echo "Cleaning up browser processes and lock files..."
  
  # Kill any existing chromium/chrome processes
  pkill -9 -f chromium 2>/dev/null || true
  pkill -9 -f chrome 2>/dev/null || true
  pkill -9 -f puppeteer 2>/dev/null || true
  
  # Wait a moment for processes to die
  sleep 2
  
  # Remove browser lock files from cache directory
  if [ -d "/data" ]; then
    find /data -name "SingletonLock" -delete 2>/dev/null || true
    find /data -name "SingletonCookie" -delete 2>/dev/null || true
    find /data -name "SingletonSocket" -delete 2>/dev/null || true
    find /data -name "lockfile" -delete 2>/dev/null || true
    find /data -name ".org.chromium.Chromium.*" -delete 2>/dev/null || true
    echo "Browser lock files cleaned"
  fi
  
  # Also check app directory for any stray locks
  if [ -d "/app/data" ]; then
    find /app/data -name "SingletonLock" -delete 2>/dev/null || true
    find /app/data -name "SingletonCookie" -delete 2>/dev/null || true
    find /app/data -name "SingletonSocket" -delete 2>/dev/null || true
    find /app/data -name "lockfile" -delete 2>/dev/null || true
  fi
}

# Trap to cleanup on exit
trap cleanup_browser EXIT SIGTERM SIGINT

# Cleanup before starting
cleanup_browser

# Ensure data directories exist with correct permissions
echo "Ensuring data directories..."
mkdir -p /data/tokens
mkdir -p /data/cache
chown -R node:node /data 2>/dev/null || true

# Start the application in the background
echo "Starting WPP API..."
node src/index.js &
APP_PID=$!

# Wait for API to be ready
echo "Waiting for API to be ready..."
until curl -s http://localhost:3000/health > /dev/null 2>&1; do
  sleep 2
done

echo "API is ready!"

# Check if session needs to be created
if [ -n "$INSTANCE_NAME" ] && [ "$INSTANCE_NAME" != "default" ]; then
  echo "Checking session status for: $INSTANCE_NAME"
  
  # Wait a bit more to ensure everything is initialized
  sleep 5
  
  # Check if session exists
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/session/status)
  
  if [ "$STATUS_CODE" = "404" ]; then
    echo "Session does not exist, creating: $INSTANCE_NAME"
    curl -X POST http://localhost:3000/api/sessions \
      -H "Content-Type: application/json" \
      -d "{\"sessionName\":\"$INSTANCE_NAME\"}" || true
    echo "Session creation initiated"
  else
    echo "Session already exists: $INSTANCE_NAME"
  fi
fi

# Keep the script running and forward signals to the app
wait $APP_PID
