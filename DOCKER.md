# Docker Setup for Apple Music Tagging App

This document explains how to run the Apple Music Tagging application using Docker containers.

## 🐳 Architecture

The Docker setup includes:
- **Frontend**: React app served by Nginx (port 80)
- **Backend**: Node.js API server (port 3001) 
- **Database**: PostgreSQL 15 (port 5432)

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Environment Configuration

Create a `.env` file in the root directory with your configuration:

```bash
# Database Configuration
DB_PASSWORD=your_secure_database_password

# JWT Secret (generate a strong secret for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Application Mode
USE_MOCK_DATA=true

# Apple Music API (for future integration)
APPLE_MUSIC_TEAM_ID=your_team_id
APPLE_MUSIC_KEY_ID=your_key_id
APPLE_MUSIC_PRIVATE_KEY_PATH=./keys/apple-music-private-key.p8
```

### 2. Build and Run

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

### 3. Access the Application

- **Web App**: http://localhost
- **API**: http://localhost:3001
- **Database**: localhost:5432

## 🛠️ Development Commands

### Building Individual Services

```bash
# Build only the backend
docker-compose build backend

# Build only the frontend
docker-compose build web
```

### Managing Services

```bash
# Start services
docker-compose up

# Stop services
docker-compose down

# View logs
docker-compose logs

# Follow logs for specific service
docker-compose logs -f backend
docker-compose logs -f web
```

### Database Management

```bash
# Access PostgreSQL CLI
docker-compose exec database psql -U postgres -d apple_music_tagger

# Reset database (warning: destroys all data)
docker-compose down -v
docker-compose up --build
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `defaultpassword` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key...` |
| `USE_MOCK_DATA` | Use mock data instead of real API | `true` |
| `APPLE_MUSIC_TEAM_ID` | Apple Music API Team ID | `""` |
| `APPLE_MUSIC_KEY_ID` | Apple Music API Key ID | `""` |
| `APPLE_MUSIC_PRIVATE_KEY_PATH` | Path to Apple Music private key | `""` |

### Ports

| Service | Internal Port | External Port |
|---------|---------------|---------------|
| Web (Nginx) | 80 | 80 |
| Backend (Node.js) | 3001 | 3001 |
| Database (PostgreSQL) | 5432 | 5432 |

## 📁 Docker Files Structure

```
├── docker-compose.yml          # Main orchestration file
├── backend/
│   └── Dockerfile             # Backend container config
└── web/
    ├── Dockerfile             # Frontend container config
    └── nginx.conf             # Nginx configuration
```

## 🔍 Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost/health      # Frontend
curl http://localhost:3001/health # Backend
```

## 🚢 Production Deployment

### Security Considerations

1. **Change default passwords**: Update `DB_PASSWORD` and `JWT_SECRET`
2. **Use environment files**: Never commit secrets to version control
3. **Enable HTTPS**: Configure SSL/TLS certificates
4. **Firewall**: Restrict database port (5432) access

### Production Environment Variables

```bash
# Set secure values
DB_PASSWORD=very_secure_random_password
JWT_SECRET=super_long_random_jwt_secret_key_here
USE_MOCK_DATA=false
NODE_ENV=production
```

### Scaling

```bash
# Scale backend instances
docker-compose up --scale backend=3

# Use load balancer for production
# (nginx, traefik, or cloud load balancer)
```

## 🐛 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 80
sudo lsof -i :80

# Use different ports
docker-compose up -p 8080:80
```

**Database connection issues:**
```bash
# Check database logs
docker-compose logs database

# Verify database is healthy
docker-compose exec database pg_isready -U postgres
```

**Build failures:**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Debug specific service
docker-compose exec backend sh
docker-compose exec web sh

# Check container stats
docker stats
```

## 🔄 Updates and Rebuilds

### Code Changes

```bash
# Rebuild after code changes
docker-compose up --build

# Force rebuild specific service
docker-compose build --no-cache backend
docker-compose up backend
```

### Database Schema Updates

```bash
# Apply schema changes (rebuilds database)
docker-compose down -v
docker-compose up --build
```

## 📊 Monitoring

### Container Health

```bash
# Check container status
docker-compose ps

# Resource usage
docker stats $(docker-compose ps -q)
```

### Application Metrics

- Frontend: Access logs in Nginx container
- Backend: Application logs via `docker-compose logs backend`
- Database: PostgreSQL logs via `docker-compose logs database`

## 🎯 Next Steps

1. **SSL/HTTPS**: Configure SSL certificates for production
2. **CI/CD**: Set up automated builds and deployments  
3. **Monitoring**: Add Prometheus/Grafana for metrics
4. **Backup**: Implement database backup strategy
5. **Apple Music Integration**: Configure real API credentials

---

For more information, see the main [README.md](./README.md) file.