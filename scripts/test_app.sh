#!/bin/bash
set -euo pipefail

# Development script to run backend and frontend locally with hot reload
# This is much faster than Docker for development!

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PATH="$ROOT_DIR/backend/apivenv/bin/activate"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Local Development Environment ===${NC}"
echo ""

# Check virtual environment
if [[ ! -f "$VENV_PATH" ]]; then
  echo -e "${YELLOW}Warning: Virtual environment not found at $VENV_PATH${NC}"
  echo "Creating virtual environment..."
  cd "$ROOT_DIR/backend"
  python3 -m venv apivenv
  source apivenv/bin/activate
  pip install -e .[dev]
  cd "$ROOT_DIR"
else
  echo -e "${GREEN}✓ Virtual environment found${NC}"
fi

# Check if frontend dependencies are installed
if [[ ! -d "$ROOT_DIR/frontend/node_modules" ]]; then
  echo -e "${YELLOW}Installing frontend dependencies...${NC}"
  cd "$ROOT_DIR/frontend"
  npm install
  cd "$ROOT_DIR"
fi

echo ""
echo -e "${GREEN}Starting services...${NC}"
echo -e "${BLUE}Backend:${NC} http://localhost:8000"
echo -e "${BLUE}Frontend:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both services${NC}"
echo ""

# Cleanup function to kill both processes
cleanup() {
  echo ""
  echo -e "${YELLOW}Shutting down services...${NC}"
  kill $BACKEND_PID 2>/dev/null || true
  kill $FRONTEND_PID 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
cd "$ROOT_DIR/backend"
source "$VENV_PATH"
echo -e "${GREEN}[Backend]${NC} Starting on port 8000..."
python main.py > /tmp/backend.log 2>&1 &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 2

# Start frontend
cd "$ROOT_DIR/frontend"
echo -e "${GREEN}[Frontend]${NC} Starting on port 3000..."
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for both processes
echo ""
echo -e "${GREEN}✓ Both services are running!${NC}"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""

# Keep script running and show logs
tail -f /tmp/backend.log /tmp/frontend.log
