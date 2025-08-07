#!/bin/bash

# StartServer.sh - Start the server only (for production)
# This script assumes the build has already been completed

set -e  # Exit on any error

echo "🚀 Starting Brazucas Server..."

# Color codes for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Environment Check
log_info "Checking environment..."

# Check for required environment variables
required_vars=("MONGODB_URI" "JWT_SECRET" "SESSION_SECRET" "ADMIN_SECRET_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    log_warning "Missing environment variables: ${missing_vars[*]}"
    log_warning "Make sure to set these in your deployment environment"
fi

# Show partial values for debugging (first 10 chars) - ALWAYS show this for debugging
log_info "Current environment variable values:"
for var in "${required_vars[@]}"; do
    val="${!var}"
    if [ -n "$val" ]; then
        echo "  $var: ${val:0:20}... (${#val} chars total)"
    else
        echo "  $var: NOT SET"
    fi
done

if [ ${#missing_vars[@]} -eq 0 ]; then
    log_success "All required environment variables are set"
fi

# Additional MongoDB URI validation
log_info "MongoDB URI validation:"
if [ -n "$MONGODB_URI" ]; then
    uri_length=${#MONGODB_URI}
    if [ $uri_length -lt 50 ]; then
        log_warning "MONGODB_URI seems too short ($uri_length chars). Should be 80+ chars for MongoDB Atlas."
    else
        log_success "MONGODB_URI length looks reasonable ($uri_length chars)"
    fi
    
    # Check if it starts with mongodb://  or mongodb+srv://
    if [[ $MONGODB_URI == mongodb+srv://* ]]; then
        log_success "MONGODB_URI uses SRV format (recommended)"
    elif [[ $MONGODB_URI == mongodb://* ]]; then
        log_info "MONGODB_URI uses standard format"
    else
        log_warning "MONGODB_URI doesn't start with mongodb:// or mongodb+srv://"
    fi
else
    log_warning "MONGODB_URI is empty or not set"
fi

# Set default port if not provided
export PORT=${PORT:-3001}
log_info "Starting server on port $PORT"

# Start the Express server
cd "$PROJECT_ROOT/backend"
log_info "Starting Express server..."
node dist/server.js
