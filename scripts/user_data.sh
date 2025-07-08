#!/bin/bash
# user_data.sh - EC2 instance initialization script (AWS Academy version)

# Update system
yum update -y

# Install required packages
yum install -y \
  python3 \
  python3-pip \
  git \
  postgresql15 \
  nginx \
  docker \
  docker-compose-plugin

# Create application directory
mkdir -p /opt/supply-chain-api
cd /opt/supply-chain-api

# Set environment variables
cat > .env << EOF
DATABASE_URL=postgresql://${db_user}:${db_password}@${db_host}/${db_name}
DATABASE_URL_ASYNC=postgresql+asyncpg://${db_user}:${db_password}@${db_host}/${db_name}
SECRET_KEY=$(openssl rand -hex 32)
DEBUG=False
ENVIRONMENT=production
ALLOWED_ORIGINS=["http://${alb_dns_name}", "https://${alb_dns_name}", "http://localhost:3000"]
AWS_REGION=${aws_region}
SNS_TOPIC_ARN=${sns_topic_arn}
SQS_QUEUE_URL=${sqs_queue_url}
EOF

# Create Docker Compose file
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  api:
  build: .
  ports:
    - "8000:8000"
  env_file:
    - .env
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 30s
    timeout: 10s
    retries: 3
    start_period: 40s
EOF

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONPATH=/app

# Install system dependencies
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Run the application with Gunicorn
CMD ["gunicorn", "app.main:app", "--bind", "0.0.0.0:8000", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker"]
EOF

# Create example application file
cat > app/main.py << 'EOF'
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
  # Startup
  print("Starting up FastAPI application...")
  yield
  # Shutdown
  print("Shutting down FastAPI application...")

app = FastAPI(
  title="Smart Supply Chain API",
  description="API for Smart Supply Chain Management System",
  version="1.0.0",
  lifespan=lifespan
)

# CORS middleware
app.add_middleware(
  CORSMiddleware,
  allow_origins=os.getenv("ALLOWED_ORIGINS", "[]").replace("[", "").replace("]", "").split(","),
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.get("/")
async def root():
  return {"message": "Smart Supply Chain API is running"}

@app.get("/health")
async def health_check():
  return {"status": "healthy", "service": "smart-supply-chain-api"}

@app.get("/api/v1/health")
async def api_health():
  return {"status": "healthy", "version": "1.0.0"}
EOF

# Create requirements.txt
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
gunicorn==21.2.0
python-multipart==0.0.6
sqlalchemy==2.0.23
alembic==1.12.1
psycopg2-binary==2.9.9
asyncpg==0.29.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
boto3==1.34.0
httpx==0.25.2
python-dotenv==1.0.0
fastapi-cors==0.0.6
structlog==23.2.0
EOF

# Create basic configuration
cat > app/core/config.py << 'EOF'
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
  project_name: str = "Smart Supply Chain"
  version: str = "1.0.0"
  api_v1_str: str = "/api/v1"
  
  # Database
  database_url: str = os.getenv("DATABASE_URL", "")
  database_url_async: str = os.getenv("DATABASE_URL_ASYNC", "")
  
  # Security
  secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here")
  algorithm: str = "HS256"
  access_token_expire_minutes: int = 30
  
  # CORS
  allowed_origins: List[str] = []
  
  # AWS
  aws_region: str = os.getenv("AWS_REGION", "us-east-1")
  sns_topic_arn: str = os.getenv("SNS_TOPIC_ARN", "")
  sqs_queue_url: str = os.getenv("SQS_QUEUE_URL", "")
  
  class Config:
    env_file = ".env"

settings = Settings()
EOF

# Build and start application
cd /opt/supply-chain-api
docker-compose build
docker-compose up -d

# Create systemd service file
cat > /etc/systemd/system/supply-chain-api.service << EOF
[Unit]
Description=Smart Supply Chain API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/supply-chain-api
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl enable supply-chain-api.service
systemctl start supply-chain-api.service

# Create nginx configuration file
cat > /etc/nginx/conf.d/supply-chain-api.conf << 'EOF'
upstream api_backend {
  server 127.0.0.1:8000;
}

server {
  listen 80;
  server_name _;

  location / {
    proxy_pass http://api_backend;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF

# Start nginx
systemctl start nginx
systemctl enable nginx

# Create log directory
mkdir -p /var/log/supply-chain-api

# Create simple monitoring script
cat > /opt/supply-chain-api/monitor.sh << 'EOF'
#!/bin/bash

# Check if the API is running
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
  echo "$(date): API is down, restarting..." >> /var/log/supply-chain-api/monitor.log
  cd /opt/supply-chain-api
  docker-compose restart
fi
EOF

chmod +x /opt/supply-chain-api/monitor.sh

# Add monitoring to crontab
echo "*/5 * * * * /opt/supply-chain-api/monitor.sh" | crontab -

# Print completion message
echo "Supply Chain API deployment completed!"
echo "API should be available at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4):8000"