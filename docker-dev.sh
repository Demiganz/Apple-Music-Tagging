#!/bin/bash

# Docker development helper script for Apple Music Tagging App

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Display usage
usage() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  build     Build all containers"
    echo "  up        Start all services"
    echo "  down      Stop all services"
    echo "  restart   Restart all services"
    echo "  logs      Show logs for all services"
    echo "  clean     Clean up containers, networks, and volumes"
    echo "  reset     Reset everything (clean + rebuild)"
    echo "  status    Show status of all services"
    echo "  shell     Open shell in backend container"
    echo "  db        Connect to database"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build && $0 up    # Build and start services"
    echo "  $0 logs backend      # Show backend logs"
    echo "  $0 clean             # Clean up everything"
}

# Build containers
build() {
    log_info "Building Docker containers..."
    docker-compose build --no-cache
    log_success "Build completed!"
}

# Start services
up() {
    log_info "Starting services..."
    docker-compose up -d
    log_success "Services started!"
    log_info "Web app: http://localhost"
    log_info "API: http://localhost:3001"
    log_info "Database: localhost:5432"
}

# Stop services
down() {
    log_info "Stopping services..."
    docker-compose down
    log_success "Services stopped!"
}

# Restart services
restart() {
    log_info "Restarting services..."
    docker-compose restart
    log_success "Services restarted!"
}

# Show logs
logs() {
    if [ -n "$2" ]; then
        log_info "Showing logs for $2..."
        docker-compose logs -f "$2"
    else
        log_info "Showing logs for all services..."
        docker-compose logs -f
    fi
}

# Clean up
clean() {
    log_warning "This will remove all containers, networks, and volumes."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        log_success "Cleanup completed!"
    else
        log_info "Cleanup cancelled."
    fi
}

# Reset everything
reset() {
    log_warning "This will clean everything and rebuild from scratch."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        clean
        build
        up
        log_success "Reset completed!"
    else
        log_info "Reset cancelled."
    fi
}

# Show status
status() {
    log_info "Service status:"
    docker-compose ps
    echo ""
    log_info "Resource usage:"
    docker stats --no-stream $(docker-compose ps -q) 2>/dev/null || log_warning "No running containers found"
}

# Open shell in backend
shell() {
    log_info "Opening shell in backend container..."
    docker-compose exec backend sh
}

# Connect to database
db() {
    log_info "Connecting to database..."
    docker-compose exec database psql -U postgres -d apple_music_tagger
}

# Main script logic
check_docker

case "${1:-help}" in
    build)
        build
        ;;
    up)
        up
        ;;
    down)
        down
        ;;
    restart)
        restart
        ;;
    logs)
        logs "$@"
        ;;
    clean)
        clean
        ;;
    reset)
        reset
        ;;
    status)
        status
        ;;
    shell)
        shell
        ;;
    db)
        db
        ;;
    help|*)
        usage
        ;;
esac