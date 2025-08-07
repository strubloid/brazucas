#!/bin/bash

# BuildSystems.sh - Build only script for deployment
# This script only handles the build process without starting the server

set -e  # Exit on any error

echo "🔨 Building Brazucas Application..."

# Color codes for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

log_info "Project root: $PROJECT_ROOT"

# Build Frontend
log_info "Building Frontend..."
cd "$PROJECT_ROOT/frontend"
npm install
npm run build
log_success "Frontend build completed"

# Build Backend
log_info "Building Backend..."
cd "$PROJECT_ROOT/backend"
npm install
npm run build
log_success "Backend build completed"

log_success "All builds completed successfully!"
