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
    
    # Show partial values for debugging (first 10 chars)
    log_info "Current environment variable values:"
    for var in "${required_vars[@]}"; do
        val="${!var}"
        if [ -n "$val" ]; then
            echo "  $var: ${val:0:10}... (${#val} chars total)"
        else
            echo "  $var: NOT SET"
        fi
    done
else
    log_success "All required environment variables are set"
fi

# Set default port if not provided
export PORT=${PORT:-3001}
log_info "Starting server on port $PORT"

# Start the Express server
cd "$PROJECT_ROOT/backend"
log_info "Starting Express server..."
node dist/server.js
