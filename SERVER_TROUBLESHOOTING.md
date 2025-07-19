# Server Troubleshooting Guide

## Port Already in Use Error (EADDRINUSE)

### Problem
```
Error: listen EADDRINUSE: address already in use :::5000
```

### Quick Solutions

#### 1. Use the Management Script
```bash
# From the server directory
./manage-server.sh stop    # Stop all processes
./manage-server.sh start   # Start fresh server
./manage-server.sh restart # Stop and start in one command
./manage-server.sh status  # Check current status
```

#### 2. Use NPM Scripts
```bash
# Stop existing processes
pnpm run stop

# Start on different port
pnpm run dev:port  # Uses port 5001

# Check port status
pnpm run status

# Restart server
pnpm run restart
```

#### 3. Manual Process Management
```bash
# Find processes using port 5000
lsof -i :5000

# Kill all Node.js server processes
pkill -f "node.*server.js"
pkill -f "nodemon.*server.js"

# Kill specific process by PID
kill -9 <PID>

# Check if port is free
lsof -i :5000 || echo "Port 5000 is free"
```

#### 4. Use Different Port
```bash
# Set different port via environment variable
PORT=5001 pnpm run dev

# Or permanently in .env file
echo "PORT=5001" >> .env
```

### Root Causes

1. **Previous server still running** - Most common cause
2. **VS Code integrated terminal** - Multiple terminals running same process
3. **Background processes** - nodemon didn't exit cleanly
4. **System services** - Another application using port 5000

### Prevention Tips

1. **Always stop server properly** - Use Ctrl+C instead of closing terminal
2. **Use the management script** - Handles cleanup automatically
3. **Check before starting** - Run `./manage-server.sh status` first
4. **Use unique ports** - Set PORT environment variable for different projects

### Debugging Steps

1. **Check what's running:**
   ```bash
   ps aux | grep node | grep -v grep
   ```

2. **Check specific port:**
   ```bash
   lsof -i :5000
   netstat -tulpn | grep :5000
   ```

3. **Check server logs:**
   ```bash
   # If using our enhanced server.js, it will show helpful error messages
   pnpm run dev
   ```

4. **Test health endpoint:**
   ```bash
   curl http://localhost:5000/api/health
   ```

### Advanced Solutions

#### Using PM2 (Production Process Manager)
```bash
# Install PM2 globally
npm install -g pm2

# Start server with PM2
pm2 start server.js --name "mylocal-connect"

# Stop server
pm2 stop mylocal-connect

# Restart server
pm2 restart mylocal-connect

# Monitor logs
pm2 logs mylocal-connect

# List all processes
pm2 list
```

#### Port Detection Script
```bash
# Find available port automatically
#!/bin/bash
PORT=5000
while lsof -i :$PORT >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done
echo "Available port: $PORT"
PORT=$PORT pnpm run dev
```

### Environment-Specific Solutions

#### VS Code Users
- Use the integrated terminal carefully
- Close terminals properly with Ctrl+C
- Use the VS Code task runner for consistent process management

#### Docker Users
```bash
# If running in Docker, check container ports
docker ps
docker stop <container-name>
```

#### Linux/Mac Users
```bash
# Force kill all node processes (use with caution)
sudo pkill -f node

# Find processes by port
sudo ss -tlnp | grep :5000
```

### Error Prevention

1. **Graceful Shutdown** - Our enhanced server.js now handles SIGTERM and SIGINT
2. **Process Monitoring** - Use the management script for consistent handling
3. **Port Configuration** - Set unique ports per project in .env files
4. **Health Checks** - Verify server is responding before assuming it's working

### Quick Reference Commands

```bash
# Emergency stop all
pkill -f "node.*server.js" && pkill -f "nodemon"

# Start with different port
PORT=5001 pnpm run dev

# Check and start
./manage-server.sh status && ./manage-server.sh start

# Full restart
./manage-server.sh restart

# Health check
curl -s http://localhost:5000/api/health | jq .
```

## Common Error Messages

### "EADDRINUSE"
- **Cause**: Port already in use
- **Solution**: Stop existing process or use different port

### "EACCES"
- **Cause**: Permission denied (usually ports < 1024)
- **Solution**: Use port > 1024 or run with sudo (not recommended)

### "ECONNREFUSED"
- **Cause**: Server not running or wrong port
- **Solution**: Check server status and port configuration

### "Cannot find module"
- **Cause**: Missing dependencies
- **Solution**: Run `pnpm install`

Remember: Always use the management script `./manage-server.sh` for the most reliable server management!
