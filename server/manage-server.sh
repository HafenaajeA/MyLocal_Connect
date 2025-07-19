#!/bin/bash

# MyLocal_Connect Server Management Script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default port
PORT=${PORT:-5000}

# Function to display help
show_help() {
    echo -e "${BLUE}MyLocal_Connect Server Management${NC}"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start the development server"
    echo "  stop      Stop all server processes"
    echo "  restart   Restart the server"
    echo "  status    Check server status"
    echo "  port      Check what's running on port $PORT"
    echo "  logs      Show server logs (if running with PM2)"
    echo "  help      Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  PORT      Server port (default: 5000)"
    echo ""
    echo "Examples:"
    echo "  $0 start"
    echo "  PORT=3001 $0 start"
    echo "  $0 stop"
    echo "  $0 status"
}

# Function to check what's running on the port
check_port() {
    echo -e "${BLUE}Checking port $PORT...${NC}"
    
    if command -v lsof >/dev/null 2>&1; then
        PROCESS=$(lsof -i :$PORT 2>/dev/null)
        if [ -n "$PROCESS" ]; then
            echo -e "${RED}Port $PORT is in use:${NC}"
            echo "$PROCESS"
            return 1
        else
            echo -e "${GREEN}Port $PORT is available${NC}"
            return 0
        fi
    else
        # Fallback to netstat if lsof is not available
        PROCESS=$(netstat -tulpn 2>/dev/null | grep :$PORT)
        if [ -n "$PROCESS" ]; then
            echo -e "${RED}Port $PORT is in use:${NC}"
            echo "$PROCESS"
            return 1
        else
            echo -e "${GREEN}Port $PORT is available${NC}"
            return 0
        fi
    fi
}

# Function to stop server processes
stop_server() {
    echo -e "${YELLOW}Stopping MyLocal_Connect server processes...${NC}"
    
    # Kill nodemon processes
    pkill -f "nodemon.*server.js" 2>/dev/null && echo -e "${GREEN}✅ Stopped nodemon processes${NC}"
    
    # Kill node server processes
    pkill -f "node.*server.js" 2>/dev/null && echo -e "${GREEN}✅ Stopped node server processes${NC}"
    
    # Kill any pnpm dev processes
    pkill -f "pnpm.*run.*dev" 2>/dev/null && echo -e "${GREEN}✅ Stopped pnpm dev processes${NC}"
    
    # Wait a moment for processes to terminate
    sleep 2
    
    # Check if port is now free
    if check_port; then
        echo -e "${GREEN}✅ Server stopped successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Some processes may still be running${NC}"
    fi
}

# Function to check server status
check_status() {
    echo -e "${BLUE}Checking MyLocal_Connect server status...${NC}"
    
    # Check for running processes
    NODE_PROCESSES=$(ps aux | grep -E "(node.*server\.js|nodemon.*server\.js)" | grep -v grep)
    
    if [ -n "$NODE_PROCESSES" ]; then
        echo -e "${GREEN}✅ Server processes found:${NC}"
        echo "$NODE_PROCESSES" | while IFS= read -r line; do
            echo "  $line"
        done
        
        # Try to ping the health endpoint
        if command -v curl >/dev/null 2>&1; then
            echo ""
            echo -e "${BLUE}Testing health endpoint...${NC}"
            if curl -s "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
                echo -e "${GREEN}✅ Server is responding on port $PORT${NC}"
            else
                echo -e "${YELLOW}⚠️  Server process found but not responding on port $PORT${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ No server processes found${NC}"
    fi
    
    check_port
}

# Function to start the server
start_server() {
    echo -e "${BLUE}Starting MyLocal_Connect development server...${NC}"
    
    # Check if port is available
    if ! check_port; then
        echo -e "${YELLOW}Port $PORT is in use. Attempting to stop existing processes...${NC}"
        stop_server
        sleep 2
        
        if ! check_port; then
            echo -e "${RED}❌ Could not free port $PORT. Please manually stop the process or use a different port.${NC}"
            echo -e "${YELLOW}Try: PORT=5001 $0 start${NC}"
            exit 1
        fi
    fi
    
    # Check if we're in the server directory
    if [ ! -f "server.js" ]; then
        echo -e "${RED}❌ server.js not found. Please run this script from the server directory.${NC}"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  node_modules not found. Installing dependencies...${NC}"
        if command -v pnpm >/dev/null 2>&1; then
            pnpm install
        elif command -v npm >/dev/null 2>&1; then
            npm install
        else
            echo -e "${RED}❌ Package manager not found. Please install pnpm or npm.${NC}"
            exit 1
        fi
    fi
    
    echo -e "${GREEN}🚀 Starting server on port $PORT...${NC}"
    
    # Start the server
    if command -v pnpm >/dev/null 2>&1; then
        PORT=$PORT pnpm run dev
    else
        PORT=$PORT npm run dev
    fi
}

# Function to restart the server
restart_server() {
    echo -e "${BLUE}Restarting MyLocal_Connect server...${NC}"
    stop_server
    sleep 3
    start_server
}

# Main script logic
case "$1" in
    start)
        start_server
        ;;
    stop)
        stop_server
        ;;
    restart)
        restart_server
        ;;
    status)
        check_status
        ;;
    port)
        check_port
        ;;
    logs)
        echo -e "${BLUE}Server logs:${NC}"
        echo -e "${YELLOW}(For live logs, use: tail -f logs/server.log or check terminal where server is running)${NC}"
        ;;
    help|--help|-h)
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
