#!/bin/bash

# StartSystems.sh - Build and start the Brazucas application
# This script handles the complete build process for both frontend and backend

set -e  # Exit on any error

echo "🚀 Starting Brazucas Application Build Process..."

# Color codes for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

log_info "Project root: $PROJECT_ROOT"

# Step 1: Build Frontend
log_info "Step 1/4: Building Frontend..."
cd "$PROJECT_ROOT/frontend"

if [ ! -d "node_modules" ]; then
    log_info "Installing frontend dependencies..."
    npm install
else
    log_info "Frontend dependencies already installed"
fi

log_info "Building React application..."
npm run build
log_success "Frontend build completed"

# Step 2: Build Backend  
log_info "Step 2/4: Building Backend..."
cd "$PROJECT_ROOT/backend"

if [ ! -d "node_modules" ]; then
    log_info "Installing backend dependencies..."
    npm install
else
    log_info "Backend dependencies already installed"
fi

log_info "Compiling TypeScript..."
npm run build
log_success "Backend build completed"

# Step 3: Environment Check
log_info "Step 3/4: Environment Check..."

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
else
    log_success "All required environment variables are set"
fi

# Step 4: Start Application
log_info "Step 4/4: Starting Application..."

# Set default port if not provided
export PORT=${PORT:-3001}
log_info "Starting server on port $PORT"

# Start the Express server
cd "$PROJECT_ROOT/backend"
node dist/server.js
